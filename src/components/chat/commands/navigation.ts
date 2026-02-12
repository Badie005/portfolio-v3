import { CommandRegistry } from '../ChatCommands';
import { CommandContext } from '../ChatContext';

const handleTerminal = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    if (ctx.onFocusPanel) {
        ctx.onFocusPanel('terminal');
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'Terminal ouvert.' }
        });
    } else {
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'Le terminal n\'est pas disponible.' }
        });
    }
    return true;
};

const handleExplorer = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    if (ctx.onFocusPanel) {
        ctx.onFocusPanel('explorer');
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'Explorateur de fichiers ouvert.' }
        });
    } else {
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'L\'explorateur n\'est pas disponible.' }
        });
    }
    return true;
};

const handleClose = async (args: string, ctx: CommandContext): Promise<boolean> => {
    const filePath = args.trim();
    
    if (!filePath) {
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'Veuillez spécifier un fichier. Ex: `/close src/app.tsx`' }
        });
        return true;
    }

    if (ctx.onCloseTab) {
        ctx.onCloseTab(filePath);
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: `Onglet "${filePath}" fermé.` }
        });
    } else {
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'Fermeture d\'onglet non disponible.' }
        });
    }
    return true;
};

export function register(reg: CommandRegistry): void {
    reg.register('/terminal', handleTerminal);
    reg.register('/term', handleTerminal);
    reg.register('/explorer', handleExplorer);
    reg.register('/files', handleExplorer);
    reg.register('/close', handleClose);

    reg.registerPattern(
        /(?:ouvre?|open|affiche?|show|focus)\s+(?:le\s+)?terminal/i,
        handleTerminal
    );

    reg.registerPattern(
        /(?:ouvre?|open|affiche?|show|focus)\s+(?:l['']|le\s+)?(?:explorateur|explorer|files|fichiers)/i,
        handleExplorer
    );

    reg.registerPattern(
        /(?:ferme?|close)\s+(?:l['']|le\s+)?onglet\s+(.+)/i,
        async (input, ctx) => {
            const match = input.match(/(?:ferme?|close)\s+(?:l['']|le\s+)?onglet\s+(.+)/i);
            return handleClose(match?.[1]?.trim() || '', ctx);
        }
    );
}
