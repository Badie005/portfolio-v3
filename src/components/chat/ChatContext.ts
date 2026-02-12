import { GeminiService, GeminiMessage } from '@/lib/gemini';
import { ChatAction, CodeChange, AgentAction } from './ChatReducer';
import { FileSystemItem, FileData, SearchOptions, SearchResult, TerminalCommandResult, IdePanel, DownloadOptions } from '@/components/code-window/types';

export interface CommandContext {
    activeFile: FileData | null | undefined;
    contextFiles: FileSystemItem[];
    dispatch: React.Dispatch<ChatAction>;
    onOpenFile: (filename: string) => void;
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
    gemini: GeminiService | null;
    getConversationHistory: () => GeminiMessage[];
    enableStreaming: boolean;
    thinkingTimeRef: React.MutableRefObject<number>;
    abortControllerRef: React.MutableRefObject<AbortController | null>;
    t: (key: string, params?: Record<string, string | number>) => string;
    maxMessages: number;
}

export type CommandHandler = (args: string, ctx: CommandContext) => Promise<boolean>;

export interface CommandPattern {
    regex: RegExp;
    handler: CommandHandler;
}

export const generateId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function buildCodeChanges(
    text: string,
    defaultFilename: string,
    modifyActions: AgentAction[],
    getDescription: (filename: string) => string
): CodeChange[] {
    const blocks: Array<{ filename: string; language: string; code: string }> = [];
    const regex = /```(\w+)?(?:\s+([^\n]+))?\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const language = match[1] || 'plaintext';
        const possibleFilename = match[2]?.trim() || '';
        const code = match[3].trim();

        if (code.length < 5) continue;

        let filename = 'untitled.' + (language === 'plaintext' ? 'txt' : language);

        if (possibleFilename && possibleFilename.includes('.')) {
            filename = possibleFilename.replace(/^(?:\/\/|#|\/\*)\s*/, '').trim();
        } else {
            const firstLine = code.split('\n')[0];
            const filenameMatch = firstLine.match(
                /(?:\/\/|#|\/\*)\s*(?:file:|filename:)?\s*([a-zA-Z0-9._-]+\.[a-zA-Z0-9]+)/i
            );
            if (filenameMatch) {
                filename = filenameMatch[1].trim();
            }
        }

        blocks.push({ filename, language, code });
    }

    return blocks.map((block, index) => {
        let filename = block.filename;
        if (modifyActions[index]?.filename) {
            filename = modifyActions[index].filename!;
        } else if (filename.startsWith('untitled') && defaultFilename) {
            filename = defaultFilename;
        }

        const lines = block.code.split('\n');

        return {
            filename,
            language: block.language,
            newCode: block.code,
            description: getDescription(filename),
            applied: false,
            linesAdded: lines.length,
        };
    });
}
