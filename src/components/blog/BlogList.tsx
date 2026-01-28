"use client";

import { useState } from "react";
import { BlogPostMeta } from "@/lib/blog";
import { BlogCard } from "./BlogCard";
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

    return (
        <div>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
                <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === null
                            ? "bg-orange-500 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                >
                    {t("filterAll")}
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category
                                ? "bg-orange-500 text-white"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Posts Grid */}
            {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                        <BlogCard key={post.slug} post={post} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                        {t("noPostsInCategory")}
                    </p>
                </div>
            )}
        </div>
    );
}
