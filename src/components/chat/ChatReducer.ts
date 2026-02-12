import { GeminiErrorCode } from '@/lib/gemini';

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
    thoughts?: string;
    thinkingTime?: number;
    codeChanges?: CodeChange[];
    actions?: AgentAction[];
    error?: string;
    isStreaming?: boolean;
    cached?: boolean;
}

export interface CodeChange {
    filename: string;
    language: string;
    newCode: string;
    description: string;
    applied: boolean;
    linesAdded: number;
    linesRemoved?: number;
}

export interface AgentAction {
    type: 'read' | 'create' | 'delete' | 'modify' | 'thought' | 'search';
    filename?: string;
    status: 'pending' | 'done' | 'error';
    timestamp: number;
    description?: string;
    isFolder?: boolean;
    content?: string;
}

export interface ChatState {
    messages: ChatMessage[];
    status: 'idle' | 'loading' | 'streaming' | 'error';
    streamingText: string;
    error: { message: string; code?: GeminiErrorCode } | null;
    input: string;
}

export type ChatAction =
    | { type: 'ADD_USER_MESSAGE'; payload: string }
    | { type: 'ADD_BOT_MESSAGE'; payload: Partial<ChatMessage> & { text: string } }
    | { type: 'START_LOADING' }
    | { type: 'STREAM_CHUNK'; payload: string }
    | { type: 'STREAM_REPLACE'; payload: string }
    | { type: 'FINISH_RESPONSE'; payload: Partial<ChatMessage> & { text: string } }
    | { type: 'SET_ERROR'; payload: { message: string; code?: GeminiErrorCode } }
    | { type: 'DISMISS_ERROR' }
    | { type: 'CLEAR_ALL' }
    | { type: 'APPLY_CODE_CHANGE'; payload: { messageId: string; changeIndex: number } }
    | { type: 'SET_INPUT'; payload: string }
    | { type: 'LOAD_HISTORY'; payload: ChatMessage[] };

export const MAX_MESSAGES = 50;
export const MAX_STORED = 100;

const generateId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case 'ADD_USER_MESSAGE':
            return {
                ...state,
                messages: [...state.messages, {
                    id: generateId(),
                    role: 'user' as const,
                    text: action.payload,
                    timestamp: new Date(),
                }].slice(-MAX_STORED),
                input: '',
                status: 'idle',
                streamingText: '',
            };

        case 'ADD_BOT_MESSAGE':
            return {
                ...state,
                messages: [...state.messages, {
                    id: generateId(),
                    role: 'model' as const,
                    timestamp: new Date(),
                    ...action.payload,
                }].slice(-MAX_STORED),
                status: 'idle',
                streamingText: '',
            };

        case 'START_LOADING':
            return {
                ...state,
                status: 'loading',
                streamingText: '',
                error: null,
            };

        case 'STREAM_CHUNK':
            return {
                ...state,
                status: 'streaming',
                streamingText: state.streamingText + action.payload,
            };

        case 'STREAM_REPLACE':
            return {
                ...state,
                status: 'streaming',
                streamingText: action.payload,
            };

        case 'FINISH_RESPONSE':
            return {
                ...state,
                status: 'idle',
                streamingText: '',
                messages: [...state.messages, {
                    id: generateId(),
                    role: 'model' as const,
                    timestamp: new Date(),
                    ...action.payload,
                }].slice(-MAX_MESSAGES),
            };

        case 'SET_ERROR':
            return {
                ...state,
                status: 'error',
                error: action.payload,
                streamingText: '',
            };

        case 'DISMISS_ERROR':
            return {
                ...state,
                error: null,
            };

        case 'CLEAR_ALL':
            return {
                ...state,
                messages: [],
                streamingText: '',
                error: null,
                status: 'idle',
            };

        case 'APPLY_CODE_CHANGE': {
            const { messageId, changeIndex } = action.payload;
            return {
                ...state,
                messages: state.messages.map(msg => {
                    if (msg.id === messageId && msg.codeChanges) {
                        const updatedChanges = [...msg.codeChanges];
                        updatedChanges[changeIndex] = { ...updatedChanges[changeIndex], applied: true };
                        return { ...msg, codeChanges: updatedChanges };
                    }
                    return msg;
                }),
            };
        }

        case 'SET_INPUT':
            return {
                ...state,
                input: action.payload,
            };

        case 'LOAD_HISTORY':
            return {
                ...state,
                messages: action.payload,
            };

        default:
            return state;
    }
}

export const initialState: ChatState = {
    messages: [],
    status: 'idle',
    streamingText: '',
    error: null,
    input: '',
};
