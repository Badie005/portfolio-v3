import React from 'react';
import { GitBranch, AlertCircle, Bell } from 'lucide-react';

interface StatusBarProps {
    language: string;
    lineCount: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ language, lineCount }) => {
    return (
        <div className="h-6 bg-ide-accent text-white flex items-center justify-between px-3 text-[10px] select-none font-sans shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 hover:bg-white/20 px-1 py-0.5 rounded cursor-pointer transition-colors">
                    <GitBranch size={10} />
                    <span className="font-medium">main*</span>
                </div>
                <div className="flex items-center gap-1 hover:bg-white/20 px-1 py-0.5 rounded cursor-pointer transition-colors">
                    <AlertCircle size={10} />
                    <span>0</span>
                    <span className="opacity-60">0</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 hover:bg-white/20 px-1 py-0.5 rounded cursor-pointer transition-colors hidden sm:flex">
                    <span>Ln {Math.min(10, lineCount)}, Col 1</span>
                </div>
                <div className="hover:bg-white/20 px-1 py-0.5 rounded cursor-pointer transition-colors hidden sm:block">
                    UTF-8
                </div>
                <div className="hover:bg-white/20 px-1 py-0.5 rounded cursor-pointer transition-colors uppercase font-medium">
                    {language === 'lock' ? 'JSON' : language}
                </div>
                <div className="hover:bg-white/20 px-1 py-0.5 rounded cursor-pointer transition-colors">
                    <Bell size={10} />
                </div>
            </div>
        </div>
    );
};

export default StatusBar;
