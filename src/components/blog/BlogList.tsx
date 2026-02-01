"use client";

import { useState } from "react";
import { BlogPostMeta } from "@/lib/blog";
import { FeaturedArticle } from "./FeaturedArticle";
import { ArticleListItem } from "./ArticleListItem";
import { useTranslations } from "next-intl";

interface BlogListProps {
    posts: BlogPostMeta[];
    categories: string[];
}

export function BlogList({ posts, categories }: BlogListProps) {
    const t = useTranslations("blog");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filteredPosts = activeCategory
        ? posts.filter((post) => post.category === activeCategory)
        : posts;

    // Separate featured (first) and rest
    const featuredPost = filteredPosts[0];
    const listPosts = filteredPosts.slice(1);

    return (
        <div>
            {/* Category Filter - Minimal Style */}
            {categories.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-12">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`px-4 py-2 text-sm font-medium transition-colors rounded-full ${activeCategory === null
                                ? "text-ide-accent"
                                : "text-ide-muted hover:text-ide-text"
                            }`}
                    >
                        {t("filterAll")}
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 text-sm font-medium transition-colors rounded-full ${activeCategory === category
                                    ? "text-ide-accent"
                                    : "text-ide-muted hover:text-ide-text"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}

            {/* Featured Article */}
            {featuredPost && (
                <div className="pb-10 mb-10 border-b border-ide-border">
                    <FeaturedArticle post={featuredPost} />
                </div>
            )}

            {/* Articles List */}
            {listPosts.length > 0 && (
                <div className="space-y-0">
                    {listPosts.map((post) => (
                        <ArticleListItem key={post.slug} post={post} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {filteredPosts.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-ide-muted text-lg">
                        {t("noPostsInCategory")}
                    </p>
                </div>
            )}
        </div>
    );
}
