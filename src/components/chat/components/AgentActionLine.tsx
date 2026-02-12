import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AgentAction } from '../ChatReducer';

interface AgentActionLineProps {
    action: AgentAction;
}

const AgentActionLine = memo<AgentActionLineProps>(({ action }) => {
    const t = useTranslations('ide');
    const labels: Record<AgentAction['type'], string> = {
        read: t('chat.actionLabels.read'),
        create: t('chat.actionLabels.created'),
        delete: t('chat.actionLabels.deleted'),
        modify: t('chat.actionLabels.modified'),
        thought: t('chat.actionLabels.thought'),
        search: t('chat.actionLabels.searched'),
    };

    const getIcon = () => {
        switch (action.type) {
            case 'read': return '◉';
            case 'create': return '+';
            case 'delete': return '−';
            case 'modify': return '✎';
            case 'search': return '◎';
            default: return '○';
        }
    };

    return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F5F3EE] text-[#37352F]">
            <span className="text-[10px]">{getIcon()}</span>
            <span>{labels[action.type]}</span>
            {action.filename && (
                <span className="text-[#9A9A9A]">{action.filename}</span>
            )}
            {action.status === 'pending' && (
                <Loader2 size={10} className="animate-spin text-[#D97757]" />
            )}
        </div>
    );
});

AgentActionLine.displayName = 'AgentActionLine';
export default AgentActionLine;
