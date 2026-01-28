import { useState, useEffect, useCallback, useRef } from 'react';

export interface ConsoleMessage {
    id: string;
    type: 'log' | 'info' | 'warn' | 'error' | 'debug';
    content: string;
    timestamp: Date;
    count: number;
}

export function useConsoleCapture() {
    const [messages, setMessages] = useState<ConsoleMessage[]>([]);

    const originalConsoleRef = useRef<{
        log: typeof console.log;
        info: typeof console.info;
        warn: typeof console.warn;
        error: typeof console.error;
        debug: typeof console.debug;
    } | null>(null);

    const formatArgs = (args: unknown[]): string => {
        return args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');
    };

    const addMessage = useCallback((type: ConsoleMessage['type'], args: unknown[]) => {
        const content = formatArgs(args);
        const now = new Date();

        // Use queueMicrotask to avoid setState during render of another component
        queueMicrotask(() => {
            setMessages(prev => {
                // Check if same message as last one (for counting duplicates)
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.type === type && lastMsg.content === content) {
                    const updated = [...prev];
                    updated[updated.length - 1] = { ...lastMsg, count: lastMsg.count + 1 };
                    return updated;
                }

                const newMessage: ConsoleMessage = {
                    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 9)}`,
                    type,
                    content,
                    timestamp: now,
                    count: 1,
                };

                // Keep last 100 messages
                const newMessages = [...prev, newMessage].slice(-100);
                return newMessages;
            });
        });
    }, []);

    useEffect(() => {
        const shouldForwardToConsole = process.env.NODE_ENV !== 'production';

        // Store original console methods
        originalConsoleRef.current = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
            debug: console.debug,
        };

        // Override console methods
        console.log = (...args: unknown[]) => {
            if (shouldForwardToConsole) originalConsoleRef.current?.log(...args);
            addMessage('log', args);
        };

        console.info = (...args: unknown[]) => {
            if (shouldForwardToConsole) originalConsoleRef.current?.info(...args);
            addMessage('info', args);
        };

        console.warn = (...args: unknown[]) => {
            if (shouldForwardToConsole) originalConsoleRef.current?.warn(...args);
            addMessage('warn', args);
        };

        console.error = (...args: unknown[]) => {
            if (shouldForwardToConsole) originalConsoleRef.current?.error(...args);
            addMessage('error', args);
        };

        console.debug = (...args: unknown[]) => {
            if (shouldForwardToConsole) originalConsoleRef.current?.debug(...args);
            addMessage('debug', args);
        };

        // Add initial welcome message
        addMessage('info', ['B.DEV Console initialized']);
        addMessage('log', ['Portfolio v3.0.2 loaded']);

        // Cleanup - restore original console
        return () => {
            if (originalConsoleRef.current) {
                console.log = originalConsoleRef.current.log;
                console.info = originalConsoleRef.current.info;
                console.warn = originalConsoleRef.current.warn;
                console.error = originalConsoleRef.current.error;
                console.debug = originalConsoleRef.current.debug;
            }
        };
    }, [addMessage]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        addMessage('info', ['Console cleared']);
    }, [addMessage]);

    return {
        messages,
        clearMessages,
    };
}
