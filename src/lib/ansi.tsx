import React from 'react';

// Mapping des codes ANSI vers les classes Tailwind
const ANSI_COLORS: Record<string, string> = {
    // Reset
    '0': '',
    // Styles
    '1': 'font-bold',
    '3': 'italic',
    '4': 'underline',
    // Foreground Colors
    '30': 'text-gray-500', // Black/Gray
    '31': 'text-red-500',    // Red
    '32': 'text-emerald-500', // Green
    '33': 'text-amber-500',   // Yellow
    '34': 'text-blue-500',    // Blue
    '35': 'text-purple-500',  // Magenta
    '36': 'text-cyan-500',    // Cyan
    '37': 'text-gray-300',    // White
    // Bright Foreground
    '90': 'text-gray-400',
    '91': 'text-red-400',
    '92': 'text-emerald-400',
    '93': 'text-amber-400',
    '94': 'text-blue-400',
    '95': 'text-purple-400',
    '96': 'text-cyan-400',
    '97': 'text-white',
};

interface AnsiSpan {
    text: string;
    classes: string[];
}

/**
 * Parse une chaîne contenant des codes ANSI et retourne un tableau d'éléments React
 */
export function parseAnsi(input: string): React.ReactNode {
    if (!input) return null;

    // Regex pour capturer les codes ANSI : \x1b[...m
    const regex = /\x1b\[([0-9;]*)m/g;

    const parts: AnsiSpan[] = [];
    let currentClasses: Set<string> = new Set();
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(input)) !== null) {
        // Ajouter le texte avant le code ANSI
        const textBefore = input.slice(lastIndex, match.index);
        if (textBefore) {
            parts.push({
                text: textBefore,
                classes: Array.from(currentClasses)
            });
        }

        // Traiter le code ANSI
        const codes = match[1].split(';');

        codes.forEach(code => {
            if (code === '0' || code === '') {
                // Reset
                currentClasses.clear();
            } else if (ANSI_COLORS[code]) {
                // Si c'est une couleur, on enlève les autres couleurs (simplification)
                if (parseInt(code) >= 30 && parseInt(code) <= 97) {
                    // Supprimer les classes de couleur existantes
                    Array.from(currentClasses).forEach(cls => {
                        if (cls.startsWith('text-')) currentClasses.delete(cls);
                    });
                }
                currentClasses.add(ANSI_COLORS[code]);
            }
        });

        lastIndex = regex.lastIndex;
    }

    // Ajouter le reste du texte
    const textAfter = input.slice(lastIndex);
    if (textAfter) {
        parts.push({
            text: textAfter,
            classes: Array.from(currentClasses)
        });
    }

    // Si aucun code ANSI n'a été trouvé, retourner la chaîne brute
    if (parts.length === 0) {
        return input;
    }

    return (
        <>
            {parts.map((part, index) => (
                <span key={index} className={part.classes.join(' ')}>
                    {part.text}
                </span>
            ))}
        </>
    );
}

// Helper pour générer des codes ANSI facilement
export const ansi = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    italic: '\x1b[3m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
};
