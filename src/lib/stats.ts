import { Redis } from "@upstash/redis";

// Keys for statistics
const STATS_KEYS = {
    CV_DOWNLOADS: "portfolio:stats:cv_downloads",
    PAGE_VIEWS: "portfolio:stats:page_views",
    UNIQUE_VISITORS: "portfolio:stats:unique_visitors",
};

const UNIQUE_VISITORS_TTL_SECONDS = 60 * 60 * 24 * 30;

let redis: Redis | null = null;

function getRedis(): Redis | null {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.warn("[Stats] Upstash Redis not configured");
        return null;
    }

    if (!redis) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }

    return redis;
}

/**
 * Increment CV downloads counter
 */
export async function incrementCVDownloads(): Promise<number> {
    const client = getRedis();
    if (!client) return 0;

    try {
        const count = await client.incr(STATS_KEYS.CV_DOWNLOADS);
        return count;
    } catch (error) {
        console.error("[Stats] Failed to increment CV downloads:", error);
        return 0;
    }
}

/**
 * Get CV downloads count
 */
export async function getCVDownloads(): Promise<number> {
    const client = getRedis();
    if (!client) return 0;

    try {
        const count = await client.get<number>(STATS_KEYS.CV_DOWNLOADS);
        return count || 0;
    } catch (error) {
        console.error("[Stats] Failed to get CV downloads:", error);
        return 0;
    }
}

/**
 * Increment page views counter
 */
export async function incrementPageViews(): Promise<number> {
    const client = getRedis();
    if (!client) return 0;

    try {
        const count = await client.incr(STATS_KEYS.PAGE_VIEWS);
        return count;
    } catch (error) {
        console.error("[Stats] Failed to increment page views:", error);
        return 0;
    }
}

/**
 * Get page views count
 */
export async function getPageViews(): Promise<number> {
    const client = getRedis();
    if (!client) return 0;

    try {
        const count = await client.get<number>(STATS_KEYS.PAGE_VIEWS);
        return count || 0;
    } catch (error) {
        console.error("[Stats] Failed to get page views:", error);
        return 0;
    }
}

/**
 * Track unique visitor (using IP hash for privacy)
 */
export async function trackVisitor(visitorId: string): Promise<boolean> {
    const client = getRedis();
    if (!client) return false;

    try {
        // Use a Set to track unique visitors
        const added = await client.sadd(STATS_KEYS.UNIQUE_VISITORS, visitorId);
        await client.expire(STATS_KEYS.UNIQUE_VISITORS, UNIQUE_VISITORS_TTL_SECONDS);
        return added === 1;
    } catch (error) {
        console.error("[Stats] Failed to track visitor:", error);
        return false;
    }
}

/**
 * Get unique visitors count
 */
export async function getUniqueVisitors(): Promise<number> {
    const client = getRedis();
    if (!client) return 0;

    try {
        const count = await client.scard(STATS_KEYS.UNIQUE_VISITORS);
        return count;
    } catch (error) {
        console.error("[Stats] Failed to get unique visitors:", error);
        return 0;
    }
}

/**
 * Get all statistics
 */
export async function getAllStats(): Promise<{
    cvDownloads: number;
    pageViews: number;
    uniqueVisitors: number;
}> {
    const [cvDownloads, pageViews, uniqueVisitors] = await Promise.all([
        getCVDownloads(),
        getPageViews(),
        getUniqueVisitors(),
    ]);

    return {
        cvDownloads,
        pageViews,
        uniqueVisitors,
    };
}
