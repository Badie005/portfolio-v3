import { useState, useCallback, useMemo, useEffect } from 'react';

export interface SlashCommand {
    command: string;
    description: string;
    category: string;
    hasArg: boolean;
}

const SLASH_COMMANDS: SlashCommand[] = [
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
];

export function useCommandAutocomplete(input: string): {
    showAutocomplete: boolean;
    autocompleteCommands: SlashCommand[];
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
    selectNext: () => void;
    selectPrev: () => void;
    hideAutocomplete: () => void;
    getSelectedCommand: () => SlashCommand | null;
} {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filteredCommands = useMemo(() => {
        if (!input.startsWith('/')) return [];
        const query = input.toLowerCase();
        return SLASH_COMMANDS.filter(cmd =>
            cmd.command.toLowerCase().startsWith(query) ||
            cmd.description.toLowerCase().includes(query.slice(1))
        ).slice(0, 6);
    }, [input]);

    const showAutocomplete = input.startsWith('/') && filteredCommands.length > 0;

    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredCommands.length]);

    const selectNext = useCallback(() => {
        setSelectedIndex(prev =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
    }, [filteredCommands.length]);

    const selectPrev = useCallback(() => {
        setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
    }, [filteredCommands.length]);

    const hideAutocomplete = useCallback(() => {
        setSelectedIndex(0);
    }, []);

    const getSelectedCommand = useCallback((): SlashCommand | null => {
        return filteredCommands[selectedIndex] || null;
    }, [filteredCommands, selectedIndex]);

    return {
        showAutocomplete,
        autocompleteCommands: filteredCommands,
        selectedIndex,
        setSelectedIndex,
        selectNext,
        selectPrev,
        hideAutocomplete,
        getSelectedCommand,
    };
}

export { SLASH_COMMANDS };
