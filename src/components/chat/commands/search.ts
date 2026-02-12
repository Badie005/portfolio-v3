import { CommandRegistry } from '../ChatCommands';
import { CommandContext } from '../ChatContext';
import { formatSearchResults } from '@/lib/fileSearch';

const handleSearch = async (args: string, ctx: CommandContext): Promise<boolean> => {
    const query = args.trim();
    
    if (!query) {
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'Veuillez spécifier un terme de recherche. Ex: `/search useState`' }
        });
        return true;
    }

    if (!ctx.onSearchFiles) {
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'La recherche de fichiers n\'est pas disponible.' }
        });
        return true;
    }

    const results = ctx.onSearchFiles(query);
    const formattedResults = formatSearchResults(results, query);

    ctx.dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: {
            text: formattedResults,
            actions: [{ type: 'search', filename: query, status: 'done', timestamp: Date.now() }],
        },
    });
    return true;
};

export function register(reg: CommandRegistry): void {
    reg.register('/search', handleSearch);

    reg.registerPattern(
        /(?:cherche|search|grep|trouve|find)\s+(.+)/i,
        async (input, ctx) => {
            const match = input.match(/(?:cherche|search|grep|trouve|find)\s+(.+)/i);
            return handleSearch(match?.[1] || '', ctx);
        }
    );
}
