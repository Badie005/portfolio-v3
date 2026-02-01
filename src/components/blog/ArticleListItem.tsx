"use client";

import { Link } from "@/i18n/navigation";
import { BlogPostMeta } from "@/lib/blog";
import { useLocale } from "next-intl";

interface ArticleListItemProps {
    post: BlogPostMeta;
}

export function ArticleListItem({ post }: ArticleListItemProps) {
    const locale = useLocale();

    const formattedDate = new Date(post.date).toLocaleDateString(
        locale === "en" ? "en-US" : "fr-FR",
        { year: "numeric", month: "short", day: "numeric" }
    );

    return (
        <article className="group py-5 border-b border-ide-border/60 last:border-b-0">
            <Link
                href={`/blog/${post.slug}`}
                className="flex items-start justify-between gap-6"
            >
                <h3 className="text-lg md:text-xl font-heading font-semibold text-ide-text group-hover:text-ide-accent transition-colors leading-snug flex-1">
                    {post.title}
                </h3>
                <time className="text-sm font-mono text-ide-muted whitespace-nowrap mt-1">
                    {formattedDate}
                </time>
            </Link>
        </article>
    );
}
