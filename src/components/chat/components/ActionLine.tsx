import { memo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface ActionLineProps {
    type: 'thought' | 'read' | 'searched';
    text: string;
    time?: string;
    loading?: boolean;
}

const ActionLine = memo<ActionLineProps>(({ type, text, time, loading }) => {
    const t = useTranslations('ide');
    const labels: Record<ActionLineProps['type'], string> = {
        thought: t('chat.actionLabels.thought'),
        read: t('chat.actionLabels.read'),
        searched: t('chat.actionLabels.searched'),
    };

    const [displayedText, setDisplayedText] = useState(loading ? '' : text);

    useEffect(() => {
        if (!loading || !text) {
            setDisplayedText(text);
            return;
        }

        setDisplayedText('');
        let index = 0;
        const speed = 25;
        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, loading]);

    const getIcon = () => {
        switch (type) {
            case 'thought': return '◆';
            case 'read': return '◉';
            case 'searched': return '◎';
            default: return '○';
        }
    };

    return (
        <div className="flex items-center gap-2 py-1 px-1" role="status">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold
                ${loading ? 'bg-[#D97757]/10 text-[#D97757] animate-pulse' : 'bg-[#F5F3EE] text-[#9A9A9A]'}`}
            >
                {getIcon()}
            </div>
            <div className="flex items-center gap-1.5 text-[12px]">
                <span className={`font-medium uppercase tracking-wide ${loading ? 'text-[#D97757]' : 'text-[#6B6B6B]'}`}>
                    {labels[type]}
                </span>
                {text && (
                    <span className="text-[#37352F]">
                        {displayedText}
                        {loading && (
                            <span className="inline-block w-[2px] h-3 bg-[#D97757] ml-1 animate-pulse align-middle" />
                        )}
                    </span>
                )}
                {time && (
                    <span className="text-[#9A9A9A] text-[11px] ml-1">({time})</span>
                )}
            </div>
        </div>
    );
});

ActionLine.displayName = 'ActionLine';
export default ActionLine;
