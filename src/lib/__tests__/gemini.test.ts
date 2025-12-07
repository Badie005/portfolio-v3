/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiService, GeminiErrorCode } from '../gemini';

// Mock GoogleGenerativeAI
const mockGenerateContent = vi.fn();
const mockSendMessage = vi.fn();
const mockStartChat = vi.fn();
const mockGetGenerativeModel = vi.fn();

vi.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
            getGenerativeModel: mockGetGenerativeModel
        })),
        HarmCategory: {
            HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
            HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
            HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        },
        HarmBlockThreshold: {
            BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
        }
    };
});

describe('GeminiService', () => {
    let service: GeminiService;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock implementations
        mockGetGenerativeModel.mockReturnValue({
            startChat: mockStartChat,
            generateContent: mockGenerateContent
        });

        mockStartChat.mockReturnValue({
            sendMessage: mockSendMessage
        });

        // Reset env vars
        process.env.GEMINI_API_KEY = 'test-api-key-longer-than-10-chars';
    });

    afterEach(() => {
        vi.resetModules();
    });

    it('should initialize correctly with API key', () => {
        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars' });
        expect(service.isReady()).toBe(true);
    });

    it('should fail initialization without API key', () => {
        process.env.GEMINI_API_KEY = '';
        service = new GeminiService({ apiKey: '' });
        expect(service.isReady()).toBe(false);
    });

    it('should send a message successfully', async () => {
        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars' });

        const mockResponse = {
            response: {
                text: () => 'Hello from Gemini',
                usageMetadata: {
                    promptTokenCount: 10,
                    candidatesTokenCount: 5,
                    totalTokenCount: 15
                }
            }
        };
        mockSendMessage.mockResolvedValue(mockResponse);

        const result = await service.sendMessage('Hello');

        expect(result.text).toBe('Hello from Gemini');
        expect(result.error).toBeUndefined();
        expect(mockStartChat).toHaveBeenCalled();
        expect(mockSendMessage).toHaveBeenCalledWith('Hello');
    });

    it('should handle empty messages', async () => {
        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars' });
        const result = await service.sendMessage('');

        expect(result.error).toBeDefined();
        expect(result.errorCode).toBe(GeminiErrorCode.INVALID_REQUEST);
        expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars' });

        mockSendMessage.mockRejectedValue(new Error('API key not valid'));

        const result = await service.sendMessage('Hello');

        expect(result.text).toBe('');
        expect(result.error).toBeDefined();
        expect(result.errorCode).toBe(GeminiErrorCode.API_KEY_INVALID);
    });

    it('should use cache if enabled', async () => {
        service = new GeminiService({ apiKey: 'test-api-key-longer-than-10-chars', enableCache: true });

        const mockResponse = {
            response: {
                text: () => 'Cached Response',
            }
        };
        mockSendMessage.mockResolvedValue(mockResponse);

        // First call
        await service.sendMessage('Hello Cache');

        // Second call with same message
        const result = await service.sendMessage('Hello Cache');

        expect(result.text).toBe('Cached Response');
        expect(result.cached).toBe(true);
        // Should be called only once due to cache
        expect(mockSendMessage).toHaveBeenCalledTimes(1);
    });
});
