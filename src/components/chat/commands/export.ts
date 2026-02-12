import { CommandRegistry } from '../ChatCommands';
import { CommandContext } from '../ChatContext';
import { generateResume } from '../data/resumeGenerator';

const handleDownload = async (args: string, ctx: CommandContext): Promise<boolean> => {
    const parts = args.trim().split(' ');
    const filename = parts[0];
    const content = parts.slice(1).join(' ') || '';
    
    if (!filename) {
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'Veuillez spécifier un nom de fichier. Ex: `/download mon-fichier.txt contenu`' }
        });
        return true;
    }

    if (ctx.onDownload) {
        const success = ctx.onDownload({ filename, content });
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: success ? `Fichier "${filename}" téléchargé.` : 'Erreur lors du téléchargement.' }
        });
    } else {
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'Téléchargement non disponible.' }
        });
    }
    return true;
};

const handleResume = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    if (!ctx.onDownload) {
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'Téléchargement non disponible.' }
        });
        return true;
    }

    const files = ctx.contextFiles.filter((f): f is FileData => 'content' in f);
    const cvContent = generateResume(files);
    
    ctx.onDownload({ 
        filename: 'CV_Abdelbadie_Khoubiza.md', 
        content: cvContent, 
        mimeType: 'text/markdown' 
    });
    
    ctx.dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: { text: 'CV généré et téléchargé au format Markdown.' }
    });
    return true;
};

import { FileData } from '@/components/code-window/types';

export function register(reg: CommandRegistry): void {
    reg.register('/download', handleDownload);
    reg.register('/resume', handleResume);
    reg.register('/cv', handleResume);

    reg.registerPattern(
        /(?:télécharge?|download|export|sauvegarde?|save)\s+(?:le\s+)?(?:cv|resume)/i,
        handleResume
    );
}
