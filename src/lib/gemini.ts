// B.AI Service - OpenRouter Integration
// ============================================================
// Uses OpenRouter API to access Gemini 2.0 Flash (free tier)

// ============================================================
// TYPES & INTERFACES
// ============================================================

export type MessageRole = 'user' | 'model';

export interface GeminiMessage {
    role: MessageRole;
    parts: { text: string }[];
    timestamp?: number;
}

export interface GeminiResponse {
    text: string;
    error?: string;
    errorCode?: GeminiErrorCode;
    usage?: TokenUsage;
    finishReason?: string;
    cached?: boolean;
}

export interface TokenUsage {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
}

export enum GeminiErrorCode {
    API_KEY_MISSING = 'API_KEY_MISSING',
    API_KEY_INVALID = 'API_KEY_INVALID',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    CONTENT_FILTERED = 'CONTENT_FILTERED',
    MODEL_OVERLOADED = 'MODEL_OVERLOADED',
    NETWORK_ERROR = 'NETWORK_ERROR',
    INVALID_REQUEST = 'INVALID_REQUEST',
    CONTEXT_LENGTH_EXCEEDED = 'CONTEXT_LENGTH_EXCEEDED',
    TIMEOUT = 'TIMEOUT',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface GeminiConfig {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    maxRetries: number;
    retryDelay: number;
    timeout: number;
    enableCache: boolean;
    cacheMaxAge: number;
    enableLogging: boolean;
    maxHistoryMessages: number;
}

export type StreamCallback = (chunk: string, done: boolean) => void;

// ============================================================
// CONSTANTS & DEFAULTS
// ============================================================

// Google AI Studio API (Primary)
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GOOGLE_AI_MODEL = 'gemini-2.5-pro-exp-03-25';

// OpenRouter fallback (if Google AI fails)
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODELS = [
    'google/gemini-2.0-flash-exp:free',
    'z-ai/glm-4.5-air:free',
    'meta-llama/llama-3.3-70b-instruct:free',
];

const DEFAULT_CONFIG: Omit<GeminiConfig, 'apiKey'> = {
    model: GOOGLE_AI_MODEL,
    temperature: 0.7,
    maxTokens: 8192,
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 60000,
    enableCache: true,
    cacheMaxAge: 5 * 60 * 1000,
    enableLogging: process.env.NODE_ENV === 'development',
    maxHistoryMessages: 20,
};

// ============================================================
// SYSTEM PROMPT
// ============================================================

const SYSTEM_PROMPT = `# SYSTEM PROMPT: B.AI (Portfolio Agent)

ROLE & IDENTITY
You are B.AI, the integrated AI assistant for the B.DEV x B.411 Portfolio.
Your core identity is a fusion of technical precision (B.DEV) and creative vision (B.411).
You operate within a Next.js 16 IDE-style environment.

CORE DIRECTIVES
1.  **Professional Tone**: Maintain a helpful, technical, and concise tone. Avoid emojis and excessive enthusiasm.
2.  **Context Awareness**: You have full knowledge of B.DEV's projects, skills, and background.
3.  **Language**: Respond in French by default, but adapt seamlessly to the user's language.
4.  **Formatting**: Use Markdown for all responses. Use bolding for key terms. Lists and tables are preferred for readability.

BIO & SKILLS (B.DEV)
- **Name**: Abdelbadie Khoubiza
- **Role**: Full Stack Developer & Designer
- **Location**: Morocco
- **Stack**: Next.js 16, TypeScript, Tailwind CSS, Node.js, Python, Figma, Docker.

PROJECT KNOWLEDGE BASE

1.  **Portfolio IDE (Current Context)**
    *   **Description**: Interactive developer portfolio simulating a VS Code environment.
    *   **Stack**: Next.js 16, TypeScript, Tailwind v4, OpenRouter AI, Vercel.
    *   **Key Features**: Real-time Terminal (50+ cmds), File Explorer, Glassmorphism UI, B.AI Agent.

2.  **USMBA Portal (2025)**
    *   **Description**: Academic management system for Sidi Mohamed Ben Abdellah University.
    *   **Stack**: Laravel 12, MySQL, Alpine.js, Tailwind CSS.
    *   **Key Features**: Secure Authentication, PDF Generation (QR Code), Glassmorphism Admin Dashboard.

3.  **AYJI E-learning (2025)**
    *   **Description**: Modern Learning Management System (LMS) as a Single Page Application.
    *   **Stack**: Angular 19, NgRx, Node.js, MongoDB, Redis, Socket.io.
    *   **Key Features**: Real-time Quiz, Student Dashboard, Reactive State Management.

4.  **IT Infrastructure Audit (Internship 2024)**
    *   **Context**: Agence Urbaine Taza.
    *   **Focus**: System Administration, Virtualization (VMware), Network Security, RAID Configuration.

INTERACTION GUIDELINES
-   **Answering**: Start directly with the answer. Do not use phrases like "I have searched".
-   **Code**: When providing code, use strictly formatted code blocks with filenames: \`\`\`language filename.ext
-   **Navigation**: If a user asks about a project, provide technical details and invite them to view the specific project file or page.
-   **System Capabilities**: You can read, create, edit, and delete files in this virtual environment.

RESTRICTIONS
-   Do NOT use emojis in your responses.
-   Do NOT invent information about B.DEV. Use only the provided context.
-   Do NOT be verbose. Precision is paramount.

Now, await user input and assist accordingly.`;

// ============================================================
// LOGGER
// ============================================================

class Logger {
    private enabled: boolean;
    private prefix: string = '[B.AI]';

    constructor(enabled: boolean = true) {
        this.enabled = enabled;
    }

    private log(level: string, message: string, data?: unknown): void {
        if (!this.enabled) return;
        const timestamp = new Date().toISOString();
        const formatted = `${this.prefix} [${timestamp}] [${level}] ${message}`;

        switch (level) {
            case 'DEBUG': console.debug(formatted, data ?? ''); break;
            case 'INFO': console.info(formatted, data ?? ''); break;
            case 'WARN': console.warn(formatted, data ?? ''); break;
            case 'ERROR': console.error(formatted, data ?? ''); break;
        }
    }

    debug(message: string, data?: unknown): void { this.log('DEBUG', message, data); }
    info(message: string, data?: unknown): void { this.log('INFO', message, data); }
    warn(message: string, data?: unknown): void { this.log('WARN', message, data); }
    error(message: string, data?: unknown): void { this.log('ERROR', message, data); }
    setEnabled(enabled: boolean): void { this.enabled = enabled; }
}

// ============================================================
// CACHE
// ============================================================

interface CacheEntry {
    response: GeminiResponse;
    timestamp: number;
    hits: number;
}

class ResponseCache {
    private cache: Map<string, CacheEntry> = new Map();
    private maxAge: number;
    private maxSize: number;

    constructor(maxAge: number = 5 * 60 * 1000, maxSize: number = 100) {
        this.maxAge = maxAge;
        this.maxSize = maxSize;
    }

    private generateKey(message: string, history: GeminiMessage[]): string {
        const historyHash = history
            .slice(-5)
            .map(m => `${m.role}:${m.parts[0]?.text?.slice(0, 30) ?? ''}`)
            .join('|');
        return btoa(encodeURIComponent(`${message.slice(0, 100)}::${historyHash}`)).slice(0, 64);
    }

    get(message: string, history: GeminiMessage[]): GeminiResponse | null {
        const key = this.generateKey(message, history);
        const cached = this.cache.get(key);

        if (!cached) return null;

        if (Date.now() - cached.timestamp > this.maxAge) {
            this.cache.delete(key);
            return null;
        }

        cached.hits++;
        return { ...cached.response, cached: true };
    }

    set(message: string, history: GeminiMessage[], response: GeminiResponse): void {
        this.cleanup();
        const key = this.generateKey(message, history);
        this.cache.set(key, {
            response: { ...response },
            timestamp: Date.now(),
            hits: 0
        });
    }

    private cleanup(): void {
        if (this.cache.size < this.maxSize) return;

        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.maxAge) {
                this.cache.delete(key);
            }
        }

        if (this.cache.size >= this.maxSize) {
            const entries = Array.from(this.cache.entries())
                .sort((a, b) => a[1].hits - b[1].hits);
            entries.slice(0, Math.floor(this.maxSize / 4))
                .forEach(([key]) => this.cache.delete(key));
        }
    }

    clear(): void {
        this.cache.clear();
    }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isValidApiKey(key: string | undefined | null): key is string {
    return typeof key === 'string' && key.length > 10;
}

function sanitizeInput(input: string, maxLength: number = 10000): string {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .slice(0, maxLength)
        .replace(/\0/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function truncateHistory(history: GeminiMessage[], maxMessages: number): GeminiMessage[] {
    if (history.length <= maxMessages) return [...history];
    const truncated = history.slice(-maxMessages);
    if (truncated[0]?.role === 'model' && truncated.length > 1) {
        return truncated.slice(1);
    }
    return truncated;
}

function parseError(error: unknown): { code: GeminiErrorCode; message: string } {
    const defaultError = {
        code: GeminiErrorCode.UNKNOWN_ERROR,
        message: 'Une erreur inconnue est survenue'
    };

    if (!error) return defaultError;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const lowerMessage = errorMessage.toLowerCase();

    const patterns: Array<{ patterns: string[]; code: GeminiErrorCode; message: string }> = [
        {
            patterns: ['api key', 'api_key', 'invalid key', 'authentication', 'unauthorized', '401'],
            code: GeminiErrorCode.API_KEY_INVALID,
            message: 'Clé API invalide ou expirée'
        },
        {
            patterns: ['rate limit', 'quota', 'too many requests', '429'],
            code: GeminiErrorCode.RATE_LIMIT_EXCEEDED,
            message: 'Limite de requêtes atteinte. Veuillez patienter quelques instants.'
        },
        {
            patterns: ['safety', 'blocked', 'harmful', 'filtered', 'content_filter'],
            code: GeminiErrorCode.CONTENT_FILTERED,
            message: 'Le contenu a été filtré pour des raisons de sécurité.'
        },
        {
            patterns: ['overloaded', '503', 'unavailable', 'capacity'],
            code: GeminiErrorCode.MODEL_OVERLOADED,
            message: 'Le service est temporairement surchargé. Réessayez dans un moment.'
        },
        {
            patterns: ['network', 'fetch', 'connection', 'econnrefused', 'etimedout'],
            code: GeminiErrorCode.NETWORK_ERROR,
            message: 'Erreur réseau. Vérifiez votre connexion internet.'
        },
        {
            patterns: ['context', 'token limit', 'too long', 'maximum context'],
            code: GeminiErrorCode.CONTEXT_LENGTH_EXCEEDED,
            message: 'La conversation est trop longue. Démarrez une nouvelle conversation.'
        },
        {
            patterns: ['timeout', 'timed out'],
            code: GeminiErrorCode.TIMEOUT,
            message: 'La requête a expiré. Veuillez réessayer.'
        },
        {
            patterns: ['invalid', 'bad request', '400'],
            code: GeminiErrorCode.INVALID_REQUEST,
            message: 'Requête invalide. Vérifiez votre message.'
        }
    ];

    for (const { patterns: p, code, message } of patterns) {
        if (p.some(pattern => lowerMessage.includes(pattern))) {
            return { code, message };
        }
    }

    return {
        code: GeminiErrorCode.UNKNOWN_ERROR,
        message: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
    };
}

// ============================================================
// OPENROUTER MESSAGE FORMAT CONVERTER
// ============================================================

interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

function convertToOpenRouterMessages(
    userMessage: string,
    conversationHistory: GeminiMessage[]
): OpenRouterMessage[] {
    const messages: OpenRouterMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history
    const truncated = truncateHistory(conversationHistory, 20);
    for (const msg of truncated) {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.parts[0]?.text || ''
        });
    }

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    return messages;
}

// ============================================================
// MAIN SERVICE CLASS
// ============================================================

export class GeminiService {
    private config: GeminiConfig;
    private cache: ResponseCache;
    private logger: Logger;
    private initialized: boolean = false;

    constructor(config?: Partial<GeminiConfig>) {
        const apiKey = config?.apiKey || process.env.OPENROUTER_API_KEY || '';

        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
            apiKey,
        };

        this.logger = new Logger(this.config.enableLogging);
        this.cache = new ResponseCache(this.config.cacheMaxAge);

        this.initialize();
    }

    private initialize(): void {
        // On client side, we proxy to /api/chat
        if (typeof window !== 'undefined') {
            this.initialized = true;
            return;
        }

        if (!isValidApiKey(this.config.apiKey)) {
            this.logger.warn('OpenRouter API key not configured');
            this.initialized = false;
            return;
        }

        this.initialized = true;
        this.logger.info(`Initialized with model: ${this.config.model}`);
    }

    isReady(): boolean {
        if (typeof window !== 'undefined') return true;
        return this.initialized;
    }

    getConfig(): Readonly<Omit<GeminiConfig, 'apiKey'>> {
        const { apiKey, ...rest } = this.config;
        void apiKey; // Suppress unused variable warning
        return rest;
    }

    // Server-side API call to Google AI Studio (Primary)
    private async callGoogleAI(
        userMessage: string,
        conversationHistory: GeminiMessage[],
        stream: boolean = false
    ): Promise<Response> {
        const googleApiKey = process.env.GOOGLE_AI_API_KEY;

        if (!googleApiKey) {
            this.logger.warn('Google AI API key not found, falling back to OpenRouter');
            return this.callOpenRouterFallback(userMessage, conversationHistory, stream);
        }

        // Build contents array for Google AI format
        const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

        // Add conversation history
        for (const msg of conversationHistory.slice(-this.config.maxHistoryMessages)) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.parts[0]?.text || '' }]
            });
        }

        // Add current user message
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const endpoint = stream ? 'streamGenerateContent?alt=sse' : 'generateContent';
        const url = `${GOOGLE_AI_API_URL}/${GOOGLE_AI_MODEL}:${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'x-goog-api-key': googleApiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents,
                    systemInstruction: {
                        parts: [{ text: SYSTEM_PROMPT }]
                    },
                    generationConfig: {
                        temperature: this.config.temperature,
                        maxOutputTokens: this.config.maxTokens,
                    }
                })
            });

            // If Google AI fails (any error), fallback to OpenRouter
            if (!response.ok) {
                this.logger.warn(`Google AI error ${response.status}, falling back to OpenRouter`);
                return this.callOpenRouterFallback(userMessage, conversationHistory, stream);
            }

            return response;
        } catch (error) {
            this.logger.error('Google AI request failed', error);
            return this.callOpenRouterFallback(userMessage, conversationHistory, stream);
        }
    }

    // Fallback to OpenRouter if Google AI fails
    private async callOpenRouterFallback(
        userMessage: string,
        conversationHistory: GeminiMessage[],
        stream: boolean = false,
        modelIndex: number = 0
    ): Promise<Response> {
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        if (!openRouterKey) {
            throw new Error('No API keys available');
        }

        const model = OPENROUTER_MODELS[modelIndex] || OPENROUTER_MODELS[0];
        const messages = convertToOpenRouterMessages(userMessage, conversationHistory);

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openRouterKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://bdev.dev',
                'X-Title': 'B.DEV Portfolio'
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: this.config.temperature,
                max_tokens: this.config.maxTokens,
                stream
            })
        });

        // If rate limit, try next model
        if (response.status === 429 && modelIndex < OPENROUTER_MODELS.length - 1) {
            this.logger.warn(`Rate limit on ${model}, trying next fallback...`);
            await sleep(2000);
            return this.callOpenRouterFallback(userMessage, conversationHistory, stream, modelIndex + 1);
        }

        return response;
    }


    async sendMessage(
        userMessage: string,
        conversationHistory: GeminiMessage[] = []
    ): Promise<GeminiResponse> {
        // Client-side: Proxy to /api/chat
        if (typeof window !== 'undefined') {
            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userMessage, history: conversationHistory })
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    if (res.status === 429) {
                        return {
                            text: '',
                            error: 'Limite de requêtes atteinte. Veuillez patienter quelques instants.',
                            errorCode: GeminiErrorCode.RATE_LIMIT_EXCEEDED
                        };
                    }
                    if (res.status === 503) {
                        return {
                            text: '',
                            error: 'Le service est temporairement surchargé.',
                            errorCode: GeminiErrorCode.MODEL_OVERLOADED
                        };
                    }
                    throw new Error(err.error || `API Error: ${res.status}`);
                }

                const data = await res.json();
                if (data.response?.error) {
                    const { code, message } = parseError(new Error(data.response.error));
                    return { text: '', error: message, errorCode: code };
                }
                return data.response;
            } catch (error) {
                const { code, message } = parseError(error);
                return { text: '', error: message, errorCode: code };
            }
        }

        // Server-side: Direct OpenRouter call
        if (!this.isReady()) {
            return {
                text: '',
                error: 'Service non initialisé. Vérifiez la clé API.',
                errorCode: GeminiErrorCode.API_KEY_MISSING,
            };
        }

        const sanitizedMessage = sanitizeInput(userMessage);
        if (!sanitizedMessage) {
            return {
                text: '',
                error: 'Le message ne peut pas être vide.',
                errorCode: GeminiErrorCode.INVALID_REQUEST,
            };
        }

        // Check cache
        if (this.config.enableCache) {
            const cached = this.cache.get(sanitizedMessage, conversationHistory);
            if (cached) {
                this.logger.debug('Cache hit');
                return cached;
            }
        }

        this.logger.info('Sending message', { messageLength: sanitizedMessage.length });

        // Retry logic
        let lastError: unknown;
        for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
            try {
                const response = await this.callGoogleAI(sanitizedMessage, conversationHistory, false);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
                }

                const data = await response.json();
                // Google AI format: candidates[0].content.parts[0].text
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text ||
                    data.choices?.[0]?.message?.content || '';

                const geminiResponse: GeminiResponse = {
                    text,
                    finishReason: data.candidates?.[0]?.finishReason || data.choices?.[0]?.finish_reason,
                    usage: {
                        promptTokens: data.usageMetadata?.promptTokenCount || data.usage?.prompt_tokens,
                        completionTokens: data.usageMetadata?.candidatesTokenCount || data.usage?.completion_tokens,
                        totalTokens: data.usageMetadata?.totalTokenCount || data.usage?.total_tokens,
                    },
                };

                if (this.config.enableCache && text) {
                    this.cache.set(sanitizedMessage, conversationHistory, geminiResponse);
                }

                this.logger.info('Message sent successfully', { responseLength: text.length });
                return geminiResponse;

            } catch (error) {
                lastError = error;
                this.logger.warn(`Attempt ${attempt + 1} failed`, { error });

                if (attempt < this.config.maxRetries - 1) {
                    await sleep(this.config.retryDelay * Math.pow(2, attempt));
                }
            }
        }

        const { code, message } = parseError(lastError);
        this.logger.error('Failed to send message', { code, error: lastError });
        return { text: '', error: message, errorCode: code };
    }

    /**
     * Server-side only: Get a stream response from Google AI Studio
     */
    async getStreamResponse(
        userMessage: string,
        conversationHistory: GeminiMessage[] = []
    ): Promise<Response> {
        if (typeof window !== 'undefined') {
            throw new Error('getStreamResponse is for server-side use only');
        }

        const sanitizedMessage = sanitizeInput(userMessage);
        return this.callGoogleAI(sanitizedMessage, conversationHistory || [], true);
    }

    async sendMessageStream(
        userMessage: string,
        conversationHistory: GeminiMessage[] = [],
        onChunk: StreamCallback
    ): Promise<GeminiResponse> {
        // Client-side: Consume /api/chat stream
        if (typeof window !== 'undefined') {
            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userMessage, history: conversationHistory })
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    if (res.status === 429) throw new Error('Limite de requêtes atteinte.');
                    if (res.status === 503) throw new Error('Service surchargé.');
                    throw new Error(err.error || `API Error: ${res.status}`);
                }

                if (!res.body) throw new Error('No response body');

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let fullText = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    // Handle server-side errors sent as text if content-type isn't correct,
                    // but usually we expect a stream of text.
                    // For simplicity, we assume the API returns raw text chunks (not SSE)
                    // or we parse SSE if we decide to implement SSE.
                    // Let's implement robust SSE parsing or just raw text streaming.
                    // The server implementation will determine this.
                    // Assuming the server just pipes the OpenRouter stream content.

                    fullText += chunk;
                    onChunk(chunk, false);
                }

                onChunk('', true);
                return { text: fullText };

            } catch (error) {
                const { code, message } = parseError(error);
                onChunk(message, true);
                return { text: '', error: message, errorCode: code };
            }
        }

        // Server-side: Should use getStreamResponse directly
        return this.sendMessage(userMessage, conversationHistory);
    }

    clearCache(): void {
        this.cache.clear();
        this.logger.info('Cache cleared');
    }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

let serviceInstance: GeminiService | null = null;

export function getGeminiService(config?: Partial<GeminiConfig>): GeminiService {
    if (!serviceInstance) {
        serviceInstance = new GeminiService(config);
    }
    return serviceInstance;
}

export function resetGeminiService(): void {
    serviceInstance = null;
}

// ============================================================
// RE-EXPORTS FOR COMPATIBILITY
// ============================================================

export { SYSTEM_PROMPT };
