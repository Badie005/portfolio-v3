/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiService, GeminiErrorCode } from '../gemini';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create mock response
function createMockResponse(data: object, status = 200): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: vi.fn().mockResolvedValue(data),
        text: vi.fn().mockResolvedValue(JSON.stringify(data)),
        headers: new Headers({ 'Content-Type': 'application/json' }),
    } as unknown as Response;
}

describe('GeminiService', { timeout: 15000 }, () => {
    let service: GeminiService;

    beforeEach(() => {
        vi.clearAllMocks();
        mockFetch.mockReset();

        // Setup env vars
        process.env.OPENROUTER_API_KEY = 'test-openrouter-key-longer-than-10-chars';
        process.env.GOOGLE_AI_API_KEY = '';
    });

    afterEach(() => {
        vi.resetModules();
    });

    it('should initialize correctly with API key', () => {
        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars' });
        expect(service.isReady()).toBe(true);
    });

    it('should return false for isReady when API key is too short in server environment', () => {
        // Clear the window object simulation for this test
        const originalWindow = global.window;
        // @ts-expect-error - Simulating server environment
        delete global.window;

        service = new GeminiService({ apiKey: 'short' });
        expect(service.isReady()).toBe(false);

        // Restore
        global.window = originalWindow;
    });

    it('should handle empty messages', async () => {
        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars' });
        const result = await service.sendMessage('');

        expect(result.error).toBeDefined();
        expect(result.errorCode).toBe(GeminiErrorCode.INVALID_REQUEST);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only messages', async () => {
        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars' });
        const result = await service.sendMessage('   \n\t   ');

        expect(result.error).toBeDefined();
        expect(result.errorCode).toBe(GeminiErrorCode.INVALID_REQUEST);
    });

    it('should call OpenRouter API and parse response correctly', async () => {
        process.env.OPENROUTER_API_KEY = 'test-openrouter-key-longer-than-10-chars';

        const mockApiResponse = {
            choices: [
                {
                    message: {
                        content: 'Hello from OpenRouter!'
                    },
                    finish_reason: 'stop'
                }
            ],
            usage: {
                prompt_tokens: 10,
                completion_tokens: 5,
                total_tokens: 15
            }
        };

        mockFetch.mockResolvedValue(createMockResponse(mockApiResponse));

        service = new GeminiService({ apiKey: 'test-openrouter-key-longer-than-10-chars' });
        const result = await service.sendMessage('Hello');

        expect(result.text).toBe('Hello from OpenRouter!');
        expect(result.error).toBeUndefined();
        expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
        mockFetch.mockResolvedValue(createMockResponse(
            { error: { message: 'Invalid API key' } },
            401
        ));

        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars' });
        const result = await service.sendMessage('Hello');

        expect(result.text).toBe('');
        expect(result.error).toBeDefined();
    });

    it('should handle network errors', async () => {
        mockFetch.mockRejectedValue(new Error('Network error: connection refused'));

        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars' });
        const result = await service.sendMessage('Hello');

        expect(result.text).toBe('');
        expect(result.error).toBeDefined();
        expect(result.errorCode).toBe(GeminiErrorCode.NETWORK_ERROR);
    });

    it('should use cache when enabled', async () => {
        const mockApiResponse = {
            choices: [
                {
                    message: { content: 'Cached Response' },
                    finish_reason: 'stop'
                }
            ]
        };

        mockFetch.mockResolvedValue(createMockResponse(mockApiResponse));

        service = new GeminiService({
            apiKey: 'test-api-key-longer-than-10-chars',
            enableCache: true
        });

        // First call
        await service.sendMessage('Hello Cache');

        // Second call with same message
        const result = await service.sendMessage('Hello Cache');

        expect(result.text).toBe('Cached Response');
        expect(result.cached).toBe(true);
        // Should be called only once due to cache
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should return config without exposing API key', () => {
        service = new GeminiService({ apiKey: 'secret-api-key-longer-than-10-chars' });
        const config = service.getConfig();

        // API key should not be in the returned config
        expect((config as Record<string, unknown>).apiKey).toBeUndefined();
        expect(config.model).toBeDefined();
        expect(config.temperature).toBeDefined();
    });

    it('should handle rate limit errors', async () => {
        mockFetch.mockResolvedValue(createMockResponse(
            { error: { message: 'Rate limit exceeded' } },
            429
        ));

        service = new GeminiService({
            apiKey: 'test-api-key-longer-than-10-chars',
            maxRetries: 1 // Reduce retries for faster test
        });
        const result = await service.sendMessage('Hello');

        expect(result.error).toBeDefined();
        expect(result.errorCode).toBe(GeminiErrorCode.RATE_LIMIT_EXCEEDED);
    });
});
