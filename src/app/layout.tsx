import "./globals.css";
import { Outfit, Cormorant_Garamond } from "next/font/google";

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

// Root layout - provides required html/body structure for Next.js 16+
// The [locale] segment provides the content with providers
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html className={`${outfit.variable} ${cormorant.variable}`} suppressHydrationWarning>
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
