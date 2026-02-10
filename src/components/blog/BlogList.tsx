"use client";


import { BlogPostMeta } from "@/lib/blog";
import { useTranslations } from "next-intl";
import { FileText, LayoutGrid } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export function BlogList({ posts }: { posts: BlogPostMeta[] }) {
    const t = useTranslations("blog");

    // Featured post is the first one
    const featuredPost = posts[0];
    // Side articles are the rest (up to 4)
    const sideArticles = posts.slice(1, 5);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div>
            {posts.length > 0 && (
                <div className="border-t border-ide-border pt-12">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Featured Article (Left - 65%) */}
                        <div className="lg:w-[65%] flex flex-col gap-6">
                            {/* Image/Video Thumbnail */}
                            {featuredPost && (
                                <>
                                    <Link
                                        href={`/blog/${featuredPost.slug}`}
                                        className="relative rounded-2xl overflow-hidden block group"
                                    >
                                        <Image
                                            src={featuredPost.coverImage || featuredPost.image || '/placeholder.png'}
                                            alt={featuredPost.title}
                                            width={800}
                                            height={450}
                                            priority
                                            className="w-full h-auto object-cover"
                                        />

                                    </Link>

                                    {/* Featured Article Info */}
                                    <Link
                                        href={`/blog/${featuredPost.slug}`}
                                        className="flex flex-col md:flex-row gap-8 group"
                                    >
                                        <div className="flex-1 pb-4">
                                            <h2
                                                className="text-[32px] text-ide-text leading-[1.2] group-hover:opacity-70 transition-opacity"
                                                style={{ fontFamily: "'Saans', sans-serif", fontWeight: 500 }}
                                            >
                                                {featuredPost.title}
                                            </h2>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <div className="flex gap-2 text-sm">
                                                <span className="text-ide-accent">{featuredPost.category}</span>
                                                <span className="text-ide-muted">{formatDate(featuredPost.date)}</span>
                                            </div>
                                            <p className="text-[15px] text-ide-text leading-[1.4]">
                                                {featuredPost.description}
                                            </p>
                                        </div>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Side Articles (Right - 35%) */}
                        <div className="lg:w-[35%] flex flex-col gap-4">
                            {sideArticles.map((article, index) => (
                                <Link
                                    key={article.slug}
                                    href={`/blog/${article.slug}`}
                                    className={`flex flex-col gap-2 pb-4 group ${index < sideArticles.length - 1 ? "border-b border-ide-border" : ""
                                        }`}
                                >
                                    <div className="flex gap-2 text-sm">
                                        <span className="text-ide-accent">{article.category}</span>
                                        <span className="text-ide-muted">{formatDate(article.date)}</span>
                                    </div>
                                    <h4
                                        className="text-[19px] text-ide-text leading-[1.2] group-hover:opacity-70 transition-opacity"
                                        style={{ fontFamily: "'Saans', sans-serif", fontWeight: 500 }}
                                    >
                                        {article.title}
                                    </h4>
                                    <p className="text-[14.6px] text-ide-muted leading-[1.45]">
                                        {article.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {posts.length === 0 && (
                <div className="relative text-center py-24">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 bg-ide-accent/[0.03] rounded-full blur-3xl" />
                    </div>

                    <div className="relative">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-ide-bg-secondary/80 border border-ide-border/50 mb-6">
                            <FileText className="w-6 h-6 text-ide-muted/30" strokeWidth={1.5} />
                        </div>

                        <p className="text-lg text-ide-muted mb-6">
                            {t("noPostsInCategory")}
                        </p>

                        <button
                            className="
                                inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                                rounded-lg border border-ide-accent/20 text-ide-accent
                                bg-ide-accent/[0.06] hover:bg-ide-accent/[0.1]
                                transition-all duration-200
                            "
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            {t("filterAll")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}