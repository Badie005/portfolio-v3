"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";

interface MDXContentProps {
    content: string;
}

interface CodeBlockProps {
    code: string;
}

function CodeBlock({ code }: CodeBlockProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            window.setTimeout(() => setIsCopied(false), 2000);
        } catch {
            setIsCopied(false);
        }
    };

    return (
        <div className="my-8 rounded-xl overflow-hidden bg-[#F6F1EF] text-[#333] border border-[#ece4d9]">
            <div
                className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? "max-h-full" : "max-h-[300px]"
                }`}
            >
                <pre className="p-6 overflow-x-auto font-mono text-sm leading-6 whitespace-pre-wrap">
                    <code>{code}</code>
                </pre>

                {!isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#F6F1EF] to-transparent pointer-events-none" />
                )}
            </div>

            <div className="flex items-center justify-end px-4 py-3 gap-6 select-none">
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-ide-muted hover:text-ide-text transition-colors text-sm font-medium"
                >
                    {isCopied ? <Check size={16} className="text-ide-accent" /> : <Copy size={16} />}
                    {isCopied ? "Copied" : "Copy"}
                </button>

                <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="flex items-center gap-2 text-ide-muted hover:text-ide-text transition-colors text-sm font-medium"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp size={16} /> Collapse
                        </>
                    ) : (
                        <>
                            <ChevronDown size={16} /> Expand
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export function MDXContent({ content }: MDXContentProps) {
    return (
        <div className="font-blog">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom heading renderers with anchor links
                    h1: ({ children }) => (
                        <h1 className="text-3xl font-sans font-semibold tracking-tight mt-12 mb-5 text-ide-text leading-tight text-pretty">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-2xl font-sans font-semibold tracking-tight mt-12 mb-5 text-ide-text leading-tight text-pretty">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-xl font-sans font-semibold tracking-tight mt-10 mb-4 text-ide-text leading-tight text-pretty">{children}</h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-lg font-sans font-semibold tracking-tight mt-10 mb-4 text-ide-text leading-tight text-pretty">{children}</h4>
                    ),
                    p: ({ children }) => (
                        <p className="text-[17px] sm:text-[18px] text-ide-text leading-[1.75] my-5 text-pretty">{children}</p>
                    ),
                    // Code blocks
                    pre: ({ children }) => <>{children}</>,
                    code: ({ className, children, ...props }) => {
                        const isInline = !className;
                        if (isInline) {
                            return (
                                <code className="px-1.5 py-0.5 bg-surface-2 border border-ide-border rounded text-sm font-mono text-ide-text" {...props}>
                                    {children}
                                </code>
                            );
                        }
                        const codeContent = String(children).replace(/\n$/, "");
                        return <CodeBlock code={codeContent} />;
                    },
                    hr: () => (
                        <hr className="my-10 border-0 h-px bg-ide-border/60" />
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-ide-text">{children}</strong>
                    ),
                    // Links
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target={href?.startsWith("http") ? "_blank" : undefined}
                            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="text-ide-text underline decoration-ide-border underline-offset-4 hover:text-ide-accent hover:decoration-ide-accent transition-colors"
                        >
                            {children}
                        </a>
                    ),
                    // Images
                    img: ({ src, alt, title }) => (
                        <figure className="my-10">
                            <div className="rounded-2xl border border-ide-border bg-surface-2/50 p-4 sm:p-5 shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={src}
                                    alt={alt || ""}
                                    className="w-full rounded-xl bg-surface-1"
                                    loading="lazy"
                                />
                            </div>
                            {(title || alt) && (
                                <figcaption className="mt-3 text-[11px] font-mono font-medium tracking-wider text-ide-muted leading-relaxed">
                                    {title || alt}
                                </figcaption>
                            )}
                        </figure>
                    ),
                    // Blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className="my-8 rounded-2xl border border-ide-border bg-surface-2/50 px-6 py-4 text-ide-muted">
                            <div className="[&>p]:my-0 [&>p]:text-ide-muted [&>p]:leading-[1.75] text-[17px] sm:text-[18px]">
                                {children}
                            </div>
                        </blockquote>
                    ),
                    table: ({ children }) => (
                        <div className="my-10 overflow-hidden rounded-md border border-[#ece4d9] bg-[#F6F1EF]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-ide-text">
                                    {children}
                                </table>
                            </div>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="text-[11px] font-semibold text-ide-muted border-b border-[#ece4d9]">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-[#ece4d9]">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="align-top">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-2.5 text-left font-semibold text-ide-text">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2.5 text-ide-text">
                            {children}
                        </td>
                    ),
                    // Lists
                    ul: ({ children }) => (
                        <ul className="my-6 list-disc list-outside pl-6 space-y-2 text-ide-text marker:text-ide-muted [&>li>p]:my-0 [&>li>p]:leading-[1.75]">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-6 list-decimal list-outside pl-6 space-y-2 text-ide-text marker:text-ide-muted [&>li>p]:my-0 [&>li>p]:leading-[1.75]">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-[17px] sm:text-[18px] leading-[1.75] text-ide-text">{children}</li>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
