import { memo, useCallback } from 'react';
import { BookOpen, Wand2, Bug, TestTube } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FileData } from '@/components/code-window/types';

const QUICK_ACTIONS = [
    { id: 'explain', icon: BookOpen },
    { id: 'refactor', icon: Wand2 },
    { id: 'debug', icon: Bug },
    { id: 'tests', icon: TestTube },
] as const;

interface QuickActionsToolbarProps {
    onAction: (prompt: string) => void;
    activeFile: FileData | null | undefined;
    disabled?: boolean;
}

const QuickActionsToolbar = memo<QuickActionsToolbarProps>(({ onAction, activeFile, disabled }) => {
    const t = useTranslations('ide');

    const handleAction = useCallback((actionId: string) => {
        const prompts: Record<string, string> = {
            explain: t('chat.quickActions.explainPrompt', { filename: activeFile?.name || 'this file' }),
            refactor: t('chat.quickActions.refactorPrompt', { filename: activeFile?.name || 'this file' }),
            debug: t('chat.quickActions.debugPrompt', { filename: activeFile?.name || 'this file' }),
            tests: t('chat.quickActions.testsPrompt', { filename: activeFile?.name || 'this file' }),
        };
        onAction(prompts[actionId] || '');
    }, [onAction, activeFile, t]);

    if (!activeFile) return null;

    return (
        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-[#E8E5DE]/50 bg-[#FAF9F6]/50">
            {QUICK_ACTIONS.map(({ id, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => handleAction(id)}
                    disabled={disabled}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#6B6B6B] bg-white border border-[#E8E5DE] hover:border-[#D97757]/40 hover:text-[#D97757] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t(`chat.quickActions.${id}`)}
                >
                    <Icon size={12} aria-hidden="true" />
                    {t(`chat.quickActions.${id}`)}
                </button>
            ))}
        </div>
    );
});

QuickActionsToolbar.displayName = 'QuickActionsToolbar';
export default QuickActionsToolbar;
