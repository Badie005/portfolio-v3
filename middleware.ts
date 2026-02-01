import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { incrementPageViews, trackVisitor } from "@/lib/stats";

// Create the intl middleware
const intlMiddleware = createIntlMiddleware(routing);

const VISITOR_COOKIE_NAME = "bdev_vid";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function setRequestNonce(response: NextResponse, nonce: string): void {
  response.headers.set("x-middleware-request-x-nonce", nonce);

  const existing = response.headers.get("x-middleware-override-headers");
  const keys = existing
    ? existing
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
    : [];

  if (!keys.includes("x-nonce")) {
    keys.push("x-nonce");
  }

  response.headers.set("x-middleware-override-headers", keys.join(","));
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function generateVisitorId(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function isBot(userAgent: string): boolean {
  return /bot|crawler|spider|crawling|slurp|facebookexternalhit|whatsapp|telegrambot|discordbot|linkedinbot|twitterbot/i.test(userAgent);
}

function shouldTrackPageView(req: NextRequest): boolean {
  if (req.method !== "GET") return false;
  if (req.headers.get("x-middleware-prefetch")) return false;
  if (req.headers.get("next-router-prefetch")) return false;

  const purpose = req.headers.get("purpose") || req.headers.get("sec-purpose");
  if (purpose === "prefetch") return false;

  const accept = req.headers.get("accept") || "";
  const isDocumentRequest = accept.includes("text/html");
  const isRscNavigationRequest =
    accept.includes("text/x-component") || req.headers.get("rsc") === "1";

  if (!isDocumentRequest && !isRscNavigationRequest) return false;

  const userAgent = req.headers.get("user-agent") || "";
  if (isBot(userAgent)) return false;

  return true;
}

function addSecurityHeaders(response: NextResponse, nonce: string, isDev: boolean): void {
  // Build CSP directives
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "https://va.vercel-scripts.com",
    isDev ? "'unsafe-eval'" : "",
    isDev ? "'unsafe-inline'" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const connectSrc = [
    "'self'",
    "https://*.upstash.io",
    "https://*.upstash.com",
    "https://api.resend.com",
    "https://vitals.vercel-insights.com",
    "https://va.vercel-scripts.com",
    "https://*.sentry.io",
    isDev ? "ws:" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const workerSrc = ["'self'"].join(" ");

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "media-src 'self'",
    `connect-src ${connectSrc}`,
    `worker-src ${workerSrc}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  // Security Headers
  response.headers.set("Content-Security-Policy", csp);

  // HSTS - Only in production
  if (!isDev) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
}

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const nonce = generateNonce();
  const isDev = process.env.NODE_ENV !== "production";
  const { pathname } = req.nextUrl;

  // Skip i18n for API routes, static files, and special paths
  const shouldSkipIntl =
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/_vercel/") ||
    pathname.startsWith("/monitoring") ||
    pathname.includes(".");

  if (shouldSkipIntl) {
    // Just apply security headers
    const res = NextResponse.next();
    setRequestNonce(res, nonce);

    addSecurityHeaders(res, nonce, isDev);
    return res;
  }

  // Apply intl middleware for pages
  const intlResponse = intlMiddleware(req);

  // Get the locale that was determined by next-intl middleware
  const locale = intlResponse.headers.get("x-next-intl-locale") || routing.defaultLocale;

  // Add locale header for server components
  intlResponse.headers.set("x-next-intl-locale", locale);

  // Add pathname header for locale resolution in layouts
  intlResponse.headers.set("x-pathname", pathname);
  const existingOverride = intlResponse.headers.get("x-middleware-override-headers") || "";
  const overrideKeys = existingOverride.split(",").map(k => k.trim()).filter(Boolean);
  if (!overrideKeys.includes("x-pathname")) {
    overrideKeys.push("x-pathname");
  }
  if (!overrideKeys.includes("x-next-intl-locale")) {
    overrideKeys.push("x-next-intl-locale");
  }
  intlResponse.headers.set("x-middleware-override-headers", overrideKeys.join(","));

  // Add nonce to request headers
  setRequestNonce(intlResponse, nonce);

  // Add security headers to the response
  addSecurityHeaders(intlResponse, nonce, isDev);

  const hasRedisConfig = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );

  if (hasRedisConfig && shouldTrackPageView(req) && !intlResponse.headers.has("location")) {
    const existingVisitorId = req.cookies.get(VISITOR_COOKIE_NAME)?.value;
    const visitorId = existingVisitorId || generateVisitorId();

    if (!existingVisitorId) {
      intlResponse.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        secure: !isDev,
        path: "/",
        maxAge: VISITOR_COOKIE_MAX_AGE,
      });
    }

    event.waitUntil(
      Promise.all([incrementPageViews(), trackVisitor(visitorId)])
    );
  }

  return intlResponse;
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|mp4|pdf|json|xml|txt|html)).*)",
  ],
};
