import type { Metadata } from "next";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { headers } from "next/headers";
import { ClientLayout } from "@/components/ClientLayout";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";


const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Abdelbadie Khoubiza | Développeur Full-Stack React & Node.js - Portfolio B.DEV",
    template: "%s | B.DEV",
  },
  description:
    "Abdelbadie Khoubiza - Développeur Full-Stack spécialisé React, Next.js, Node.js et Laravel. Création d'applications web performantes à Fès, Maroc. Découvrez mon portfolio de projets professionnels.",
  keywords: [
    "Full-Stack Developer",
    "React",
    "Node.js",
    "Laravel",
    "TypeScript",
    "Next.js",
    "Maroc",
    "Fès",
    "USMBA",
    "Développeur Web",
    "B.DEV",
    "B.411",
  ],
  authors: [{ name: "Abdelbadie Khoubiza" }],
  creator: "Abdelbadie Khoubiza",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon-light.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
    ],
    apple: [
      { url: "/logo/SVG/Logo-B.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon-dark.svg",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    siteName: "B.DEV × B.411 Portfolio",
    title: "B.DEV - Full-Stack Developer",
    description:
      "Portfolio professionnel d'un développeur Full-Stack basé à Fès, Maroc",
    images: [
      {
        url: "/logo/SVG/Logo-B.svg",
        width: 1200,
        height: 630,
        alt: "B.DEV × B.411 Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "B.DEV - Full-Stack Developer",
    description: "Portfolio professionnel d'un développeur Full-Stack",
    images: ["/logo/SVG/Logo-B.svg"],
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
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://abdelbadie-khoubiza.com";
  const nonce = (await headers()).get("x-nonce") || undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Abdelbadie Khoubiza",
    url: siteUrl,
    jobTitle: "Full-Stack Developer",
    description:
      "Full-Stack Developer spécialisé en React, Node.js et Laravel. Développement d'applications web performantes et évolutives.",
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
    knowsAbout: [
      "React",
      "Next.js",
      "Node.js",
      "Laravel",
      "TypeScript",
      "JavaScript",
      "PHP",
      "MySQL",
      "MongoDB",
      "Tailwind CSS",
    ],
  };

  return (
    <html lang="fr" className={`${outfit.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#171717" />
      </head>
      <body className="antialiased" style={{ backgroundColor: '#FAFAFA' }} suppressHydrationWarning>
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Skip Link for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand text-brand-foreground px-4 py-2 rounded-lg z-[100] focus:outline-none focus:ring-2 focus:ring-ide-accent"
        >
          Aller au contenu principal
        </a>

        {/* Gradient blob - fixed background */}
        <div
          className="fixed -left-32 -bottom-32 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-orange-300 via-rose-200 to-amber-100 blur-3xl pointer-events-none animate-blob-breathe"
          style={{ zIndex: 0 }}
          aria-hidden="true"
        />

        <ClientLayout>
          <Navigation />
          <main id="main-content" className="min-h-screen relative z-10">{children}</main>
          <Footer />
        </ClientLayout>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
