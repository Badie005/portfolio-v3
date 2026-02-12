import { useCallback, useEffect, RefObject } from 'react';

export function useAutoScroll<T extends HTMLElement>(
    ref: RefObject<T | null>,
    dependencies: unknown[]
): {
    scrollToBottom: () => void;
} {
    const scrollToBottom = useCallback(() => {
        if (ref.current) {
            ref.current.scrollTop = ref.current.scrollHeight;
        }
    }, [ref]);

    useEffect(() => {
        requestAnimationFrame(() => {
            scrollToBottom();
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return { scrollToBottom };
}
