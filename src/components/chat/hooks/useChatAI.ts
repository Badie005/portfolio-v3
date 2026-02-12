import { useRef, useCallback } from 'react';
import { ChatMessage, MAX_MESSAGES, ChatAction } from '../ChatReducer';
import { CommandContext, buildCodeChanges } from '../ChatContext';
import { registry } from '../ChatCommands';
import { chatRateLimiter, parseAgentActions } from '../utils';
import { FileSystemItem, FileData, SearchOptions, SearchResult, TerminalCommandResult, IdePanel, DownloadOptions } from '@/components/code-window/types';
import { getGeminiService, GeminiMessage } from '@/lib/gemini';
import { useTranslations } from 'next-intl';

interface UseChatAIParams {
    contextFiles: FileSystemItem[];
    activeFile?: FileData | null;
    onOpenFile: (filename: string) => void;
    onReadFile?: (filename: string) => string | null;
    onUpdateFile?: (filename: string, content: string) => void;
    onCreateFile?: (filename: string, content: string) => void;
    onCreateFileWithPath?: (filePath: string, content: string) => void;
    onDeleteFile?: (filename: string) => void;
    onCreateFolder?: (folderPath: string) => boolean;
    onDeleteFolder?: (folderPath: string) => boolean;
    onSearchFiles?: (query: string, options?: SearchOptions) => SearchResult[];
    onExecuteCommand?: (command: string) => TerminalCommandResult;
    onFocusPanel?: (panel: IdePanel) => void;
    onCloseTab?: (filePath: string) => void;
    onDownload?: (options: DownloadOptions) => boolean;
    enableStreaming: boolean;
    messagesRef: React.MutableRefObject<ChatMessage[]>;
    dispatch: React.Dispatch<ChatAction>;
    thinkingTimeRef: React.MutableRefObject<number>;
    abortControllerRef: React.MutableRefObject<AbortController | null>;
    addToHistory: (input: string) => void;
    resetNavigation: () => void;
}

export function useChatAI({
    contextFiles,
    activeFile,
    onOpenFile,
    onReadFile,
    onUpdateFile,
    onCreateFile,
    onCreateFileWithPath,
    onDeleteFile,
    onCreateFolder,
    onDeleteFolder,
    onSearchFiles,
    onExecuteCommand,
    onFocusPanel,
    onCloseTab,
    onDownload,
    enableStreaming,
    messagesRef,
    dispatch,
    thinkingTimeRef,
    abortControllerRef,
    addToHistory,
    resetNavigation,
}: UseChatAIParams) {
    const t = useTranslations('ide');
    const geminiServiceRef = useRef(getGeminiService());
    const lastInputRef = useRef('');

    const getConversationHistory = useCallback((): GeminiMessage[] => {
        return messagesRef.current
            .slice(-20)
            .filter(m => m.text && !m.error)
            .map(m => ({
                role: m.role as 'user' | 'model',
                parts: [{ text: m.text }],
            }));
    }, [messagesRef]);

    const handleSend = useCallback(async (input: string, status: string) => {
        const trimmedInput = input.trim();
        if (!trimmedInput || status === 'loading' || status === 'streaming') return false;
        if (!chatRateLimiter.canProceed()) return false;
        if (!geminiServiceRef.current?.isReady()) return false;

        lastInputRef.current = trimmedInput;
        addToHistory(trimmedInput);
        resetNavigation();
        dispatch({ type: 'ADD_USER_MESSAGE', payload: trimmedInput });
        dispatch({ type: 'SET_INPUT', payload: '' });
        dispatch({ type: 'DISMISS_ERROR' });

        const ctx: CommandContext = {
            activeFile,
            contextFiles,
            dispatch,
            onOpenFile,
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
            gemini: geminiServiceRef.current,
            getConversationHistory,
            enableStreaming,
            thinkingTimeRef,
            abortControllerRef,
            t,
            maxMessages: MAX_MESSAGES,
        };

        const handled = await registry.execute(trimmedInput, ctx);
        if (handled) return true;

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        dispatch({ type: 'START_LOADING' });

        try {
            const conversationHistory = getConversationHistory();
            const parsedActions = parseAgentActions(trimmedInput);
            const fileContents = new Map<string, string>();
            const modifyActions: typeof parsedActions = [];

            parsedActions.forEach(action => {
                if (action.type === 'modify' && action.filename) {
                    const content = onReadFile?.(action.filename);
                    if (content) {
                        fileContents.set(action.filename, content);
                        modifyActions.push(action);
                    }
                }
            });

            let contextMessage = trimmedInput;

            if (contextFiles.length > 0) {
                const fileList = contextFiles.filter((f): f is FileData => 'content' in f).map(f => f.name).join(', ');
                contextMessage += `\n\n[${t('chat.context.filesystem', { list: fileList })}]`;
            }

            fileContents.forEach((content, filename) => {
                contextMessage += `\n\n[${t('chat.contextLabels.toModify')} - ${filename}]:\n\`\`\`\n${content}\n\`\`\``;
            });

            if (activeFile && !fileContents.has(activeFile.name)) {
                contextMessage += `\n\n[${t('chat.context.activeFile', { filename: activeFile.name })}]:\n\`\`\`${activeFile.type}\n${activeFile.content}\n\`\`\``;
            }

            let responseText = '';

            if (enableStreaming) {
                const response = await geminiServiceRef.current?.sendMessageStream(
                    contextMessage,
                    conversationHistory,
                    (chunk) => {
                        if (controller.signal.aborted) return;
                        responseText += chunk;
                        dispatch({ type: 'STREAM_REPLACE', payload: responseText });
                    }
                );
                if (response?.error) throw new Error(response.error);
            } else {
                const response = await geminiServiceRef.current?.sendMessage(contextMessage, conversationHistory);
                if (response?.error) throw new Error(response.error);
                responseText = response?.text || '';
            }

            if (controller.signal.aborted) return true;

            const codeChanges = buildCodeChanges(
                responseText,
                modifyActions[0]?.filename || activeFile?.name || 'file.txt',
                modifyActions,
                (filename) => t('chat.actionDescriptions.modified', { filename })
            );

            const smartActions = [];
            if (/(?:cherche|search|trouve|find|où|where|quel|which|montre|show|liste|list|affiche|display|skills|compétences|formation|projet)/i.test(trimmedInput)) {
                smartActions.push({
                    type: 'search' as const,
                    filename: trimmedInput.split(/\s+/).filter(w => w.length > 3).slice(0, 3).join(' '),
                    status: 'done' as const,
                    timestamp: Date.now(),
                });
            }
            if (activeFile) {
                smartActions.push({ type: 'read' as const, filename: activeFile.name, status: 'done' as const, timestamp: Date.now() });
            }

            dispatch({
                type: 'FINISH_RESPONSE',
                payload: {
                    text: responseText,
                    thoughts: t('chat.message.analyzed'),
                    thinkingTime: thinkingTimeRef.current,
                    codeChanges: codeChanges.length > 0 ? codeChanges : undefined,
                    actions: smartActions.length > 0 ? smartActions.slice(0, 5) : undefined,
                },
            });

            modifyActions.forEach(action => {
                if (action.filename) onOpenFile(action.filename);
            });

            return true;

        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return true;
            const errorMessage = err instanceof Error ? err.message : t('chat.errors.unknown');
            dispatch({ type: 'SET_ERROR', payload: { message: errorMessage } });
            dispatch({ type: 'ADD_BOT_MESSAGE', payload: { text: '', error: errorMessage } });
            return true;
        }
    }, [
        activeFile, contextFiles, enableStreaming, getConversationHistory, onOpenFile, onReadFile,
        t, thinkingTimeRef, addToHistory, resetNavigation, onDownload, onFocusPanel, onCloseTab,
        onCreateFile, onCreateFileWithPath, onDeleteFile, onExecuteCommand, onSearchFiles,
        onCreateFolder, onDeleteFolder, onUpdateFile, dispatch, abortControllerRef
    ]);

    const handleRetry = useCallback(() => {
        if (lastInputRef.current) {
            dispatch({ type: 'SET_INPUT', payload: lastInputRef.current });
            dispatch({ type: 'DISMISS_ERROR' });
        }
    }, [dispatch]);

    const isReady = useCallback(() => geminiServiceRef.current?.isReady() ?? false, []);

    return { handleSend, handleRetry, isReady, getConversationHistory, lastInputRef };
}
