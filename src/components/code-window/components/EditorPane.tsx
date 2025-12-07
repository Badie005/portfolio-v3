import { cn } from '@/lib/utils';
import { FileData } from '../types';
import SyntaxHighlighter from './SyntaxHighlighter';
import { EmptyState } from './EmptyState';

interface EditorPaneProps {
    file: FileData | null;
    className?: string;
}

export function EditorPane({ file, className }: EditorPaneProps) {
    const lineCount = file?.content.split('\n').length || 0;

    return (
        <div className={cn(
            'h-full w-full overflow-y-auto overflow-x-auto flex text-[13px] leading-6 py-4 relative',
            'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400',
            className
        )}>
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-bold text-gray-900 opacity-[0.02] pointer-events-none select-none z-0">
                B.DEV
            </div>

            {file ? (
                <>
                    {/* Line Numbers - sticky to left */}
                    <div className="sticky left-0 bg-white z-10">
                        <LineNumbers count={lineCount} />
                    </div>

                    {/* Code Content */}
                    <div className="flex-1 pr-8 animate-in fade-in duration-300 pb-20 min-w-0">
                        <SyntaxHighlighter
                            content={file.content}
                            language={file.type}
                        />
                    </div>
                </>
            ) : (
                <EmptyState />
            )}
        </div>
    );
}

function LineNumbers({ count }: { count: number }) {
    return (
        <div className="w-12 flex flex-col items-end pr-4 text-gray-300 select-none shrink-0 font-mono text-[11px] pt-[2px]">
            {Array.from({ length: count }, (_, i) => (
                <div key={i}>{i + 1}</div>
            ))}
        </div>
    );
}
