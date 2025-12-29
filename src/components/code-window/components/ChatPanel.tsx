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
    Zap
} from 'lucide-react';
import Image from 'next/image';
import {
    GeminiService,
    GeminiMessage,
    GeminiErrorCode,
    getGeminiService
} from '@/lib/gemini';
import { FileSystemItem, FileData, CodeChange, AgentAction } from '../types';

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
const THINKING_MESSAGES = [
    'Réflexion en cours...',
    'Analyse du code...',
    'Génération de la réponse...',
    'Traitement de votre demande...',
];



// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const generateId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

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
    modifyActions: AgentAction[]
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
            description: `Modification de ${filename}`,
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
                        description: type === 'createFolder' ? 'Création dossier' : 'Suppression dossier'
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
                timestamp: Date.now(),
                description: 'Scaffolding projet'
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
    const labels = {
        thought: 'Thought',
        read: 'Read',
        searched: 'Searched',
    };

    return (
        <div className="py-0.5">
            <div className="text-[12px] text-[#9A9A9A] flex items-center gap-1.5">
                {/* Label */}
                <span className="font-medium text-[#37352F]">{labels[type]}</span>

                {/* Time for thought */}
                {type === 'thought' && time && (
                    <span className="text-[#D97757]">{time}</span>
                )}

                {/* Description for read/searched */}
                {type !== 'thought' && text && (
                    <span className="text-[#9A9A9A]">{text}</span>
                )}

                {/* Loading dots */}
                {loading && (
                    <div className="flex items-center gap-1 ml-1">
                        <div className="w-1 h-1 bg-[#D97757] rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-[#D97757]/60 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                        <div className="w-1 h-1 bg-[#D97757]/30 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                    </div>
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
    const labels: Record<AgentAction['type'], string> = {
        read: 'Read',
        create: 'Created',
        delete: 'Deleted',
        modify: 'Modified',
        thought: 'Thought',
        search: 'Searched',
    };

    return (
        <div className="py-0.5">
            <div className="text-[12px] flex items-center gap-1.5">
                <span className="font-medium text-[#37352F]">{labels[action.type]}</span>
                <span className="text-[#9A9A9A]">{action.filename}</span>
            </div>
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
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const lineCount = code.split('\n').length;
    const shouldCollapse = lineCount > 15;

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [code]);

    return (
        <div className="my-2 rounded-lg border border-ide-border bg-white">
            {/* Header - Light theme */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-ide-ui/40 border-b border-ide-border/50 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-ide-muted font-mono">{language}</span>
                    <span className="text-[10px] text-ide-muted/70">{lineCount} lines</span>
                </div>
                <div className="flex items-center gap-1">
                    {shouldCollapse && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="px-2 py-0.5 rounded text-[10px] hover:bg-ide-ui text-ide-muted hover:text-ide-text transition-colors"
                        >
                            {isExpanded ? 'Réduire' : 'Voir tout'}
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
                    <span className="text-[10px] text-ide-muted">+ {lineCount - 15} lignes supplémentaires</span>
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
    const isRetryable = errorCode && ![
        GeminiErrorCode.API_KEY_INVALID,
        GeminiErrorCode.API_KEY_MISSING,
        GeminiErrorCode.CONTENT_FILTERED,
    ].includes(errorCode);

    return (
        <div className="mx-2 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-red-700 font-medium">Erreur</p>
                    <p className="text-[11px] text-red-600 mt-0.5">{message}</p>
                    {errorCode && <p className="text-[10px] text-red-400 mt-1 font-mono">Code: {errorCode}</p>}
                </div>
                <div className="flex items-center gap-1">
                    {isRetryable && onRetry && (
                        <button onClick={onRetry} className="p-1.5 hover:bg-red-100 rounded text-red-500 transition-colors" title="Réessayer">
                            <RefreshCw size={14} />
                        </button>
                    )}
                    {onDismiss && (
                        <button onClick={onDismiss} className="p-1.5 hover:bg-red-100 rounded text-red-400 transition-colors" title="Fermer">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});
ErrorBanner.displayName = 'ErrorBanner';

const EmptyState = memo<{ onSuggestionClick?: (suggestion: string) => void }>(({ onSuggestionClick }) => {
    const suggestions = [
        { text: "Qui est B.DEV ?", hasIcon: false },
        { text: "Montre-moi tes projets", hasIcon: false },
        { text: "Quelles sont tes compétences ?", hasIcon: false },
        { text: "Crée un fichier hello.ts", hasIcon: true },
    ];

    return (
        <div className="h-full flex flex-col items-center justify-center p-6">
            {/* Icon with halo effect */}
            <div className="mb-6 relative group">
                <div className="absolute inset-0 bg-[#D97757]/20 rounded-xl blur-lg transform group-hover:scale-110 transition-transform duration-500" />
                <div className="relative w-14 h-14 bg-[#FFFBF7] rounded-xl border border-[#E5E0DB] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                    <Image
                        src="/logo/SVG/Mini-Logo-B.svg"
                        alt="B.AI Assistant Logo"
                        width={28}
                        height={28}
                        className="w-7 h-7 transition-transform group-hover:rotate-12 duration-300"
                    />
                </div>
            </div>

            {/* Text */}
            <div className="text-center mb-8 space-y-2">
                <h3 className="text-lg font-serif font-medium text-[#2D2A26]">B.AI Agent</h3>
                <p className="text-xs text-[#8A8580] max-w-[260px] mx-auto leading-relaxed">
                    Je connais chaque ligne de ce portfolio.<br />
                    <span className="opacity-70">Pose une question technique ou explore mes projets.</span>
                </p>
            </div>

            {/* Suggestion buttons */}
            {onSuggestionClick && (
                <div className="flex flex-wrap justify-center gap-2 max-w-[380px]">
                    {suggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSuggestionClick(suggestion.text)}
                            className="group bg-white hover:bg-[#FFFBF7] text-[#5C5550] hover:text-[#D97757] text-[11px] px-4 py-2 rounded-lg border border-[#E5E0DB] hover:border-[#D97757]/40 transition-all duration-300 shadow-sm hover:shadow flex items-center gap-2"
                        >
                            {suggestion.hasIcon && (
                                <svg className="w-3 h-3 opacity-50 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="16 18 22 12 16 6" />
                                    <polyline points="8 6 2 12 8 18" />
                                </svg>
                            )}
                            <span>{suggestion.text}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
});
EmptyState.displayName = 'EmptyState';



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

    enableStreaming = true,
    maxMessages = 50,
    className = '',
}) => {
    // State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingTime, setThinkingTime] = useState(0);
    const [thinkingMessage, setThinkingMessage] = useState(THINKING_MESSAGES[0]);
    const [streamingText, setStreamingText] = useState('');
    const [error, setError] = useState<{ message: string; code?: GeminiErrorCode } | null>(null);
    const [isServiceReady, setIsServiceReady] = useState(false);

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

    // Thinking timer
    useEffect(() => {
        if (isLoading) {
            setThinkingTime(0);
            let msgIndex = 0;

            thinkingIntervalRef.current = setInterval(() => {
                setThinkingTime(t => t + 1);
                msgIndex = (msgIndex + 1) % THINKING_MESSAGES.length;
                setThinkingMessage(THINKING_MESSAGES[msgIndex]);
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
    }, [isLoading]);

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
            const isFolder = action.description?.includes('dossier') ||
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
                        return { ...action, status: 'error' as const, description: 'Fichier non trouvé' };
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
                            return { ...action, status: 'done' as const, description: `Dossier ${action.filename} créé` };
                        } else if (action.filename === 'project-scaffold') {
                            // Project scaffolding - will be handled by AI response
                            return { ...action, status: 'pending' as const, description: 'Scaffolding en cours...' };
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
                            return { ...action, status: 'done' as const, description: `Dossier ${action.filename} supprimé` };
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
    }, [onReadFile, onCreateFolder, onDeleteFolder]);

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
        if (!trimmedInput || isLoading || !geminiServiceRef.current?.isReady()) return;

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
            contextMessage += `\n\n[Système de fichiers (Fichiers et dossiers disponibles): ${fileList}]`;
        }

        // Add file contents from actions
        for (const [filename, content] of fileContents) {
            const action = executedActions.find(a => a.filename === filename);
            const label = action?.type === 'modify' ? 'À MODIFIER' : 'Contenu';
            contextMessage += `\n\n[${label} - ${filename}]:\n\`\`\`\n${content}\n\`\`\``;
        }

        // ALWAYS include active file context if available and not already included
        if (activeFile && !fileContents.has(activeFile.name)) {
            contextMessage += `\n\n[📄 Fichier actif dans l'éditeur: ${activeFile.name}]:\n\`\`\`${activeFile.type}\n${activeFile.content}\n\`\`\``;
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

            const codeChanges = responseText ? parseCodeChanges(responseText, defaultFile, modifyActions) : [];

            // Build smart actions based on what was done
            const smartActions: AgentAction[] = [];

            // Add "Searched" action if query contains search-related terms
            const searchTerms = trimmedInput.toLowerCase();
            const isSearchQuery = /cherche|search|trouve|find|où|where|quel|which|montre|show|liste|list|affiche|display|skills|compétences|formation|projet/i.test(searchTerms);
            if (isSearchQuery && contextFiles && contextFiles.length > 0) {
                // Extract relevant keywords for search description
                const keywords = trimmedInput.split(/\s+/).filter(w => w.length > 3).slice(0, 3).join(' ');
                smartActions.push({
                    type: 'search',
                    filename: keywords || 'portfolio files',
                    status: 'done',
                    timestamp: Date.now(),
                    description: `Searched for: ${keywords}`
                });
            }

            // Add "Read" actions for files that were accessed
            if (activeFile) {
                smartActions.push({
                    type: 'read',
                    filename: `${activeFile.name} (current file)`,
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
                thoughts: 'Analyzed request',
                thinkingTime: thinkingTime,
                codeChanges: codeChanges.length > 0 ? codeChanges : undefined,
                actions: allActions.length > 0 ? allActions : undefined,
            };

            setMessages(prev => [...prev, aiMsg].slice(-maxMessages));

        } catch (err) {
            console.error('Chat error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
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
    }, [input, isLoading, activeFile, enableStreaming, maxMessages, executeActions, getConversationHistory, onOpenFile, onCreateFile, onCreateFileWithPath, onDeleteFile, contextFiles, thinkingTime]);

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
        setStreamingText('');
        setError(null);
        setIsLoading(false);
    }, []);

    // Handle keyboard
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    // Handle suggestion click
    const handleSuggestionClick = useCallback((suggestion: string) => {
        setInput(suggestion);
        textareaRef.current?.focus();
    }, []);


    // Memoized message list
    const messageList = useMemo(() => (
        messages.map((msg) => (
            <div key={msg.id} className="w-full">
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
                                <div className="flex items-center gap-2 text-red-500 text-[12px]">
                                    <AlertCircle size={14} />
                                    <span>{msg.error}</span>
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
                                Réponse en cache
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
    ), [messages, applyCodeChange, onOpenFile]);

    return (
        <div className={`flex flex-col h-full w-full bg-ide-sidebar overflow-hidden ${className}`}>
            {/* Header - Simplified */}
            <div className="h-9 border-b border-ide-border flex items-center">
                <div className="mx-auto w-full max-w-[580px] px-3 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-ide-text">B.AI Agent</span>
                    <div className="flex items-center gap-1">
                        {!isServiceReady && (
                            <span className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded">Non connecté</span>
                        )}
                        {messages.length > 0 && (
                            <button
                                onClick={handleClear}
                                className="p-1 hover:bg-ide-ui/50 rounded text-ide-muted hover:text-ide-text transition-colors"
                                title="Effacer la conversation"
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
                        <EmptyState onSuggestionClick={handleSuggestionClick} />
                    )}

                    <div ref={messagesEndRef} />
                    <div className="h-2 bg-gradient-to-t from-ide-sidebar to-transparent pointer-events-none sticky bottom-0 z-20" />
                </div>
            </div>

            {/* Input Area - Elevated and distinct */}
            <div className="p-3 pt-2 bg-ide-sidebar border-t border-ide-border/50 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
                <div className="mx-auto w-full max-w-[580px]">
                    <div className={`border rounded-xl overflow-hidden transition-all bg-white shadow-sm ${isLoading
                        ? 'border-ide-muted'
                        : 'border-ide-border focus-within:border-ide-accent focus-within:shadow-md focus-within:ring-2 focus-within:ring-ide-accent/10'
                        }`}>
                        <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                            <textarea
                                ref={textareaRef}
                                name="message"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={isServiceReady ? "Planifier, rechercher, construire..." : "Service non disponible..."}
                                className="text-ide-text text-[13px] max-h-[200px] w-full resize-none bg-transparent px-3 pt-2.5 pb-1.5 outline-none placeholder:text-ide-muted/60"
                                rows={1}
                                spellCheck={false}
                                disabled={isLoading || !isServiceReady}
                            />
                            <div className="px-3 py-2 pt-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Image src="/logo/SVG/Mini-Logo-B.svg" alt="Agent Logo" width={16} height={16} className="w-4 h-4" />
                                        <span className="text-[11px] text-ide-muted">Agent</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isLoading || !isServiceReady}
                                        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${input.trim() && !isLoading && isServiceReady
                                            ? 'bg-ide-text text-white hover:bg-ide-text/80'
                                            : 'bg-ide-ui/50 text-ide-muted cursor-not-allowed'
                                            }`}
                                    >
                                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={14} />}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {input.length > MAX_INPUT_LENGTH * 0.8 && (
                        <p className={`text-[10px] mt-1 text-right ${input.length >= MAX_INPUT_LENGTH ? 'text-red-500' : 'text-ide-muted'}`}>
                            {input.length}/{MAX_INPUT_LENGTH}
                        </p>
                    )}
                </div>
            </div>
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
