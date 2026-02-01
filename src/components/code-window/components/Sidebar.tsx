import { X, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { FileSystemItem, FileData } from '../types';
import FileTree from './FileTree';

interface SidebarProps {
    title: string;
    files: FileSystemItem[];
    activeFileName: string;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onFileClick: (file: FileData) => void;
    isOpen: boolean;
    onClose: () => void;
    width: number;
    isMobile: boolean;
    className?: string;
}

export function Sidebar({
    title,
    files,
    activeFileName,
    searchQuery,
    onSearchChange,
    onFileClick,
    isOpen,
    onClose,
    width,
    isMobile,
    className,
}: SidebarProps) {
    const t = useTranslations('ide');

    return (
        <aside
            style={{ width: isMobile && isOpen ? '100%' : width }}
            className={cn(
                'bg-ide-sidebar border-r border-ide-border flex flex-col shrink-0 transition-transform duration-200 overflow-hidden',
                isMobile ? 'absolute z-20 h-full shadow-xl' : 'relative h-full',
                isMobile && !isOpen && '-translate-x-full',
                isMobile && isOpen && 'translate-x-0',
                className
            )}
        >
            {/* Header */}
            <header className="h-9 flex items-center justify-between px-4 pt-2 mb-2">
                <h2 className="text-ide-muted text-[11px] font-bold tracking-wider uppercase">
                    {title}
                </h2>
                {isMobile && (
                    <button
                        onClick={onClose}
                        className="text-ide-muted hover:text-ide-text transition-colors"
                        aria-label={t('sidebar.closeSidebar')}
                    >
                        <X size={14} />
                    </button>
                )}
            </header>

            {/* Search */}
            <div className="px-4 pb-3">
                <div className="relative group">
                    <Search
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-ide-accent transition-colors"
                        size={12}
                    />
                    <input
                        type="text"
                        placeholder={t('sidebar.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={cn(
                            'w-full bg-white/80 backdrop-blur-sm border border-ide-border rounded-md',
                            'py-1 pl-7 pr-2 text-xs text-ide-text',
                            'placeholder:text-ide-muted',
                            'focus:outline-none focus:border-ide-accent/50',
                            'focus:ring-1 focus:ring-ide-accent/20',
                            'transition-all'
                        )}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-ide-muted hover:text-ide-text"
                            aria-label={t('sidebar.clearSearch')}
                        >
                            <X size={10} />
                        </button>
                    )}
                </div>
            </div>

            {/* File Tree */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
                <div className="w-full">
                    <FileTree
                        items={files}
                        activeFileName={activeFileName}
                        onFileClick={onFileClick}
                    />
                </div>
            </nav>
        </aside>
    );
}
