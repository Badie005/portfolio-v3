import { useState, useCallback } from 'react';

const STORAGE_KEY = 'bai-input-history';
const MAX_HISTORY = 50;

function loadHistory(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveHistory(history: string[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    } catch {
        // Silently fail
    }
}

export function useInputHistory(): {
    inputHistory: string[];
    historyIndex: number;
    addToHistory: (input: string) => void;
    navigateUp: () => string | null;
    navigateDown: () => string | null;
    resetNavigation: () => void;
} {
    const [inputHistory, setInputHistory] = useState<string[]>(() => loadHistory());
    const [historyIndex, setHistoryIndex] = useState(-1);

    const addToHistory = useCallback((input: string) => {
        if (!input.trim()) return;
        setInputHistory(prev => {
            const filtered = prev.filter(h => h !== input);
            const updated = [input, ...filtered].slice(0, MAX_HISTORY);
            saveHistory(updated);
            return updated;
        });
        setHistoryIndex(-1);
    }, []);

    const navigateUp = useCallback((): string | null => {
        if (inputHistory.length === 0) return null;
        
        if (historyIndex === -1) {
            setHistoryIndex(0);
            return inputHistory[0] || null;
        }
        
        if (historyIndex < inputHistory.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            return inputHistory[newIndex] || null;
        }
        
        return inputHistory[historyIndex] || null;
    }, [inputHistory, historyIndex]);

    const navigateDown = useCallback((): string | null => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            return inputHistory[newIndex] || null;
        }
        
        if (historyIndex === 0) {
            setHistoryIndex(-1);
            return '';
        }
        
        return null;
    }, [inputHistory, historyIndex]);

    const resetNavigation = useCallback(() => {
        setHistoryIndex(-1);
    }, []);

    return {
        inputHistory,
        historyIndex,
        addToHistory,
        navigateUp,
        navigateDown,
        resetNavigation,
    };
}
