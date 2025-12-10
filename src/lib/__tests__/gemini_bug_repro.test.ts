/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from '../gemini';

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

describe('GeminiService Bug Reproduction', () => {
    let service: GeminiService;

    beforeEach(() => {
        vi.clearAllMocks();
        mockFetch.mockReset();
        // Ensure env vars are cleared
        delete process.env.OPENROUTER_API_KEY;
        delete process.env.GOOGLE_AI_API_KEY;
    });

    it('should use apiKey from config when process.env.OPENROUTER_API_KEY is not set', async () => {
        const apiKey = 'test-api-key-provided-in-constructor';
        service = new GeminiService({ apiKey });

        // Mock a successful response
        mockFetch.mockResolvedValue(createMockResponse({
            choices: [{ message: { content: 'Success' } }]
        }));

        const result = await service.sendMessage('Hello');

        // If the bug exists, this will fail because callOpenRouterFallback uses process.env.OPENROUTER_API_KEY
        // which is undefined, so it throws "No API keys available"
        expect(result.error).toBeUndefined();
        expect(result.text).toBe('Success');

        // Also verify that the fetch call used the correct key
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('openrouter'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': `Bearer ${apiKey}`
                })
            })
        );
    });
});
