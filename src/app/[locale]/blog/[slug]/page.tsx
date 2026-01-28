import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { getPostBySlug, getAllPostSlugs } from "@/lib/blog";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import { MDXContent } from "@/components/blog/MDXContent";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

interface PageProps {
    params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
    return routing.locales.flatMap((locale) => {
        const slugs = getAllPostSlugs(locale);
        return slugs.map((slug) => ({ locale, slug }));
    });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale, namespace: "blog" });
    const post = getPostBySlug(slug, locale);

    if (!post) {
        return { title: t("notFoundTitle") };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://abdelbadie-khoubiza.com";

    return {
        title: post.title,
        description: post.description,
        authors: [{ name: post.author }],
        openGraph: {
            title: post.title,
            description: post.description,
            type: "article",
            publishedTime: post.date,
            modifiedTime: post.updatedAt,
            authors: [post.author],
            tags: post.tags,
            images: [{
                url: post.image || `${siteUrl}/api/og?type=blog&title=${encodeURIComponent(post.title)}`,
                width: 1200,
                height: 630,
                alt: post.title,
            }],
        },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const t = await getTranslations({ locale, namespace: "blog" });
    const post = getPostBySlug(slug, locale);
    if (!post) notFound();

    // Get nonce for CSP compliance
    let nonce: string | undefined;
    try {
        nonce = (await headers()).get("x-nonce") || undefined;
    } catch {
        nonce = undefined;
    }

    const formattedDate = new Date(post.date).toLocaleDateString(
        locale === "en" ? "en-US" : "fr-FR",
        { year: "numeric", month: "long", day: "numeric" }
    );

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        author: { "@type": "Person", name: post.author },
        datePublished: post.date,
        dateModified: post.updatedAt || post.date,
        image: post.image,
        keywords: post.tags.join(", "),
        inLanguage: locale,
    };

    const backText = t("backToBlog");
    const authorDesc = t("authorDescription");

    return (
        <>
            <script
                type="application/ld+json"
                nonce={nonce}
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <article className="min-h-screen py-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-neutral-500 hover:text-orange-500 transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {backText}
                    </Link>

                    <header className="mb-12">
                        <span className="inline-block px-3 py-1 text-sm font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full mb-4">
                            {post.category}
                        </span>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-neutral-500 text-sm">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {formattedDate}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {post.readingTime} {t("readingTime")}
                            </span>
                        </div>
                    </header>

                    {post.image && (
                        <div className="relative aspect-video rounded-2xl overflow-hidden mb-12">
                            <Image src={post.image} alt={post.title} fill className="object-cover" priority sizes="800px" />
                        </div>
                    )}

                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <MDXContent content={post.content} />
                    </div>

                    {post.tags.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Tag className="w-4 h-4 text-neutral-400" />
                                {post.tags.map((tag) => (
                                    <span key={tag} className="px-3 py-1 text-sm bg-neutral-100 dark:bg-neutral-800 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-12 p-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                                A
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{post.author}</h3>
                                <p className="text-sm text-neutral-500">{authorDesc}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </>
    );
}
