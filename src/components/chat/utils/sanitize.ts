export const MAX_INPUT_LENGTH = 10000;

export function sanitizeInput(input: string, maxLength: number = MAX_INPUT_LENGTH): string {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .slice(0, maxLength)
        .replace(/\0/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

export function isSafeUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    const trimmed = url.trim();
    if (!trimmed) return false;
    
    if (trimmed.startsWith('#') || trimmed.startsWith('/')) return true;
    
    if (/^mailto:/i.test(trimmed)) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.slice(7));
    }
    
    if (/^tel:/i.test(trimmed)) {
        return /^[\d+\-\s()]+$/.test(trimmed.slice(4));
    }
    
    try {
        const parsed = new URL(trimmed, 'https://placeholder.com');
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

export function sanitizeUrl(url: string): string {
    if (!isSafeUrl(url)) return '#';
    return url.trim();
}
