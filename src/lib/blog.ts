import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { unstable_cache } from "next/cache";

export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    date: string;
    updatedAt?: string;
    author: string;
    image?: string;
    coverImage?: string;
    tags: string[];
    category: string;
    content: string;
    readingTime: number;
    published: boolean;
    translationKey?: string;
}

export interface BlogPostMeta {
    slug: string;
    title: string;
    description: string;
    date: string;
    author: string;
    image?: string;
    tags: string[];
    category: string;
    readingTime: number;
    published: boolean;
    translationKey?: string;
}

const BLOG_BASE_DIR = path.join(process.cwd(), "content/blog");

const getBlogDir = (locale: string): string => {
    const localeDir = path.join(BLOG_BASE_DIR, locale);
    if (fs.existsSync(localeDir)) {
        return localeDir;
    }
    return BLOG_BASE_DIR;
};

/**
 * Internal function to get all blog posts metadata (without content)
 */
function getAllPostsInternal(locale: string = "fr"): BlogPostMeta[] {
    const blogDir = getBlogDir(locale);

    // Check if blog directory exists
    if (!fs.existsSync(blogDir)) {
        return [];
    }

    const files = fs.readdirSync(blogDir).filter((file) => file.endsWith(".mdx"));

    const posts = files
        .map((file) => {
            const slug = file.replace(/\.mdx$/, "");
            const filePath = path.join(blogDir, file);
            const fileContent = fs.readFileSync(filePath, "utf-8");
            const { data, content } = matter(fileContent);

            // Skip unpublished posts in production
            if (process.env.NODE_ENV === "production" && data.published === false) {
                return null;
            }

            const stats = readingTime(content);
            const readingMinutes = Math.max(1, Math.ceil(stats.minutes));

            return {
                slug,
                title: data.title || "Untitled",
                description: data.description || "",
                date: data.date || new Date().toISOString(),
                author: data.author || "Abdelbadie Khoubiza",
                image: data.image || null,
                tags: data.tags || [],
                category: data.category || (locale === "en" ? "General" : "Général"),
                readingTime: readingMinutes,
                published: data.published !== false,
                translationKey: data.translationKey,
            } as BlogPostMeta;
        })
        .filter((post): post is BlogPostMeta => post !== null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
}

/**
 * Get all blog posts metadata (without content) - cached by locale
 */
export async function getAllPosts(locale: string = "fr"): Promise<BlogPostMeta[]> {
    // Use unstable_cache to ensure proper caching by locale
    // This prevents cache collisions between different locales
    const cachedGetPosts = unstable_cache(
        async () => getAllPostsInternal(locale),
        [`posts-${locale}`],
        { tags: [`posts-${locale}`, `locale-${locale}`] }
    );

    // Call the cached function - in Server Components this will be cached per locale
    return cachedGetPosts();
}

/**
 * Internal function to get a single blog post by slug (with content)
 */
function getPostBySlugInternal(slug: string, locale: string = "fr"): BlogPost | null {
    const blogDir = getBlogDir(locale);
    const filePath = path.join(blogDir, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    // Skip unpublished posts in production
    if (process.env.NODE_ENV === "production" && data.published === false) {
        return null;
    }

    const stats = readingTime(content);
    const readingMinutes = Math.max(1, Math.ceil(stats.minutes));

    return {
        slug,
        title: data.title || "Untitled",
        description: data.description || "",
        date: data.date || new Date().toISOString(),
        updatedAt: data.updatedAt,
        author: data.author || "Abdelbadie Khoubiza",
        image: data.image || null,
        coverImage: data.coverImage || null,
        tags: data.tags || [],
        category: data.category || (locale === "en" ? "General" : "Général"),
        content,
        readingTime: readingMinutes,
        published: data.published !== false,
        translationKey: data.translationKey,
    };
}

/**
 * Get a single blog post by slug (with content) - cached by locale and slug
 */
export async function getPostBySlug(slug: string, locale: string = "fr"): Promise<BlogPost | null> {
    const cachedGetPost = unstable_cache(
        async () => getPostBySlugInternal(slug, locale),
        [`post-${locale}-${slug}`],
        { tags: [`post-${locale}-${slug}`, `posts-${locale}`, `locale-${locale}`] }
    );

    return cachedGetPost();
}

/**
 * Internal function to get all post slugs for static generation
 */
function getAllPostSlugsInternal(locale: string = "fr"): string[] {
    const blogDir = getBlogDir(locale);

    if (!fs.existsSync(blogDir)) {
        return [];
    }

    return fs
        .readdirSync(blogDir)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => file.replace(/\.mdx$/, ""));
}

/**
 * Get all post slugs for static generation - cached by locale
 */
export async function getAllPostSlugs(locale: string = "fr"): Promise<string[]> {
    const cachedGetSlugs = unstable_cache(
        async () => getAllPostSlugsInternal(locale),
        [`slugs-${locale}`],
        { tags: [`slugs-${locale}`, `posts-${locale}`, `locale-${locale}`] }
    );

    return cachedGetSlugs();
}

/**
 * Check if a post exists in a specific locale
 */
export function postExists(slug: string, locale: string): boolean {
    const blogDir = getBlogDir(locale);
    const filePath = path.join(blogDir, `${slug}.mdx`);
    return fs.existsSync(filePath);
}

/**
 * Get the translation of an article by translationKey
 * Returns the post metadata in the target locale, or null if not found
 */
export function getTranslation(translationKey: string, targetLocale: string): BlogPostMeta | null {
    const blogDir = getBlogDir(targetLocale);

    if (!fs.existsSync(blogDir)) {
        return null;
    }

    const files = fs.readdirSync(blogDir).filter((file) => file.endsWith(".mdx"));

    for (const file of files) {
        const filePath = path.join(blogDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(fileContent);

        if (data.translationKey === translationKey) {
            const slug = file.replace(/\.mdx$/, "");
            const stats = readingTime(content);
            const readingMinutes = Math.max(1, Math.ceil(stats.minutes));

            return {
                slug,
                title: data.title || "Untitled",
                description: data.description || "",
                date: data.date || new Date().toISOString(),
                author: data.author || "Abdelbadie Khoubiza",
                image: data.image || null,
                tags: data.tags || [],
                category: data.category || (targetLocale === "en" ? "General" : "Général"),
                readingTime: readingMinutes,
                published: data.published !== false,
                translationKey: data.translationKey,
            };
        }
    }

    return null;
}

/**
 * Get all available locales for a translationKey
 * Returns an array of locale codes where this translationKey exists
 */
export function getAvailableLocales(translationKey: string): string[] {
    const locales: string[] = [];
    const allLocales = ["fr", "en"]; // Supported locales

    for (const locale of allLocales) {
        const translation = getTranslation(translationKey, locale);
        if (translation) {
            locales.push(locale);
        }
    }

    return locales;
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(category: string, locale: string = "fr"): Promise<BlogPostMeta[]> {
    const posts = await getAllPosts(locale);
    return posts.filter(
        (post) => post.category.toLowerCase() === category.toLowerCase()
    );
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(tag: string, locale: string = "fr"): Promise<BlogPostMeta[]> {
    const posts = await getAllPosts(locale);
    return posts.filter((post) =>
        post.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
    );
}

/**
 * Get all unique categories
 */
export async function getAllCategories(locale: string = "fr"): Promise<string[]> {
    const posts = await getAllPosts(locale);
    const categories = new Set(posts.map((post) => post.category));
    return Array.from(categories);
}

/**
 * Get all unique tags
 */
export async function getAllTags(locale: string = "fr"): Promise<string[]> {
    const posts = await getAllPosts(locale);
    const tags = new Set(posts.flatMap((post) => post.tags));
    return Array.from(tags);
}
