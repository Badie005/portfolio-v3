"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Send, Loader2, ArrowUpRight, Mail, LinkedinIcon, GithubIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TerminalStatus } from "@/components/ui/TerminalStatus";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const contactLinks = [
  {
    label: "Email",
    value: "a.khoubiza.dev@gmail.com",
    href: "mailto:a.khoubiza.dev@gmail.com",
    icon: Mail,
  },
  {
    label: "LinkedIn",
    value: "/in/abdelbadie-khoubiza",
    href: "https://linkedin.com/in/abdelbadie-khoubiza",
    icon: LinkedinIcon,
  },
  {
    label: "GitHub",
    value: "/Badie005",
    href: "https://github.com/Badie005",
    icon: GithubIcon,
  },
];

const TERMINAL_TEXTS = ["Connecting...", "Opening channel...", "Ready to chat..."];

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Vérifier le content-type avant de parser le JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Erreur serveur. Veuillez réessayer plus tard.");
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erreur lors de l'envoi");
      toast.success("Message envoyé ! Je vous répondrai sous 24h.");
      reset();
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-16 lg:mb-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <TerminalStatus
              texts={TERMINAL_TEXTS}
              className="mb-6"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl lg:text-5xl font-medium text-ide-accent mb-6 font-heading tracking-tight"
          >
            Contact
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-ide-muted leading-relaxed font-body"
          >
            Vous avez un projet en tête ? N&apos;hésitez pas à me contacter.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Contact Links */}
            <div className="space-y-4">
              {contactLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group relative flex items-center justify-between p-4 rounded-xl border border-white/30 bg-white/40 backdrop-blur-md hover:bg-white/50 hover:border-ide-accent/40 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-ide-accent/0 via-ide-accent/5 to-ide-accent/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-white/50 border border-white/30 flex items-center justify-center text-ide-accent group-hover:scale-110 transition-transform duration-300">
                      <link.icon size={20} />
                    </div>
                    <div>
                      <span className="text-xs text-ide-muted font-mono block mb-0.5">
                        {link.label}
                      </span>
                      <span className="text-ide-text font-medium">{link.value}</span>
                    </div>
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="text-ide-muted/60 group-hover:text-ide-accent transition-all duration-500 ease-out relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-110"
                  />
                </a>
              ))}
            </div>

            {/* Status Card */}
            <div className="p-6 rounded-xl border border-white/30 bg-card-dark backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="flex items-center gap-3 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs text-accent-on-dark font-mono tracking-wide uppercase">Disponible</span>
              </div>
              <p className="text-card-dark-text font-medium mb-2 text-lg">
                Ouvert aux opportunités
              </p>
              <p className="text-card-dark-muted text-sm leading-relaxed">
                Freelance, CDI, ou collaboration ponctuelle. Réponse sous 24h.
              </p>
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="group relative rounded-xl border border-white/30 overflow-hidden transition-all duration-500 hover:border-ide-accent/40 hover:shadow-xl backdrop-blur-md bg-white/40 hover:bg-white/50 shadow-sm">
              {/* Top accent border - subtle */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ide-accent/40 to-transparent" />

              {/* Animated bottom border on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ide-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Glass shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* Hover glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-ide-accent/0 via-ide-accent/10 to-ide-accent/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />

              {/* Decorative Header */}
              <div className="relative z-10 px-6 py-4 border-b border-white/20 bg-white/30 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                  </div>
                  <span className="text-xs font-mono text-ide-muted ml-2">contact_form.tsx</span>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 p-6 lg:p-8 space-y-6">
                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-ide-muted font-mono uppercase tracking-widest">
                      Nom <span className="text-ide-accent">*</span>
                    </label>
                    <input
                      {...register("name", { required: "Requis", minLength: 2 })}
                      className={`w-full h-12 px-4 bg-white/50 border rounded-lg text-ide-text placeholder-ide-muted/40 focus:outline-none focus:border-ide-accent focus:ring-1 focus:ring-ide-accent transition-all duration-300 ${errors.name ? "border-red-500/50" : "border-white/30"
                        }`}
                      placeholder="Jean Dupont"
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-[10px] uppercase font-mono mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-ide-muted font-mono uppercase tracking-widest">
                      Email <span className="text-ide-accent">*</span>
                    </label>
                    <input
                      type="email"
                      {...register("email", {
                        required: "Requis",
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email invalide" },
                      })}
                      className={`w-full h-12 px-4 bg-white/50 border rounded-lg text-ide-text placeholder-ide-muted/40 focus:outline-none focus:border-ide-accent focus:ring-1 focus:ring-ide-accent transition-all duration-300 ${errors.email ? "border-red-500/50" : "border-white/30"
                        }`}
                      placeholder="jean@exemple.com"
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-[10px] uppercase font-mono mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="text-xs text-ide-muted font-mono uppercase tracking-widest">
                    Sujet <span className="text-ide-accent">*</span>
                  </label>
                  <input
                    {...register("subject", { required: "Requis", minLength: 3 })}
                    className={`w-full h-12 px-4 bg-white/50 border rounded-lg text-ide-text placeholder-ide-muted/40 focus:outline-none focus:border-ide-accent focus:ring-1 focus:ring-ide-accent transition-all duration-300 ${errors.subject ? "border-red-500/50" : "border-white/30"
                      }`}
                    placeholder="Projet web, collaboration..."
                    disabled={isSubmitting}
                  />
                  {errors.subject && (
                    <p className="text-red-400 text-[10px] uppercase font-mono mt-1">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-xs text-ide-muted font-mono uppercase tracking-widest">
                    Message <span className="text-ide-accent">*</span>
                  </label>
                  <textarea
                    {...register("message", { required: "Requis", minLength: 10 })}
                    rows={5}
                    className={`w-full p-4 bg-white/50 border rounded-lg text-ide-text placeholder-ide-muted/40 focus:outline-none focus:border-ide-accent focus:ring-1 focus:ring-ide-accent transition-all duration-300 resize-none ${errors.message ? "border-red-500/50" : "border-white/30"
                      }`}
                    placeholder="Décrivez votre projet..."
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="text-red-400 text-[10px] uppercase font-mono mt-1">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-xl bg-[#26251E] text-white font-semibold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#3B3A33] active:bg-[#1A1914] transition-colors duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Envoyer le message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

