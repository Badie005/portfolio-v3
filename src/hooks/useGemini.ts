// hooks/useGemini.ts
// ============================================================
// React Hook for Gemini AI Service (Client Side)
// Uses /api/chat which returns a streaming text response
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { GeminiMessage } from '@/lib/gemini';

export interface UseGeminiState {
    messages: GeminiMessage[];
    isLoading: boolean;
    error: string | null;
    streamingText: string;
    isReady: boolean;
}

export interface UseGeminiReturn extends UseGeminiState {
    sendMessage: (message: string) => Promise<void>;
    sendMessageStreaming: (message: string) => Promise<void>;
    clearMessages: () => void;
    clearError: () => void;
    retryLastMessage: () => Promise<void>;
}

export function useGemini(): UseGeminiReturn {
    const [messages, setMessages] = useState<GeminiMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [streamingText, setStreamingText] = useState('');

    // Always ready since we use the API route
    const isReady = true;

    const lastMessageRef = useRef<string>('');
    const abortControllerRef = useRef<AbortController | null>(null);

    /**
     * Send a message and read the streaming response
     */
    const sendMessageStreaming = useCallback(async (message: string) => {
        if (!message.trim()) return;

        lastMessageRef.current = message;
        abortControllerRef.current = new AbortController();

        const userMessage: GeminiMessage = {
            role: 'user',
            parts: [{ text: message }],
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);
        setStreamingText('');

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, history: messages }),
                signal: abortControllerRef.current?.signal,
            });

            // Check if it's an error response (JSON)
            const contentType = response.headers.get("Content-Type") || "";

            if (!response.ok) {
                // Error responses are JSON
                if (contentType.includes("application/json")) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data.error || `Erreur ${response.status}`);
                } else {
                    throw new Error(`Erreur ${response.status}`);
                }
            }

            // Check if we have a body to read
            if (!response.body) {
                throw new Error("Pas de réponse du serveur");
            }

            // Read the streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                setStreamingText(fullText);
            }

            // Add the complete message to history
            if (fullText.trim()) {
                const assistantMessage: GeminiMessage = {
                    role: 'model',
                    parts: [{ text: fullText }],
                    timestamp: Date.now(),
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                setError("Réponse vide du serveur");
            }

        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return;
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            if (process.env.NODE_ENV !== 'production') {
                console.error('[useGemini] Error:', err);
            }
        } finally {
            setIsLoading(false);
            setStreamingText('');
        }
    }, [messages]);

    /**
     * Alias for sendMessageStreaming (backward compatibility)
     */
    const sendMessage = sendMessageStreaming;

    const clearMessages = useCallback(() => {
        abortControllerRef.current?.abort();
        setMessages([]);
        setStreamingText('');
        setError(null);
        setIsLoading(false);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const retryLastMessage = useCallback(async () => {
        if (lastMessageRef.current) {
            setMessages(prev => {
                if (prev.length > 0 && prev[prev.length - 1].role === 'user') {
                    return prev.slice(0, -1);
                }
                return prev;
            });
            await sendMessageStreaming(lastMessageRef.current);
        }
    }, [sendMessageStreaming]);

    return {
        messages,
        isLoading,
        error,
        streamingText,
        isReady,
        sendMessage,
        sendMessageStreaming,
        clearMessages,
        clearError,
        retryLastMessage,
    };
}

export default useGemini;

