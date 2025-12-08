/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiService, GeminiErrorCode } from '../gemini';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GeminiService', () => {
    let service: GeminiService;

    beforeEach(() => {
        vi.clearAllMocks();
        mockFetch.mockReset();
        // Reset env vars
        process.env.GEMINI_API_KEY = 'test-api-key-longer-than-10-chars';
        process.env.GOOGLE_AI_API_KEY = 'google-api-key';
    });

    afterEach(() => {
        vi.resetModules();
    });

    it('should initialize correctly with API key', () => {
        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars' });
        expect(service.isReady()).toBe(true);
    });

    it('should fail initialization without API key', () => {
        // In the updated code, we need to ensure process.env.OPENROUTER_API_KEY is also empty if we want to fail
        delete process.env.OPENROUTER_API_KEY;

        service = new GeminiService({ apiKey: '' });
        // The service checks isValidApiKey which requires length > 10.
        expect(service.isReady()).toBe(false);
    });

    it('should send a message successfully via Google AI', async () => {
        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars' });

        // Mock Google AI response
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                candidates: [{
                    content: {
                        parts: [{ text: 'Hello from Gemini' }]
                    },
                    finishReason: 'STOP'
                }],
                usageMetadata: {
                    promptTokenCount: 10,
                    candidatesTokenCount: 5,
                    totalTokenCount: 15
                }
            })
        });

        const result = await service.sendMessage('Hello');

        expect(result.text).toBe('Hello from Gemini');
        expect(result.error).toBeUndefined();

        // Verify fetch was called with Google AI URL
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('generativelanguage.googleapis.com'),
            expect.anything()
        );
    });

    it('should fallback to OpenRouter if Google AI fails', async () => {
        process.env.OPENROUTER_API_KEY = 'openrouter-key';
        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars' });

        // Mock Google AI failure
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: { message: 'Google AI Error' } })
        });

        // Mock OpenRouter success
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [{
                    message: { content: 'Hello from OpenRouter' },
                    finish_reason: 'stop'
                }],
                usage: {
                    prompt_tokens: 10,
                    completion_tokens: 5,
                    total_tokens: 15
                }
            })
        });

        const result = await service.sendMessage('Hello');

        expect(result.text).toBe('Hello from OpenRouter');

        // Should have called Google AI first
        expect(mockFetch).toHaveBeenNthCalledWith(1,
            expect.stringContaining('generativelanguage.googleapis.com'),
            expect.anything()
        );

        // Then OpenRouter
        expect(mockFetch).toHaveBeenNthCalledWith(2,
            expect.stringContaining('openrouter.ai'),
            expect.anything()
        );
    });

    it('should handle empty messages', async () => {
        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars' });
        const result = await service.sendMessage('');

        expect(result.error).toBeDefined();
        expect(result.errorCode).toBe(GeminiErrorCode.INVALID_REQUEST);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should use cache if enabled', async () => {
        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars', enableCache: true });

        // Mock Google AI response
        const mockResponse = {
            ok: true,
            json: async () => ({
                candidates: [{
                    content: {
                        parts: [{ text: 'Cached Response' }]
                    }
                }]
            })
        };
        mockFetch.mockResolvedValue(mockResponse);

        // First call
        await service.sendMessage('Hello Cache');

        // Second call with same message
        const result = await service.sendMessage('Hello Cache');

        expect(result.text).toBe('Cached Response');
        expect(result.cached).toBe(true);
        // Should be called only once due to cache
        expect(mockFetch).toHaveBeenCalledTimes(1);
    }, 15000); // Increased timeout
});
