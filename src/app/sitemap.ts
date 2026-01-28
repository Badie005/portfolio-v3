import { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { routing } from "@/i18n/routing";

export const runtime = "nodejs";
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
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

  // TODO: Ajouter les articles de blog dynamiquement
  const blogPages: MetadataRoute.Sitemap = routing.locales.flatMap((locale) => {
    const blogPosts = getAllPostSlugs(locale)
      .map((slug) => {
        const post = getPostBySlug(slug, locale);
        if (!post) return null;

        return {
          slug,
          lastModified: new Date(post.updatedAt || post.date),
        };
      })
      .filter((post): post is { slug: string; lastModified: Date } => post !== null);

    return blogPosts.map((post) => ({
      url: toUrl(`/blog/${post.slug}`, locale),
      lastModified: post.lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  });
  // const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
  //   url: `${baseUrl}/blog/${post.slug}`,
  //   lastModified: new Date(post.updatedAt),
  //   changeFrequency: "monthly" as const,
  //   priority: 0.7,
  // }));

  return [...mainPages, ...projectPages, ...blogPages];
}
