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
        <div className="min-h-screen">
            <section className="pt-32 pb-24 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header - Anthropic Style: Title left, Description right */}
                    <header className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-16 mb-16 lg:mb-20">
                        <div>
                            <h1
                                className="text-4xl md:text-5xl lg:text-6xl tracking-tight text-ide-text"
                                style={{ fontFamily: "'Saans', sans-serif", fontWeight: 500 }}
                            >
                                {t("subtitle")}
                            </h1>
                        </div>
                        <div className="lg:pt-2">
                            <p
                                className="text-xl lg:text-2xl text-ide-text leading-relaxed mb-6"
                                style={{ fontFamily: "'Saans', sans-serif" }}
                            >
                                {t("description")}
                            </p>

                            {/* Category links inline */}
                            {categories.length > 0 && (
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                                    <span className="text-ide-muted font-medium">Topics:</span>
                                    {categories.map((category, index) => (
                                        <span key={category} className="flex items-center">
                                            <span className="text-ide-text underline underline-offset-4 decoration-ide-border hover:decoration-ide-accent cursor-pointer transition-colors">
                                                {category}
                                            </span>
                                            {index < categories.length - 1 && (
                                                <span className="text-ide-border ml-2">·</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </header>



                    {/* Blog Content */}
                    {posts.length > 0 ? (
                        <BlogList key={locale} posts={posts} />
                    ) : (
                        <div className="text-center py-20">
                            <BookOpen className="w-12 h-12 mx-auto mb-6 text-ide-border" />
                            <h2
                                className="text-2xl text-ide-text mb-2"
                                style={{ fontFamily: "'Saans', sans-serif", fontWeight: 500 }}
                            >
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
