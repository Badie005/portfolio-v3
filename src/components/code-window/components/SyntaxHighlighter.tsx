import React from 'react';
import { FileType } from '../types';

interface SyntaxHighlighterProps {
    content: string;
    language: FileType;
}

const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ content, language }) => {

    if (language === 'markdown') {
        return (
            <div className="whitespace-pre font-mono text-[13px] leading-7">
                {content.split('\n').map((line, i) => {
                    // H1 - Title principal
                    if (line.startsWith('# ')) {
                        return <div key={i} className="text-ide-accent font-bold text-lg mt-2">{line}</div>;
                    }
                    // H2
                    if (line.startsWith('## ')) {
                        return <div key={i} className="text-ide-accent font-bold text-base mt-4 mb-1">{line}</div>;
                    }
                    // H3
                    if (line.startsWith('### ')) {
                        return <div key={i} className="text-ide-keyword font-semibold mt-3">{line}</div>;
                    }
                    // Badges ![...](...)
                    if (line.includes('![') && line.includes('](')) {
                        return <div key={i} className="text-ide-muted opacity-70 text-[11px]">{line}</div>;
                    }
                    // Links [text](url)
                    if (line.includes('](http') || line.includes('](mailto')) {
                        return <div key={i} className="text-ide-string underline decoration-ide-string/30">{line}</div>;
                    }
                    // Tables |...|
                    if (line.trim().startsWith('|')) {
                        return <div key={i} className="text-ide-function bg-ide-bg/50 px-1 -mx-1">{line}</div>;
                    }
                    // List items - / *
                    if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                        return <div key={i} className="text-ide-string">{line}</div>;
                    }
                    // Numbered list 1. 2. etc
                    if (/^\s*\d+\./.test(line)) {
                        return <div key={i} className="text-ide-string">{line}</div>;
                    }
                    // Code blocks ```
                    if (line.startsWith('```')) {
                        return <div key={i} className="text-ide-comment opacity-50 bg-neutral-100 -mx-1 px-1">{line}</div>;
                    }
                    // Inline code backticks or bold **text**
                    if (line.includes('**') || line.includes('`')) {
                        const parts = line.split(/(\*\*.*?\*\*|`[^`]+`)/g);
                        return (
                            <div key={i} className="text-ide-text">
                                {parts.map((part, idx) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                        return <span key={idx} className="font-bold text-ide-keyword">{part}</span>;
                                    }
                                    if (part.startsWith('`') && part.endsWith('`')) {
                                        return <span key={idx} className="bg-neutral-100 text-ide-function px-1 rounded text-[12px]">{part}</span>;
                                    }
                                    return <span key={idx}>{part}</span>;
                                })}
                            </div>
                        );
                    }
                    // Emojis at start of line (like 📧 🎓 🚀)
                    if (/^[\u{1F300}-\u{1F9FF}]/u.test(line.trim())) {
                        return <div key={i} className="text-ide-text">{line}</div>;
                    }
                    // Blockquotes
                    if (line.trim().startsWith('>')) {
                        return <div key={i} className="text-ide-comment italic border-l-2 border-ide-accent/30 pl-3 -ml-1">{line}</div>;
                    }
                    // Empty lines
                    if (line.trim() === '') {
                        return <div key={i} className="h-4">&nbsp;</div>;
                    }
                    return <div key={i} className="text-ide-text">{line}</div>;
                })}
            </div>
        );
    }

    if (language === 'css') {
        return (
            <div className="font-mono text-[13px] leading-6">
                {content.split('\n').map((line, i) => {
                    const parts = line.split(/({|}|:|;)/g);
                    return (
                        <div key={i} className="whitespace-pre">
                            {parts.map((part, idx) => {
                                if (part.startsWith('@')) return <span key={idx} className="text-ide-keyword font-bold">{part}</span>;
                                if (part.includes('{') || part.includes('}')) return <span key={idx} className="text-ide-muted">{part}</span>;
                                if (line.includes(':') && !line.trim().startsWith(':') && idx === 0) return <span key={idx} className="text-ide-function">{part}</span>;
                                return <span key={idx} className="text-ide-text">{part}</span>;
                            })}
                        </div>
                    )
                })}
            </div>
        );
    }

    if (language === 'typescript' || language === 'javascript') {
        return (
            <div className="font-mono text-[13px] leading-6">
                {content.split('\n').map((line, i) => {
                    // Advanced regex to split code into tokens:
                    // 1. Strings
                    // 2. Keywords/Operators
                    // 3. Generics like <T>
                    const words = line.split(/(\/\/.*$|\/\*[\s\S]*?\*\/|`.*?`|'.*?'|".*?"|[(){}[\].,;]|<.*?>|\s+)/g).filter(Boolean);

                    return (
                        <div key={i} className="whitespace-pre">
                            {words.map((word, idx) => {
                                // Comments
                                if (word.startsWith('//') || word.startsWith('/*')) return <span key={idx} className="text-ide-comment italic">{word}</span>;

                                // Strings
                                if (word.startsWith('"') || word.startsWith("'") || word.startsWith("`")) return <span key={idx} className="text-ide-string">{word}</span>;

                                // Keywords
                                if (['import', 'from', 'export', 'const', 'let', 'var', 'function', 'return', 'interface', 'type', 'default', 'async', 'await'].includes(word.trim())) {
                                    return <span key={idx} className="text-ide-keyword font-medium">{word}</span>;
                                }

                                // Types / Components
                                if (/^[A-Z]/.test(word.trim()) && word.length > 1) {
                                    return <span key={idx} className="text-ide-function">{word}</span>;
                                }

                                // JSX Tags (Simple heuristic)
                                if (word.startsWith('<') && word.length > 1 && !word.includes(' ')) {
                                    return <span key={idx} className="text-ide-keyword">{word}</span>;
                                }

                                // Generics <T>
                                if (word.match(/^<[A-Z]>$/)) {
                                    return <span key={idx} className="text-ide-function">{word}</span>;
                                }

                                return <span key={idx} className="text-ide-text">{word}</span>;
                            })}
                        </div>
                    );
                })}
            </div>
        )
    }

    if (language === 'xml') {
        return (
            <div className="font-mono text-[13px] leading-6">
                {content.split('\n').map((line, i) => {
                    const parts = line.split(/(<[^>]+>|"[^"]*")/g).filter(Boolean);
                    return (
                        <div key={i} className="whitespace-pre">
                            {parts.map((part, idx) => {
                                if (part.startsWith('<')) return <span key={idx} className="text-ide-keyword">{part}</span>;
                                if (part.startsWith('"')) return <span key={idx} className="text-ide-string">{part}</span>;
                                return <span key={idx} className="text-ide-text">{part}</span>;
                            })}
                        </div>
                    )
                })}
            </div>
        );
    }

    // JSON/Lock Tokenizer
    const lines = content.split('\n');
    const renderLine = (line: string, i: number) => {
        const parts = line.split(/(".*?"|[\{\}\[\],:]|true|false|\b\d+\b)/g).filter(Boolean);
        return (
            <div key={i} className="whitespace-pre">
                {parts.map((part, index) => {
                    let className = 'text-ide-text';
                    if (part.startsWith('"')) {
                        const restOfLine = line.substring(line.indexOf(part) + part.length).trim();
                        if (restOfLine.startsWith(':')) {
                            className = 'text-slate-700 font-medium'; // Key
                        } else {
                            className = 'text-ide-string'; // Value
                        }
                    } else if (/^\d+$/.test(part)) {
                        className = 'text-ide-number';
                    } else if (part === 'true' || part === 'false') {
                        className = 'text-ide-keyword';
                    } else if ('{}[]:,'.includes(part)) {
                        className = 'text-ide-muted';
                    }
                    return <span key={index} className={className}>{part}</span>;
                })}
            </div>
        );
    };

    return (
        <div className="font-mono text-[13px] leading-6">
            {lines.map(renderLine)}
        </div>
    );
};

export default SyntaxHighlighter;
