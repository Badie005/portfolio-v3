import { GitBranch, AlertCircle, Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatusBarProps {
    language: string;
    lineCount: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ language, lineCount }) => {
    const t = useTranslations('ide');
    const currentLine = Math.min(10, lineCount);
    const formattedLanguage = language === 'lock' ? t('statusBar.json') : language;

    return (
        <div className="h-6 bg-ide-accent text-white flex items-center justify-between px-3 text-[10px] select-none font-sans shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 hover:bg-white/20 px-1 py-0.5 rounded cursor-pointer transition-colors">
                    <GitBranch size={10} />
                    <span className="font-medium">{t('statusBar.branch')}</span>
                </div>
                <div className="flex items-center gap-1 hover:bg-white/20 px-1 py-0.5 rounded cursor-pointer transition-colors">
                    <AlertCircle size={10} />
                    <span>0</span>
                    <span className="opacity-60">0</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 hover:bg-white/20 px-1 py-0.5 rounded cursor-pointer transition-colors hidden sm:flex">
                    <span>{t('statusBar.lineCol', { line: currentLine, col: 1 })}</span>
                </div>
                <div className="hover:bg-white/20 px-1 py-0.5 rounded cursor-pointer transition-colors hidden sm:block">
                    {t('statusBar.encoding')}
                </div>
                <div className="hover:bg-white/20 px-1 py-0.5 rounded cursor-pointer transition-colors uppercase font-medium">
                    {formattedLanguage}
                </div>
                <div className="hover:bg-white/20 px-1 py-0.5 rounded cursor-pointer transition-colors">
                    <Bell size={10} />
                </div>
            </div>
        </div>
    );
};

export default StatusBar;
