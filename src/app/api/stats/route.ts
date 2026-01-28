import { NextResponse } from "next/server";
import { getAllStats } from "@/lib/stats";

export const revalidate = 60; // Revalidate every minute

export async function GET() {
    try {
        const stats = await getAllStats();

        return NextResponse.json({
            success: true,
            data: {
                cvDownloads: stats.cvDownloads,
                pageViews: stats.pageViews,
                uniqueVisitors: stats.uniqueVisitors,
                lastUpdated: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("[Stats API] Failed to get stats:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch statistics" },
            { status: 500 }
        );
    }
}
