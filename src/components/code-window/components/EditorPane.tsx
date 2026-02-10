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
            {file ? (
                <>
                    {/* Line Numbers - sticky to left (hide for images) */}
                    {file.type !== 'image' && file.type !== 'svg' && (
                        <div className="sticky left-0 bg-white z-10">
                            <LineNumbers count={lineCount} />
                        </div>
                    )}

                    {/* Content */}
                    <div className={cn(
                        "flex-1 animate-in fade-in duration-300 min-w-0",
                        (file.type === 'image' || file.type === 'svg')
                            ? "flex items-center justify-center p-8"
                            : "pr-8 pb-20 flex"
                    )}>
                        {(file.type === 'image' || file.type === 'svg') ? (
                            <div className="flex items-center justify-center w-full h-full">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={file.content}
                                    alt={file.name}
                                    className="max-w-[90%] max-h-[80vh] w-auto h-auto object-contain rounded-lg"
                                />
                            </div>
                        ) : (
                            <SyntaxHighlighter
                                content={file.content}
                                language={file.type}
                            />
                        )}
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
