// hooks/useGemini.ts
// ============================================================
// React Hook for Gemini AI Service (Client Side)
// Uses /api/chat to protect API Key
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { GeminiMessage, GeminiResponse } from '@/lib/gemini';

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

    const callApi = async (message: string, history: GeminiMessage[]) => {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, history }),
            signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || `Error ${response.status}`);
        }

        const data = await response.json();
        return data.response as GeminiResponse;
    };

    const sendMessage = useCallback(async (message: string) => {
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

        try {
            const response = await callApi(message, messages);

            if (response.error) {
                setError(response.error);
            } else {
                const assistantMessage: GeminiMessage = {
                    role: 'model',
                    parts: [{ text: response.text }],
                    timestamp: Date.now(),
                };
                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return;
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    const sendMessageStreaming = useCallback(async (message: string) => {
        // Note: The current API route does not support streaming yet.
        // We fallback to standard sendMessage but simulate the interface.
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
        setStreamingText(''); // Reset streaming text

        try {
            // Simulate "thinking" or waiting state
            const response = await callApi(message, messages);

            if (response.error) {
                setError(response.error);
            } else {
                // Since we don't have real streaming, we just set the full text at the end
                // Ideally we would stream the response from the API
                const assistantMessage: GeminiMessage = {
                    role: 'model',
                    parts: [{ text: response.text }],
                    timestamp: Date.now(),
                };
                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return;
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
            setStreamingText('');
        }
    }, [messages]);

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
            await sendMessage(lastMessageRef.current);
        }
    }, [sendMessage]);

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
