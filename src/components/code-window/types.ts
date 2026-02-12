export type FileType = 'json' | 'markdown' | 'lock' | 'typescript' | 'css' | 'javascript' | 'xml' | 'image' | 'svg';

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

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
  maxResults?: number;
  contextLines?: number;
}

export interface SearchResult {
  filePath: string;
  line: number;
  column: number;
  content: string;
  match: string;
  contextBefore?: string;
  contextAfter?: string;
}

export interface TerminalCommandResult {
  success: boolean;
  output: string;
}

export type IdePanel = 'terminal' | 'explorer' | 'editor' | 'chat';

export interface DownloadOptions {
  filename: string;
  content: string;
  mimeType?: string;
}

export function downloadFile(options: DownloadOptions): boolean {
  const { filename, content, mimeType = 'text/plain' } = options;
  
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

export const MIME_TYPES: Record<string, string> = {
  md: 'text/markdown',
  txt: 'text/plain',
  json: 'application/json',
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  ts: 'text/typescript',
};
