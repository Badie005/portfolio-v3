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
        <article className="group relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-200 dark:border-neutral-800">
            {/* Image */}
            {post.image && (
                <Link href={`/blog/${post.slug}`} className="block aspect-video relative overflow-hidden">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </Link>
            )}

            {/* Content */}
            <div className="p-6">
                {/* Category & Tags */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                        {post.category}
                    </span>
                </div>

                {/* Title */}
                <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
                        {post.title}
                    </h2>
                </Link>

                {/* Description */}
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2">
                    {post.description}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formattedDate}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {post.readingTime} {t("readingTime")}
                        </span>
                    </div>

                    <Link
                        href={`/blog/${post.slug}`}
                        className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-medium transition-colors"
                    >
                        {t("readArticle")}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
