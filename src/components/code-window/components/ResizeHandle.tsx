import React from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
    onMouseDown: (e: React.MouseEvent) => void;
    orientation?: 'vertical' | 'horizontal';
    className?: string;
}

export function ResizeHandle({
    onMouseDown,
    orientation = 'vertical',
    className
}: ResizeHandleProps) {
    return (
        <div
            className={cn(
                'group relative flex-shrink-0 z-10',
                orientation === 'vertical'
                    ? 'w-[5px] cursor-col-resize'
                    : 'h-[5px] cursor-row-resize',
                className
            )}
            onMouseDown={onMouseDown}
        >
            {/* Zone de détection élargie */}
            <div
                className={cn(
                    'absolute',
                    orientation === 'vertical'
                        ? 'w-[9px] h-full -left-[2px] top-0'
                        : 'h-[9px] w-full -top-[2px] left-0'
                )}
            />
            {/* Ligne visible au hover */}
            <div
                className={cn(
                    'absolute transition-all duration-150',
                    orientation === 'vertical'
                        ? 'w-[2px] h-full left-[1.5px] top-0 bg-transparent group-hover:bg-ide-accent'
                        : 'h-[2px] w-full top-[1.5px] left-0 bg-transparent group-hover:bg-ide-accent'
                )}
            />
        </div>
    );
}
