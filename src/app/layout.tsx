import "./globals.css";
import { Cormorant_Garamond, IBM_Plex_Serif } from "next/font/google";
import { headers } from "next/headers";

// Saans is defined as a local font in globals.css (@font-face)
// We just need to set the CSS variable for it

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-blog",
});

// Root layout - provides required html/body structure for Next.js 16+
// The [locale] segment provides the content with providers
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get("x-next-intl-locale");
  const pathname = requestHeaders.get("x-pathname") || requestHeaders.get("x-middleware-request-x-pathname") || "";

  // Determine locale from header or pathname
  let locale: "en" | "fr" = "en";
  if (headerLocale === "fr" || headerLocale === "en") {
    locale = headerLocale;
  } else if (pathname.startsWith("/fr")) {
    locale = "fr";
  }

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${ibmPlexSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#171717" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#FAFAFA" media="(prefers-color-scheme: light)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="B.DEV" />
        <link rel="apple-touch-icon" href="/android-chrome-512x512.png" />
      </head>
      <body className="antialiased" style={{ backgroundColor: "#FAFAFA" }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
