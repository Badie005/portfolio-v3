/**
 * @vitest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useGemini from '../useGemini';

// Mock fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create a streaming response
const createStreamResponse = (text: string) => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(encoder.encode(text));
            controller.close();
        },
    });

    return {
        ok: true,
        headers: {
            get: (name: string) => {
                if (name === 'Content-Type') return 'text/plain';
                return null;
            }
        },
        body: stream,
    };
};

describe('useGemini Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFetch.mockReset();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useGemini());

        expect(result.current.messages).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.isReady).toBe(true);
    });

    it('should send a message and update state successfully', async () => {
        const { result } = renderHook(() => useGemini());

        // Mock successful streaming response
        mockFetch.mockResolvedValueOnce(createStreamResponse('Response from AI'));

        await act(async () => {
            await result.current.sendMessage('Hello AI');
        });

        // Check loading state
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();

        // Check messages
        expect(result.current.messages).toHaveLength(2);
        expect(result.current.messages[0]).toEqual(expect.objectContaining({
            role: 'user',
            parts: [{ text: 'Hello AI' }]
        }));
        expect(result.current.messages[1]).toEqual(expect.objectContaining({
            role: 'model',
            parts: [{ text: 'Response from AI' }]
        }));

        // Check API call
        expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                message: 'Hello AI',
                history: []
            })
        }));
    });

    it('should handle API errors', async () => {
        const { result } = renderHook(() => useGemini());

        // Mock error API response
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            headers: {
                get: () => 'application/json'
            },
            json: async () => ({ error: 'Internal Server Error' })
        });

        await act(async () => {
            await result.current.sendMessage('Crash me');
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('Internal Server Error');
        // Should still have the user message
        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].role).toBe('user');
    });

    it('should clear messages', async () => {
        const { result } = renderHook(() => useGemini());

        // Add some state first
        mockFetch.mockResolvedValueOnce(createStreamResponse('Hi'));

        await act(async () => {
            await result.current.sendMessage('Hi');
        });

        expect(result.current.messages).toHaveLength(2);

        // Clear
        act(() => {
            result.current.clearMessages();
        });

        expect(result.current.messages).toEqual([]);
        expect(result.current.error).toBeNull();
    });
});
