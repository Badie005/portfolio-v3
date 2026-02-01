export type FileType = 'json' | 'markdown' | 'lock' | 'typescript' | 'css' | 'javascript' | 'xml';

export interface FileData {
    name: string;
    type: FileType;
    content: string;
    isOpen?: boolean;
}

export interface FolderData {
    name: string;
    isOpen: boolean;
    children?: (FolderData | FileData)[];
    type: 'folder';
}

export type FileSystemItem = FolderData | FileData;

export interface FileSystem {
    root: FileSystemItem[];
}

export interface TerminalMessage {
    type: 'command' | 'output' | 'error' | 'success';
    content: string;
}

export interface FileAttachment {
    name: string;
    added: number;
    removed: number;
}

export interface CodeChange {
    filename: string;
    language: string;
    oldCode?: string;
    newCode: string;
    description: string;
    applied?: boolean;
    linesAdded?: number;
    linesRemoved?: number;
}

// Agent actions
export type AgentActionType = 'read' | 'create' | 'modify' | 'delete' | 'thought' | 'search';

export interface AgentAction {
    type: AgentActionType;
    filename?: string;
    content?: string;
    description?: string;
    isFolder?: boolean;
    status: 'pending' | 'done' | 'error';
    time?: number;
    timestamp?: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
    thoughts?: string;
    fileAttachments?: FileAttachment[];
    codeChanges?: CodeChange[];
    actions?: AgentAction[]; // Agent actions (read, create, delete, etc.)
}

export interface PanelConfig {
    minWidth?: number;
    maxWidth?: number;
    defaultWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    defaultHeight?: number;
}

export interface LayoutConfig {
    leftSidebar: PanelConfig;
    rightSidebar: PanelConfig;
    terminal?: PanelConfig;
}

export type ThemeMode = 'light' | 'dark' | 'system';
