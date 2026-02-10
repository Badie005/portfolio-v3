import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { getPostBySlug, getAllPostSlugs, getTranslation, getAvailableLocales } from "@/lib/blog";
import { Tag } from "lucide-react";
import { MDXContent } from "@/components/blog/MDXContent";
import { ArticleLanguageSwitcher } from "@/components/blog/ArticleLanguageSwitcher";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// Force dynamic rendering to ensure locale-specific data is fetched correctly
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
    params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
    const params = [];
    for (const locale of routing.locales) {
        const slugs = await getAllPostSlugs(locale);
        for (const slug of slugs) {
            params.push({ locale, slug });
        }
    }
    return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale, namespace: "blog" });
    const post = await getPostBySlug(slug, locale);

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
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.description,
            images: [post.image || `${siteUrl}/api/og?type=blog&title=${encodeURIComponent(post.title)}`],
        },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const t = await getTranslations({ locale, namespace: "blog" });
    const post = await getPostBySlug(slug, locale);

    // If post not found in current locale, check if it exists in other locales
    // (handles case where user manually changes /en/blog/welcome to /fr/blog/welcome)
    if (!post) {
        // Check all other locales for a post with this slug
        const otherLocales = routing.locales.filter((loc) => loc !== locale);

        for (const otherLocale of otherLocales) {
            const postInOtherLocale = await getPostBySlug(slug, otherLocale);
            if (postInOtherLocale?.translationKey) {
                // Found in another locale, get the translation in current locale
                const translation = getTranslation(postInOtherLocale.translationKey, locale);
                if (translation) {
                    // Redirect to the correct localized URL with locale prefix
                    redirect(`/${locale}/blog/${translation.slug}`);
                }
            }
        }

        notFound();
    }

    // Get available translations if this post has a translationKey
    const translations = post.translationKey
        ? getAvailableLocales(post.translationKey)
            .map((loc) => {
                const translation = getTranslation(post.translationKey!, loc);
                return translation ? { locale: loc, slug: translation.slug, title: translation.title } : null;
            })
            .filter((t): t is { locale: string; slug: string; title: string } => t !== null)
        : [];

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

    const authorDesc = t("authorDescription");
    const heroImage = post.coverImage || post.image;

    return (
        <>
            <script
                type="application/ld+json"
                nonce={nonce}
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <article className="min-h-screen relative overflow-hidden bg-surface-1">
                <section className="pt-24 pb-24 px-6 relative z-10">
                    {/* Back Link */}
                    <div className="max-w-[1400px] mx-auto mb-10">
                        <Link
                            href="/blog"
                            className="block font-sans text-base font-semibold text-ide-text hover:text-ide-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ide-accent/40 rounded-md"
                        >
                            Blog technique
                        </Link>
                    </div>

                    {/* ===== COMPONENT 1: Article Header (80% viewport width) ===== */}
                    <header className="max-w-[1400px] mx-auto mb-20 lg:mb-24">
                        {/* Breadcrumb */}
                        <div className="mb-10">
                            <span className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-mono font-medium uppercase tracking-wider text-ide-muted bg-surface-2 border border-ide-border rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-ide-accent" />
                                {post.category}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[380px_1fr] gap-8 lg:gap-x-16 items-start">
                            <div className="relative w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] lg:w-[280px] lg:h-[280px] xl:w-[380px] xl:h-[380px] overflow-hidden rounded-2xl border border-ide-border bg-surface-2 shadow-sm">
                                {heroImage ? (
                                    <Image
                                        src={heroImage}
                                        alt={post.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1023px) 180px, (max-width: 1279px) 280px, 380px"
                                        priority
                                        quality={90}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="grid grid-cols-3 gap-4">
                                            <span className="w-3 h-3 rounded-full bg-ide-border/60" />
                                            <span className="w-3 h-3 rounded-full bg-ide-border/50" />
                                            <span className="w-3 h-3 rounded-full bg-ide-border/60" />
                                            <span className="w-3 h-3 rounded-full bg-ide-border/50" />
                                            <span className="w-3 h-3 rounded-full bg-ide-accent/70" />
                                            <span className="w-3 h-3 rounded-full bg-ide-border/50" />
                                            <span className="w-3 h-3 rounded-full bg-ide-border/60" />
                                            <span className="w-3 h-3 rounded-full bg-ide-border/50" />
                                            <span className="w-3 h-3 rounded-full bg-ide-border/60" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-1">
                                <h1
                                    className="text-3xl md:text-4xl lg:text-[3.25rem] tracking-tight text-ide-text leading-[1.12] text-pretty"
                                    style={{ fontFamily: "'Saans', sans-serif", fontWeight: 500 }}
                                >
                                    {post.title}
                                </h1>
                            </div>
                        </div>

                        <div className="border-t border-ide-border/60 mt-12 mb-10" />

                        {/* Date + Description Grid (like Anthropic) */}
                        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[380px_1fr] gap-4 lg:gap-x-16">
                            {/* Date (left column on desktop) */}
                            <div className="text-sm text-ide-muted space-y-2 leading-relaxed" style={{ fontFamily: "'Saans', sans-serif" }}>
                                <p>
                                    {t("publishedOn")} {formattedDate}
                                </p>
                                <p className="font-mono text-[11px] font-medium uppercase tracking-wider">
                                    {post.readingTime} {t("readingTime")}
                                </p>
                            </div>

                            {/* Description (right column, larger) */}
                            <p className="text-xl lg:text-2xl text-ide-text leading-[1.6] text-pretty" style={{ fontFamily: "'Saans', sans-serif" }}>
                                {post.description}
                            </p>
                        </div>
                    </header>

                    {/* ===== COMPONENT 2: Article Content ===== */}
                    {/* Content starts at same left offset as description (after illustration column) */}
                    <div className="max-w-[1400px] mx-auto">
                        <div className="lg:pl-[calc(280px+4rem)] xl:pl-[calc(380px+4rem)]">
                            <div className="max-w-[68ch]">
                                <MDXContent content={post.content} />

                                {post.tags.length > 0 && (
                                    <div className="mt-14 pt-8 border-t border-ide-border/60">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Tag className="w-4 h-4 text-ide-muted" />
                                            {post.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 text-xs font-mono font-medium uppercase tracking-wider bg-surface-2 border border-ide-border text-ide-muted rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Language Switcher */}
                                {translations.length > 1 && (
                                    <div className="mt-8">
                                        <ArticleLanguageSwitcher translations={translations} />
                                    </div>
                                )}

                                <div className="mt-14">
                                    <div className="relative p-6 rounded-2xl bg-surface-2/50 border border-ide-border overflow-hidden">
                                        <div
                                            className="absolute inset-0 opacity-[0.07] dark:opacity-[0.05] text-ide-border"
                                            style={{
                                                backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
                                                backgroundSize: "24px 24px",
                                            }}
                                        />

                                        <div className="relative z-10 flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-surface-1 border border-ide-border flex items-center justify-center overflow-hidden">
                                                <Image
                                                    src="/logo/SVG/Mini_BDEV_Logo_B.svg"
                                                    alt="B.DEV"
                                                    width={40}
                                                    height={40}
                                                    className="object-contain"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-heading font-semibold text-ide-text">{post.author}</h3>
                                                <p className="text-sm text-ide-muted">{authorDesc}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </article>
        </>
    );
}
