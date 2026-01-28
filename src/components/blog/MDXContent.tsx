"use client";

import ReactMarkdown from "react-markdown";

interface MDXContentProps {
    content: string;
}

export function MDXContent({ content }: MDXContentProps) {
    return (
        <ReactMarkdown
            components={{
                // Custom heading renderers with anchor links
                h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
                ),
                h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold mt-8 mb-4">{children}</h2>
                ),
                h3: ({ children }) => (
                    <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
                ),
                // Code blocks
                code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    if (isInline) {
                        return (
                            <code className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-sm" {...props}>
                                {children}
                            </code>
                        );
                    }
                    return (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
                // Links
                a: ({ href, children }) => (
                    <a
                        href={href}
                        target={href?.startsWith("http") ? "_blank" : undefined}
                        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-orange-500 hover:text-orange-600 underline underline-offset-2"
                    >
                        {children}
                    </a>
                ),
                // Images
                img: ({ src, alt }) => (
                    <figure className="my-8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={src}
                            alt={alt || ""}
                            className="w-full rounded-lg shadow-lg"
                        />
                        {alt && (
                            <figcaption className="text-center text-sm text-neutral-500 mt-2">
                                {alt}
                            </figcaption>
                        )}
                    </figure>
                ),
                // Blockquotes
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-orange-500 pl-4 italic text-neutral-600 dark:text-neutral-400 my-6">
                        {children}
                    </blockquote>
                ),
                // Lists
                ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 my-4">{children}</ul>
                ),
                ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 my-4">{children}</ol>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
