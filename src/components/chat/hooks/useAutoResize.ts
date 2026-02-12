import { useEffect, RefObject } from 'react';

export function useAutoResize(
    ref: RefObject<HTMLTextAreaElement | null>,
    value: string,
    maxHeight: number = 200
): void {
    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            const newHeight = Math.min(ref.current.scrollHeight, maxHeight);
            ref.current.style.height = `${newHeight}px`;
        }
    }, [ref, value, maxHeight]);
}
