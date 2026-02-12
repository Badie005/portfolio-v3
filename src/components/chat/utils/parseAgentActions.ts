import { AgentAction } from '../ChatReducer';

export function parseAgentActions(userInput: string): AgentAction[] {
    const actions: AgentAction[] = [];

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

    for (const { type, regex } of filePatterns) {
        let match;
        while ((match = regex.exec(userInput)) !== null) {
            const filename = match[1].trim();
            if (filename && !actions.some(a => a.type === type && a.filename === filename)) {
                actions.push({ type, filename, status: 'pending', timestamp: Date.now() });
            }
        }
    }

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
}
