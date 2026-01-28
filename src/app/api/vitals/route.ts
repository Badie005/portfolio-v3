import { enforceRateLimit } from "@/lib/rate-limit";
import { rateLimitResponse, validationErrorResponse } from "@/lib/api-response";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

const webVitalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(32),
  value: z.number(),
  delta: z.number(),
  rating: z.enum(["good", "needs-improvement", "poor"]).optional(),
  navigationType: z.string().optional(),
  pathname: z.string().optional(),
  href: z.string().optional(),
  timestamp: z.number().int().optional(),
});

export async function POST(request: Request) {
  try {
    const rl = await enforceRateLimit(request, 100, 60, "vitals");
    if (!rl.allowed) {
      return rateLimitResponse(rl.reset);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    webVitalSchema.parse(body);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse("Données invalides", error.issues);
    }

    console.error("[API /vitals] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
