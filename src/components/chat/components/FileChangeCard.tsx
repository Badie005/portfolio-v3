import { memo, useState, useCallback } from 'react';
import { FileCode, Check, Sparkles, Loader2 } from 'lucide-react';
import { CodeChange } from '../ChatReducer';

interface FileChangeCardProps {
    change: CodeChange;
    onApply: () => void;
    onClick: () => void;
    disabled?: boolean;
}

const FileChangeCard = memo<FileChangeCardProps>(({ change, onApply, onClick, disabled }) => {
    const [isApplying, setIsApplying] = useState(false);
    const lineCount = change.newCode.split('\n').length;
    const linesRemoved = change.linesRemoved || 0;

    const handleApply = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled || isApplying) return;
        setIsApplying(true);
        try {
            await onApply();
        } finally {
            setIsApplying(false);
        }
    }, [onApply, disabled, isApplying]);

    return (
        <div
            onClick={onClick}
            className={`group cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                change.applied
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'hover:bg-[#F5F3EE] border border-transparent hover:border-[#E8E5DE]'
            }`}
            role="button"
            tabIndex={0}
            aria-label={`File change: ${change.filename}`}
        >
            <FileCode size={14} className={change.applied ? 'text-emerald-600' : 'text-[#9A9A9A]'} aria-hidden="true" />

            <span className={`text-[13px] font-medium flex-1 truncate ${
                change.applied ? 'text-emerald-700' : 'text-[#37352F]'
            }`}>
                {change.filename}
            </span>

            <div className="flex items-center gap-1 text-[12px] font-mono">
                <span className="text-emerald-600">+{lineCount}</span>
                {linesRemoved > 0 && <span className="text-red-500">-{linesRemoved}</span>}
            </div>

            {change.applied ? (
                <Check size={14} className="text-emerald-600" aria-hidden="true" />
            ) : (
                <button
                    onClick={handleApply}
                    disabled={disabled || isApplying}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/50 transition-all"
                    aria-label="Apply change"
                >
                    {isApplying ? (
                        <Loader2 size={12} className="animate-spin text-[#9A9A9A]" />
                    ) : (
                        <Sparkles size={12} className="text-ide-accent" />
                    )}
                </button>
            )}
        </div>
    );
});

FileChangeCard.displayName = 'FileChangeCard';
export default FileChangeCard;
