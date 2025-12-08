/**
 * @vitest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useGemini from '../useGemini';

// Helper to create a mock streaming response
function createStreamingResponse(text: string): Response {
    const encoder = new TextEncoder();
    const chunks = [encoder.encode(text)];
    let chunkIndex = 0;

    const mockReader: ReadableStreamDefaultReader<Uint8Array> = {
        read: vi.fn().mockImplementation(() => {
            if (chunkIndex < chunks.length) {
                return Promise.resolve({ done: false, value: chunks[chunkIndex++] });
            }
            return Promise.resolve({ done: true, value: undefined });
        }),
        releaseLock: vi.fn(),
        cancel: vi.fn().mockResolvedValue(undefined),
        closed: Promise.resolve(undefined),
    } as unknown as ReadableStreamDefaultReader<Uint8Array>;

    const mockBody = {
        getReader: () => mockReader,
    } as unknown as ReadableStream<Uint8Array>;

    return {
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/event-stream' }),
        body: mockBody,
        json: vi.fn(),
    } as unknown as Response;
}

function createErrorResponse(status: number, error: string): Response {
    return {
        ok: false,
        status,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: null,
        json: vi.fn().mockResolvedValue({ error }),
    } as unknown as Response;
}

// Mock fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

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

    it('should send a message and update state successfully with streaming', async () => {
        const { result } = renderHook(() => useGemini());

        // Mock successful streaming API response
        mockFetch.mockResolvedValueOnce(createStreamingResponse('Response from AI'));

        await act(async () => {
            await result.current.sendMessage('Hello AI');
        });

        // Wait for state to update
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

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
        mockFetch.mockResolvedValueOnce(createErrorResponse(500, 'Internal Server Error'));

        await act(async () => {
            await result.current.sendMessage('Crash me');
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe('Internal Server Error');
        // Should still have the user message
        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].role).toBe('user');
    });

    it('should clear messages', async () => {
        const { result } = renderHook(() => useGemini());

        // Add some state first
        mockFetch.mockResolvedValueOnce(createStreamingResponse('Hi'));

        await act(async () => {
            await result.current.sendMessage('Hi');
        });

        await waitFor(() => {
            expect(result.current.messages).toHaveLength(2);
        });

        // Clear
        act(() => {
            result.current.clearMessages();
        });

        expect(result.current.messages).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it('should handle empty response body', async () => {
        const { result } = renderHook(() => useGemini());

        // Mock response without body
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            headers: new Headers({ 'Content-Type': 'text/event-stream' }),
            body: null,
        } as unknown as Response);

        await act(async () => {
            await result.current.sendMessage('Test');
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBeTruthy();
    });
});
