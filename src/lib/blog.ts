import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    date: string;
    updatedAt?: string;
    author: string;
    image?: string;
    tags: string[];
    category: string;
    content: string;
    readingTime: number;
    published: boolean;
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
 * Get all blog posts metadata (without content)
 */
export function getAllPosts(locale: string = "fr"): BlogPostMeta[] {
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
            } as BlogPostMeta;
        })
        .filter((post): post is BlogPostMeta => post !== null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
}

/**
 * Get a single blog post by slug (with content)
 */
export function getPostBySlug(slug: string, locale: string = "fr"): BlogPost | null {
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
        tags: data.tags || [],
        category: data.category || (locale === "en" ? "General" : "Général"),
        content,
        readingTime: readingMinutes,
        published: data.published !== false,
    };
}

/**
 * Get all post slugs for static generation
 */
export function getAllPostSlugs(locale: string = "fr"): string[] {
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
 * Get posts by category
 */
export function getPostsByCategory(category: string, locale: string = "fr"): BlogPostMeta[] {
    return getAllPosts(locale).filter(
        (post) => post.category.toLowerCase() === category.toLowerCase()
    );
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tag: string, locale: string = "fr"): BlogPostMeta[] {
    return getAllPosts(locale).filter((post) =>
        post.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
    );
}

/**
 * Get all unique categories
 */
export function getAllCategories(locale: string = "fr"): string[] {
    const posts = getAllPosts(locale);
    const categories = new Set(posts.map((post) => post.category));
    return Array.from(categories);
}

/**
 * Get all unique tags
 */
export function getAllTags(locale: string = "fr"): string[] {
    const posts = getAllPosts(locale);
    const tags = new Set(posts.flatMap((post) => post.tags));
    return Array.from(tags);
}
