# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Type checking (runs separately from build)
npm run type-check

# Linting with ESLint
npm run lint

# Unit tests (Vitest)
npm run test                 # Run all tests once
npm run test -- path/to/test # Run single test file
npm run test:watch           # Watch mode
npm run test:coverage        # With coverage

# E2E tests (Playwright)
npm run test:e2e             # Headless
npm run test:e2e:ui          # With UI
npm run test:e2e -- tests/i18n.spec.ts  # Run single spec

# Bundle analysis
npm run analyze
```

## High-Level Architecture

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19
- **Styling**: Tailwind CSS v4 (see `src/app/globals.css` for theme variables)
- **Language**: TypeScript 5
- **I18n**: next-intl v4 with `localePrefix: "always"` (all locales have URL prefix)
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deployment**: Optimized for Vercel

### Internationalization (i18n) Architecture

The project uses a strict locale-prefix strategy (`/fr/`, `/en/` for all pages):

**Key Files:**

- `src/i18n/routing.ts` - Routing configuration with `localePrefix: "always"`
- `src/i18n/request.ts` - Locale validation and message loading
- `middleware.ts` - Handles locale detection, CSP nonces, and stats tracking
- `messages/fr.json` and `messages/en.json` - Translation dictionaries

**Critical Pattern:**

- Root pages (`/`, `/projects`) redirect to locale-prefixed versions (`/en`, `/en/projects`)
- The `(site)` route group contains both root redirects AND `[locale]` routes
- Always use the `Link` component from `@/i18n/navigation` (not next/link) for i18n-aware routing
- `usePathname()` from `@/i18n/navigation` returns pathname WITHOUT locale prefix

### Route Structure

```
src/app/
├── layout.tsx           # Root layout with font loading, locale detection from headers
├── (site)/              # Route group for site pages
│   ├── page.tsx         # Redirects / → /en (or default locale)
│   ├── projects/        # Root projects redirect
│   └── [locale]/        # Actual localized content
│       ├── page.tsx
│       ├── blog/
│       ├── projects/
│       └── stats/
└── api/                 # API routes
```

### Middleware Behavior

`middleware.ts` handles:

1. **i18n routing**: Via `next-intl/middleware` with `localePrefix: "always"`
2. **Security headers**: CSP with nonces, HSTS, X-Frame-Options, etc.
3. **Nonce generation**: For CSP script-src compliance (passed via headers to components)
4. **Stats tracking**: Page views via Upstash Redis (only when configured)
5. **Bot detection**: Excludes bots from tracking

**Important**: The middleware sets custom headers (`x-next-intl-locale`, `x-pathname`, `x-nonce`) used by server components for locale detection and CSP compliance.

### Content Management

**Blog Posts:**

- Stored in `content/blog/` as MDX files with locale subdirectories (`fr/`, `en/`)
- Posts are organized by locale: `content/blog/fr/bienvenue.mdx`, `content/blog/en/welcome.mdx`
- Frontmatter includes: `title`, `description`, `date`, `author`, `image`, `tags`, `category`, `published`
- `src/lib/blog.ts` provides `getAllPosts(locale)`, `getPostBySlug(slug, locale)`, `getPostsByCategory/category/tag`
- `src/components/blog/MDXContent.tsx` renders MDX with custom components

**Projects:**

- Data in `src/data/projects.ts` with separate arrays for `projectsFr` and `projectsEn`
- Type-safe project IDs with union type `ProjectId`
- Use `getProjects(locale)` and `getProjectById(id, locale)` for locale-aware access

### Styling System

Tailwind CSS v4 with custom theme variables defined in `src/app/globals.css`:

**Fonts:**

- `--font-body`: Outfit (sans-serif) - main UI text
- `--font-heading`: Cormorant Garamond (serif) - headings, hero text
- `--font-blog`: IBM Plex Serif (serif) - blog article content

**Theme Systems:**

- **IDE Theme**: Syntax highlighting colors (`ide-bg`, `ide-sidebar`, `ide-accent`, `ide-text`, `ide-keyword`, etc.) used in the interactive code window component
- **Surface Colors**: `--surface-1` (warm off-white), `--surface-2` (warm beige), `--brand` (warm black)
- **Neutral Palette**: Full neutral scale from 50-950
- **Dark Mode**: Full dark theme support via `.dark` class with inverted colors

### Testing Strategy

**Unit Tests (Vitest):**

- Located in `src/__tests__/`
- Component tests in `src/__tests__/components/`
- Library tests in `src/__tests__/lib/`
- Setup in `src/__tests__/setup.ts` mocks Next.js router, Image, Framer Motion, and browser APIs

**E2E Tests (Playwright):**

- Located in `e2e/`
- Key specs: `i18n.spec.ts`, `contact.spec.ts`, `api-chat.spec.ts`, `projects.spec.ts`
- Tests run against production build, requires `npm run build` first

**CI/CD Pipeline (`.github/workflows/ci.yml`):**

- Lint & Type Check → Unit Tests → Build → E2E Tests → Lighthouse CI → Deploy
- Parallel job execution for lint and test
- Security audit with npm audit and TruffleHog
- Automatic Vercel preview deployment on PRs
- Production deployment on main branch after all checks pass

### API Routes

Located in `src/app/api/`:

- `/api/contact` - Contact form submission via Resend with rate limiting
- `/api/chat` - AI chat endpoint using Gemini/OpenRouter with streaming
- `/api/stats` - Page view statistics from Upstash Redis
- `/api/og` - Dynamic Open Graph image generation
- `/api/cv` - CV download endpoint
- `/api/health` - Health check endpoint
- `/api/vitals` - Web Vitals reporting

All API routes should handle CORS and implement proper rate limiting where applicable.

### Environment Variables

Required for full functionality:

```bash
# Email (Resend)
RESEND_API_KEY=
FROM_EMAIL=
TO_EMAIL=

# AI APIs (for chat feature)
GOOGLE_AI_API_KEY=
OPENROUTER_API_KEY=

# Stats (Upstash Redis)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Monitoring (Sentry - optional)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Important Implementation Notes

1. **Always use i18n Link**: Import from `@/i18n/navigation`, not `next/link`
2. **Locale in URLs**: With `localePrefix: "always"`, all pages need `/fr/` or `/en/` prefix
3. **CSP Nonces**: Server components must read nonce from headers for inline scripts
4. **Image optimization**: Uses Next.js Image with WebP/AVIF formats
5. **Stats tracking**: Only works when Upstash Redis is configured; gracefully degrades otherwise
