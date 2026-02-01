import { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { routing } from "@/i18n/routing";

export const runtime = "nodejs";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://abdelbadie-khoubiza.com").replace(/\/$/, "");

  const toUrl = (pathname: string, locale: string) => {
    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

    if (locale === routing.defaultLocale) {
      return `${baseUrl}${normalizedPath}`;
    }

    if (normalizedPath === "/") {
      return `${baseUrl}/${locale}`;
    }

    return `${baseUrl}/${locale}${normalizedPath}`;
  };

  // Pages principales
  const mainPages: MetadataRoute.Sitemap = routing.locales.flatMap((locale) => [
    {
      url: toUrl("/", locale),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: toUrl("/projects", locale),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: toUrl("/blog", locale),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: toUrl("/stats", locale),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
  ]);

  // Pages projets individuelles générées dynamiquement
  const projectPages: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    projects.map((project) => ({
      url: toUrl(`/projects/${project.id}`, locale),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  // Articles de blog dynamiquement
  const blogPages: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    const slugs = await getAllPostSlugs(locale);
    const blogPosts = await Promise.all(
      slugs.map(async (slug) => {
        const post = await getPostBySlug(slug, locale);
        if (!post) return null;

        return {
          slug,
          lastModified: new Date(post.updatedAt || post.date),
        };
      })
    );

    const validPosts = blogPosts.filter((post): post is { slug: string; lastModified: Date } => post !== null);

    for (const post of validPosts) {
      blogPages.push({
        url: toUrl(`/blog/${post.slug}`, locale),
        lastModified: post.lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      });
    }
  }

  return [...mainPages, ...projectPages, ...blogPages];
}
