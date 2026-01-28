import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getAllPosts, getAllCategories } from "@/lib/blog";
import { BlogList } from "@/components/blog/BlogList";
import { BookOpen } from "lucide-react";

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "blog" });

    return {
        title: t("title"),
        description: t("description"),
        openGraph: {
            title: `${t("title")} | B.DEV`,
            description: t("description"),
            images: ["/og/og-blog.svg"],
        },
    };
}

export default async function BlogPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const t = await getTranslations({ locale, namespace: "blog" });
    const posts = getAllPosts(locale);
    const categories = getAllCategories(locale);

    return (
        <div className="min-h-screen py-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <header className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 rounded-full text-violet-600 dark:text-violet-400 text-sm font-medium mb-6">
                        <BookOpen className="w-4 h-4" />
                        {t("title")}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                        {t("subtitle")}
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        {t("description")}
                    </p>
                </header>

                {/* Blog Content */}
                {posts.length > 0 ? (
                    <BlogList posts={posts} categories={categories} />
                ) : (
                    <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                        <BookOpen className="w-16 h-16 mx-auto mb-6 text-neutral-300 dark:text-neutral-700" />
                        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                            {t("comingSoon")}
                        </h2>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                            {t("noArticles")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
