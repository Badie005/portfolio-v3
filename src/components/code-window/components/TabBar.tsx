import React from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    isDirty?: boolean;
}

interface TabBarProps {
    tabs: Tab[];
    activeTabId: string;
    onTabClick: (tabId: string) => void;
    onTabClose: (tabId: string) => void;
    onTabContextMenu?: (tabId: string, e: React.MouseEvent) => void;
    className?: string;
}

export function TabBar({
    tabs,
    activeTabId,
    onTabClick,
    onTabClose,
    onTabContextMenu,
    className
}: TabBarProps) {
    const t = useTranslations('ide');
    const handleClose = (e: React.MouseEvent, tabId: string) => {
        e.stopPropagation();
        onTabClose(tabId);
    };

    return (
        <div className={cn(
            'flex bg-ide-bg border-b border-ide-border pt-1.5 px-2 gap-1 overflow-x-auto no-scrollbar',
            className
        )}>
            {tabs.map(tab => {
                const isActive = tab.id === activeTabId;

                return (
                    <div
                        key={tab.id}
                        onClick={() => onTabClick(tab.id)}
                        onContextMenu={(e) => onTabContextMenu?.(tab.id, e)}
                        className={cn(
                            'group flex items-center gap-2 px-3 py-2 text-xs cursor-pointer',
                            'min-w-[120px] max-w-[180px] select-none rounded-t-md',
                            'border-t border-l border-r transition-colors',
                            isActive
                                ? 'bg-white text-ide-text border-ide-border shadow-sm translate-y-[1px] relative z-10'
                                : 'bg-transparent text-ide-muted border-transparent hover:bg-ide-ui/40'
                        )}
                    >
                        {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                        <span className="truncate flex-1">
                            {tab.label}
                            {tab.isDirty && <span className="ml-1 text-ide-accent">●</span>}
                        </span>
                        <button
                            onClick={(e) => handleClose(e, tab.id)}
                            className={cn(
                                'p-0.5 rounded hover:bg-ide-ui transition-opacity',
                                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            )}
                            aria-label={t('tabBar.closeTab', { tab: tab.label })}
                        >
                            <X size={12} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
