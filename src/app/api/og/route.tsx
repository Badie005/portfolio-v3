import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Fallback font (system fonts)
const fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Get parameters from URL
        const title = searchParams.get("title") || "B.DEV Portfolio";
        const description = searchParams.get("description") || "Développeur Full-Stack";
        const type = searchParams.get("type") || "default"; // default, project, blog

        // Different templates based on type
        if (type === "project") {
            return new ImageResponse(
                (
                    <div
                        style={{
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#171717",
                            fontFamily,
                        }}
                    >
                        {/* Background gradient */}
                        <div
                            style={{
                                position: "absolute",
                                bottom: -100,
                                left: -100,
                                width: 400,
                                height: 400,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #f59e0b 100%)",
                                filter: "blur(80px)",
                                opacity: 0.5,
                            }}
                        />

                        {/* Content */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 60,
                                zIndex: 1,
                            }}
                        >
                            {/* Badge */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "8px 20px",
                                    backgroundColor: "rgba(249, 115, 22, 0.2)",
                                    borderRadius: 100,
                                    marginBottom: 24,
                                }}
                            >
                                <span style={{ color: "#f97316", fontSize: 18 }}>Projet</span>
                            </div>

                            {/* Title */}
                            <h1
                                style={{
                                    fontSize: 56,
                                    fontWeight: 700,
                                    color: "#FAFAFA",
                                    textAlign: "center",
                                    lineHeight: 1.2,
                                    marginBottom: 16,
                                    maxWidth: 900,
                                }}
                            >
                                {title}
                            </h1>

                            {/* Description */}
                            <p
                                style={{
                                    fontSize: 24,
                                    color: "#a3a3a3",
                                    textAlign: "center",
                                    maxWidth: 700,
                                }}
                            >
                                {description}
                            </p>

                            {/* Footer */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 40,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                }}
                            >
                                <span style={{ fontSize: 20, color: "#f97316", fontWeight: 600 }}>B.DEV</span>
                                <span style={{ fontSize: 20, color: "#525252" }}>×</span>
                                <span style={{ fontSize: 20, color: "#737373" }}>Abdelbadie Khoubiza</span>
                            </div>
                        </div>
                    </div>
                ),
                {
                    width: 1200,
                    height: 630,
                }
            );
        }

        if (type === "blog") {
            return new ImageResponse(
                (
                    <div
                        style={{
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#FDE8DC",
                            position: "relative",
                            overflow: "hidden",
                            fontFamily,
                        }}
                    >
                        {/* Background gradient */}
                        <div
                            style={{
                                position: "absolute",
                                top: 40,
                                left: 40,
                                right: 40,
                                bottom: 40,
                                borderRadius: 32,
                                border: "3px solid rgba(38, 37, 30, 0.12)",
                            }}
                        />

                        {/* Content */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                justifyContent: "center",
                                padding: 80,
                                zIndex: 1,
                                width: "100%",
                            }}
                        >
                            {/* Badge */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "8px 20px",
                                    backgroundColor: "rgba(205, 124, 91, 0.14)",
                                    border: "2px solid #CD7C5B",
                                    borderRadius: 100,
                                    marginBottom: 24,
                                }}
                            >
                                <span style={{ color: "#CD7C5B", fontSize: 18, fontWeight: 600 }}>Blog</span>
                            </div>

                            {/* Title */}
                            <h1
                                style={{
                                    fontSize: 52,
                                    fontWeight: 700,
                                    color: "#26251E",
                                    lineHeight: 1.3,
                                    marginBottom: 16,
                                    maxWidth: 900,
                                }}
                            >
                                {title}
                            </h1>

                            {/* Description */}
                            <p
                                style={{
                                    fontSize: 22,
                                    color: "#4A4A4A",
                                    maxWidth: 800,
                                    lineHeight: 1.5,
                                }}
                            >
                                {description}
                            </p>

                            {/* Footer */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 40,
                                    left: 80,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                }}
                            >
                                <span style={{ fontSize: 20, color: "#26251E", fontWeight: 700 }}>B.DEV</span>
                                <span style={{ fontSize: 20, color: "#4A4A4A" }}>Blog</span>
                            </div>
                        </div>
                    </div>
                ),
                {
                    width: 1200,
                    height: 630,
                }
            );
        }

        // Default template (home page)
        return new ImageResponse(
            (
                <div
                    style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#171717",
                        fontFamily,
                    }}
                >
                    {/* Background gradient */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: -150,
                            left: -150,
                            width: 600,
                            height: 600,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)",
                            filter: "blur(120px)",
                            opacity: 0.4,
                        }}
                    />

                    {/* Content */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1,
                        }}
                    >
                        {/* Logo / Name */}
                        <div
                            style={{
                                fontSize: 80,
                                fontWeight: 800,
                                color: "#f97316",
                                marginBottom: 8,
                            }}
                        >
                            B.DEV
                        </div>

                        {/* Title */}
                        <h1
                            style={{
                                fontSize: 48,
                                fontWeight: 600,
                                color: "#FAFAFA",
                                textAlign: "center",
                                marginBottom: 16,
                            }}
                        >
                            {title}
                        </h1>

                        {/* Description */}
                        <p
                            style={{
                                fontSize: 24,
                                color: "#a3a3a3",
                                textAlign: "center",
                                maxWidth: 700,
                            }}
                        >
                            {description}
                        </p>

                        {/* Tech stack pills */}
                        <div
                            style={{
                                display: "flex",
                                gap: 12,
                                marginTop: 40,
                            }}
                        >
                            {["React", "Next.js", "Node.js", "TypeScript"].map((tech) => (
                                <div
                                    key={tech}
                                    style={{
                                        padding: "8px 16px",
                                        backgroundColor: "rgba(249, 115, 22, 0.15)",
                                        borderRadius: 8,
                                        color: "#f97316",
                                        fontSize: 16,
                                    }}
                                >
                                    {tech}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: 40,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <span style={{ fontSize: 18, color: "#737373" }}>abdelbadie-khoubiza.com</span>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (error) {
        console.error("OG Image generation error:", error);

        // Return a simple fallback
        return new ImageResponse(
            (
                <div
                    style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#171717",
                        fontFamily,
                    }}
                >
                    <span style={{ fontSize: 64, color: "#f97316", fontWeight: 800 }}>B.DEV</span>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    }
}
