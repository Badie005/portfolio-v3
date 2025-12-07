import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Guard against undefined key
        if (!e.key) return;

        // Ignore events from input elements (allow normal typing)
        const target = e.target as HTMLElement;
        const isInputElement =
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable;

        if (isInputElement) return;

        for (const shortcut of shortcuts) {
            if (!shortcut.key) continue;

            const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
            const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
            const altMatch = shortcut.alt ? e.altKey : !e.altKey;
            const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

            if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
                e.preventDefault();
                shortcut.action();
                break;
            }
        }
    }, [shortcuts]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return shortcuts;
}
