/**
 * Gemini AI Service Configuration
 * Centralized configuration for AI service parameters
 */

export const GEMINI_CONFIG = {
    // API Endpoints
    endpoints: {
        googleAI: 'https://generativelanguage.googleapis.com/v1beta/models',
        openRouter: 'https://openrouter.ai/api/v1/chat/completions',
    },

    // Models
    models: {
        primary: 'gemini-2.5-pro-exp-03-25',
        fallback: [
            'google/gemini-2.0-flash-exp:free',
            'z-ai/glm-4.5-air:free',
            'meta-llama/llama-3.3-70b-instruct:free',
        ],
    },

    // Generation parameters
    generation: {
        temperature: 0.7,
        maxTokens: 8192,
        topP: 0.95,
    },

    // Retry & Timeout
    resilience: {
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 60000,
    },

    // Cache settings
    cache: {
        enabled: true,
        maxAge: 5 * 60 * 1000, // 5 minutes
        maxSize: 100,
    },

    // Rate limiting defaults
    rateLimit: {
        chat: { limit: 10, windowSec: 60 },
        contact: { limit: 5, windowSec: 3600 },
    },

    // Logging
    logging: {
        enabled: process.env.NODE_ENV === 'development',
        prefix: '[B.AI]',
    },
} as const;

export type GeminiConfig = typeof GEMINI_CONFIG;
