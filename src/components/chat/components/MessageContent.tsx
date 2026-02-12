import { memo, useMemo } from 'react';
import InlineFormat from './InlineFormat';
import InlineCodeBlock from './InlineCodeBlock';

interface MessageContentProps {
    text: string;
    isStreaming?: boolean;
    showInlineCode?: boolean;
}

function parseTextContent(text: string, startKey: number): React.ReactNode[] {
    const elements: React.ReactNode[] = [];
    let key = startKey;
    const lines = text.split('\n');
    let lastWasEmpty = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
            const headerText = line.replace(/^#+\s*/, '');
            elements.push(<div key={key++} className="font-medium mt-3 mb-1">{headerText}</div>);
            lastWasEmpty = false;
            continue;
        }

        const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
        if (numberedMatch) {
            elements.push(
                <div key={key++} className="flex gap-2 pl-2 py-0.5">
                    <span className="text-ide-muted/70 min-w-[16px] text-[12px]">{numberedMatch[1]}.</span>
                    <span className="flex-1"><InlineFormat text={numberedMatch[2]} /></span>
                </div>
            );
            lastWasEmpty = false;
            continue;
        }

        if (line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().startsWith('* ')) {
            const content = line.replace(/^[\s]*[-•*]\s*/, '');
            elements.push(
                <div key={key++} className="flex gap-2 pl-2 py-0.5">
                    <span className="text-ide-muted/70 text-[11px]">•</span>
                    <span className="flex-1"><InlineFormat text={content} /></span>
                </div>
            );
            lastWasEmpty = false;
            continue;
        }

        if (line.trim() === '') {
            if (!lastWasEmpty) {
                elements.push(<div key={key++} className="h-1.5" />);
                lastWasEmpty = true;
            }
            continue;
        }

        elements.push(<div key={key++}><InlineFormat text={line} /></div>);
        lastWasEmpty = false;
    }

    return elements;
}

const MessageContent = memo<MessageContentProps>(({ text, isStreaming, showInlineCode = true }) => {
    const elements = useMemo(() => {
        const result: React.ReactNode[] = [];
        let key = 0;

        const codeBlockRegex = /```(\w+)?(?:\s+[^\n]*)?\n([\s\S]*?)```/g;
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                const textBefore = text.slice(lastIndex, match.index);
                result.push(...parseTextContent(textBefore, key));
                key += 100;
            }

            const language = match[1] || 'plaintext';
            const code = match[2].trim();

            if (showInlineCode && code.length >= 5) {
                result.push(
                    <InlineCodeBlock key={key++} language={language} code={code} />
                );
            }

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            const remainingText = text.slice(lastIndex);
            result.push(...parseTextContent(remainingText, key));
        }

        return result;
    }, [text, showInlineCode]);

    return (
        <div className="text-[13px] text-ide-text leading-relaxed space-y-0.5">
            {elements}
            {isStreaming && <span className="inline-block w-1.5 h-3 bg-ide-accent animate-pulse ml-0.5" />}
        </div>
    );
});

MessageContent.displayName = 'MessageContent';
export default MessageContent;
