export interface ParsedCodeBlock {
    filename: string;
    language: string;
    code: string;
}

const LANGUAGE_MAP: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'sql': 'sql',
    'sh': 'bash',
    'bash': 'bash',
    'lock': 'json',
};

export function getLanguageFromExtension(ext: string): string {
    return LANGUAGE_MAP[ext.toLowerCase()] || 'plaintext';
}

export function parseCodeBlocks(text: string): ParsedCodeBlock[] {
    const blocks: ParsedCodeBlock[] = [];
    const regex = /```(\w+)?(?:\s+([^\n]+))?\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const language = match[1] || 'plaintext';
        const possibleFilename = match[2]?.trim() || '';
        const code = match[3].trim();

        if (code.length < 5) continue;

        let filename = 'untitled.' + (language === 'plaintext' ? 'txt' : language);

        if (possibleFilename && possibleFilename.includes('.')) {
            filename = possibleFilename.replace(/^(?:\/\/|#|\/\*)\s*/, '').trim();
        } else {
            const firstLine = code.split('\n')[0];
            const filenameMatch = firstLine.match(
                /(?:\/\/|#|\/\*)\s*(?:file:|filename:)?\s*([a-zA-Z0-9._-]+\.[a-zA-Z0-9]+)/i
            );
            if (filenameMatch) {
                filename = filenameMatch[1].trim();
            }
        }

        blocks.push({ filename, language, code });
    }

    return blocks;
}

export function getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()! : '';
}
