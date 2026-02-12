import { useReducer, useRef, useCallback, useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Trash2, ArrowUp, Square } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { chatReducer, initialState, ChatMessage } from './ChatReducer';
import { registerAllCommands } from './commands';
import { useThinkingTimer, useInputHistory, useAutoScroll, useCommandAutocomplete, useChatAI } from './hooks';
import { sanitizeInput } from './utils';
import { ErrorBanner, ChatMessageList, EmptyState, QuickActionsToolbar, CommandAutocomplete } from './components';
import { FileSystemItem, FileData, SearchOptions, SearchResult, TerminalCommandResult, IdePanel, DownloadOptions } from '@/components/code-window/types';

const STORAGE_KEY = 'bai-chat-history';
const MAX_HISTORY_MESSAGES = 20;
const MAX_HISTORY_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

function loadMessages(): ChatMessage[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];
        
        const now = Date.now();
        const recentMessages = parsed
            .map((m: ChatMessage) => ({ ...m, timestamp: new Date(m.timestamp) }))
            .filter((m: ChatMessage) => {
                const msgTime = m.timestamp instanceof Date ? m.timestamp.getTime() : new Date(m.timestamp).getTime();
                return now - msgTime < MAX_HISTORY_AGE_MS;
            })
            .slice(-MAX_HISTORY_MESSAGES);
        
        return recentMessages;
    } catch {
        return [];
    }
}

function saveMessages(messages: ChatMessage[]): void {
    if (typeof window === 'undefined') return;
    try { 
        const now = Date.now();
        const recentMessages = messages
            .filter(m => {
                const msgTime = m.timestamp instanceof Date ? m.timestamp.getTime() : new Date(m.timestamp).getTime();
                return now - msgTime < MAX_HISTORY_AGE_MS;
            })
            .slice(-MAX_HISTORY_MESSAGES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentMessages)); 
    } catch { /* */ }
}

interface ChatPanelProps {
    contextFiles?: FileSystemItem[];
    onOpenFile: (filename: string) => void;
    activeFile?: FileData | null;
    onUpdateFile?: (filename: string, content: string) => void;
    onCreateFile?: (filename: string, content: string) => void;
    onCreateFileWithPath?: (filePath: string, content: string) => void;
    onDeleteFile?: (filename: string) => void;
    onReadFile?: (filename: string) => string | null;
    onCreateFolder?: (folderPath: string) => boolean;
    onDeleteFolder?: (folderPath: string) => boolean;
    onSearchFiles?: (query: string, options?: SearchOptions) => SearchResult[];
    onExecuteCommand?: (command: string) => TerminalCommandResult;
    onFocusPanel?: (panel: IdePanel) => void;
    onCloseTab?: (filePath: string) => void;
    onDownload?: (options: DownloadOptions) => boolean;
    enableStreaming?: boolean;
    className?: string;
}

export default function ChatPanel({
    contextFiles = [],
    onOpenFile,
    activeFile,
    onUpdateFile,
    onCreateFile,
    onCreateFileWithPath,
    onDeleteFile,
    onReadFile,
    onCreateFolder,
    onDeleteFolder,
    onSearchFiles,
    onExecuteCommand,
    onFocusPanel,
    onCloseTab,
    onDownload,
    enableStreaming = true,
    className = '',
}: ChatPanelProps) {
    const t = useTranslations('ide');
    const [state, dispatch] = useReducer(chatReducer, { ...initialState, messages: loadMessages() });
    const messagesRef = useRef(state.messages);

    useEffect(() => {
        messagesRef.current = state.messages;
    }, [state.messages]);

    const thinkingMessages = useMemo(() => {
        const msgs = t.raw('chat.thinkingMessages') as string[] | undefined;
        return Array.isArray(msgs) && msgs.length > 0 ? msgs : [t('chat.message.analyzed')];
    }, [t]);

    const [thinkingMessage, setThinkingMessage] = useState(thinkingMessages[0] ?? t('chat.message.analyzed'));
    const { thinkingTime, thinkingTimeRef } = useThinkingTimer(state.status === 'loading' || state.status === 'streaming');
    const { addToHistory, navigateUp, navigateDown, resetNavigation } = useInputHistory();
    const { showAutocomplete, autocompleteCommands, selectedIndex, selectNext, selectPrev, hideAutocomplete, getSelectedCommand } = useCommandAutocomplete(state.input);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useAutoScroll(messagesContainerRef, [state.messages.length, state.streamingText]);

    const { handleSend: sendAI, handleRetry, isReady } = useChatAI({
        contextFiles, activeFile, onOpenFile, onReadFile, onUpdateFile, onCreateFile, onCreateFileWithPath,
        onDeleteFile, onCreateFolder, onDeleteFolder, onSearchFiles, onExecuteCommand, onFocusPanel,
        onCloseTab, onDownload, enableStreaming, messagesRef, dispatch, thinkingTimeRef,
        abortControllerRef, addToHistory, resetNavigation,
    });

    useEffect(() => {
        if (state.status === 'loading') setThinkingMessage(thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)]);
    }, [state.status, thinkingMessages]);

    useEffect(() => { registerAllCommands(); }, []);
    useEffect(() => { saveMessages(state.messages); }, [state.messages]);

    const applyCodeChange = useCallback((messageId: string, changeIndex: number) => {
        const message = messagesRef.current.find(m => m.id === messageId);
        const change = message?.codeChanges?.[changeIndex];
        if (!change || change.applied) return;
        const existing = onReadFile?.(change.filename);
        if (existing !== null && onUpdateFile) onUpdateFile(change.filename, change.newCode);
        else if (onCreateFile) onCreateFile(change.filename, change.newCode);
        else if (onCreateFileWithPath) onCreateFileWithPath(change.filename, change.newCode);
        dispatch({ type: 'APPLY_CODE_CHANGE', payload: { messageId, changeIndex } });
    }, [onUpdateFile, onReadFile, onCreateFile, onCreateFileWithPath]);

    const handleCommandSelect = useCallback((cmd: { command: string; hasArg: boolean }) => {
        dispatch({ type: 'SET_INPUT', payload: cmd.command + (cmd.hasArg ? ' ' : '') });
        hideAutocomplete();
        textareaRef.current?.focus();
    }, [hideAutocomplete]);

    const handleSend = useCallback(() => {
        const trimmed = sanitizeInput(state.input);
        if (!trimmed || state.status === 'loading' || state.status === 'streaming') return;
        sendAI(state.input, state.status);
    }, [state.input, state.status, sendAI]);

    const handleStop = useCallback(() => {
        abortControllerRef.current?.abort();
        dispatch({ type: 'FINISH_RESPONSE', payload: { text: state.streamingText || 'Génération interrompue.' } });
    }, [state.streamingText]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (showAutocomplete && autocompleteCommands.length > 0) {
            if (e.key === 'ArrowDown') { e.preventDefault(); selectNext(); return; }
            if (e.key === 'ArrowUp') { e.preventDefault(); selectPrev(); return; }
            if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); const cmd = getSelectedCommand(); if (cmd) handleCommandSelect(cmd); return; }
            if (e.key === 'Escape') { e.preventDefault(); hideAutocomplete(); return; }
        }
        if (!showAutocomplete) {
            if (e.key === 'ArrowUp' && !e.shiftKey) { e.preventDefault(); const prev = navigateUp(); if (prev !== null) dispatch({ type: 'SET_INPUT', payload: prev }); return; }
            if (e.key === 'ArrowDown' && !e.shiftKey) { e.preventDefault(); const next = navigateDown(); dispatch({ type: 'SET_INPUT', payload: next || '' }); return; }
        }
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    }, [showAutocomplete, autocompleteCommands.length, selectNext, selectPrev, getSelectedCommand, handleCommandSelect, hideAutocomplete, navigateUp, navigateDown, handleSend]);

    const handleClear = useCallback(() => { 
        abortControllerRef.current?.abort(); 
        dispatch({ type: 'CLEAR_ALL' }); 
        localStorage.removeItem(STORAGE_KEY); 
    }, []);
    
    const handleSuggestionClick = useCallback((suggestion: string) => { 
        dispatch({ type: 'SET_INPUT', payload: suggestion });
        setTimeout(() => {
            const trimmed = suggestion.trim();
            if (trimmed) {
                sendAI(suggestion, 'idle');
            }
        }, 0);
    }, [sendAI]);

    const isLoading = state.status === 'loading' || state.status === 'streaming';

    return (
        <div className={`flex flex-col h-full w-full bg-ide-sidebar overflow-hidden ${className}`} role="log" aria-live="polite" aria-busy={isLoading}>
            <div className="h-9 border-b border-ide-border flex items-center">
                <div className="mx-auto w-full max-w-[580px] px-3 flex items-center justify-between">
                    <span className="text-[16px] font-heading font-semibold text-ide-text tracking-normal">{t('chat.title')}</span>
                    <div className="flex items-center gap-1">
                        {!isReady() && <span className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded">{t('chat.disconnected')}</span>}
                        {state.messages.length > 0 && (
                            <button onClick={handleClear} className="p-1 hover:bg-ide-ui/50 rounded text-ide-muted hover:text-ide-text transition-colors" title={t('chat.clearConversation')} aria-label={t('chat.clearConversation')}>
                                <Trash2 size={14} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {state.error && <ErrorBanner message={state.error.message} errorCode={state.error.code} onRetry={handleRetry} onDismiss={() => dispatch({ type: 'DISMISS_ERROR' })} />}
            <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                <div className="mx-auto w-full max-w-[580px] px-3">
                    {state.messages.length > 0 ? (
                        <ChatMessageList messages={state.messages} streamingText={state.streamingText} status={state.status} thinkingTime={thinkingTime} thinkingMessage={thinkingMessage} activeFile={activeFile} onApplyCodeChange={applyCodeChange} onOpenFile={onOpenFile} />
                    ) : (
                        <EmptyState input={state.input} setInput={(v) => dispatch({ type: 'SET_INPUT', payload: v })} onSend={handleSend} onKeyDown={handleKeyDown} isLoading={isLoading} isServiceReady={isReady()} onSuggestionClick={handleSuggestionClick} />
                    )}
                    <div className="h-2 bg-gradient-to-t from-ide-sidebar to-transparent pointer-events-none sticky bottom-0 z-20" />
                </div>
            </div>
            {state.messages.length > 0 && (
                <div className="bg-white/60 backdrop-blur-md border-t border-white/40">
                    <QuickActionsToolbar 
                        onAction={(prompt) => { 
                            dispatch({ type: 'SET_INPUT', payload: prompt });
                            setTimeout(() => {
                                const trimmed = prompt.trim();
                                if (trimmed && state.status !== 'loading' && state.status !== 'streaming') {
                                    sendAI(prompt, state.status);
                                }
                            }, 0);
                        }} 
                        activeFile={activeFile} 
                        disabled={isLoading} 
                    />
                    <div className="p-3 pt-2">
                        <div className="mx-auto w-full max-w-[580px]">
                            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E8E5DE] shadow-[0_8px_32px_-12px_rgba(20,20,19,0.15)] overflow-hidden focus-within:border-[#D97757]/40 focus-within:shadow-lg transition-all">
                                <CommandAutocomplete commands={autocompleteCommands} selectedIndex={selectedIndex} onSelect={handleCommandSelect} visible={showAutocomplete} />
                                <textarea ref={textareaRef} name="message" value={state.input} onChange={(e) => dispatch({ type: 'SET_INPUT', payload: e.target.value })} onKeyDown={handleKeyDown} placeholder={isReady() ? t('chat.placeholderReady') : t('chat.placeholderUnavailable')} className="text-ide-text text-[15px] w-full resize-none bg-transparent px-4 py-4 outline-none placeholder:text-ide-muted/70 min-h-[48px] max-h-[200px] overflow-y-hidden" rows={1} spellCheck={false} disabled={isLoading} />
                                <div className="px-4 py-3 border-t border-[#E8E5DE]/50 flex items-center justify-between">
                                    <Image src="/logo/IDE/Logo AI.svg" alt="B.AI" width={28} height={12} />
                                    {isLoading ? (
                                        <button type="button" onClick={handleStop} className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-500 text-white shadow-sm hover:bg-red-600 transition-all" aria-label="Stop generation"><Square size={12} aria-hidden="true" /></button>
                                    ) : (
                                        <button type="submit" disabled={!state.input.trim() || !isReady()} className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${state.input.trim() && isReady() ? 'bg-[#D97757] text-white shadow-sm hover:bg-[#c86a4c]' : 'bg-ide-ui/50 text-ide-muted cursor-not-allowed'}`} aria-label="Send message"><ArrowUp size={14} aria-hidden="true" /></button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export { parseCodeBlocks, parseAgentActions } from './utils';
