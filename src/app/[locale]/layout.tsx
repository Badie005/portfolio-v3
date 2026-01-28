import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { headers } from "next/headers";
import { ClientLayout } from "@/components/ClientLayout";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { WebVitals } from "@/components/WebVitals";
import { routing } from "@/i18n/routing";

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;

    const tMeta = await getTranslations({ locale, namespace: "meta" });

    return {
        metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
        title: {
            default: tMeta("title"),
            template: "%s | B.DEV",
        },
        description: tMeta("description"),
        keywords: tMeta.raw("keywords") as string[],
        authors: [{ name: "Abdelbadie Khoubiza" }],
        creator: "Abdelbadie Khoubiza",
        icons: {
            icon: [
                { url: "/favicon.ico", sizes: "32x32" },
                { url: "/favicon-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
                { url: "/favicon-light.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
            ],
            apple: [{ url: "/logo/SVG/Logo-B.svg", type: "image/svg+xml" }],
            shortcut: "/favicon-dark.svg",
        },
        openGraph: {
            type: "website",
            locale: locale === "en" ? "en_US" : "fr_FR",
            url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            siteName: "B.DEV × B.411 Portfolio",
            title: tMeta("openGraph.title"),
            description: tMeta("openGraph.description"),
            images: [{ url: "/api/og", width: 1200, height: 630, alt: "B.DEV Portfolio" }],
        },
        twitter: {
            card: "summary_large_image",
            title: tMeta("twitter.title"),
            description: tMeta("twitter.description"),
            images: ["/api/og"],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
        alternates: {
            canonical: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            languages: {
                en: "/",
                fr: "/fr",
            },
        },
    };
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    // Validate locale
    if (!routing.locales.includes(locale as "fr" | "en")) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    // Get messages for the current locale
    const messages = await getMessages();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://abdelbadie-khoubiza.com";

    const tCommon = await getTranslations({ locale, namespace: "common" });
    const tMeta = await getTranslations({ locale, namespace: "meta" });

    // Get nonce from headers (not available during static generation)
    let nonce: string | undefined;
    try {
        nonce = (await headers()).get("x-nonce") || undefined;
    } catch {
        // headers() throws during static generation, ignore
        nonce = undefined;
    }

    const jsonLdPerson = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Abdelbadie Khoubiza",
        url: siteUrl,
        jobTitle: tMeta("jsonLd.person.jobTitle"),
        description: tMeta("jsonLd.person.description"),
        email: "a.khoubiza.dev@gmail.com",
        address: {
            "@type": "PostalAddress",
            addressLocality: "Fès",
            addressCountry: "MA",
        },
        sameAs: [
            "https://github.com/Badie005",
            "https://linkedin.com/in/abdelbadie-khoubiza",
        ],
        knowsAbout: ["React", "Next.js", "Node.js", "Laravel", "TypeScript"],
    };

    const jsonLdWebsite = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: tMeta("jsonLd.website.name"),
        url: siteUrl,
        author: { "@type": "Person", name: "Abdelbadie Khoubiza" },
        inLanguage: locale,
    };

    return (
        <>
            {/* Script to set lang attribute dynamically based on locale */}
            <script
                nonce={nonce}
                dangerouslySetInnerHTML={{
                    __html: `document.documentElement.lang="${locale}";`,
                }}
            />

            <script
                type="application/ld+json"
                nonce={nonce}
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }}
            />
            <script
                type="application/ld+json"
                nonce={nonce}
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
            />

            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand text-brand-foreground px-4 py-2 rounded-lg z-[100] focus:outline-none focus:ring-2 focus:ring-ide-accent"
            >
                {tCommon("skipToContent")}
            </a>

            <div
                className="fixed -left-32 -bottom-32 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-orange-300 via-rose-200 to-amber-100 blur-3xl pointer-events-none animate-blob-breathe"
                style={{ zIndex: 0 }}
                aria-hidden="true"
            />

            <NextIntlClientProvider messages={messages}>
                <ClientLayout>
                    <Navigation />
                    <main id="main-content" className="min-h-screen relative z-10">
                        {children}
                    </main>
                    <Footer />
                </ClientLayout>
            </NextIntlClientProvider>

            <Toaster />
            <ServiceWorkerRegister />
            <WebVitals />
            <Analytics />
            <SpeedInsights />
        </>
    );
}
