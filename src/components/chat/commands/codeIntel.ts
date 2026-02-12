import { CommandRegistry } from '../ChatCommands';
import { CommandContext } from '../ChatContext';
import { GeminiErrorCode } from '@/lib/gemini';

const sendToAI = async (
    prompt: string,
    ctx: CommandContext
): Promise<{ text: string; error?: string }> => {
    ctx.abortControllerRef.current?.abort();
    const controller = new AbortController();
    ctx.abortControllerRef.current = controller;

    ctx.dispatch({ type: 'START_LOADING' });

    try {
        const conversationHistory = ctx.getConversationHistory();
        
        if (ctx.enableStreaming) {
            let responseText = '';
            const response = await ctx.gemini?.sendMessageStream(
                prompt,
                conversationHistory,
                (chunk) => {
                    if (controller.signal.aborted) return;
                    responseText += chunk;
                    ctx.dispatch({ type: 'STREAM_REPLACE', payload: responseText });
                }
            );
            
            if (controller.signal.aborted) {
                return { text: '' };
            }
            
            if (response?.error) {
                return { text: '', error: response.error };
            }
            
            return { text: responseText };
        } else {
            const response = await ctx.gemini?.sendMessage(prompt, conversationHistory);
            
            if (controller.signal.aborted) {
                return { text: '' };
            }
            
            if (response?.error) {
                return { text: '', error: response.error };
            }
            
            return { text: response?.text || '' };
        }
    } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
            return { text: '' };
        }
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        return { text: '', error: errorMessage };
    }
};

const handleTests = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    if (!ctx.activeFile) {
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'Ouvrez d\'abord un fichier dans l\'éditeur pour générer des tests.' }
        });
        return true;
    }

    const prompt = `Génère des tests unitaires complets pour le fichier "${ctx.activeFile.name}". Utilise un framework de test moderne (Vitest/Jest pour JS/TS, pytest pour Python, etc.). Inclus:
1. Tests pour les cas nominaux
2. Tests pour les cas limites
3. Tests pour les erreurs
4. Mocks si nécessaire

Code du fichier:
\`\`\`${ctx.activeFile.type}
${ctx.activeFile.content}
\`\`\``;

    const result = await sendToAI(prompt, ctx);

    if (result.error) {
        ctx.dispatch({ type: 'SET_ERROR', payload: { message: result.error, code: GeminiErrorCode.UNKNOWN_ERROR } });
    } else if (result.text) {
        ctx.dispatch({
            type: 'FINISH_RESPONSE',
            payload: {
                text: result.text,
                actions: [{ type: 'read', filename: ctx.activeFile.name, status: 'done', timestamp: Date.now() }],
            }
        });
    }

    return true;
};

const handleReview = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    if (!ctx.activeFile) {
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'Ouvrez d\'abord un fichier dans l\'éditeur pour effectuer une code review.' }
        });
        return true;
    }

    const prompt = `Effectue une code review complète du fichier "${ctx.activeFile.name}". Analyse:

1. **Qualité du code**: Lisibilité, nommage, structure
2. **Performance**: Optimisations possibles
3. **Sécurité**: Vulnérabilités potentielles
4. **Bonnes pratiques**: Patterns, conventions
5. **Maintenabilité**: Dette technique, suggestions

Code:
\`\`\`${ctx.activeFile.type}
${ctx.activeFile.content}
\`\`\`

Donne des suggestions concrètes avec des exemples de code quand c'est pertinent.`;

    const result = await sendToAI(prompt, ctx);

    if (result.error) {
        ctx.dispatch({ type: 'SET_ERROR', payload: { message: result.error, code: GeminiErrorCode.UNKNOWN_ERROR } });
    } else if (result.text) {
        ctx.dispatch({
            type: 'FINISH_RESPONSE',
            payload: {
                text: result.text,
                actions: [{ type: 'read', filename: ctx.activeFile.name, status: 'done', timestamp: Date.now() }],
            }
        });
    }

    return true;
};

const handleDoc = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    if (!ctx.activeFile) {
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'Ouvrez d\'abord un fichier dans l\'éditeur pour générer la documentation.' }
        });
        return true;
    }

    const prompt = `Génère une documentation complète pour le fichier "${ctx.activeFile.name}". Inclus:

1. **Description générale**: Purpose du fichier
2. **Exports**: Fonctions, classes, composants exportés
3. **Types/Interfaces**: Documentation des types
4. **Utilisation**: Exemples d'utilisation
5. **Dépendances**: Imports et leurs usages

Code:
\`\`\`${ctx.activeFile.type}
${ctx.activeFile.content}
\`\`\`

Format: JSDoc/TSDoc pour JS/TS, docstrings pour Python, etc.`;

    const result = await sendToAI(prompt, ctx);

    if (result.error) {
        ctx.dispatch({ type: 'SET_ERROR', payload: { message: result.error, code: GeminiErrorCode.UNKNOWN_ERROR } });
    } else if (result.text) {
        ctx.dispatch({
            type: 'FINISH_RESPONSE',
            payload: {
                text: result.text,
                actions: [{ type: 'read', filename: ctx.activeFile.name, status: 'done', timestamp: Date.now() }],
            }
        });
    }

    return true;
};

export function register(reg: CommandRegistry): void {
    reg.register('/tests', handleTests);
    reg.register('/review', handleReview);
    reg.register('/doc', handleDoc);
}
