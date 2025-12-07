import { GeminiService } from "@/lib/gemini";
import { enforceRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

// Initialisation du service avec la clé OpenRouter (côté serveur uniquement)
const gemini = new GeminiService({
    apiKey: process.env.OPENROUTER_API_KEY,
});

interface ChatRequestBody {
    message: string;
    history?: Array<{
        role: "user" | "model";
        parts: Array<{ text: string }>;
    }>;
}

export async function POST(req: NextRequest) {
    try {
        // Rate Limiting (Protection anti-spam)
        // 10 requêtes par minute
        const { allowed, reset } = await enforceRateLimit(req, 10, 60);

        if (!allowed) {
            return NextResponse.json(
                {
                    error: "Too many requests. Please try again later.",
                    retryAfter: reset
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
                    },
                }
            );
        }

        // Validation du Body
        const body: ChatRequestBody = await req.json();

        if (!body.message || typeof body.message !== "string") {
            return NextResponse.json(
                { error: "Invalid request: 'message' field is required" },
                { status: 400 }
            );
        }

        // Sanitization basique (évite les messages trop longs)
        if (body.message.length > 4000) {
            return NextResponse.json(
                { error: "Message too long. Maximum 4000 characters." },
                { status: 400 }
            );
        }

        // Appel au service Gemini (côté serveur)
        const response = await gemini.sendMessage(body.message, body.history);

        return NextResponse.json(
            {
                response,
                timestamp: new Date().toISOString(),
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("[API /chat] Error:", error);

        // Gestion des erreurs Gemini spécifiques
        if (error instanceof Error) {
            if (error.message.includes("API key")) {
                return NextResponse.json(
                    { error: "Service configuration error" },
                    { status: 500 }
                );
            }

            if (error.message.includes("quota") || error.message.includes("rate")) {
                return NextResponse.json(
                    { error: "Service temporarily unavailable. Please try again later." },
                    { status: 503 }
                );
            }
        }

        // Erreur générique (ne pas exposer les détails internes)
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
