import { memo, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ArrowUp, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EmptyStateProps {
    onSuggestionClick?: (suggestion: string) => void;
    input: string;
    setInput: (value: string) => void;
    onSend: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    isLoading: boolean;
    isServiceReady: boolean;
}

const EmptyState = memo<EmptyStateProps>(({
    onSuggestionClick,
    input,
    setInput,
    onSend,
    onKeyDown,
    isLoading,
    isServiceReady
}) => {
    const t = useTranslations('ide');
    const suggestions = (t.raw('chat.emptyState.suggestions') as Array<{ text: string; icon?: string; prompt?: string }>) || [];
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSend();
    }, [onSend]);

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6 animate-chat-scale-in">
            <div className="w-full max-w-[480px] text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                    <Image
                        src="/logo/IDE/Logo-AI-illustration.svg"
                        alt="B.AI"
                        width={100}
                        height={100}
                        priority
                    />
                </div>

                <h2 className="text-base sm:text-lg font-mono font-medium text-[#37352F] tracking-tight">
                    <span className="text-[#37352F]">{t('chat.emptyState.prompt')}</span>
                    <span className="inline-block w-2.5 h-5 bg-[#D97757] ml-2 animate-pulse align-middle"></span>
                </h2>
            </div>

            <div className="w-full max-w-[480px]">
                <form onSubmit={handleSubmit} className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E8E5DE] shadow-[0_8px_32px_-12px_rgba(20,20,19,0.15)] overflow-hidden focus-within:border-[#D97757]/40 focus-within:shadow-lg transition-all">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder={t('chat.emptyState.placeholder')}
                        className="text-ide-text text-[15px] w-full resize-none bg-transparent px-4 py-4 outline-none placeholder:text-ide-muted/70 min-h-[48px] max-h-[200px] overflow-y-hidden"
                        rows={1}
                        spellCheck={false}
                        disabled={isLoading || !isServiceReady}
                        aria-label={t('chat.emptyState.placeholder')}
                    />

                    <div className="px-4 py-3 border-t border-[#E8E5DE]/50 flex items-center justify-between">
                        <Image src="/logo/IDE/Logo AI.svg" alt="B.AI" width={28} height={12} />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading || !isServiceReady}
                            className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                                input.trim() && !isLoading && isServiceReady
                                    ? 'bg-[#D97757] text-white shadow-sm hover:bg-[#c86a4c]'
                                    : 'bg-ide-ui/50 text-ide-muted cursor-not-allowed'
                            }`}
                            aria-label="Send message"
                        >
                            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={14} />}
                        </button>
                    </div>
                </form>

                {onSuggestionClick && (
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                        {suggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSuggestionClick(suggestion.prompt || suggestion.text)}
                                className="group flex items-center gap-2 text-[13px] px-4 py-2.5 rounded-full border border-[#E8E5DE] bg-white/80 text-[#37352F]/80 shadow-sm transition-all hover:border-[#D97757]/40 hover:bg-white hover:shadow-md hover:text-[#37352F]"
                            >
                                {suggestion.icon && (
                                    <Image
                                        src={`/icons/IDE-icone/${suggestion.icon}.svg`}
                                        alt=""
                                        width={16}
                                        height={16}
                                        className="w-4 h-4 opacity-60 group-hover:opacity-80 transition-opacity"
                                    />
                                )}
                                {suggestion.text}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

EmptyState.displayName = 'EmptyState';
export default EmptyState;
