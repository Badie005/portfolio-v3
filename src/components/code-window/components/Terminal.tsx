import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { useTerminal } from '../hooks/useTerminal';
import { useConsoleCapture, ConsoleMessage } from '../hooks/useConsoleCapture';
import { FileSystemItem, TerminalMessage } from '../types';
import { parseAnsi } from '@/lib/ansi';
import { SnakeGame } from './SnakeGame';

// Output line renderer component - IDE style without icons
const OutputLine: React.FC<{ msg: TerminalMessage; promptPath: string }> = ({ msg }) => {
// ... (rest of the component remains same until render)
    // Get text styling - IDE colors only
    const getContainerClass = () => {
        const base = 'whitespace-pre-wrap break-all font-mono text-[11px] leading-5';
        if (msg.type === 'command') return `${base} text-ide-text mt-2 mb-0.5 font-medium`;
        // Les couleurs sont maintenant gérées par le parseur ANSI pour le contenu
        return `${base} text-ide-text/90`;
    };

    const content = msg.type === 'command' 
        ? msg.content 
        : parseAnsi(msg.content);

    return (
        <div className="flex items-start">
            {msg.type === 'command' && (
                <span className="shrink-0 select-none mr-2 text-ide-accent font-medium">$</span>
            )}
            <span className={getContainerClass()}>{content}</span>
        </div>
    );
};

// Console message line renderer - IDE style without icons
const ConsoleMessageLine: React.FC<{ message: ConsoleMessage }> = ({ message }) => {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const getTypeLabel = () => {
        switch (message.type) {
            case 'error': return '[ERR]';
            case 'warn': return '[WRN]';
            case 'info': return '[INF]';
            case 'debug': return '[DBG]';
            default: return '[LOG]';
        }
    };

    const getTextClass = () => {
        switch (message.type) {
            case 'error': return 'text-red-600';
            case 'warn': return 'text-amber-600';
            case 'info': return 'text-blue-600';
            case 'debug': return 'text-gray-500';
            default: return 'text-ide-text';
        }
    };

    return (
        <div className="flex items-start gap-2 px-2 py-0.5 hover:bg-black/5 font-mono text-[11px]">
            <span className="text-gray-400 shrink-0">{formatTime(message.timestamp)}</span>
            <span className={`shrink-0 ${getTextClass()}`}>{getTypeLabel()}</span>
            <span className={`flex-1 break-all whitespace-pre-wrap ${getTextClass()}`}>{message.content}</span>
            {message.count > 1 && (
                <span className="text-[9px] px-1 bg-gray-200 text-gray-600 rounded shrink-0">x{message.count}</span>
            )}
        </div>
    );
};

interface TerminalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenFile: (filename: string) => string | null;
    files: FileSystemItem[];
    isMaximized?: boolean;
    onToggleMaximize?: () => void;
}

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 600;
const DEFAULT_HEIGHT = 200;

const Terminal: React.FC<TerminalProps> = ({ 
    isOpen, 
    onClose, 
    onOpenFile, 
    files,
    isMaximized = false,
    onToggleMaximize 
}) => {
    const {
        history,
        setHistory,
        executeCommand,
        navigateHistory,
        getCommandSuggestions,
        getFileSuggestions,
        getPrompt,
        currentPath,
    } = useTerminal({ files, onOpenFile });

    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeTab, setActiveTab] = useState<'terminal' | 'console' | 'output' | 'problems' | 'debug'>('terminal');
    const [consoleFilter, setConsoleFilter] = useState<'all' | 'log' | 'info' | 'warn' | 'error'>('all');
    const [consoleSearch, setConsoleSearch] = useState('');
    const [height, setHeight] = useState(DEFAULT_HEIGHT);
    const [isResizing, setIsResizing] = useState(false);
    const [showSnake, setShowSnake] = useState(false);
    const startYRef = useRef(0);
    const startHeightRef = useRef(0);
    
    // Console capture hook
    const { messages: consoleMessages, clearMessages: clearConsole } = useConsoleCapture();
    
    // Filtered console messages
    const filteredConsoleMessages = consoleMessages.filter(msg => {
        const matchesFilter = consoleFilter === 'all' || msg.type === consoleFilter;
        const matchesSearch = !consoleSearch || msg.content.toLowerCase().includes(consoleSearch.toLowerCase());
        return matchesFilter && matchesSearch;
    });
    
    const bottomRef = useRef<HTMLDivElement>(null);
    const consoleBottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    // Resize handlers
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        startYRef.current = e.clientY;
        startHeightRef.current = height;
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
    }, [height]);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const delta = startYRef.current - e.clientY;
            const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeightRef.current + delta));
            setHeight(newHeight);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing]);

    // Auto-scroll to bottom for terminal
    useEffect(() => {
        if (isOpen && bottomRef.current && activeTab === 'terminal') {
            bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [history, isOpen, activeTab]);

    // Auto-scroll for console
    useEffect(() => {
        if (isOpen && consoleBottomRef.current && activeTab === 'console') {
            consoleBottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [consoleMessages, isOpen, activeTab]);

    // Focus input when terminal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Update suggestions based on input
    useEffect(() => {
        if (!input) {
             
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const parts = input.split(' ');
        const lastPart = parts[parts.length - 1];
        
        if (parts.length === 1) {
            // Command suggestions
            const cmdSuggestions = getCommandSuggestions(input);
            setSuggestions(cmdSuggestions);
            setShowSuggestions(cmdSuggestions.length > 0);
        } else {
            // File suggestions for commands that take file arguments
            const fileCommands = ['cat', 'open', 'head', 'tail', 'wc', 'grep', 'cd', 'ls'];
            if (fileCommands.includes(parts[0].toLowerCase())) {
                const fileSuggestions = getFileSuggestions(lastPart, currentPath);
                setSuggestions(fileSuggestions);
                setShowSuggestions(fileSuggestions.length > 0);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }
        setSelectedSuggestion(-1);
    }, [input, getCommandSuggestions, getFileSuggestions, currentPath]);

    const handleCommand = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        
        if (input.trim().toLowerCase() === 'snake' || input.trim().toLowerCase() === 'game') {
            setShowSnake(true);
            setInput('');
            return;
        }

        executeCommand(input);
        setInput('');
        setShowSuggestions(false);
    }, [input, executeCommand]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        // History navigation
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (showSuggestions && suggestions.length > 0) {
                setSelectedSuggestion(prev => Math.max(0, prev - 1));
            } else {
                const prevCmd = navigateHistory('up');
                setInput(prevCmd);
            }
            return;
        }
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (showSuggestions && suggestions.length > 0) {
                setSelectedSuggestion(prev => Math.min(suggestions.length - 1, prev + 1));
            } else {
                const nextCmd = navigateHistory('down');
                setInput(nextCmd);
            }
            return;
        }

        // Tab completion
        if (e.key === 'Tab') {
            e.preventDefault();
            if (suggestions.length > 0) {
                const suggestion = selectedSuggestion >= 0 ? suggestions[selectedSuggestion] : suggestions[0];
                const parts = input.split(' ');
                if (parts.length === 1) {
                    setInput(suggestion + ' ');
                } else {
                    parts[parts.length - 1] = suggestion;
                    setInput(parts.join(' '));
                }
                setShowSuggestions(false);
            }
            return;
        }

        // Enter with suggestion selected
        if (e.key === 'Enter' && selectedSuggestion >= 0 && showSuggestions) {
            e.preventDefault();
            const suggestion = suggestions[selectedSuggestion];
            const parts = input.split(' ');
            if (parts.length === 1) {
                setInput(suggestion + ' ');
            } else {
                parts[parts.length - 1] = suggestion;
                setInput(parts.join(' '));
            }
            setShowSuggestions(false);
            return;
        }

        // Escape to close suggestions
        if (e.key === 'Escape') {
            setShowSuggestions(false);
            setSelectedSuggestion(-1);
            return;
        }

        // Ctrl+L to clear
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            setHistory([]);
            return;
        }

        // Ctrl+C to cancel
        if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            setInput('');
            setHistory(prev => [...prev, { type: 'output', content: '^C' }]);
            return;
        }

        // Ctrl+U to clear line
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            setInput('');
            return;
        }
    }, [showSuggestions, suggestions, selectedSuggestion, navigateHistory, input, setHistory]);

    const prompt = getPrompt();

    if (!isOpen) return null;

    return (
        <div 
            className="border-t border-ide-border bg-ide-bg flex flex-col font-mono text-[11px] shrink-0 w-full"
            style={{ 
                height: isMaximized ? '100%' : `${height}px`,
                minHeight: `${MIN_HEIGHT}px`,
                maxHeight: isMaximized ? undefined : `${MAX_HEIGHT}px`,
                flex: isMaximized ? '1 1 auto' : '0 0 auto',
            }}
        >
            {/* Resize Handle - at the top */}
            <div 
                className={`h-1 w-full cursor-ns-resize hover:bg-ide-accent/50 transition-colors shrink-0 ${isResizing ? 'bg-ide-accent' : 'bg-ide-border'}`}
                onMouseDown={handleResizeStart}
            />
            
            {/* Terminal Tab Bar - IDE style */}
            <div className="h-7 border-b border-ide-border flex items-center justify-between px-2 bg-ide-sidebar select-none shrink-0 overflow-hidden">
                <div className="flex items-center overflow-x-auto scrollbar-none flex-1 min-w-0">
                    {/* Terminal Tab */}
                    <button 
                        onClick={() => setActiveTab('terminal')}
                        className={`px-3 py-1 text-[11px] transition-colors border-b-2
                            ${activeTab === 'terminal' 
                                ? 'text-ide-text border-ide-accent' 
                                : 'text-ide-muted hover:text-ide-text border-transparent'
                            }`}
                    >
                        TERMINAL
                    </button>

                    {/* Console Tab */}
                    <button 
                        onClick={() => setActiveTab('console')}
                        className={`px-3 py-1 text-[11px] transition-colors border-b-2 flex items-center gap-1
                            ${activeTab === 'console' 
                                ? 'text-ide-text border-ide-accent' 
                                : 'text-ide-muted hover:text-ide-text border-transparent'
                            }`}
                    >
                        CONSOLE
                        {consoleMessages.length > 0 && (
                            <span className="text-[9px] px-1 bg-ide-border text-ide-muted rounded">
                                {consoleMessages.length}
                            </span>
                        )}
                    </button>

                    {/* Output Tab */}
                    <button 
                        onClick={() => setActiveTab('output')}
                        className={`px-3 py-1 text-[11px] transition-colors border-b-2
                            ${activeTab === 'output' 
                                ? 'text-ide-text border-ide-accent' 
                                : 'text-ide-muted hover:text-ide-text border-transparent'
                            }`}
                    >
                        OUTPUT
                    </button>

                    {/* Problems Tab */}
                    <button 
                        onClick={() => setActiveTab('problems')}
                        className={`px-3 py-1 text-[11px] transition-colors border-b-2 flex items-center gap-1
                            ${activeTab === 'problems' 
                                ? 'text-ide-text border-ide-accent' 
                                : 'text-ide-muted hover:text-ide-text border-transparent'
                            }`}
                    >
                        PROBLEMS
                        <span className="text-[9px] px-1 bg-ide-border text-ide-muted rounded">0</span>
                    </button>

                    {/* Debug Tab */}
                    <button 
                        onClick={() => setActiveTab('debug')}
                        className={`px-3 py-1 text-[11px] transition-colors border-b-2
                            ${activeTab === 'debug' 
                                ? 'text-ide-text border-ide-accent' 
                                : 'text-ide-muted hover:text-ide-text border-transparent'
                            }`}
                    >
                        DEBUG
                    </button>
                </div>

                <div className="flex items-center gap-1 text-ide-muted shrink-0 ml-2">
                    <button 
                        onClick={onToggleMaximize}
                        className="p-1 hover:text-ide-text hover:bg-ide-hover rounded transition-colors"
                        title={isMaximized ? "Restore" : "Maximize"}
                    >
                        {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:text-ide-text hover:bg-ide-hover rounded transition-colors"
                        title="Close"
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden bg-ide-bg">
                {/* Terminal Panel */}
                {activeTab === 'terminal' && (
                    showSnake ? (
                        <div className="h-full flex items-center justify-center bg-ide-bg p-4">
                            <SnakeGame onClose={() => setShowSnake(false)} />
                        </div>
                    ) : (
                    <div 
                        ref={terminalRef}
                        className="h-full overflow-y-auto p-3 cursor-text scrollbar-thin scrollbar-thumb-ide-border scrollbar-track-transparent"
                        onClick={() => inputRef.current?.focus()}
                    >
                        {history.map((msg, i) => (
                            <OutputLine key={i} msg={msg} promptPath={prompt.path} />
                        ))}

                        {/* Input Line - IDE style */}
                        <div className="relative mt-2">
                            <form onSubmit={handleCommand} className="flex items-center font-mono text-[11px]">
                                <span className="shrink-0 select-none mr-2 text-ide-accent">$</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 bg-transparent border-none outline-none text-ide-text placeholder-ide-muted caret-ide-text"
                                    autoComplete="off"
                                    spellCheck="false"
                                />
                            </form>

                            {/* Autocomplete Suggestions - IDE style */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute bottom-full left-4 mb-1 bg-ide-sidebar border border-ide-border rounded shadow-lg overflow-hidden z-50 min-w-[180px] max-h-[120px] overflow-y-auto">
                                    {suggestions.map((suggestion, idx) => (
                                        <button
                                            key={suggestion}
                                            className={`w-full px-2 py-1 text-left text-[11px] font-mono transition-colors
                                                ${idx === selectedSuggestion ? 'bg-ide-hover text-ide-text' : 'text-ide-muted hover:bg-ide-hover hover:text-ide-text'}
                                            `}
                                            onClick={() => {
                                                const parts = input.split(' ');
                                                if (parts.length === 1) {
                                                    setInput(suggestion + ' ');
                                                } else {
                                                    parts[parts.length - 1] = suggestion;
                                                    setInput(parts.join(' '));
                                                }
                                                setShowSuggestions(false);
                                                inputRef.current?.focus();
                                            }}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div ref={bottomRef} />
                    </div>
                    )
                )}

                {/* Console Panel - IDE style */}
                {activeTab === 'console' && (
                    <div className="h-full flex flex-col">
                        {/* Console Header with Filters */}
                        <div className="flex items-center justify-between px-2 py-1 border-b border-ide-border bg-ide-sidebar/50 gap-2">
                            {/* Filter Buttons */}
                            <div className="flex items-center gap-1 text-[10px]">
                                <button
                                    onClick={() => setConsoleFilter('all')}
                                    className={`px-2 py-0.5 rounded transition-colors ${
                                        consoleFilter === 'all' ? 'bg-ide-hover text-ide-text' : 'text-ide-muted hover:text-ide-text'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setConsoleFilter('error')}
                                    className={`px-2 py-0.5 rounded transition-colors ${
                                        consoleFilter === 'error' ? 'bg-ide-hover text-ide-error' : 'text-ide-muted hover:text-ide-error'
                                    }`}
                                >
                                    Errors ({consoleMessages.filter(m => m.type === 'error').length})
                                </button>
                                <button
                                    onClick={() => setConsoleFilter('warn')}
                                    className={`px-2 py-0.5 rounded transition-colors ${
                                        consoleFilter === 'warn' ? 'bg-ide-hover text-ide-warning' : 'text-ide-muted hover:text-ide-warning'
                                    }`}
                                >
                                    Warnings ({consoleMessages.filter(m => m.type === 'warn').length})
                                </button>
                                <button
                                    onClick={() => setConsoleFilter('log')}
                                    className={`px-2 py-0.5 rounded transition-colors ${
                                        consoleFilter === 'log' ? 'bg-ide-hover text-ide-text' : 'text-ide-muted hover:text-ide-text'
                                    }`}
                                >
                                    Logs
                                </button>
                            </div>

                            {/* Search & Clear */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={consoleSearch}
                                    onChange={(e) => setConsoleSearch(e.target.value)}
                                    placeholder="Filter..."
                                    className="w-24 px-2 py-0.5 text-[10px] bg-ide-bg border border-ide-border rounded text-ide-text placeholder-ide-muted focus:outline-none focus:border-ide-accent"
                                />
                                <button
                                    onClick={clearConsole}
                                    className="px-2 py-0.5 text-[10px] text-ide-muted hover:text-ide-text rounded transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                        
                        {/* Console Messages */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-ide-border scrollbar-track-transparent">
                            {filteredConsoleMessages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-ide-muted text-[11px]">
                                    {consoleMessages.length === 0 ? 'No console output' : 'No matching messages'}
                                </div>
                            ) : (
                                filteredConsoleMessages.map((msg) => (
                                    <ConsoleMessageLine key={msg.id} message={msg} />
                                ))
                            )}
                            <div ref={consoleBottomRef} />
                        </div>
                    </div>
                )}

                {/* Output Panel - IDE style */}
                {activeTab === 'output' && (
                    <div className="h-full overflow-y-auto p-2 font-mono text-[11px] scrollbar-thin scrollbar-thumb-ide-border scrollbar-track-transparent">
                        <div className="text-ide-muted">Build Output - Next.js</div>
                        <div className="mt-2 space-y-0.5">
                            <div className="text-ide-accent">Compiled successfully</div>
                            <div className="text-ide-muted">Ready in 1.2s</div>
                            <div className="text-ide-muted mt-2">Next.js 14.1.0</div>
                            <div className="text-ide-muted">- Local: http://localhost:3000</div>
                            <div className="text-ide-muted">- Network: http://192.168.1.100:3000</div>
                        </div>
                    </div>
                )}

                {/* Problems Panel - IDE style */}
                {activeTab === 'problems' && (
                    <div className="h-full overflow-y-auto p-2 font-mono text-[11px] scrollbar-thin scrollbar-thumb-ide-border scrollbar-track-transparent">
                        <div className="flex items-center gap-4 mb-2 pb-2 border-b border-ide-border">
                            <span className="text-ide-muted">Errors: <span className="text-ide-text">0</span></span>
                            <span className="text-ide-muted">Warnings: <span className="text-ide-text">0</span></span>
                        </div>
                        <div className="flex items-center justify-center h-20 text-ide-muted">
                            No problems detected
                        </div>
                    </div>
                )}

                {/* Debug Panel - IDE style */}
                {activeTab === 'debug' && (
                    <div className="h-full overflow-y-auto p-2 font-mono text-[11px] scrollbar-thin scrollbar-thumb-ide-border scrollbar-track-transparent">
                        <div className="text-ide-muted mb-2">Debug Console</div>
                        <div className="space-y-0.5">
                            <div className="text-ide-muted"><span className="text-ide-muted/50">10:30:01</span> [INF] Debugger attached</div>
                            <div className="text-ide-muted"><span className="text-ide-muted/50">10:30:01</span> [INF] Source maps loaded</div>
                            <div className="text-ide-muted"><span className="text-ide-muted/50">10:30:02</span> [LOG] Application started</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Bar - IDE style */}
            <div className="h-5 border-t border-ide-border bg-ide-sidebar flex items-center justify-between px-3 text-[10px] text-ide-muted shrink-0">
                {activeTab === 'terminal' && (
                    <>
                        <span>Terminal</span>
                        <span>Tab: autocomplete | Ctrl+L: clear</span>
                    </>
                )}
                {activeTab === 'console' && (
                    <>
                        <span>Console: {consoleMessages.length} messages</span>
                        <span>Errors: {consoleMessages.filter(m => m.type === 'error').length} | Warnings: {consoleMessages.filter(m => m.type === 'warn').length}</span>
                    </>
                )}
                {activeTab === 'output' && (
                    <>
                        <span>Build Output</span>
                        <span>Next.js 14.1.0</span>
                    </>
                )}
                {activeTab === 'problems' && (
                    <>
                        <span>Problems</span>
                        <span>No issues</span>
                    </>
                )}
                {activeTab === 'debug' && (
                    <>
                        <span>Debug</span>
                        <span>Ready</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default Terminal;
