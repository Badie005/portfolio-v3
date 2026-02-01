"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { BlogPostMeta } from "@/lib/blog";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface BlogCardProps {
    post: BlogPostMeta;
}

export function BlogCard({ post }: BlogCardProps) {
    const locale = useLocale();
    const t = useTranslations("blog");

    const formattedDate = new Date(post.date).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-ide-border bg-surface-1 shadow-sm transition-all duration-300 hover:border-ide-accent/50 hover:shadow-xl">
            {/* Image */}
            {post.image && (
                <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative aspect-video w-full overflow-hidden bg-surface-2 border-b border-ide-border/50">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="absolute inset-0 w-full h-full object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>
                </Link>
            )}

            {/* Content */}
            <div className="relative p-6 flex flex-col">
                {/* Category & Tags */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 text-[10px] font-mono font-medium uppercase tracking-wider text-ide-muted bg-surface-2 rounded border border-ide-border">
                        {post.category}
                    </span>
                </div>

                {/* Title */}
                <Link href={`/blog/${post.slug}`} className="block">
                    <h2 className="text-xl font-heading font-bold text-ide-text tracking-tight mb-2 group-hover:text-ide-accent transition-colors line-clamp-2">
                        {post.title}
                    </h2>
                </Link>

                {/* Description */}
                <p className="text-ide-muted text-sm leading-relaxed mb-5 line-clamp-2">
                    {post.description}
                </p>

                {/* Meta */}
                <div className="mt-auto flex items-center justify-between gap-4 text-xs text-ide-muted">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formattedDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {post.readingTime} {t("readingTime")}
                        </span>
                    </div>

                    <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-wider text-ide-accent hover:opacity-80 transition-opacity"
                    >
                        {t("readArticle")}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
