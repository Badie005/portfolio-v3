import React from 'react';
import { FileType } from '../types';

interface SyntaxHighlighterProps {
    content: string;
    language: FileType;
}

const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ content, language }) => {

    if (language === 'markdown') {
        const lines = content.split('\n');
        const elements: React.ReactNode[] = [];
        let inCodeBlock = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Handle code block markers (``` lines) - just hide them
            if (line.trim().startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                elements.push(<div key={i} className="h-1"></div>);
                continue;
            }

            // If inside code block, render with code styling
            if (inCodeBlock) {
                elements.push(
                    <div key={i} className="font-mono text-[12px] text-[#D97757] bg-[#F8F6F4] px-2 -mx-1">
                        {line || ' '}
                    </div>
                );
                continue;
            }

            // H1 - Title principal
            if (line.startsWith('# ')) {
                elements.push(<div key={i} className="text-[#1a1a1a] font-bold text-xl mt-4 mb-2 tracking-tight">{line.slice(2)}</div>);
                continue;
            }
            // H2
            if (line.startsWith('## ')) {
                elements.push(<div key={i} className="text-[#D97757] font-bold text-base mt-6 mb-2">{line.slice(3)}</div>);
                continue;
            }
            // H3
            if (line.startsWith('### ')) {
                elements.push(<div key={i} className="text-[#5C5856] font-semibold mt-4 mb-1 text-[13px]">{line.slice(4)}</div>);
                continue;
            }
            // Date/meta info with ** **
            if (line.startsWith('**') && line.includes('|')) {
                const cleanLine = line.replace(/\*\*/g, '');
                elements.push(<div key={i} className="text-[#8B7355] text-[12px] mb-3 font-medium">{cleanLine}</div>);
                continue;
            }
            // Badges - hide them
            if (line.includes('![') && line.includes('](')) {
                continue;
            }
            // Links
            if (line.includes('](http') || line.includes('](mailto')) {
                elements.push(<div key={i} className="text-[#D97757] underline decoration-[#D97757]/30">{line}</div>);
                continue;
            }
            // Tables
            if (line.trim().startsWith('|')) {
                if (line.includes('---')) continue;
                const cells = line.split('|').filter(c => c.trim());
                elements.push(
                    <div key={i} className="flex gap-4 text-[12px] py-1 border-b border-[#E8E5DE]/50">
                        {cells.map((cell, idx) => (
                            <span key={idx} className="text-[#37352F] min-w-[100px]">{cell.trim()}</span>
                        ))}
                    </div>
                );
                continue;
            }
            // Horizontal rule (check before list items)
            if (line.trim() === '---' || line.trim() === '***') {
                elements.push(<div key={i} className="border-t border-[#E8E5DE] my-4"></div>);
                continue;
            }
            // List items
            if ((line.trim().startsWith('-') || line.trim().startsWith('*')) && line.trim().length > 1) {
                const indent = line.search(/\S/);
                const listContent = line.trim().slice(1).trim();
                elements.push(
                    <div key={i} className="flex items-start gap-2" style={{ paddingLeft: `${indent * 4}px` }}>
                        <span className="text-[#D97757] mt-[2px]">•</span>
                        <span className="text-[#37352F]">{listContent}</span>
                    </div>
                );
                continue;
            }
            // Numbered list
            if (/^\s*\d+\./.test(line)) {
                const match = line.match(/^(\s*)(\d+)\.\s*(.*)/);
                if (match) {
                    elements.push(
                        <div key={i} className="flex items-start gap-2" style={{ paddingLeft: `${match[1].length * 4}px` }}>
                            <span className="text-[#D97757] font-medium min-w-[20px]">{match[2]}.</span>
                            <span className="text-[#37352F]">{match[3]}</span>
                        </div>
                    );
                    continue;
                }
            }
            // Inline code or bold
            if (line.includes('**') || line.includes('`')) {
                const parts = line.split(/(\*\*.*?\*\*|`[^`]+`)/g);
                elements.push(
                    <div key={i} className="text-[#37352F]">
                        {parts.map((part, idx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <span key={idx} className="font-semibold text-[#1a1a1a]">{part.slice(2, -2)}</span>;
                            }
                            if (part.startsWith('`') && part.endsWith('`')) {
                                return <span key={idx} className="bg-[#F5F5F4] text-[#D97757] px-1.5 py-0.5 rounded text-[12px] font-mono">{part.slice(1, -1)}</span>;
                            }
                            return <span key={idx}>{part}</span>;
                        })}
                    </div>
                );
                continue;
            }
            // Blockquotes
            if (line.trim().startsWith('>')) {
                elements.push(<div key={i} className="text-[#6B6B6B] italic border-l-2 border-[#D97757] pl-4 bg-[#FAF9F6] py-1">{line.slice(1).trim()}</div>);
                continue;
            }
            // Empty lines
            if (line.trim() === '') {
                elements.push(<div key={i} className="h-3"></div>);
                continue;
            }
            // Default text
            elements.push(<div key={i} className="text-[#37352F]">{line}</div>);
        }

        return <div className="whitespace-pre-wrap font-sans text-[13px] leading-7">{elements}</div>;
    }

    if (language === 'css') {
        return (
            <div className="font-mono text-[13px] leading-6">
                {content.split('\n').map((line, i) => {
                    const tokens = line.split(/({|}|:|;|!important|[\s]+)/g).filter(Boolean);
                    let isPropertyContext = true;
                    if (line.includes('{')) isPropertyContext = false; // Selectors
                    if (line.trim().startsWith('@')) isPropertyContext = false; // At-rules

                    return (
                        <div key={i} className="whitespace-pre">
                            {tokens.map((token, idx) => {
                                // Comments
                                if (token.startsWith('/*')) return <span key={idx} className="text-ide-comment italic">{token}</span>;

                                // Punctuation
                                if (['{', '}', ':', ';'].includes(token)) {
                                    if (token === '{') isPropertyContext = true; // Start property block
                                    return <span key={idx} className="text-ide-muted">{token}</span>;
                                }

                                // At-rules (@media, @keyframes)
                                if (token.startsWith('@')) return <span key={idx} className="text-ide-keyword font-bold">{token}</span>;

                                // Selectors
                                if (!line.includes(':') && !token.includes(';') && !isPropertyContext) {
                                    return <span key={idx} className="text-ide-function font-bold">{token}</span>; // Green
                                }

                                // Properties
                                if (line.includes(':') && idx < tokens.indexOf(':')) {
                                    return <span key={idx} className="text-ide-keyword">{token}</span>; // Blue
                                }

                                // Values
                                if (line.includes(':') && idx > tokens.indexOf(':')) {
                                    // Numbers/Units
                                    if (token.match(/^[0-9.]+(px|em|rem|%|vh|vw|s|ms|deg)$/)) return <span key={idx} className="text-ide-number">{token}</span>;
                                    // Hex color
                                    if (token.match(/^#[0-9a-fA-F]{3,8}$/)) return <span key={idx} className="text-ide-string">{token}</span>;
                                    // Important
                                    if (token === '!important') return <span key={idx} className="text-ide-accent font-bold">{token}</span>;

                                    return <span key={idx} className="text-ide-string">{token}</span>; // Dark Grey
                                }

                                return <span key={idx} className="text-ide-muted">{token}</span>;
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
                    // Improved tokenizer for TS/JS
                    const tokens = line.split(/(\/\/.*$|\/\*[\s\S]*?\*\/|`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|[(){}[\].,;:]|[+\-*/%=&|<>!^?]+|\s+)/g).filter(Boolean);



                    return (
                        <div key={i} className="whitespace-pre">
                            {tokens.map((token, idx) => {
                                // Comments
                                if (token.startsWith('//') || token.startsWith('/*')) return <span key={idx} className="text-ide-comment italic">{token}</span>;

                                // Strings
                                if (token.match(/^["'`]/)) return <span key={idx} className="text-ide-string">{token}</span>;

                                // Numbers
                                if (token.match(/^-?\d+(\.\d+)?$/)) return <span key={idx} className="text-ide-number">{token}</span>;

                                // Keywords
                                if (['import', 'from', 'export', 'const', 'let', 'var', 'function', 'return', 'interface', 'type', 'default', 'async', 'await', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'throw', 'new', 'class', 'extends', 'implements', 'public', 'private', 'protected', 'static', 'readonly', 'as', 'null', 'undefined', 'true', 'false', 'void', 'any'].includes(token.trim())) {

                                    return <span key={idx} className="text-ide-keyword font-medium">{token}</span>;
                                }

                                // React Components / Types (Capitalized)
                                if (token.match(/^[A-Z][a-zA-Z0-9]*$/) && token.length > 1) {
                                    return <span key={idx} className="text-ide-function">{token}</span>;
                                }

                                // Function calls
                                const nextToken = tokens[idx + 1]?.trim();
                                if (nextToken === '(' && token.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/)) {
                                    return <span key={idx} className="text-ide-function">{token}</span>;
                                }

                                // Method definitions in object/class
                                if (nextToken === '(' && token.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/)) {
                                    return <span key={idx} className="text-ide-function">{token}</span>;
                                }

                                // Object keys (followed by colon)
                                if (nextToken === ':' && token.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/)) {
                                    return <span key={idx} className="text-ide-text">{token}</span>;
                                }

                                // JSX Tags
                                if (token.match(/^<[a-zA-Z]+/) || token.match(/^[a-zA-Z]+>$/)) {
                                    return <span key={idx} className="text-ide-keyword">{token}</span>;
                                }

                                // Operators
                                if (token.match(/^[+\-*/%=&|<>!^?]+$/)) {
                                    return <span key={idx} className="text-ide-muted">{token}</span>;
                                }

                                // Brackets/Punctuation
                                if (token.match(/^[(){}[\].,;:]$/)) {
                                    return <span key={idx} className="text-ide-muted">{token}</span>;
                                }

                                // Default Variable/Property
                                return <span key={idx} className="text-ide-text">{token}</span>;
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
                            className = 'text-ide-keyword font-medium'; // Key (Blue)
                        } else {
                            className = 'text-ide-string'; // Value (Green)
                        }
                    } else if (/^\d+$/.test(part)) {
                        className = 'text-ide-number'; // Number (Blue)
                    } else if (part === 'true' || part === 'false') {
                        className = 'text-ide-keyword font-medium'; // Boolean (Terracotta)
                    } else if ('{}[]:,'.includes(part)) {
                        className = 'text-ide-muted'; // Punctuation (Grey)
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
