import { memo } from 'react';
import { sanitizeUrl } from '../utils/sanitize';

const InlineFormat = memo<{ text: string }>(({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);

    return (
        <>
            {parts.map((part, idx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <span key={idx} className="font-medium">{part.slice(2, -2)}</span>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return (
                        <code key={idx} className="bg-ide-ui/40 px-1.5 py-0.5 rounded text-[12px] font-mono text-ide-text/90">
                            {part.slice(1, -1)}
                        </code>
                    );
                }
                const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                if (linkMatch) {
                    const url = sanitizeUrl(linkMatch[2]);
                    return (
                        <a 
                            key={idx} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-ide-accent underline"
                        >
                            {linkMatch[1]}
                        </a>
                    );
                }
                return <span key={idx}>{part}</span>;
            })}
        </>
    );
});

InlineFormat.displayName = 'InlineFormat';
export default InlineFormat;
