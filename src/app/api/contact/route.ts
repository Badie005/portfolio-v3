import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z, ZodError } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  subject: z.string().min(3, "Le sujet doit contenir au moins 3 caractères"),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(5000, "Message trop long"),
});


function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  try {
    const rl = await enforceRateLimit(request, 5, 3600);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Trop de requêtes. Réessayez plus tard." },
        { status: 429, headers: { "Retry-After": Math.max(0, Math.ceil((rl.reset - Date.now()) / 1000)).toString() } }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: process.env.TO_EMAIL || "a.khoubiza.dev@gmail.com",
      subject: `Portfolio - ${validatedData.subject}`,
      replyTo: validatedData.email,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #171717; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px; }
              .info { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
              .label { font-weight: bold; color: #171717; }
              .message { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #171717; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">Nouveau message depuis votre portfolio</h2>
              </div>
              <div class="content">
                <div class="info">
                  <p><span class="label">De :</span> ${escapeHtml(validatedData.name)}</p>
                  <p><span class="label">Email :</span> ${escapeHtml(validatedData.email)}</p>
                  <p><span class="label">Sujet :</span> ${escapeHtml(validatedData.subject)}</p>
                </div>
                <div class="message">
                  <p class="label">Message :</p>
                  <p>${escapeHtml(validatedData.message).replace(/\n/g, "<br>")}</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error details:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: `Erreur Resend: ${error.message || "Erreur lors de l'envoi de l'email"}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Message envoyé avec succès", id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Erreur serveur. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
