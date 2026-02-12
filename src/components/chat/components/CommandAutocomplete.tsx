import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { SlashCommand } from '../hooks/useCommandAutocomplete';

interface CommandAutocompleteProps {
    commands: SlashCommand[];
    selectedIndex: number;
    onSelect: (command: SlashCommand) => void;
    visible: boolean;
}

const categoryIcons: Record<string, string> = {
    navigation: '→',
    mode: '◉',
    file: '📄',
    terminal: '⌘',
    panel: '▦',
    export: '↓',
    info: 'ℹ',
    code: '⟨⟩',
    chat: '💬',
};

const CommandAutocomplete = memo<CommandAutocompleteProps>(({
    commands,
    selectedIndex,
    onSelect,
    visible
}) => {
    const t = useTranslations('ide');
    
    if (!visible || commands.length === 0) return null;

    return (
        <div 
            className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-lg border border-[#E8E5DE] shadow-lg overflow-hidden z-50"
            role="listbox"
            aria-label="Command suggestions"
        >
            <div className="max-h-[200px] overflow-y-auto">
                {commands.map((cmd, idx) => (
                    <button
                        key={cmd.command}
                        onClick={() => onSelect(cmd)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                            idx === selectedIndex 
                                ? 'bg-[#D97757]/10 border-l-2 border-[#D97757]' 
                                : 'hover:bg-[#F5F3EE]'
                        }`}
                        role="option"
                        aria-selected={idx === selectedIndex}
                    >
                        <span className="text-[14px] w-6 text-center text-[#9A9A9A]" aria-hidden="true">
                            {categoryIcons[cmd.category] || '•'}
                        </span>
                        <div className="flex-1 min-w-0">
                            <span className="text-[13px] font-mono font-medium text-[#37352F]">
                                {cmd.command}
                            </span>
                            {cmd.hasArg && (
                                <span className="text-[11px] text-[#9A9A9A] ml-1">&lt;arg&gt;</span>
                            )}
                        </div>
                        <span className="text-[11px] text-[#6B6B6B] truncate max-w-[150px]">
                            {cmd.description}
                        </span>
                    </button>
                ))}
            </div>
            <div className="px-3 py-1.5 bg-[#F5F3EE] border-t border-[#E8E5DE] text-[10px] text-[#9A9A9A]">
                {t('chat.autocomplete.hint')}
            </div>
        </div>
    );
});

CommandAutocomplete.displayName = 'CommandAutocomplete';
export default CommandAutocomplete;
