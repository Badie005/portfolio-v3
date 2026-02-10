"use client";

import React, { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";

/* ─────────────────────────── Types ─────────────────────────── */

interface MDXContentProps {
    content: string;
}

interface CodeBlockProps {
    code: string;
    language?: string;
}

/* ─────────────────────── Code Block ────────────────────────── */

function CodeBlock({ code, language }: CodeBlockProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const lineCount = code.split("\n").length;
    const needsExpand = lineCount > 15;

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            window.setTimeout(() => setIsCopied(false), 2000);
        } catch {
            /* silently fail */
        }
    }, [code]);

    return (
        <figure className="my-8 rounded-xl overflow-hidden bg-surface-2 border border-ide-border shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-ide-border bg-surface-1">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                    </div>
                    {language && (
                        <span className="ml-3 text-[10px] font-mono font-medium uppercase tracking-wider text-ide-muted">
                            {language}
                        </span>
                    )}
                </div>
                <span className="text-[10px] text-ide-muted font-mono">
                    {lineCount} lines
                </span>
            </div>

            {/* Code body */}
            <div
                className={`relative overflow-hidden transition-all duration-300 ease-in-out ${!isExpanded && needsExpand ? "max-h-[380px]" : "max-h-[none]"
                    }`}
            >
                <pre className="p-4 overflow-x-auto text-[13px] leading-6 bg-[#1a1a1a] text-[#e4e4e7]">
                    <code className="font-mono">
                        {code.split("\n").map((line, i) => (
                            <div key={`code-${i}`} className="flex">
                                <span className="select-none w-10 pr-4 text-right text-[#555] text-xs leading-6 flex-shrink-0">
                                    {i + 1}
                                </span>
                                <span className="flex-1">{line || " "}</span>
                            </div>
                        ))}
                    </code>
                </pre>
                {!isExpanded && needsExpand && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1a1a1a] to-transparent pointer-events-none" />
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-4 py-2.5 gap-4 select-none border-t border-ide-border bg-surface-1">
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-ide-muted hover:text-ide-text transition-colors text-xs font-medium"
                >
                    {isCopied ? (
                        <Check size={14} className="text-ide-accent" />
                    ) : (
                        <Copy size={14} />
                    )}
                    {isCopied ? "Copied!" : "Copy"}
                </button>
                {needsExpand && (
                    <button
                        type="button"
                        onClick={() => setIsExpanded((prev) => !prev)}
                        className="flex items-center gap-1.5 text-ide-muted hover:text-ide-text transition-colors text-xs font-medium"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp size={14} /> Collapse
                            </>
                        ) : (
                            <>
                                <ChevronDown size={14} /> Expand
                            </>
                        )}
                    </button>
                )}
            </div>
        </figure>
    );
}

/* ──────────────── Theorem Environment Block ────────────────── */

type TheoremVariant =
    | "theorem"
    | "lemma"
    | "proposition"
    | "corollary"
    | "definition"
    | "proof"
    | "algorithm"
    | "assumption"
    | "remark"
    | "example"
    | "counterexample"
    | "condition"
    | "conjecture"
    | "claim"
    | "observation"
    | "notation"
    | "axiom";

interface TheoremBlockProps {
    variant: TheoremVariant;
    title?: string;
    children: React.ReactNode;
}

const THEOREM_CONFIG: Record<TheoremVariant, { border: string; bg: string; label: string }> = {
    theorem: { border: "border-l-emerald-500", bg: "bg-emerald-500/5", label: "Theorem" },
    lemma: { border: "border-l-blue-500", bg: "bg-blue-500/5", label: "Lemma" },
    proposition: { border: "border-l-violet-500", bg: "bg-violet-500/5", label: "Proposition" },
    corollary: { border: "border-l-teal-500", bg: "bg-teal-500/5", label: "Corollary" },
    definition: { border: "border-l-amber-500", bg: "bg-amber-500/5", label: "Definition" },
    proof: { border: "border-l-slate-400", bg: "bg-slate-500/5", label: "Proof" },
    algorithm: { border: "border-l-rose-500", bg: "bg-rose-500/5", label: "Algorithm" },
    assumption: { border: "border-l-orange-500", bg: "bg-orange-500/5", label: "Assumption" },
    remark: { border: "border-l-slate-400", bg: "bg-slate-500/3", label: "Remark" },
    example: { border: "border-l-cyan-500", bg: "bg-cyan-500/5", label: "Example" },
    counterexample: { border: "border-l-red-500", bg: "bg-red-500/5", label: "Counterexample" },
    condition: { border: "border-l-indigo-500", bg: "bg-indigo-500/5", label: "Condition" },
    conjecture: { border: "border-l-pink-500", bg: "bg-pink-500/5", label: "Conjecture" },
    claim: { border: "border-l-lime-500", bg: "bg-lime-500/5", label: "Claim" },
    observation: { border: "border-l-sky-500", bg: "bg-sky-500/5", label: "Observation" },
    notation: { border: "border-l-gray-400", bg: "bg-gray-500/3", label: "Notation" },
    axiom: { border: "border-l-fuchsia-500", bg: "bg-fuchsia-500/5", label: "Axiom" },
};

function TheoremBlock({ variant, children }: TheoremBlockProps) {
    const config = THEOREM_CONFIG[variant] || THEOREM_CONFIG.theorem;
    const isProof = variant === "proof";

    return (
        <div
            className={`my-6 rounded-r-lg overflow-hidden border-l-4 ${config.border} ${config.bg}`}
        >
            <div className="px-5 py-4">
                <div
                    className={`
                        text-[17px] sm:text-[18px] leading-[1.75]
                        text-ide-text
                        ${isProof ? "italic" : ""}
                        [&>strong]:not-italic [&>strong]:font-semibold
                        [&>p]:my-0
                    `}
                >
                    {children}
                    {isProof && (
                        <span className="float-right text-lg mt-1 select-none text-ide-muted">
                            ∎
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ────────────────── Theorem Pattern Matching ─────────────────── */

const THEOREM_PATTERNS: { pattern: RegExp; variant: TheoremVariant }[] = [
    // Theorems, Lemmas, etc. with optional number and title
    { pattern: /^\*\*Theorem\s*\d*(\s*\([^)]+\))?[.:]*\*?\*?/i, variant: "theorem" },
    { pattern: /^\*\*Lemma\s*\d*(\s*\([^)]+\))?[.:]*\*?\*?/i, variant: "lemma" },
    { pattern: /^\*\*Proposition\s*\d*(\s*\([^)]+\))?[.:]*\*?\*?/i, variant: "proposition" },
    { pattern: /^\*\*Corollary\s*\d*(\s*\([^)]+\))?[.:]*\*?\*?/i, variant: "corollary" },
    { pattern: /^\*\*Definition\s*\d*(\s*\([^)]+\))?[.:]*\*?\*?/i, variant: "definition" },
    { pattern: /^\*\*Axiom\s*\d*(\s*\([^)]+\))?[.:]*\*?\*?/i, variant: "axiom" },
    { pattern: /^\*\*Conjecture\s*\d*(\s*\([^)]+\))?[.:]*\*?\*?/i, variant: "conjecture" },
    { pattern: /^\*\*Claim\s*\d*(\s*\([^)]+\))?[.:]*\*?\*?/i, variant: "claim" },
    { pattern: /^\*\*Observation\s*\d*(\s*\([^)]+\))?[.:]*\*?\*?/i, variant: "observation" },
    // Proofs
    { pattern: /^\*\*Proof(\s+of[^*]+)?[.:]*\*?\*?/i, variant: "proof" },
    // Algorithms
    { pattern: /^\*\*Algorithm\s*\d*[:\s]/i, variant: "algorithm" },
    // Assumptions, Conditions
    { pattern: /^\*\*Assumption\s*\d*[.:]*\*?\*?/i, variant: "assumption" },
    { pattern: /^\*\*Condition\s*[A-Z0-9]+(\s*\([^)]+\))?[.:]*\*?\*?/i, variant: "condition" },
    // Remarks, Examples
    { pattern: /^\*\*Remark[.:]*\*?\*?/i, variant: "remark" },
    { pattern: /^\*\*Example[.:]*\*?\*?/i, variant: "example" },
    { pattern: /^\*\*Counterexample\s*\d*[.:]*\*?\*?/i, variant: "counterexample" },
    { pattern: /^\*\*Notation[.:]*\*?\*?/i, variant: "notation" },
];

function detectTheoremVariant(text: string): TheoremVariant | null {
    for (const { pattern, variant } of THEOREM_PATTERNS) {
        if (pattern.test(text)) return variant;
    }
    return null;
}

/* ────────────────── Extract Text Utility ─────────────────── */

function extractText(node: React.ReactNode): string {
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (React.isValidElement(node)) {
        const props = node.props as { children?: React.ReactNode };
        if (props.children) {
            return extractText(props.children);
        }
    }
    return "";
}

/* ═══════════════════════ MAIN COMPONENT ══════════════════════ */

export function MDXContent({ content }: MDXContentProps) {
    return (
        <div className="font-blog antialiased text-ide-text selection:bg-ide-accent/20">
            {/* KaTeX CSS */}
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
                integrity="sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+"
                crossOrigin="anonymous"
            />

            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    /* ─── Headings ─── */
                    h1: ({ children }) => (
                        <h1
                            className="text-3xl md:text-4xl tracking-tight mt-12 mb-8 text-ide-text font-medium leading-[1.15]"
                            style={{ fontFamily: "'Saans', sans-serif" }}
                        >
                            {children}
                        </h1>
                    ),

                    h2: ({ children }) => (
                        <h2
                            className="text-2xl md:text-[1.75rem] tracking-tight mt-16 mb-5 text-ide-text font-medium leading-[1.3]"
                            style={{ fontFamily: "'Saans', sans-serif" }}
                        >
                            {children}
                        </h2>
                    ),

                    h3: ({ children }) => (
                        <h3
                            className="text-2xl md:text-[1.5rem] font-medium tracking-tight mt-10 mb-4 text-ide-text leading-tight"
                            style={{ fontFamily: "'Saans', sans-serif" }}
                        >
                            {children}
                        </h3>
                    ),

                    h4: ({ children }) => (
                        <h4
                            className="text-xl md:text-[1.25rem] font-medium tracking-tight mt-8 mb-3 text-ide-text leading-tight"
                            style={{ fontFamily: "'Saans', sans-serif" }}
                        >
                            {children}
                        </h4>
                    ),

                    /* ─── Paragraphs (with theorem detection) ─── */
                    p: ({ children }) => {
                        const text = extractText(children);
                        const variant = detectTheoremVariant(text);

                        if (variant) {
                            return (
                                <TheoremBlock variant={variant}>
                                    <p className="[&>strong]:font-bold my-0 font-blog leading-[1.7] text-[1.05rem]">
                                        {children}
                                    </p>
                                </TheoremBlock>
                            );
                        }

                        // Professional Editorial Spacing: Bottom margin only for clean flow
                        return (
                            <p className="text-[1.05rem] md:text-[1.125rem] leading-[1.75] mb-6 last:mb-0 font-blog text-ide-text text-pretty tracking-normal">
                                {children}
                            </p>
                        );
                    },

                    /* ─── Code ─── */
                    pre: ({ children }) => <div className="my-8">{children}</div>,

                    code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || "");
                        const isInline = !className;
                        const isReferences = match?.[1] === "references";

                        if (isReferences) {
                            const referencesList = String(children).trim().split('\n');
                            return (
                                <footer className="mt-20 pt-8">
                                    <h3 className="font-sans text-xl font-bold text-ide-text mb-6 tracking-tight">
                                        References
                                    </h3>
                                    <ol className="list-decimal list-outside pl-5 space-y-3 font-blog text-[0.9rem] leading-snug text-ide-muted/90">
                                        {referencesList.map((ref, index) => (
                                            <li key={index} className="pl-2">
                                                {ref.replace(/^\-\s*/, '').replace(/^\d+\.\s*/, '')}
                                            </li>
                                        ))}
                                    </ol>
                                </footer>
                            );
                        }

                        if (isInline) {
                            return (
                                <code
                                    className="px-1.5 py-0.5 bg-ide-bg-secondary border border-ide-border/60 rounded text-[0.85em] font-mono text-ide-function align-middle"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }

                        const codeContent = String(children).replace(/\n$/, "");
                        return <CodeBlock code={codeContent} language={match?.[1]} />;
                    },

                    /* ─── Horizontal Rule ─── */
                    hr: () => (
                        <hr className="my-16 border-0 border-t border-ide-border/60" />
                    ),

                    /* ─── Inline Formatting ─── */
                    strong: ({ children }) => (
                        <strong className="font-bold text-ide-text">{children}</strong>
                    ),

                    em: ({ children }) => (
                        <em className="italic text-ide-text font-blog">{children}</em>
                    ),

                    /* ─── Links ─── */
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target={href?.startsWith("http") ? "_blank" : undefined}
                            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="text-ide-accent hover:text-ide-accent/80 underline decoration-ide-accent/30 underline-offset-4 hover:decoration-ide-accent transition-all font-medium decoration-1"
                        >
                            {children}
                        </a>
                    ),

                    /* ─── Images ─── */
                    img: ({ src, alt, title }) => (
                        <figure className="my-12 group">
                            <div className="rounded-lg overflow-hidden border border-ide-border/40 bg-surface-2/30 shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={src}
                                    alt={alt || ""}
                                    className="w-full h-auto bg-surface-1"
                                    loading="lazy"
                                />
                            </div>
                            {(title || alt) && (
                                <figcaption className="mt-4 text-[0.9rem] font-sans text-ide-muted leading-relaxed text-center max-w-2xl mx-auto">
                                    {title || alt}
                                </figcaption>
                            )}
                        </figure>
                    ),

                    /* ─── Blockquotes (Standard) ─── */
                    blockquote: ({ children }) => (
                        <blockquote className="my-10 pl-8 border-l-[3px] border-ide-accent/40 italic text-[1.125rem] text-ide-muted font-blog leading-loose">
                            {children}
                        </blockquote>
                    ),

                    /* ─── Lists ─── */
                    ul: ({ children }) => (
                        <ul className="my-8 list-disc list-outside pl-6 space-y-3 text-ide-text font-blog text-[1.05rem] md:text-[1.125rem] leading-[1.7] marker:text-ide-muted/80 marker:text-sm">
                            {children}
                        </ul>
                    ),

                    ol: ({ children }) => (
                        <ol className="my-8 list-decimal list-outside pl-6 space-y-3 text-ide-text font-blog text-[1.05rem] md:text-[1.125rem] leading-[1.7] marker:text-ide-muted/80">
                            {children}
                        </ol>
                    ),

                    li: ({ children }) => (
                        <li className="pl-2">
                            {children}
                        </li>
                    ),

                    /* ─── Tables ─── */
                    table: ({ children }) => (
                        <div className="my-12 overflow-x-auto scrollbar-hide border border-ide-border/40 rounded-lg">
                            <table className="w-full text-left border-collapse text-[1rem]">
                                {children}
                            </table>
                        </div>
                    ),

                    thead: ({ children }) => (
                        <thead className="border-b border-ide-border bg-surface-2/50">
                            {children}
                        </thead>
                    ),

                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-ide-border/40 font-blog">
                            {children}
                        </tbody>
                    ),

                    tr: ({ children }) => (
                        <tr className="hover:bg-surface-2/30 transition-colors">
                            {children}
                        </tr>
                    ),

                    th: ({ children }) => (
                        <th
                            className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-ide-muted align-bottom text-left"
                            style={{ fontFamily: "'Saans', sans-serif" }}
                        >
                            {children}
                        </th>
                    ),

                    td: ({ children }) => (
                        <td className="py-4 px-6 align-top text-ide-text leading-relaxed border-l border-ide-border/10 first:border-0 font-blog">
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>

            {/* Additional styles for math content (KaTeX) */}
            <style>{`
                .font-blog .katex-display {
                    margin: 2em 0;
                    overflow-x: auto;
                    overflow-y: hidden;
                    text-align: center;
                    padding: 1em 0;
                }
                /* Custom refined scrollbar for math blocks */
                .font-blog .katex-display::-webkit-scrollbar {
                    height: 4px; /* Thin scrollbar */
                }
                .font-blog .katex-display::-webkit-scrollbar-track {
                    background: transparent;
                }
                .font-blog .katex-display::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.3); /* Subtle gray */
                    border-radius: 4px;
                }
                .font-blog .katex-display::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(156, 163, 175, 0.5);
                }
                
                .font-blog .katex {
                    font-size: 1.1em;
                    font-family: 'KaTeX_Main', 'Times New Roman', serif;
                    line-height: 1.2;
                    text-rendering: optimizeLegibility;
                }
                .font-blog .katex-display > .katex {
                    text-align: center;
                    display: inline-block;
                    white-space: nowrap; /* Prevent breaking inside math */
                    max-width: 100%;     /* Ensure it respects container */
                }
                .katex-html {
                    overflow: visible; /* Let parent handle overflow */
                }
            `}</style>
        </div>
    );
}