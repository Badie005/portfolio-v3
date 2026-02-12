/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiService, GeminiErrorCode, SYSTEM_PROMPT } from '../gemini';

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

    describe('B.AI Agent Specific Logic', () => {
        it('should include B.AI system prompt in Google AI calls', async () => {
            // Setup for Google AI
            process.env.GOOGLE_AI_API_KEY = 'test-google-key-valid-length';
            service = new GeminiService({ apiKey: 'test-key-valid-length' });

            mockFetch.mockResolvedValue(createMockResponse({
                candidates: [{ content: { parts: [{ text: 'Response' }] } }]
            }));

            await service.sendMessage('Hello B.AI');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('generativelanguage.googleapis.com'),
                expect.objectContaining({
                    body: expect.stringContaining(JSON.stringify(SYSTEM_PROMPT).slice(1, -1)) // Check for system prompt existence
                })
            );
        });

        it('should include B.AI system prompt in OpenRouter calls', async () => {
            // Setup for OpenRouter (no Google Key)
            process.env.GOOGLE_AI_API_KEY = '';
            process.env.OPENROUTER_API_KEY = 'test-openrouter-key-valid';
            service = new GeminiService({ apiKey: 'test-key-valid-length' });

            mockFetch.mockResolvedValue(createMockResponse({
                choices: [{ message: { content: 'Response' } }]
            }));

            await service.sendMessage('Hello B.AI');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('openrouter.ai'),
                expect.objectContaining({
                    body: expect.stringContaining(JSON.stringify(SYSTEM_PROMPT).slice(1, -1))
                })
            );
        });

        it('should fallback to OpenRouter when Google AI fails', async () => {
            process.env.GOOGLE_AI_API_KEY = 'test-google-key-valid-length';
            process.env.OPENROUTER_API_KEY = 'test-openrouter-key-valid';
            service = new GeminiService({ apiKey: 'test-key-valid-length' });

            // Mock first call (Google AI) to fail
            // Mock second call (OpenRouter) to succeed
            mockFetch
                .mockResolvedValueOnce(createMockResponse({ error: 'Internal Error' }, 500))
                .mockResolvedValueOnce(createMockResponse({
                    choices: [{ message: { content: 'Fallback Success' } }]
                }));

            const result = await service.sendMessage('Hello');

            expect(result.text).toBe('Fallback Success');
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(mockFetch).toHaveBeenNthCalledWith(1, expect.stringContaining('googleapis.com'), expect.any(Object));
            expect(mockFetch).toHaveBeenNthCalledWith(2, expect.stringContaining('openrouter.ai'), expect.any(Object));
        });

        it('should correctly format conversation history for OpenRouter', async () => {
            process.env.GOOGLE_AI_API_KEY = '';
            service = new GeminiService({ apiKey: 'test-key-valid-length' });

            const history = [
                { role: 'user' as const, parts: [{ text: 'Prev User' }] },
                { role: 'model' as const, parts: [{ text: 'Prev Model' }] }
            ];

            mockFetch.mockResolvedValue(createMockResponse({
                choices: [{ message: { content: 'Response' } }]
            }));

            await service.sendMessage('New Message', history);

            const lastCall = mockFetch.mock.calls[0];
            const body = JSON.parse(lastCall[1].body as string);

            // OpenRouter expects messages array: System -> History -> Current
            expect(body.messages).toHaveLength(4); // System + 2 history + 1 new
            expect(body.messages[0].role).toBe('system');
            expect(body.messages[1].content).toBe('Prev User');
            expect(body.messages[2].content).toBe('Prev Model');
            expect(body.messages[3].content).toBe('New Message');
        });
    });
});
