import { useRef, useEffect, useCallback, useState } from 'react';
import { PanelConfig } from '../types';

interface UseResizablePanelOptions {
    config: PanelConfig;
    direction: 'left' | 'right';
    onResize?: (width: number) => void;
}

export function useResizablePanel({ config, direction, onResize }: UseResizablePanelOptions) {
    const [width, setWidth] = useState(config.defaultWidth ?? 200);
    const isResizing = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(0);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing.current = true;
        startX.current = e.clientX;
        startWidth.current = width;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.body.style.pointerEvents = 'none';
        (e.target as HTMLElement).style.pointerEvents = 'auto';
    }, [width]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return;

            // Pour le panneau gauche: tirer vers la droite = agrandir (delta positif)
            // Pour le panneau droit: tirer vers la gauche = agrandir (delta négatif inversé)
            const delta = e.clientX - startX.current;
            const adjustedDelta = direction === 'left' ? delta : -delta;

            const newWidth = Math.max(
                config.minWidth ?? 100,
                Math.min(config.maxWidth ?? 500, startWidth.current + adjustedDelta)
            );

            setWidth(newWidth);
            onResize?.(newWidth);
        };

        const handleMouseUp = () => {
            if (isResizing.current) {
                isResizing.current = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                document.body.style.pointerEvents = '';
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [config.minWidth, config.maxWidth, config.defaultWidth, direction, onResize]);

    return { width, startResizing, setWidth };
}
