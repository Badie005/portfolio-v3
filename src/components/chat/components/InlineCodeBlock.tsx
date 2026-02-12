import { memo, useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface InlineCodeBlockProps {
    language: string;
    code: string;
}

const InlineCodeBlock = memo<InlineCodeBlockProps>(({ language, code }) => {
    const t = useTranslations('ide');
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const lineCount = code.split('\n').length;
    const shouldCollapse = lineCount > 15;
    const lineCountLabel = t('chat.inlineCode.lines', { count: lineCount });
    const moreLinesLabel = t('chat.inlineCode.moreLines', { count: lineCount - 15 });

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Silently fail
        }
    }, [code]);

    return (
        <div className="my-2 rounded-lg border border-ide-border bg-white">
            <div className="flex items-center justify-between px-3 py-1.5 bg-ide-ui/40 border-b border-ide-border/50 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-ide-muted font-mono">{language}</span>
                    <span className="text-[10px] text-ide-muted/70">{lineCountLabel}</span>
                </div>
                <div className="flex items-center gap-1">
                    {shouldCollapse && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="px-2 py-0.5 rounded text-[10px] hover:bg-ide-ui text-ide-muted hover:text-ide-text transition-colors"
                            aria-label={isExpanded ? t('chat.inlineCode.collapse') : t('chat.inlineCode.expand')}
                        >
                            {isExpanded ? t('chat.inlineCode.collapse') : t('chat.inlineCode.expand')}
                        </button>
                    )}
                    <button
                        onClick={handleCopy}
                        className="p-1 rounded hover:bg-ide-ui text-ide-muted hover:text-ide-text transition-colors"
                        aria-label={copied ? 'Copied' : 'Copy'}
                    >
                        {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                </div>
            </div>
            <div
                className={`overflow-auto bg-ide-ui/20 ${shouldCollapse && !isExpanded ? 'max-h-[300px]' : 'max-h-[500px]'}`}
                style={{ scrollbarWidth: 'thin' }}
            >
                <pre className="p-3 text-[12px] font-mono leading-relaxed min-w-max">
                    <code className="text-ide-text/80 whitespace-pre">{code}</code>
                </pre>
            </div>
            {shouldCollapse && !isExpanded && (
                <div
                    onClick={() => setIsExpanded(true)}
                    className="px-3 py-1.5 bg-ide-ui/30 border-t border-ide-border/30 text-center cursor-pointer hover:bg-ide-ui/50 transition-colors rounded-b-lg"
                >
                    <span className="text-[10px] text-ide-muted">{moreLinesLabel}</span>
                </div>
            )}
        </div>
    );
});

InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
