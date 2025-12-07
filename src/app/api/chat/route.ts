import { GeminiService } from "@/lib/gemini";
import { enforceRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createParser, type EventSourceMessage } from "eventsource-parser";

// Using Edge Runtime for better streaming performance
export const runtime = 'edge';

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
        // Rate Limiting
        const { allowed, reset } = await enforceRateLimit(req, 10, 60);

        if (!allowed) {
            return new NextResponse(
                JSON.stringify({
                    error: "Too many requests. Please try again later.",
                    retryAfter: reset
                }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
                    },
                }
            );
        }

        const body: ChatRequestBody = await req.json();

        if (!body.message || typeof body.message !== "string") {
            return new NextResponse(
                JSON.stringify({ error: "Invalid request: 'message' field is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (body.message.length > 4000) {
            return new NextResponse(
                JSON.stringify({ error: "Message too long. Maximum 4000 characters." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Get upstream response from OpenRouter
        const upstreamResponse = await gemini.getStreamResponse(body.message, body.history);

        if (!upstreamResponse.ok || !upstreamResponse.body) {
            const errorText = await upstreamResponse.text();
            console.error("OpenRouter Error:", errorText);
            return new NextResponse(
                JSON.stringify({ error: "Upstream service error" }),
                { status: upstreamResponse.status, headers: { "Content-Type": "application/json" } }
            );
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
            async start(controller) {
                // Use eventsource-parser to handle SSE chunks correctly
                const parser = createParser({
                    onEvent: (event: EventSourceMessage) => {
                        // event is EventSourceMessage { data: string, event?: string, id?: string }
                        const data = event.data;
                        if (data === '[DONE]') {
                            controller.close();
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                controller.enqueue(encoder.encode(content));
                            }
                        } catch (e) {
                            // ignore json parse errors
                        }
                    }
                });

                const reader = upstreamResponse.body!.getReader();
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        // Feed the parser with the decoded chunk
                        parser.feed(decoder.decode(value, { stream: true }));
                    }
                } finally {
                    reader.releaseLock();
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
                "X-Content-Type-Options": "nosniff",
            },
        });

    } catch (error) {
        console.error("[API /chat] Error:", error);
        return new NextResponse(
            JSON.stringify({ error: "An unexpected error occurred" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
