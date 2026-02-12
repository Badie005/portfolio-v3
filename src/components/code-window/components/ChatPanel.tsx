// ============================================================
// Chat Panel Component - Fully integrated with GeminiService
// ============================================================

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
    memo
} from 'react';
import {
    ArrowUp,
    FileCode,
    Check,
    Copy,
    Sparkles,
    Trash2,
    AlertCircle,
    RefreshCw,
    Loader2,
    X,
    Zap,
    Wand2,
    Bug,
    TestTube,
    BookOpen
} from 'lucide-react';
import Image from 'next/image';
import {
    GeminiService,
    GeminiMessage,
    GeminiErrorCode,
    getGeminiService
} from '@/lib/gemini';
import { FileSystemItem, FileData, CodeChange, AgentAction, SearchResult, SearchOptions, TerminalCommandResult, IdePanel, DownloadOptions } from '../types';
import { formatSearchResults, executeTerminalCommand, computePortfolioStats, formatPortfolioStats } from '@/lib/fileSearch';
import { useTranslations } from 'next-intl';

// ============================================================
// TYPES & INTERFACES
// ============================================================

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
    thoughts?: string;
    thinkingTime?: number; // Real thinking time in seconds
    codeChanges?: CodeChange[];
    actions?: AgentAction[];
    error?: string;
    isStreaming?: boolean;
    cached?: boolean;
}

export interface ChatPanelProps {
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
    onListDirectory?: (dirPath?: string) => string[];
    onSearchFiles?: (query: string, options?: SearchOptions) => SearchResult[];
    onExecuteCommand?: (command: string) => TerminalCommandResult;
    onFocusPanel?: (panel: IdePanel) => void;
    onCloseTab?: (filePath: string) => void;
    onDownload?: (options: DownloadOptions) => boolean;
    enableStreaming?: boolean;
    maxMessages?: number;
    className?: string;
}

interface ParsedCodeBlock {
    filename: string;
    language: string;
    code: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const MAX_INPUT_LENGTH = 10000;
const MAX_HISTORY_FOR_API = 20;
const STORAGE_KEY = 'bai-chat-history';
const INPUT_HISTORY_KEY = 'bai-input-history';
const MAX_STORED_MESSAGES = 100;
const MAX_INPUT_HISTORY = 50;

// Quick actions configuration
const QUICK_ACTIONS = [
    { id: 'explain', icon: BookOpen },
    { id: 'refactor', icon: Wand2 },
    { id: 'debug', icon: Bug },
    { id: 'tests', icon: TestTube },
] as const;

// Slash commands configuration
const SLASH_COMMANDS = [
    { command: '/tour', description: 'Visite guidée du portfolio', category: 'navigation', hasArg: false },
    { command: '/interview', description: 'Mode simulation d\'entretien', category: 'mode', hasArg: false },
    { command: '/recruiter', description: 'Mode recruteur optimisé', category: 'mode', hasArg: false },
    { command: '/casual', description: 'Mode conversation décontractée', category: 'mode', hasArg: false },
    { command: '/search', description: 'Rechercher dans les fichiers', category: 'file', hasArg: true },
    { command: '/run', description: 'Exécuter une commande terminal', category: 'terminal', hasArg: true },
    { command: '/terminal', description: 'Ouvrir le terminal', category: 'panel', hasArg: false },
    { command: '/explorer', description: 'Ouvrir l\'explorateur', category: 'panel', hasArg: false },
    { command: '/close', description: 'Fermer un onglet', category: 'panel', hasArg: true },
    { command: '/download', description: 'Télécharger un fichier', category: 'export', hasArg: true },
    { command: '/resume', description: 'Générer et télécharger le CV', category: 'export', hasArg: false },
    { command: '/stats', description: 'Statistiques du portfolio', category: 'info', hasArg: false },
    { command: '/projects', description: 'Lister les projets', category: 'info', hasArg: false },
    { command: '/stack', description: 'Afficher la stack technique', category: 'info', hasArg: false },
    { command: '/contact', description: 'Afficher les contacts', category: 'info', hasArg: false },
    { command: '/help', description: 'Liste des commandes', category: 'info', hasArg: false },
    { command: '/tests', description: 'Générer des tests pour le fichier actif', category: 'code', hasArg: false },
    { command: '/review', description: 'Review du code du fichier actif', category: 'code', hasArg: false },
    { command: '/doc', description: 'Générer la documentation', category: 'code', hasArg: false },
    { command: '/clear', description: 'Effacer la conversation', category: 'chat', hasArg: false },
] as const;



// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const generateId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// LocalStorage helpers for persistence
const saveMessagesToStorage = (messages: ChatMessage[]): void => {
    if (typeof window === 'undefined') return;
    try {
        const serialized = messages.slice(-MAX_STORED_MESSAGES).map(msg => ({
            ...msg,
            timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch {
        console.warn('Failed to save chat history');
    }
};

const loadMessagesFromStorage = (): ChatMessage[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return parsed.map((msg: ChatMessage) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
        }));
    } catch {
        return [];
    }
};

const clearMessagesFromStorage = (): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        console.warn('Failed to clear chat history');
    }
};

const saveInputHistory = (input: string): void => {
    if (typeof window === 'undefined' || !input.trim()) return;
    try {
        const stored = localStorage.getItem(INPUT_HISTORY_KEY);
        const history: string[] = stored ? JSON.parse(stored) : [];
        const filtered = history.filter(h => h !== input);
        const updated = [input, ...filtered].slice(0, MAX_INPUT_HISTORY);
        localStorage.setItem(INPUT_HISTORY_KEY, JSON.stringify(updated));
    } catch {
        // Silently fail
    }
};

const loadInputHistory = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(INPUT_HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const filterCommands = (input: string): Array<typeof SLASH_COMMANDS[number]> => {
    if (!input.startsWith('/')) return [];
    const query = input.toLowerCase();
    return SLASH_COMMANDS.filter(cmd =>
        cmd.command.toLowerCase().startsWith(query) ||
        cmd.description.toLowerCase().includes(query.slice(1))
    ).slice(0, 6);
};

const sanitizeInput = (input: string): string => {
    return input.trim().slice(0, MAX_INPUT_LENGTH);
};

const getFileExtension = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()! : '';
};

const getLanguageFromExtension = (ext: string): string => {
    const langMap: Record<string, string> = {
        'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
        'py': 'python', 'rb': 'ruby', 'java': 'java', 'cpp': 'cpp', 'c': 'c',
        'cs': 'csharp', 'go': 'go', 'rs': 'rust', 'php': 'php', 'html': 'html',
        'css': 'css', 'scss': 'scss', 'json': 'json', 'xml': 'xml', 'yaml': 'yaml',
        'yml': 'yaml', 'md': 'markdown', 'sql': 'sql', 'sh': 'bash', 'bash': 'bash',
        'lock': 'json',
    };
    return langMap[ext.toLowerCase()] || 'plaintext';
};

const getFileTemplate = (filename: string, ext: string): string => {
    const templates: Record<string, string> = {
        'ts': `// ${filename}\n\nexport {};\n`,
        'tsx': `// ${filename}\n\nimport React from 'react';\n\nconst Component = () => {\n  return <div></div>;\n};\n\nexport default Component;\n`,
        'js': `// ${filename}\n\n`,
        'jsx': `// ${filename}\n\nimport React from 'react';\n\nconst Component = () => {\n  return <div></div>;\n};\n\nexport default Component;\n`,
        'json': `{\n  "name": "${filename.replace('.json', '')}"\n}\n`,
        'md': `# ${filename.replace('.md', '')}\n\n`,
        'css': `/* ${filename} */\n\n`,
        'html': `<!DOCTYPE html>\n<html lang="fr">\n<head>\n  <meta charset="UTF-8">\n  <title>${filename}</title>\n</head>\n<body>\n  \n</body>\n</html>\n`,
        'py': `# ${filename}\n\n`,
        'lock': `{\n  "signature": "B.DEV x B.411",\n  "version": "1.0"\n}\n`,
    };
    return templates[ext] || `// ${filename}\n`;
};


// ============================================================
// PARSING FUNCTIONS
// ============================================================

const parseCodeBlocks = (text: string): ParsedCodeBlock[] => {
    const blocks: ParsedCodeBlock[] = [];
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

    return blocks;
};

const parseCodeChanges = (
    text: string,
    defaultFilename: string,
    modifyActions: AgentAction[],
    getDescription: (filename: string) => string = (filename) => filename
): CodeChange[] => {
    const blocks = parseCodeBlocks(text);

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
};

const parseAgentActions = (userInput: string): AgentAction[] => {
    const actions: AgentAction[] = [];

    // File patterns
    const filePatterns: Array<{ type: AgentAction['type']; regex: RegExp }> = [
        {
            type: 'read',
            regex: /(?:lire?|read|voir|affiche[rz]?|montre[rz]?|ouvre?)\s+(?:le\s+)?(?:fichier\s+|file\s+|code\s+)?([^\s,]+\.[a-z0-9]+)/gi
        },
        {
            type: 'create',
            regex: /(?:créer?|create|ajouter?|add|nouveau|new)\s+(?:un\s+)?(?:fichier\s+|file\s+)?([^\s,]+\.[a-z0-9]+)/gi
        },
        {
            type: 'delete',
            regex: /(?:supprimer?|supprime|suprimer?|delete|remove|enlever?)\s+(?:le\s+)?(?:fichier\s+|file\s+)?([^\s,]+\.[a-z0-9]+)/gi
        },
        {
            type: 'modify',
            regex: /(?:modifier?|modify|changer?|change|update|éditer?|edit|mettre\s+à\s+jour)\s+(?:le\s+)?(?:fichier\s+|file\s+|code\s+)?([^\s,]+\.[a-z0-9]+)/gi
        },
        {
            type: 'search',
            regex: /(?:cherche|search|grep|trouve|find)\s+(.+)/gi
        },
    ];

    // Folder patterns
    const folderPatterns: Array<{ type: 'createFolder' | 'deleteFolder'; regex: RegExp }> = [
        {
            type: 'createFolder',
            regex: /(?:créer?|create|ajouter?|add|nouveau|new|mkdir)\s+(?:un\s+)?(?:dossier\s+|folder\s+|répertoire\s+|directory\s+)([^\s,]+)/gi
        },
        {
            type: 'deleteFolder',
            regex: /(?:supprimer?|supprime|delete|remove|rmdir)\s+(?:le\s+)?(?:dossier\s+|folder\s+|répertoire\s+|directory\s+)([^\s,]+)/gi
        },
    ];

    // Parse file actions
    for (const { type, regex } of filePatterns) {
        let match;
        while ((match = regex.exec(userInput)) !== null) {
            const filename = match[1].trim();
            if (filename && !actions.some(a => a.type === type && a.filename === filename)) {
                actions.push({ type, filename, status: 'pending', timestamp: Date.now() });
            }
        }
    }

    // Parse folder actions (map to create/delete with isFolder flag)
    for (const { type, regex } of folderPatterns) {
        let match;
        while ((match = regex.exec(userInput)) !== null) {
            const folderName = match[1].trim().replace(/\/+$/, '');
            if (folderName) {
                const actionType = type === 'createFolder' ? 'create' : 'delete';
                if (!actions.some(a => a.filename === folderName)) {
                    actions.push({
                        type: actionType,
                        filename: folderName,
                        status: 'pending',
                        timestamp: Date.now(),
                        isFolder: true
                    });
                }
            }
        }
    }

    // Detect project scaffolding commands
    const projectPatterns = [
        /(?:créer?|create|init|scaffold)\s+(?:un\s+)?(?:projet\s+|project\s+)(?:react|next|node|express)/gi,
        /(?:npm\s+init|npx\s+create-react-app|npx\s+create-next-app)/gi,
    ];

    for (const regex of projectPatterns) {
        if (regex.test(userInput)) {
            actions.push({
                type: 'create',
                filename: 'project-scaffold',
                status: 'pending',
                timestamp: Date.now()
            });
            break;
        }
    }

    return actions;
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface ActionLineProps {
    type: 'thought' | 'read' | 'searched';
    text: string;
    time?: string;
    loading?: boolean;
}

const ActionLine = memo<ActionLineProps>(({ type, text, time, loading }) => {
    const t = useTranslations('ide');
    const labels: Record<ActionLineProps['type'], string> = {
        thought: t('chat.actionLabels.thought'),
        read: t('chat.actionLabels.read'),
        searched: t('chat.actionLabels.searched'),
    };

    const [displayedText, setDisplayedText] = useState(loading ? '' : text);

    useEffect(() => {
        if (!loading || !text) {
            setDisplayedText(text);
            return;
        }

        setDisplayedText('');
        let index = 0;
        const speed = 25;
        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, loading]);

    const getIcon = () => {
        switch (type) {
            case 'thought': return '◆';
            case 'read': return '◉';
            case 'searched': return '◎';
            default: return '○';
        }
    };

    return (
        <div className="flex items-center gap-2 py-1 px-1">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold
                ${loading ? 'bg-[#D97757]/10 text-[#D97757] animate-pulse' : 'bg-[#F5F3EE] text-[#9A9A9A]'}`}>
                {getIcon()}
            </div>
            <div className="flex items-center gap-1.5 text-[12px]">
                <span className={`font-medium uppercase tracking-wide ${loading ? 'text-[#D97757]' : 'text-[#6B6B6B]'}`}>
                    {labels[type]}
                </span>
                {text && (
                    <span className="text-[#37352F]">
                        {displayedText}
                        {loading && (
                            <span className="inline-block w-[2px] h-3 bg-[#D97757] ml-1 animate-pulse align-middle" />
                        )}
                    </span>
                )}
                {time && (
                    <span className="text-[#9A9A9A] text-[11px] ml-1">({time})</span>
                )}
            </div>
        </div>
    );
});
ActionLine.displayName = 'ActionLine';

interface AgentActionLineProps {
    action: AgentAction;
    onRetry?: () => void;
    onUndo?: () => void;
}

const AgentActionLine = memo<AgentActionLineProps>(({ action }) => {
    const t = useTranslations('ide');
    const labels: Record<AgentAction['type'], string> = {
        read: t('chat.actionLabels.read'),
        create: t('chat.actionLabels.created'),
        delete: t('chat.actionLabels.deleted'),
        modify: t('chat.actionLabels.modified'),
        thought: t('chat.actionLabels.thought'),
        search: t('chat.actionLabels.searched'),
    };

    const getIcon = () => {
        switch (action.type) {
            case 'read': return '◉';
            case 'create': return '+';
            case 'delete': return '−';
            case 'modify': return '✎';
            case 'search': return '◎';
            default: return '○';
        }
    };

    return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F5F3EE] text-[#37352F]">
            <span className="text-[10px]">{getIcon()}</span>
            <span>{labels[action.type]}</span>
            {action.filename && (
                <span className="text-[#9A9A9A]">{action.filename}</span>
            )}
            {action.status === 'pending' && (
                <Loader2 size={10} className="animate-spin text-[#D97757]" />
            )}
        </div>
    );
});
AgentActionLine.displayName = 'AgentActionLine';

const InlineFormat = memo<{ text: string }>(({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);

    return (
        <>
            {parts.map((part, idx) => {
                // Bold - subtle
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <span key={idx} className="font-medium">{part.slice(2, -2)}</span>;
                }
                // Inline code - subtle but visible
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={idx} className="bg-ide-ui/40 px-1.5 py-0.5 rounded text-[12px] font-mono text-ide-text/90">{part.slice(1, -1)}</code>;
                }
                // Links - simple
                const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                if (linkMatch) {
                    return <a key={idx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-ide-accent underline">{linkMatch[1]}</a>;
                }
                return <span key={idx}>{part}</span>;
            })}
        </>
    );
});
InlineFormat.displayName = 'InlineFormat';


// Inline Code Block Component (for code blocks shown in message, not as FileChangeCard)
const InlineCodeBlock = memo<{ language: string; code: string }>(({ language, code }) => {
    const t = useTranslations('ide');
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const lineCount = code.split('\n').length;
    const shouldCollapse = lineCount > 15;
    const lineCountLabel = t('chat.inlineCode.lines', { count: lineCount });
    const moreLinesLabel = t('chat.inlineCode.moreLines', { count: lineCount - 15 });

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Failed to copy:', err);
            }
        }
    }, [code]);

    return (
        <div className="my-2 rounded-lg border border-ide-border bg-white">
            {/* Header - Light theme */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-ide-ui/40 border-b border-ide-border/50 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-ide-muted font-mono">{language}</span>
                    <span className="text-[10px] text-ide-muted/70">{lineCountLabel}</span>
                </div>
                <div className="flex items-center gap-1">
                    {shouldCollapse && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="px-2 py-0.5 rounded text-[10px] hover:bg-ide-ui text-ide-muted hover:text-ide-text transition-colors"
                        >
                            {isExpanded ? t('chat.inlineCode.collapse') : t('chat.inlineCode.expand')}
                        </button>
                    )}
                    <button
                        onClick={handleCopy}
                        className="p-1 rounded hover:bg-ide-ui text-ide-muted hover:text-ide-text transition-colors"
                    >
                        {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                </div>
            </div>
            {/* Code content - Light theme */}
            <div
                className={`overflow-auto bg-ide-ui/20 ${shouldCollapse && !isExpanded ? 'max-h-[300px]' : 'max-h-[500px]'}`}
                style={{ scrollbarWidth: 'thin' }}
            >
                <pre className="p-3 text-[12px] font-mono leading-relaxed min-w-max">
                    <code className="text-ide-text/80 whitespace-pre">{code}</code>
                </pre>
            </div>
            {/* Show more indicator */}
            {shouldCollapse && !isExpanded && (
                <div
                    onClick={() => setIsExpanded(true)}
                    className="px-3 py-1.5 bg-ide-ui/30 border-t border-ide-border/30 text-center cursor-pointer hover:bg-ide-ui/50 transition-colors rounded-b-lg"
                >
                    <span className="text-[10px] text-ide-muted">{moreLinesLabel}</span>
                </div>
            )}
        </div>
    );
});
InlineCodeBlock.displayName = 'InlineCodeBlock';

const MessageContent = memo<{ text: string; isStreaming?: boolean; showInlineCode?: boolean }>(({ text, isStreaming, showInlineCode = true }) => {
    const elements: React.ReactNode[] = [];
    let key = 0;

    // Parse text with code blocks
    const codeBlockRegex = /```(\w+)?(?:\s+[^\n]*)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
        // Add text before code block
        if (match.index > lastIndex) {
            const textBefore = text.slice(lastIndex, match.index);
            elements.push(...parseTextContent(textBefore, key));
            key += 100;
        }

        // Add code block
        const language = match[1] || 'plaintext';
        const code = match[2].trim();

        if (showInlineCode && code.length >= 5) {
            elements.push(
                <InlineCodeBlock key={key++} language={language} code={code} />
            );
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    if (lastIndex < text.length) {
        const remainingText = text.slice(lastIndex);
        elements.push(...parseTextContent(remainingText, key));
    }

    return (
        <div className="text-[13px] text-ide-text leading-relaxed space-y-0.5">
            {elements}
            {isStreaming && <span className="inline-block w-1.5 h-3 bg-ide-accent animate-pulse ml-0.5" />}
        </div>
    );
});
MessageContent.displayName = 'MessageContent';

// Helper function to parse non-code text content
function parseTextContent(text: string, startKey: number): React.ReactNode[] {
    const elements: React.ReactNode[] = [];
    let key = startKey;
    const lines = text.split('\n');
    let lastWasEmpty = false; // Track consecutive empty lines

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Headers - clean with proper spacing
        if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
            const headerText = line.replace(/^#+\s*/, '');
            elements.push(<div key={key++} className="font-medium mt-3 mb-1">{headerText}</div>);
            lastWasEmpty = false;
            continue;
        }

        // Numbered list - readable spacing
        const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
        if (numberedMatch) {
            elements.push(
                <div key={key++} className="flex gap-2 pl-2 py-0.5">
                    <span className="text-ide-muted/70 min-w-[16px] text-[12px]">{numberedMatch[1]}.</span>
                    <span className="flex-1"><InlineFormat text={numberedMatch[2]} /></span>
                </div>
            );
            lastWasEmpty = false;
            continue;
        }

        // Bullet list - readable spacing
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().startsWith('* ')) {
            const content = line.replace(/^[\s]*[-•*]\s*/, '');
            elements.push(
                <div key={key++} className="flex gap-2 pl-2 py-0.5">
                    <span className="text-ide-muted/70 text-[11px]">•</span>
                    <span className="flex-1"><InlineFormat text={content} /></span>
                </div>
            );
            lastWasEmpty = false;
            continue;
        }

        // Empty line - only add one paragraph break, skip consecutive empty lines
        if (line.trim() === '') {
            if (!lastWasEmpty) {
                elements.push(<div key={key++} className="h-1.5" />);
                lastWasEmpty = true;
            }
            continue;
        }

        // Regular text
        elements.push(<div key={key++}><InlineFormat text={line} /></div>);
        lastWasEmpty = false;
    }

    return elements;
}

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

    // Compact Cursor-style file card
    return (
        <div
            onClick={onClick}
            className={`group cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${change.applied
                ? 'bg-emerald-50 border border-emerald-200'
                : 'hover:bg-[#F5F3EE] border border-transparent hover:border-[#E8E5DE]'
                }`}
        >
            {/* File icon */}
            <FileCode size={14} className={change.applied ? 'text-emerald-600' : 'text-[#9A9A9A]'} />

            {/* Filename */}
            <span className={`text-[13px] font-medium flex-1 truncate ${change.applied ? 'text-emerald-700' : 'text-[#37352F]'
                }`}>
                {change.filename}
            </span>

            {/* Diff stats */}
            <div className="flex items-center gap-1 text-[12px] font-mono">
                <span className="text-emerald-600">+{lineCount}</span>
                {linesRemoved > 0 && <span className="text-red-500">-{linesRemoved}</span>}
            </div>

            {/* Apply button or checkmark */}
            {change.applied ? (
                <Check size={14} className="text-emerald-600" />
            ) : (
                <button
                    onClick={handleApply}
                    disabled={disabled || isApplying}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/50 transition-all"
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

interface ErrorBannerProps {
    message: string;
    errorCode?: GeminiErrorCode;
    onRetry?: () => void;
    onDismiss?: () => void;
}

const ErrorBanner = memo<ErrorBannerProps>(({ message, errorCode, onRetry, onDismiss }) => {
    const t = useTranslations('ide');
    const isRetryable = errorCode && ![
        GeminiErrorCode.API_KEY_INVALID,
        GeminiErrorCode.API_KEY_MISSING,
        GeminiErrorCode.CONTENT_FILTERED,
    ].includes(errorCode);

    return (
        <div className="mx-3 mb-4 p-4 bg-[#FAF9F6] border-l-4 border-[#D97757] shadow-sm rounded-r-lg border-y border-r border-[#E8E5DE]">
            <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-[#D97757] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-[#37352F] font-serif font-medium tracking-tight mb-1">{t('chat.errorBanner.title')}</p>
                    <p className="text-[13px] text-[#6B6B6B] leading-relaxed">{message}</p>
                    {errorCode && <p className="text-[11px] text-[#9A9A9A] mt-2 font-mono bg-[#F5F3EE] px-1.5 py-0.5 rounded w-fit">{t('chat.errorBanner.code', { code: errorCode })}</p>}
                </div>
                <div className="flex items-center gap-1 -mt-1 -mr-1">
                    {isRetryable && onRetry && (
                        <button onClick={onRetry} className="p-2 hover:bg-[#D97757]/10 rounded-full text-[#D97757] transition-colors" title={t('chat.errorBanner.retry')}>
                            <RefreshCw size={15} />
                        </button>
                    )}
                    {onDismiss && (
                        <button onClick={onDismiss} className="p-2 hover:bg-[#E8E5DE] rounded-full text-[#9A9A9A] hover:text-[#37352F] transition-colors" title={t('chat.errorBanner.close')}>
                            <X size={15} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});
ErrorBanner.displayName = 'ErrorBanner';

const EmptyState = memo<{
    onSuggestionClick?: (suggestion: string) => void;
    input: string;
    setInput: (value: string) => void;
    onSend: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    isLoading: boolean;
    isServiceReady: boolean;
}>(({ onSuggestionClick, input, setInput, onSend, onKeyDown, isLoading, isServiceReady }) => {
    const t = useTranslations('ide');
    const suggestions = (t.raw('chat.emptyState.suggestions') as Array<{ text: string; icon?: string; prompt?: string }>) || [];
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea based on content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend();
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6 animate-chat-scale-in">
            {/* B.AI Logo */}
            <div className="w-full max-w-[480px] text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                    <Image
                        src="/logo/IDE/Logo-AI-illustration.svg"
                        alt="B.AI"
                        width={100}
                        height={100}
                        priority
                    />
                </div>

                {/* Main greeting */}
                <h2 className="text-base sm:text-lg font-mono font-medium text-[#37352F] tracking-tight">
                    <span className="text-[#37352F]">{t('chat.emptyState.prompt')}</span>
                    <span className="inline-block w-2.5 h-5 bg-[#D97757] ml-2 animate-pulse align-middle"></span>
                </h2>
            </div>

            {/* Functional Input container */}
            <div className="w-full max-w-[480px]">
                <form onSubmit={handleSubmit} className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E8E5DE] shadow-[0_8px_32px_-12px_rgba(20,20,19,0.15)] overflow-hidden focus-within:border-[#D97757]/40 focus-within:shadow-lg transition-all">
                    {/* Real textarea */}
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder={t('chat.emptyState.placeholder')}
                        className="text-ide-text text-[15px] w-full resize-none bg-transparent px-4 py-4 outline-none placeholder:text-ide-muted/70 min-h-[48px] max-h-[200px] overflow-y-hidden"
                        rows={1}
                        spellCheck={false}
                        disabled={isLoading || !isServiceReady}
                    />

                    {/* Bottom bar with B.AI logo on left, send button on right */}
                    <div className="px-4 py-3 border-t border-[#E8E5DE]/50 flex items-center justify-between">
                        <Image src="/logo/IDE/Logo AI.svg" alt="B.AI" width={28} height={12} />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading || !isServiceReady}
                            className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${input.trim() && !isLoading && isServiceReady
                                ? 'bg-[#D97757] text-white shadow-sm hover:bg-[#c86a4c]'
                                : 'bg-ide-ui/50 text-ide-muted cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={14} />}
                        </button>
                    </div>
                </form>

                {/* Quick action buttons - with custom icons */}
                {onSuggestionClick && (
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                        {suggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSuggestionClick(suggestion.prompt || suggestion.text)}
                                className="group flex items-center gap-2 text-[13px] px-4 py-2.5 rounded-full border border-[#E8E5DE] bg-white/80 text-[#37352F]/80 shadow-sm transition-all hover:border-[#D97757]/40 hover:bg-white hover:shadow-md hover:text-[#37352F]"
                            >
                                {suggestion.icon && (
                                    <Image
                                        src={`/icons/IDE-icone/${suggestion.icon}.svg`}
                                        alt=""
                                        width={16}
                                        height={16}
                                        className="w-4 h-4 opacity-60 group-hover:opacity-80 transition-opacity"
                                    />
                                )}
                                {suggestion.text}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});
EmptyState.displayName = 'EmptyState';

// Quick Actions Toolbar
interface QuickActionsProps {
    onAction: (prompt: string) => void;
    activeFile: FileData | null | undefined;
    disabled?: boolean;
}

const QuickActionsToolbar = memo<QuickActionsProps>(({ onAction, activeFile, disabled }) => {
    const t = useTranslations('ide');

    const handleAction = useCallback((actionId: string) => {
        const prompts: Record<string, string> = {
            explain: t('chat.quickActions.explainPrompt', { filename: activeFile?.name || 'this file' }),
            refactor: t('chat.quickActions.refactorPrompt', { filename: activeFile?.name || 'this file' }),
            debug: t('chat.quickActions.debugPrompt', { filename: activeFile?.name || 'this file' }),
            tests: t('chat.quickActions.testsPrompt', { filename: activeFile?.name || 'this file' }),
        };
        onAction(prompts[actionId] || '');
    }, [onAction, activeFile, t]);

    if (!activeFile) return null;

    return (
        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-[#E8E5DE]/50 bg-[#FAF9F6]/50">
            {QUICK_ACTIONS.map(({ id, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => handleAction(id)}
                    disabled={disabled}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#6B6B6B] bg-white border border-[#E8E5DE] hover:border-[#D97757]/40 hover:text-[#D97757] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Icon size={12} />
                    {t(`chat.quickActions.${id}`)}
                </button>
            ))}
        </div>
    );
});
QuickActionsToolbar.displayName = 'QuickActionsToolbar';

// Command Autocomplete Dropdown
interface CommandAutocompleteProps {
    input: string;
    commands: Array<typeof SLASH_COMMANDS[number]>;
    selectedIndex: number;
    onSelect: (command: typeof SLASH_COMMANDS[number]) => void;
    visible: boolean;
}

const CommandAutocomplete = memo<CommandAutocompleteProps>(({
    commands,
    selectedIndex,
    onSelect,
    visible
}) => {
    const t = useTranslations('ide');

    if (!visible || commands.length === 0) return null;

    const categoryIcons: Record<string, string> = {
        navigation: '→',
        mode: '◉',
        file: '📄',
        terminal: '⌘',
        panel: '▦',
        export: '↓',
        info: 'ℹ',
        code: '⟨⟩',
        chat: '💬',
    };

    return (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-lg border border-[#E8E5DE] shadow-lg overflow-hidden z-50">
            <div className="max-h-[200px] overflow-y-auto">
                {commands.map((cmd, idx) => (
                    <button
                        key={cmd.command}
                        onClick={() => onSelect(cmd)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${idx === selectedIndex
                                ? 'bg-[#D97757]/10 border-l-2 border-[#D97757]'
                                : 'hover:bg-[#F5F3EE]'
                            }`}
                    >
                        <span className="text-[14px] w-6 text-center text-[#9A9A9A]">
                            {categoryIcons[cmd.category] || '•'}
                        </span>
                        <div className="flex-1 min-w-0">
                            <span className="text-[13px] font-mono font-medium text-[#37352F]">
                                {cmd.command}
                            </span>
                            {cmd.hasArg && (
                                <span className="text-[11px] text-[#9A9A9A] ml-1">&lt;arg&gt;</span>
                            )}
                        </div>
                        <span className="text-[11px] text-[#6B6B6B] truncate max-w-[150px]">
                            {cmd.description}
                        </span>
                    </button>
                ))}
            </div>
            <div className="px-3 py-1.5 bg-[#F5F3EE] border-t border-[#E8E5DE] text-[10px] text-[#9A9A9A]">
                {t('chat.autocomplete.hint')}
            </div>
        </div>
    );
});
CommandAutocomplete.displayName = 'CommandAutocomplete';



// ============================================================
// MAIN COMPONENT
// ============================================================

const ChatPanel: React.FC<ChatPanelProps> = ({
    contextFiles,
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
    maxMessages = 50,
    className = '',
}) => {
    const t = useTranslations('ide');
    const thinkingMessages = useMemo(() => {
        const messages = t.raw('chat.thinkingMessages') as string[] | undefined;
        if (Array.isArray(messages) && messages.length > 0) return messages;
        return [t('chat.message.analyzed')];
    }, [t]);
    // State
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        if (typeof window !== 'undefined') {
            return loadMessagesFromStorage();
        }
        return [];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingTime, setThinkingTime] = useState(0);
    const [thinkingMessage, setThinkingMessage] = useState(() => thinkingMessages[0] ?? t('chat.message.analyzed'));
    const [streamingText, setStreamingText] = useState('');
    const [error, setError] = useState<{ message: string; code?: GeminiErrorCode } | null>(null);
    const [isServiceReady, setIsServiceReady] = useState(false);

    // Autocomplete & History state
    const [autocompleteCommands, setAutocompleteCommands] = useState<Array<typeof SLASH_COMMANDS[number]>>([]);
    const [autocompleteIndex, setAutocompleteIndex] = useState(0);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [inputHistory, setInputHistory] = useState<string[]>(() => loadInputHistory());
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const geminiServiceRef = useRef<GeminiService | null>(null);
    const lastInputRef = useRef<string>('');

    // Initialize Gemini Service
    useEffect(() => {
        geminiServiceRef.current = getGeminiService();
        setIsServiceReady(geminiServiceRef.current.isReady());

        const abortController = abortControllerRef.current;
        const thinkingInterval = thinkingIntervalRef.current;
        return () => {
            abortController?.abort();
            if (thinkingInterval) {
                clearInterval(thinkingInterval);
            }
        };
    }, []);

    // Persist messages to localStorage
    useEffect(() => {
        if (messages.length > 0) {
            saveMessagesToStorage(messages);
        }
    }, [messages]);

    // Ref for the messages container
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom - only within the chat container, not the whole page
    const scrollToBottom = useCallback(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        // Use requestAnimationFrame to ensure DOM is updated before scrolling
        requestAnimationFrame(() => {
            scrollToBottom();
        });
    }, [messages, isLoading, streamingText, scrollToBottom]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [input]);

    useEffect(() => {
        setThinkingMessage(thinkingMessages[0]);
    }, [thinkingMessages]);

    // Thinking timer
    useEffect(() => {
        if (isLoading) {
            setThinkingTime(0);
            let msgIndex = 0;

            thinkingIntervalRef.current = setInterval(() => {
                setThinkingTime(t => t + 1);
                msgIndex = (msgIndex + 1) % thinkingMessages.length;
                setThinkingMessage(thinkingMessages[msgIndex]);
            }, 1000);
        } else {
            if (thinkingIntervalRef.current) {
                clearInterval(thinkingIntervalRef.current);
                thinkingIntervalRef.current = null;
            }
        }

        return () => {
            if (thinkingIntervalRef.current) {
                clearInterval(thinkingIntervalRef.current);
            }
        };
    }, [isLoading, thinkingMessages]);

    // Get conversation history for API
    const getConversationHistory = useCallback((): GeminiMessage[] => {
        return messages
            .slice(-MAX_HISTORY_FOR_API)
            .filter(msg => msg.text && !msg.error)
            .map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }],
            }));
    }, [messages]);

    // Execute file actions
    const executeActions = useCallback((actions: AgentAction[]): {
        executedActions: AgentAction[];
        fileContents: Map<string, string>;
        pendingCreates: Array<{ name: string; content: string }>;
        pendingDeletes: string[];
        pendingFolders: string[];
    } => {
        const fileContents = new Map<string, string>();
        const pendingCreates: Array<{ name: string; content: string }> = [];
        const pendingDeletes: string[] = [];
        const pendingFolders: string[] = [];

        const executedActions = actions.map(action => {
            // Check if it's a folder action
            const isFolder = action.isFolder ||
                !action.filename?.includes('.') ||
                action.filename === 'project-scaffold';

            switch (action.type) {
                case 'read':
                case 'modify':
                    if (action.filename && onReadFile) {
                        const content = onReadFile(action.filename);
                        if (content !== null) {
                            fileContents.set(action.filename, content);
                            return { ...action, status: 'done' as const, content };
                        }
                        return { ...action, status: 'error' as const, description: t('chat.actionDescriptions.fileNotFound') };
                    }
                    break;

                case 'create':
                    if (action.filename) {
                        if (isFolder && action.filename !== 'project-scaffold') {
                            // Create folder
                            if (onCreateFolder) {
                                onCreateFolder(action.filename);
                                pendingFolders.push(action.filename);
                            }
                            return { ...action, status: 'done' as const, description: t('chat.actionDescriptions.folderCreated', { folder: action.filename }) };
                        } else if (action.filename === 'project-scaffold') {
                            // Project scaffolding - will be handled by AI response
                            return { ...action, status: 'pending' as const, description: t('chat.actionDescriptions.scaffoldingPending') };
                        } else {
                            // Create file
                            const ext = getFileExtension(action.filename);
                            const template = getFileTemplate(action.filename, ext);
                            pendingCreates.push({ name: action.filename, content: template });
                            return { ...action, status: 'done' as const };
                        }
                    }
                    break;

                case 'delete':
                    if (action.filename) {
                        if (isFolder) {
                            // Delete folder
                            if (onDeleteFolder) {
                                onDeleteFolder(action.filename);
                            }
                            return { ...action, status: 'done' as const, description: t('chat.actionDescriptions.folderDeleted', { folder: action.filename }) };
                        } else {
                            pendingDeletes.push(action.filename);
                            return { ...action, status: 'done' as const };
                        }
                    }
                    break;
            }
            return action;
        });

        return { executedActions, fileContents, pendingCreates, pendingDeletes, pendingFolders };
    }, [onReadFile, onCreateFolder, onDeleteFolder, t]);

    // Apply code change - separated to avoid setState during render
    const applyCodeChange = useCallback((messageId: string, changeIndex: number) => {
        // First, find the change to apply
        const message = messages.find(m => m.id === messageId);
        if (!message?.codeChanges?.[changeIndex]) return;

        const change = message.codeChanges[changeIndex];
        if (change.applied) return;

        // Check if file exists
        const fileContent = onReadFile?.(change.filename);
        const fileExists = fileContent !== null && fileContent !== undefined;

        if (fileExists) {
            // Update existing file
            if (onUpdateFile) {
                onUpdateFile(change.filename, change.newCode);
            }
        } else {
            // Create new file
            if (change.filename.includes('/') && onCreateFileWithPath) {
                onCreateFileWithPath(change.filename, change.newCode);
            } else if (onCreateFile) {
                onCreateFile(change.filename, change.newCode);
            }
        }

        // Then update the message state
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId && msg.codeChanges) {
                const updatedChanges = [...msg.codeChanges];
                updatedChanges[changeIndex] = { ...updatedChanges[changeIndex], applied: true };
                return { ...msg, codeChanges: updatedChanges };
            }
            return msg;
        }));
    }, [messages, onUpdateFile, onReadFile, onCreateFile, onCreateFileWithPath]);

    // Handle sending message
    const handleSend = useCallback(async () => {
        const trimmedInput = sanitizeInput(input);
        if (!trimmedInput) return;

        // Save to input history
        saveInputHistory(trimmedInput);
        setInputHistory(prev => [trimmedInput, ...prev.filter(h => h !== trimmedInput)].slice(0, MAX_INPUT_HISTORY));
        setHistoryIndex(-1);
        setShowAutocomplete(false);

        // DEMO MODE TRIGGER
        if (trimmedInput === 'test' || trimmedInput === '/demo') {
            const userMsg: ChatMessage = {
                id: generateId(),
                role: 'user',
                text: trimmedInput,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, userMsg]);
            setInput('');
            setIsLoading(true);

            // Simulation Sequence
            setTimeout(() => {
                setIsLoading(false);
                const demoMsg: ChatMessage = {
                    id: generateId(),
                    role: 'model',
                    text: "I've created a demo component to showcase the syntax highlighting and UI elements. Here is the implementation:",
                    timestamp: new Date(),
                    thoughts: "Analyzing design requirements and generating demo assets...",
                    thinkingTime: 1.8,
                    actions: [
                        { type: 'read', filename: 'src/app/page.tsx', status: 'done', timestamp: Date.now() },
                        { type: 'create', filename: 'components/Demo.tsx', status: 'done', timestamp: Date.now() }
                    ],
                    codeChanges: [
                        {
                            filename: 'components/Demo.tsx',
                            language: 'tsx',
                            description: 'Demo Component',
                            applied: false,
                            linesAdded: 15,
                            linesRemoved: 0,
                            newCode: `import React from 'react';\n\ninterface DemoProps {\n  title: string;\n  isActive: boolean;\n}\n\nexport const DemoComponent: React.FC<DemoProps> = ({ title, isActive }) => {\n  // This is a comment to test colors\n  const status = isActive ? 'Active' : 'Inactive';\n\n  return (\n    <div className="p-4 bg-white rounded-lg shadow-sm">\n      <h1 className="text-xl font-bold">{title}</h1>\n      <p className="text-gray-600">Status: {status}</p>\n      <button onClick={() => console.log('Clicked!')}>\n        Click Me\n      </button>\n    </div>\n  );\n};`
                        }
                    ],
                    // Simulate an inline error to test the design
                    error: "Simulation: An optional error message to test the new design."
                };
                setMessages(prev => [...prev, demoMsg]);
            }, 2000);
            return;
        }

        // SEARCH COMMAND - Direct /search handling
        if (trimmedInput.startsWith('/search ')) {
            const query = trimmedInput.slice(8).trim();
            if (!query) {
                const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
                setMessages(prev => [...prev, userMsg]);
                setInput('');
                setMessages(prev => [...prev, { id: generateId(), role: 'model', text: 'Veuillez spécifier un terme de recherche. Ex: `/search useState`', timestamp: new Date() }]);
                return;
            }
            if (onSearchFiles) {
                const userMsg: ChatMessage = {
                    id: generateId(),
                    role: 'user',
                    text: trimmedInput,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, userMsg]);
                setInput('');

                const results = onSearchFiles(query);
                const formattedResults = formatSearchResults(results, query);

                const searchMsg: ChatMessage = {
                    id: generateId(),
                    role: 'model',
                    text: formattedResults,
                    timestamp: new Date(),
                    actions: [{ type: 'search', filename: query, status: 'done', timestamp: Date.now() }],
                };
                setMessages(prev => [...prev, searchMsg]);
                return;
            }
        }

        // RUN COMMAND - Direct terminal command execution
        if (trimmedInput.startsWith('/run ')) {
            const cmd = trimmedInput.slice(5).trim();
            if (cmd) {
                const userMsg: ChatMessage = {
                    id: generateId(),
                    role: 'user',
                    text: trimmedInput,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, userMsg]);
                setInput('');

                const result = onExecuteCommand
                    ? onExecuteCommand(cmd)
                    : executeTerminalCommand(cmd, { files: contextFiles?.filter((f): f is FileData => 'content' in f) || [] });

                const outputMsg: ChatMessage = {
                    id: generateId(),
                    role: 'model',
                    text: `\`\`\`bash\n$ ${cmd}\n${result.output}\n\`\`\``,
                    timestamp: new Date(),
                    actions: [{ type: 'thought', filename: cmd, status: 'done', timestamp: Date.now() }],
                };
                setMessages(prev => [...prev, outputMsg]);
                return;
            }
        }

        // TERMINAL COMMAND - Open/focus terminal
        if (trimmedInput === '/terminal' || trimmedInput === '/term') {
            if (onFocusPanel) {
                onFocusPanel('terminal');
                const userMsg: ChatMessage = {
                    id: generateId(),
                    role: 'user',
                    text: trimmedInput,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, userMsg]);
                setInput('');
                const confirmMsg: ChatMessage = {
                    id: generateId(),
                    role: 'model',
                    text: 'Terminal ouvert.',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, confirmMsg]);
                return;
            }
        }

        // EXPLORER COMMAND - Open/focus file explorer
        if (trimmedInput === '/explorer' || trimmedInput === '/files') {
            if (onFocusPanel) {
                onFocusPanel('explorer');
                const userMsg: ChatMessage = {
                    id: generateId(),
                    role: 'user',
                    text: trimmedInput,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, userMsg]);
                setInput('');
                const confirmMsg: ChatMessage = {
                    id: generateId(),
                    role: 'model',
                    text: 'Explorateur de fichiers ouvert.',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, confirmMsg]);
                return;
            }
        }

        // CLOSE COMMAND - Close a tab
        if (trimmedInput.startsWith('/close ')) {
            const filePath = trimmedInput.slice(7).trim();
            if (filePath && onCloseTab) {
                onCloseTab(filePath);
                const userMsg: ChatMessage = {
                    id: generateId(),
                    role: 'user',
                    text: trimmedInput,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, userMsg]);
                setInput('');
                const confirmMsg: ChatMessage = {
                    id: generateId(),
                    role: 'model',
                    text: `Onglet "${filePath}" fermé.`,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, confirmMsg]);
                return;
            }
        }

        // Auto-detect panel focus commands
        const terminalPattern = /(?:ouvre?|open|affiche?|show|focus)\s+(?:le\s+)?terminal/i;
        const explorerPattern = /(?:ouvre?|open|affiche?|show|focus)\s+(?:l['']|le\s+)?(?:explorateur|explorer|files|fichiers)/i;
        const closePattern = /(?:ferme?|close)\s+(?:l['']|le\s+)?onglet\s+(.+)/i;

        if (terminalPattern.test(trimmedInput) && onFocusPanel) {
            onFocusPanel('terminal');
            const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
            setMessages(prev => [...prev, userMsg]);
            setInput('');
            setMessages(prev => [...prev, { id: generateId(), role: 'model', text: 'Terminal ouvert.', timestamp: new Date() }]);
            return;
        }

        if (explorerPattern.test(trimmedInput) && onFocusPanel) {
            onFocusPanel('explorer');
            const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
            setMessages(prev => [...prev, userMsg]);
            setInput('');
            setMessages(prev => [...prev, { id: generateId(), role: 'model', text: 'Explorateur ouvert.', timestamp: new Date() }]);
            return;
        }

        const closeMatch = trimmedInput.match(closePattern);
        if (closeMatch && closeMatch[1] && onCloseTab) {
            onCloseTab(closeMatch[1].trim());
            const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
            setMessages(prev => [...prev, userMsg]);
            setInput('');
            setMessages(prev => [...prev, { id: generateId(), role: 'model', text: `Onglet "${closeMatch[1].trim()}" fermé.`, timestamp: new Date() }]);
            return;
        }

        // DOWNLOAD COMMAND - Download content as file
        if (trimmedInput.startsWith('/download ')) {
            const args = trimmedInput.slice(10).trim();
            const [filename, ...contentParts] = args.split(' ');
            const content = contentParts.join(' ') || '';

            if (filename && onDownload) {
                const success = onDownload({ filename, content });
                const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
                setMessages(prev => [...prev, userMsg]);
                setInput('');
                setMessages(prev => [...prev, {
                    id: generateId(),
                    role: 'model',
                    text: success ? `Fichier "${filename}" téléchargé.` : 'Erreur lors du téléchargement.',
                    timestamp: new Date()
                }]);
                return;
            }
        }

        // RESUME COMMAND - Generate and download CV
        if (trimmedInput === '/resume' || trimmedInput === '/cv') {
            if (onDownload) {
                const cvContent = `# Abdelbadie Khoubiza

## Full Stack Developer & Designer

**Location:** Morocco  
**Email:** a.khoubiza.dev@gmail.com  
**GitHub:** github.com/abdelbadie  
**LinkedIn:** linkedin.com/in/abdelbadie

---

## Technical Skills

| Category | Technologies |
|----------|--------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Node.js, Laravel 12, Python |
| Database | MongoDB, MySQL, Redis |
| DevOps | Docker, Vercel, VMware |
| Design | Figma, Glassmorphism, Responsive UI |

---

## Projects

### Portfolio IDE (2025)
Interactive developer portfolio with VS Code simulation.  
**Stack:** Next.js 16, TypeScript, Tailwind CSS v4, OpenRouter AI

### USMBA Portal (2025)
Academic management system for Université Sidi Mohamed Ben Abdellah.  
**Stack:** Laravel 12, MySQL, Alpine.js, Tailwind CSS

### AYJI E-learning (2025)
Learning Management System with real-time features.  
**Stack:** Angular 19, NgRx, Node.js, MongoDB, Redis, Socket.io

### IT Infrastructure Audit (2024)
15-day professional internship at Agence Urbaine de Taza.  
**Focus:** Network audit, VMware virtualization, Security hardening

---

## Availability

Open to freelance, full-time, and collaboration opportunities.
`;
                onDownload({ filename: 'CV_Abdelbadie_Khoubiza.md', content: cvContent, mimeType: 'text/markdown' });
                const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
                setMessages(prev => [...prev, userMsg]);
                setInput('');
                setMessages(prev => [...prev, {
                    id: generateId(),
                    role: 'model',
                    text: 'CV généré et téléchargé au format Markdown.',
                    timestamp: new Date()
                }]);
                return;
            }
        }

        // Auto-detect download commands
        const downloadPattern = /(?:télécharge?|download|export|sauvegarde?|save)\s+(?:le\s+)?(?:cv|resume)/i;
        if (downloadPattern.test(trimmedInput) && onDownload) {
            onDownload({
                filename: 'CV_Abdelbadie_Khoubiza.md',
                content: '# CV content would be generated here',
                mimeType: 'text/markdown'
            });
            const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
            setMessages(prev => [...prev, userMsg]);
            setInput('');
            setMessages(prev => [...prev, { id: generateId(), role: 'model', text: 'CV téléchargé.', timestamp: new Date() }]);
            return;
        }

        // STATS COMMAND - Display portfolio statistics
        if (trimmedInput === '/stats') {
            const allFilesFromContext = contextFiles?.filter((f): f is FileData => 'content' in f) || [];
            const stats = computePortfolioStats(allFilesFromContext);
            const formattedStats = formatPortfolioStats(stats);
            const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
            setMessages(prev => [...prev, userMsg]);
            setInput('');
            setMessages(prev => [...prev, { id: generateId(), role: 'model', text: formattedStats, timestamp: new Date() }]);
            return;
        }

        // Auto-detect stats commands
        const statsPattern = /(?:statistiques?|stats|métriques?|combien\s+de\s+(?:fichiers?|lignes?|fiches?)|how\s+many\s+(?:files?|lines?))/i;
        if (statsPattern.test(trimmedInput)) {
            const allFilesFromContext = contextFiles?.filter((f): f is FileData => 'content' in f) || [];
            const stats = computePortfolioStats(allFilesFromContext);
            const formattedStats = formatPortfolioStats(stats);
            const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
            setMessages(prev => [...prev, userMsg]);
            setInput('');
            setMessages(prev => [...prev, { id: generateId(), role: 'model', text: formattedStats, timestamp: new Date() }]);
            return;
        }

        // CODE INTELLIGENCE COMMANDS
        // /tests - Generate unit tests for active file
        if (trimmedInput === '/tests' || trimmedInput.startsWith('/tests ')) {
            if (!activeFile) {
                const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
                setMessages(prev => [...prev, userMsg]);
                setInput('');
                setMessages(prev => [...prev, { id: generateId(), role: 'model', text: t('chat.codeIntel.testsDesc', { filename: '...' }) + '\n\nOuvrez d\'abord un fichier dans l\'éditeur.', timestamp: new Date() }]);
                return;
            }
            // Continue to AI processing with tests prompt
            const testPrompt = `Génère des tests unitaires complets pour le fichier "${activeFile.name}". Utilise un framework de test moderne (Vitest/Jest pour JS/TS, pytest pour Python, etc.). Inclus:\n1. Tests pour les cas nominaux\n2. Tests pour les cas limites\n3. Tests pour les erreurs\n4. Mocks si nécessaire\n\nCode du fichier:\n\`\`\`${activeFile.type}\n${activeFile.content}\n\`\`\``;
            const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
            setMessages(prev => [...prev, userMsg]);
            setInput('');
            setIsLoading(true);

            try {
                const conversationHistory = getConversationHistory();
                const response = await geminiServiceRef.current?.sendMessage(testPrompt, conversationHistory);
                if (response?.error) throw new Error(response.error);

                const aiMsg: ChatMessage = {
                    id: generateId(),
                    role: 'model',
                    text: response?.text || '',
                    timestamp: new Date(),
                    actions: [{ type: 'read', filename: activeFile.name, status: 'done', timestamp: Date.now() }],
                };
                setMessages(prev => [...prev, aiMsg].slice(-maxMessages));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
                setMessages(prev => [...prev, { id: generateId(), role: 'model', text: '', error: errorMessage, timestamp: new Date() }]);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // /review - Code review for active file
        if (trimmedInput === '/review' || trimmedInput.startsWith('/review ')) {
            if (!activeFile) {
                const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
                setMessages(prev => [...prev, userMsg]);
                setInput('');
                setMessages(prev => [...prev, { id: generateId(), role: 'model', text: 'Ouvrez d\'abord un fichier dans l\'éditeur.', timestamp: new Date() }]);
                return;
            }
            const reviewPrompt = `Effectue une code review complète du fichier "${activeFile.name}". Analyse:\n\n1. **Qualité du code**: Lisibilité, nommage, structure\n2. **Performance**: Optimisations possibles\n3. **Sécurité**: Vulnérabilités potentielles\n4. **Bonnes pratiques**: Patterns, conventions\n5. **Maintenabilité**: Dette technique, suggestions\n\nCode:\n\`\`\`${activeFile.type}\n${activeFile.content}\n\`\`\`\n\nDonne des suggestions concrètes avec des exemples de code quand c'est pertinent.`;
            const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
            setMessages(prev => [...prev, userMsg]);
            setInput('');
            setIsLoading(true);

            try {
                const conversationHistory = getConversationHistory();
                const response = await geminiServiceRef.current?.sendMessage(reviewPrompt, conversationHistory);
                if (response?.error) throw new Error(response.error);

                const aiMsg: ChatMessage = {
                    id: generateId(),
                    role: 'model',
                    text: response?.text || '',
                    timestamp: new Date(),
                    actions: [{ type: 'read', filename: activeFile.name, status: 'done', timestamp: Date.now() }],
                };
                setMessages(prev => [...prev, aiMsg].slice(-maxMessages));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
                setMessages(prev => [...prev, { id: generateId(), role: 'model', text: '', error: errorMessage, timestamp: new Date() }]);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // /doc - Generate documentation for active file
        if (trimmedInput === '/doc' || trimmedInput.startsWith('/doc ')) {
            if (!activeFile) {
                const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
                setMessages(prev => [...prev, userMsg]);
                setInput('');
                setMessages(prev => [...prev, { id: generateId(), role: 'model', text: 'Ouvrez d\'abord un fichier dans l\'éditeur.', timestamp: new Date() }]);
                return;
            }
            const docPrompt = `Génère une documentation complète pour le fichier "${activeFile.name}". Inclus:\n\n1. **Description générale**: Purpose du fichier\n2. **Exports**: Fonctions, classes, composants exportés\n3. **Types/Interfaces**: Documentation des types\n4. **Utilisation**: Exemples d'utilisation\n5. **Dépendances**: Imports et leurs usages\n\nCode:\n\`\`\`${activeFile.type}\n${activeFile.content}\n\`\`\`\n\nFormat: JSDoc/TSDoc pour JS/TS, docstrings pour Python, etc.`;
            const userMsg: ChatMessage = { id: generateId(), role: 'user', text: trimmedInput, timestamp: new Date() };
            setMessages(prev => [...prev, userMsg]);
            setInput('');
            setIsLoading(true);

            try {
                const conversationHistory = getConversationHistory();
                const response = await geminiServiceRef.current?.sendMessage(docPrompt, conversationHistory);
                if (response?.error) throw new Error(response.error);

                const aiMsg: ChatMessage = {
                    id: generateId(),
                    role: 'model',
                    text: response?.text || '',
                    timestamp: new Date(),
                    actions: [{ type: 'read', filename: activeFile.name, status: 'done', timestamp: Date.now() }],
                };
                setMessages(prev => [...prev, aiMsg].slice(-maxMessages));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
                setMessages(prev => [...prev, { id: generateId(), role: 'model', text: '', error: errorMessage, timestamp: new Date() }]);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // /clear - Clear conversation
        if (trimmedInput === '/clear') {
            abortControllerRef.current?.abort();
            setMessages([]);
            clearMessagesFromStorage();
            setStreamingText('');
            setError(null);
            setIsLoading(false);
            return;
        }

        // Auto-detect terminal commands (ls, pwd, cat, etc.)
        const terminalCommands = ['ls', 'cd', 'pwd', 'cat', 'grep', 'find', 'npm', 'git', 'node', 'help', 'whoami', 'date', 'uptime', 'env', 'echo'];
        const firstWord = trimmedInput.split(' ')[0].toLowerCase();
        if (terminalCommands.includes(firstWord) && onExecuteCommand) {
            const result = onExecuteCommand(trimmedInput);
            const userMsg: ChatMessage = {
                id: generateId(),
                role: 'user',
                text: trimmedInput,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, userMsg]);
            setInput('');

            const outputMsg: ChatMessage = {
                id: generateId(),
                role: 'model',
                text: `\`\`\`bash\n$ ${trimmedInput}\n${result.output}\n\`\`\``,
                timestamp: new Date(),
                actions: [{ type: 'thought', filename: trimmedInput, status: 'done', timestamp: Date.now() }],
            };
            setMessages(prev => [...prev, outputMsg]);
            return;
        }

        if (isLoading || !geminiServiceRef.current?.isReady()) return;

        lastInputRef.current = trimmedInput;
        setError(null);

        // Parse and execute actions
        const parsedActions = parseAgentActions(trimmedInput);
        const { executedActions, fileContents, pendingCreates, pendingDeletes, pendingFolders } = executeActions(parsedActions);

        // Build context message
        let contextMessage = trimmedInput;

        // Inject available files list for context awareness
        if (contextFiles && contextFiles.length > 0) {
            // Filter out files pending deletion and add files pending creation to reflect immediate state
            const effectiveFiles = contextFiles
                .filter(f => !pendingDeletes.includes(f.name))
                .map(f => f.name);

            pendingCreates.forEach(created => {
                if (!effectiveFiles.includes(created.name)) {
                    effectiveFiles.push(created.name);
                }
            });

            // Add pending folders
            pendingFolders.forEach(folder => {
                if (!effectiveFiles.includes(folder + '/')) {
                    effectiveFiles.push(folder + '/');
                }
            });

            const fileList = effectiveFiles.join(', ');
            contextMessage += `\n\n[${t('chat.context.filesystem', { list: fileList })}]`;
        }

        // Add file contents from actions
        for (const [filename, content] of fileContents) {
            const action = executedActions.find(a => a.filename === filename);
            const label = action?.type === 'modify'
                ? t('chat.contextLabels.toModify')
                : t('chat.contextLabels.content');
            contextMessage += `\n\n[${label} - ${filename}]:\n\`\`\`\n${content}\n\`\`\``;
        }

        // Execute search actions and inject results
        const searchActions = executedActions.filter(a => a.type === 'search');
        if (onSearchFiles && searchActions.length > 0) {
            for (const searchAction of searchActions) {
                if (searchAction.filename) {
                    const results = onSearchFiles(searchAction.filename);
                    if (results.length > 0) {
                        contextMessage += `\n\n[Search Results for "${searchAction.filename}"]:\n`;
                        results.slice(0, 20).forEach(r => {
                            contextMessage += `${r.filePath}:${r.line}: ${r.content}\n`;
                        });
                        if (results.length > 20) {
                            contextMessage += `... and ${results.length - 20} more results\n`;
                        }
                    } else {
                        contextMessage += `\n\n[Search Results for "${searchAction.filename}"]: No matches found.\n`;
                    }
                }
            }
        }

        // ALWAYS include active file context if available and not already included
        if (activeFile && !fileContents.has(activeFile.name)) {
            contextMessage += `\n\n[${t('chat.context.activeFile', { filename: activeFile.name })}]:\n\`\`\`${activeFile.type}\n${activeFile.content}\n\`\`\``;
        }

        const userMsg: ChatMessage = {
            id: generateId(),
            role: 'user',
            text: trimmedInput,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg].slice(-maxMessages));
        setInput('');
        setIsLoading(true);
        setStreamingText('');

        // Execute file operations
        pendingDeletes.forEach(filename => onDeleteFile?.(filename));
        pendingCreates.forEach(({ name, content }) => {
            if (name.includes('/') && onCreateFileWithPath) {
                onCreateFileWithPath(name, content);
            } else {
                onCreateFile?.(name, content);
            }
        });

        setTimeout(() => {
            for (const filename of fileContents.keys()) {
                onOpenFile(filename);
            }
        }, 0);

        try {
            const conversationHistory = getConversationHistory();
            const modifyActions = executedActions.filter(a => a.type === 'modify');
            const defaultFile = modifyActions[0]?.filename || activeFile?.name || 'file.txt';

            let responseText = '';

            if (enableStreaming) {
                const response = await geminiServiceRef.current.sendMessageStream(
                    contextMessage,
                    conversationHistory,
                    (chunk, done) => {
                        if (!done) {
                            responseText += chunk;
                            setStreamingText(responseText);
                        }
                    }
                );
                if (response.error) throw new Error(response.error);
            } else {
                const response = await geminiServiceRef.current.sendMessage(contextMessage, conversationHistory);
                if (response.error) throw new Error(response.error);
                responseText = response.text;
            }

            const codeChanges = responseText
                ? parseCodeChanges(responseText, defaultFile, modifyActions, (filename) => t('chat.actionDescriptions.modified', { filename }))
                : [];

            // Build smart actions based on what was done
            const smartActions: AgentAction[] = [];

            // Add "Searched" action if query contains search-related terms
            const searchTerms = trimmedInput.toLowerCase();
            const isSearchQuery = /cherche|search|trouve|find|où|where|quel|which|montre|show|liste|list|affiche|display|skills|compétences|formation|projet/i.test(searchTerms);
            if (isSearchQuery && contextFiles && contextFiles.length > 0) {
                // Extract relevant keywords for search description
                const keywords = trimmedInput.split(/\s+/).filter(w => w.length > 3).slice(0, 3).join(' ');
                const searchTarget = keywords || t('chat.searchActions.defaultTarget');
                smartActions.push({
                    type: 'search',
                    filename: searchTarget,
                    status: 'done',
                    timestamp: Date.now(),
                    description: t('chat.searchActions.description', { query: searchTarget })
                });
            }

            // Add "Read" actions for files that were accessed
            if (activeFile) {
                smartActions.push({
                    type: 'read',
                    filename: t('chat.actionDescriptions.currentFile', { filename: activeFile.name }),
                    status: 'done',
                    timestamp: Date.now()
                });
            }

            // Add read actions for files mentioned in response
            const mentionedFiles = responseText.match(/[\w-]+\.(json|md|tsx?|jsx?|css|html)/gi) || [];
            const uniqueFiles = [...new Set(mentionedFiles)].slice(0, 3);
            uniqueFiles.forEach(file => {
                if (!smartActions.some(a => a.filename?.includes(file))) {
                    smartActions.push({
                        type: 'read',
                        filename: file,
                        status: 'done',
                        timestamp: Date.now()
                    });
                }
            });

            // Combine with executed actions
            const allActions = [...smartActions, ...executedActions].slice(0, 5);

            const aiMsg: ChatMessage = {
                id: generateId(),
                role: 'model',
                text: responseText,
                timestamp: new Date(),
                thoughts: t('chat.message.analyzed'),
                thinkingTime: thinkingTime,
                codeChanges: codeChanges.length > 0 ? codeChanges : undefined,
                actions: allActions.length > 0 ? allActions : undefined,
            };

            setMessages(prev => [...prev, aiMsg].slice(-maxMessages));

        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Chat error:', err);
            }
            const errorMessage = err instanceof Error ? err.message : t('chat.errors.unknown');
            setError({ message: errorMessage, code: GeminiErrorCode.UNKNOWN_ERROR });

            const errorMsg: ChatMessage = {
                id: generateId(),
                role: 'model',
                text: '',
                error: errorMessage,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            setStreamingText('');
        }
    }, [input, isLoading, activeFile, enableStreaming, maxMessages, executeActions, getConversationHistory, onOpenFile, onCreateFile, onCreateFileWithPath, onDeleteFile, contextFiles, thinkingTime, t, onSearchFiles, onExecuteCommand, onFocusPanel, onCloseTab, onDownload]);

    // Retry last message
    const handleRetry = useCallback(() => {
        if (lastInputRef.current) {
            setInput(lastInputRef.current);
            setError(null);
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.error) return prev.slice(0, -1);
                return prev;
            });
        }
    }, []);

    // Clear chat
    const handleClear = useCallback(() => {
        abortControllerRef.current?.abort();
        setMessages([]);
        clearMessagesFromStorage();
        setStreamingText('');
        setError(null);
        setIsLoading(false);
    }, []);

    // Handle command selection from autocomplete
    const handleCommandSelect = useCallback((cmd: typeof SLASH_COMMANDS[number]) => {
        setInput(cmd.command + (cmd.hasArg ? ' ' : ''));
        setShowAutocomplete(false);
        setAutocompleteCommands([]);
        textareaRef.current?.focus();
    }, []);

    // Handle keyboard
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Autocomplete navigation
        if (showAutocomplete && autocompleteCommands.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setAutocompleteIndex(prev =>
                    prev < autocompleteCommands.length - 1 ? prev + 1 : 0
                );
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setAutocompleteIndex(prev =>
                    prev > 0 ? prev - 1 : autocompleteCommands.length - 1
                );
                return;
            }
            if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                handleCommandSelect(autocompleteCommands[autocompleteIndex]);
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowAutocomplete(false);
                return;
            }
        }

        // History navigation (only when not showing autocomplete)
        if (!showAutocomplete && inputHistory.length > 0) {
            if (e.key === 'ArrowUp' && !e.shiftKey) {
                e.preventDefault();
                if (historyIndex === -1) {
                    const newIndex = 0;
                    setHistoryIndex(newIndex);
                    setInput(inputHistory[newIndex] || '');
                } else if (historyIndex < inputHistory.length - 1) {
                    const newIndex = historyIndex + 1;
                    setHistoryIndex(newIndex);
                    setInput(inputHistory[newIndex] || '');
                }
                return;
            }
            if (e.key === 'ArrowDown' && !e.shiftKey) {
                e.preventDefault();
                if (historyIndex > 0) {
                    const newIndex = historyIndex - 1;
                    setHistoryIndex(newIndex);
                    setInput(inputHistory[newIndex] || '');
                } else if (historyIndex === 0) {
                    setHistoryIndex(-1);
                    setInput('');
                }
                return;
            }
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend, showAutocomplete, autocompleteCommands, autocompleteIndex, handleCommandSelect, inputHistory, historyIndex]);

    // Update autocomplete on input change
    useEffect(() => {
        if (input.startsWith('/')) {
            const commands = filterCommands(input);
            setAutocompleteCommands(commands);
            setShowAutocomplete(commands.length > 0);
            setAutocompleteIndex(0);
        } else {
            setShowAutocomplete(false);
            setAutocompleteCommands([]);
        }
    }, [input]);

    // Handle suggestion click
    const handleSuggestionClick = useCallback((suggestion: string) => {
        setInput(suggestion);
        textareaRef.current?.focus();
    }, []);


    // Memoized message list
    const messageList = useMemo(() => (
        messages.map((msg) => (
            <div key={msg.id} className="w-full animate-chat-fade-in-up">
                {/* User Message - Cursor style beige box */}
                {msg.role === 'user' && (
                    <div className="mb-3">
                        <div className="bg-[#F5F3EE] border border-[#E8E5DE] rounded-lg px-4 py-3">
                            <p className="text-[13px] text-[#37352F] leading-relaxed whitespace-pre-wrap">
                                {msg.text}
                            </p>
                        </div>
                    </div>
                )}

                {/* AI Response */}
                {msg.role === 'model' && (
                    <div className="w-full py-2">
                        {msg.error && (
                            <div className="px-1 py-2">
                                <div className="flex items-start gap-2 bg-[#FAF9F6] border-l-2 border-[#D97757] p-2 rounded-r">
                                    <AlertCircle size={14} className="text-[#D97757] mt-0.5" />
                                    <span className="text-[12px] text-[#6B6B6B] leading-relaxed">{msg.error}</span>
                                </div>
                            </div>
                        )}

                        {msg.thoughts && !msg.error && (
                            <div className="mb-1">
                                <ActionLine type="thought" text={msg.thoughts} time={msg.thinkingTime ? `${msg.thinkingTime}s` : undefined} />
                            </div>
                        )}

                        {msg.actions && msg.actions.length > 0 && (
                            <div className="mb-2 space-y-0.5">
                                {msg.actions.map((action, idx) => (
                                    <AgentActionLine key={idx} action={action} />
                                ))}
                            </div>
                        )}

                        {msg.text && !msg.error && (
                            <div className="px-1 py-1">
                                {/* Hide inline code blocks if we have codeChanges to avoid redundancy */}
                                <MessageContent
                                    text={msg.text}
                                    isStreaming={msg.isStreaming}
                                    showInlineCode={!msg.codeChanges || msg.codeChanges.length === 0}
                                />
                            </div>
                        )}

                        {msg.cached && (
                            <div className="px-1 mt-2 text-[10px] text-ide-muted flex items-center gap-1">
                                <Zap size={10} />
                                {t('chat.cached')}
                            </div>
                        )}

                        {/* Unified code cards - no duplicate display */}
                        {msg.codeChanges && msg.codeChanges.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {msg.codeChanges.map((change, idx) => (
                                    <FileChangeCard
                                        key={idx}
                                        change={change}
                                        onApply={() => applyCodeChange(msg.id, idx)}
                                        onClick={() => onOpenFile(change.filename)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        ))
    ), [messages, applyCodeChange, onOpenFile, t]);

    return (
        <div className={`flex flex-col h-full w-full bg-ide-sidebar overflow-hidden ${className}`}>
            {/* Header - Simplified */}
            <div className="h-9 border-b border-ide-border flex items-center">
                <div className="mx-auto w-full max-w-[580px] px-3 flex items-center justify-between">
                    <span className="text-[16px] font-heading font-semibold text-ide-text tracking-normal">{t('chat.title')}</span>
                    <div className="flex items-center gap-1">
                        {!isServiceReady && (
                            <span className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded">{t('chat.disconnected')}</span>
                        )}
                        {messages.length > 0 && (
                            <button
                                onClick={handleClear}
                                className="p-1 hover:bg-ide-ui/50 rounded text-ide-muted hover:text-ide-text transition-colors"
                                title={t('chat.clearConversation')}
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <ErrorBanner
                    message={error.message}
                    errorCode={error.code}
                    onRetry={handleRetry}
                    onDismiss={() => setError(null)}
                />
            )}

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                <div className="mx-auto w-full max-w-[580px] px-3">
                    {messageList}

                    {/* Streaming text */}
                    {streamingText && (
                        <div className="w-full py-2">
                            <div className="px-1 py-1">
                                <MessageContent text={streamingText} isStreaming />
                            </div>
                        </div>
                    )}

                    {/* Loading state */}
                    {isLoading && !streamingText && (
                        <div className="w-full py-1">
                            <ActionLine type="thought" text={thinkingMessage} time={`${thinkingTime}s`} loading />
                            {activeFile && <ActionLine type="read" text={activeFile.name} />}
                        </div>
                    )}

                    {/* Empty state */}
                    {messages.length === 0 && !isLoading && (
                        <EmptyState
                            onSuggestionClick={handleSuggestionClick}
                            input={input}
                            setInput={setInput}
                            onSend={handleSend}
                            onKeyDown={handleKeyDown}
                            isLoading={isLoading}
                            isServiceReady={isServiceReady}
                        />
                    )}

                    <div ref={messagesEndRef} />
                    <div className="h-2 bg-gradient-to-t from-ide-sidebar to-transparent pointer-events-none sticky bottom-0 z-20" />
                </div>
            </div>

            {/* Input Area - Only show when there are messages (hide when EmptyState is visible) */}
            {messages.length > 0 && (
                <div className="bg-white/60 backdrop-blur-md border-t border-white/40">
                    {/* Quick Actions Toolbar */}
                    <QuickActionsToolbar
                        onAction={(prompt) => {
                            setInput(prompt);
                            textareaRef.current?.focus();
                        }}
                        activeFile={activeFile}
                        disabled={isLoading || !isServiceReady}
                    />

                    <div className="p-3 pt-2">
                        <div className="mx-auto w-full max-w-[580px]">
                            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E8E5DE] shadow-[0_8px_32px_-12px_rgba(20,20,19,0.15)] overflow-hidden focus-within:border-[#D97757]/40 focus-within:shadow-lg transition-all">
                                <CommandAutocomplete
                                    input={input}
                                    commands={autocompleteCommands}
                                    selectedIndex={autocompleteIndex}
                                    onSelect={handleCommandSelect}
                                    visible={showAutocomplete}
                                />
                                <textarea
                                    ref={textareaRef}
                                    name="message"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={isServiceReady ? t('chat.placeholderReady') : t('chat.placeholderUnavailable')}
                                    className="text-ide-text text-[15px] w-full resize-none bg-transparent px-4 py-4 outline-none placeholder:text-ide-muted/70 min-h-[48px] max-h-[200px] overflow-y-hidden"
                                    rows={1}
                                    spellCheck={false}
                                    disabled={isLoading || !isServiceReady}
                                />
                                <div className="px-4 py-3 border-t border-[#E8E5DE]/50 flex items-center justify-between">
                                    <Image src="/logo/IDE/Logo AI.svg" alt="B.AI" width={28} height={12} />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isLoading || !isServiceReady}
                                        className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${input.trim() && !isLoading && isServiceReady
                                            ? 'bg-[#D97757] text-white shadow-sm hover:bg-[#c86a4c]'
                                            : 'bg-ide-ui/50 text-ide-muted cursor-not-allowed'
                                            }`}
                                    >
                                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={14} />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// EXPORTS
// ============================================================

export default memo(ChatPanel);

export {
    parseCodeBlocks,
    parseCodeChanges,
    parseAgentActions,
    getFileTemplate,
    getLanguageFromExtension,
};
