import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
    try {
        // Path to CV file
        const cvPath = path.join(process.cwd(), "public", "CV.pdf");

        // Check if file exists
        try {
            await fs.access(cvPath);
        } catch {
            return NextResponse.json(
                { error: "CV not found" },
                { status: 404 }
            );
        }

        // Read the file
        const fileBuffer = await fs.readFile(cvPath);

        // Track the download
        // await incrementCVDownloads();

        // Get filename from query or use default
        const searchParams = request.nextUrl.searchParams;
        const filename = searchParams.get("name") || "Abdelbadie_Khoubiza_CV.pdf";

        // Return the file with appropriate headers
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Length": fileBuffer.length.toString(),
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error) {
        console.error("[CV API] Download failed:", error);
        return NextResponse.json(
            { error: "Failed to download CV" },
            { status: 500 }
        );
    }
}
