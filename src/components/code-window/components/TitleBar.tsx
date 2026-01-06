import { Menu, Terminal, PanelLeft, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TitleBarProps {
    title: string;
    onToggleTerminal: () => void;
    onToggleSidebar: () => void;
    onToggleChat?: () => void;
    showMobileMenu: boolean;
    className?: string;
}

export function TitleBar({
    title,
    onToggleTerminal,
    onToggleSidebar,
    onToggleChat,
    showMobileMenu,
    className
}: TitleBarProps) {
    return (
        <header className={cn(
            'h-10 bg-ide-bg border-b border-ide-border',
            'flex items-center justify-between px-4',
            'shrink-0 select-none z-10',
            className
        )}>
            {/* Traffic Lights + Toggle Buttons */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 group">
                    <TrafficLight color="red" />
                    <TrafficLight color="yellow" />
                    <TrafficLight color="green" />
                </div>

                {/* Toggle Buttons */}
                <div className="hidden md:flex items-center gap-1 ml-2">
                    <button
                        onClick={onToggleSidebar}
                        className="p-1.5 rounded hover:bg-ide-ui text-ide-muted hover:text-ide-text transition-colors"
                        title="Toggle Sidebar (Ctrl+B)"
                    >
                        <PanelLeft size={14} />
                    </button>
                    <button
                        onClick={onToggleTerminal}
                        className="p-1.5 rounded hover:bg-ide-ui text-ide-muted hover:text-ide-text transition-colors"
                        title="Toggle Terminal (Ctrl+J)"
                    >
                        <Terminal size={14} />
                    </button>
                    {onToggleChat && (
                        <button
                            onClick={onToggleChat}
                            className="p-1.5 rounded hover:bg-ide-ui text-ide-muted hover:text-ide-text transition-colors"
                            title="Toggle AI Agent (Ctrl+L)"
                        >
                            <MessageSquare size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Title */}
            <h1 className="text-xs font-medium text-ide-muted tracking-wide opacity-80 absolute left-1/2 -translate-x-1/2">
                {title}
            </h1>

            {/* Actions */}
            <div className="flex items-center gap-2 justify-end">
                {showMobileMenu && (
                    <button
                        onClick={onToggleSidebar}
                        className="md:hidden p-1 hover:bg-ide-ui rounded transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <Menu size={18} className="text-ide-muted" />
                    </button>
                )}
            </div>
        </header>
    );
}

interface TrafficLightProps {
    color: 'red' | 'yellow' | 'green';
    onClick?: () => void;
    title?: string;
}

function TrafficLight({ color, onClick, title }: TrafficLightProps) {
    const colorClasses = {
        red: 'bg-[#ff5f57] border-[#e0443e]',
        yellow: 'bg-[#febc2e] border-[#d89e24]',
        green: 'bg-[#28c840] border-[#1aab29]',
    };

    return (
        <button
            onClick={onClick}
            title={title}
            className={cn(
                'w-3 h-3 rounded-full border shadow-sm transition-opacity',
                colorClasses[color],
                onClick && 'cursor-pointer hover:opacity-80'
            )}
            aria-label={title}
        />
    );
}
