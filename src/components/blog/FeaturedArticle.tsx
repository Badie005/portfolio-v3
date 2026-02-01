"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { BlogPostMeta } from "@/lib/blog";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface FeaturedArticleProps {
    post: BlogPostMeta;
}

export function FeaturedArticle({ post }: FeaturedArticleProps) {
    const locale = useLocale();
    const t = useTranslations("blog");

    const formattedDate = new Date(post.date).toLocaleDateString(
        locale === "en" ? "en-US" : "fr-FR",
        { year: "numeric", month: "long", day: "numeric" }
    );

    return (
        <article className="group relative">
            <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-8 lg:gap-12 items-start">
                {/* Article Illustration - Unique SVG per article */}
                {post.image && (
                    <Link href={`/blog/${post.slug}`} className="block">
                        <div className="relative w-[140px] h-[140px] lg:w-[180px] lg:h-[180px] overflow-hidden">
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 140px, 180px"
                                quality={90}
                            />
                        </div>
                    </Link>
                )}

                {/* Content - Right Side */}
                <div className="flex flex-col">
                    {/* Featured Label */}
                    <span className="inline-flex items-center text-xs font-medium uppercase tracking-wider text-ide-accent mb-4">
                        {t("featured")}
                    </span>

                    {/* Title */}
                    <Link href={`/blog/${post.slug}`} className="block group/link">
                        <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-heading font-semibold tracking-tight text-ide-text leading-tight mb-4 group-hover/link:text-ide-accent transition-colors">
                            {post.title}
                        </h2>
                    </Link>

                    {/* Description */}
                    <p className="text-ide-muted text-lg leading-relaxed mb-6 max-w-2xl">
                        {post.description}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-ide-muted">
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formattedDate}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {post.readingTime} {t("readingTime")}
                        </span>
                        <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-2 font-medium text-ide-accent hover:opacity-80 transition-opacity ml-auto"
                        >
                            {t("readArticle")}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
