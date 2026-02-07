import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getAllPosts, getAllCategories } from "@/lib/blog";
import { BlogList } from "@/components/blog/BlogList";
import { BookOpen } from "lucide-react";

// Force dynamic rendering to ensure locale-specific data is fetched correctly
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
            images: [{ url: "/api/og?type=blog&title=Blog", width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${t("title")} | B.DEV`,
            description: t("description"),
            images: ["/api/og?type=blog&title=Blog"],
        },
    };
}

export default async function BlogPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const t = await getTranslations({ locale, namespace: "blog" });
    const posts = await getAllPosts(locale);
    const categories = await getAllCategories(locale);

    return (
        <div className="min-h-screen relative overflow-hidden">
            <section className="pt-32 pb-24 px-6 relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Header - Editorial Style */}
                    <header className="mb-16">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold tracking-tight text-ide-text mb-4">
                            {t("subtitle")}
                        </h1>
                        <p className="text-lg text-ide-muted max-w-2xl">
                            {t("description")}
                        </p>
                    </header>

                    {/* Separator */}
                    <div className="border-t border-ide-border mb-12" />

                    {/* Blog Content */}
                    {posts.length > 0 ? (
                        <BlogList key={locale} posts={posts} categories={categories} />
                    ) : (
                        <div className="text-center py-20">
                            <BookOpen className="w-12 h-12 mx-auto mb-6 text-ide-border" />
                            <h2 className="text-2xl font-heading font-semibold text-ide-text mb-2">
                                {t("comingSoon")}
                            </h2>
                            <p className="text-ide-muted max-w-md mx-auto">
                                {t("noArticles")}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
