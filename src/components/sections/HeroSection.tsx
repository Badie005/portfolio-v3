"use client";

import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Github, Linkedin, Mail, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { TerminalStatus } from "@/components/ui/TerminalStatus";
import { GrainyTextLines } from "@/components/ui/GrainyTextReveal";

import { CodeWindowSkeleton } from "@/components/code-window/CodeWindowSkeleton";

// Lazy load CodeWindow pour améliorer LCP
const CodeWindow = dynamic(
  () => import("@/components/code-window/CodeWindow").then((mod) => mod.CodeWindow),
  {
    loading: () => <CodeWindowSkeleton />,
    ssr: false,
  }
);

export function HeroSection() {
  const tHero = useTranslations("hero");
  const tContact = useTranslations("contact");

  return (
    <section className="min-h-screen flex items-center justify-center relative px-4 sm:px-6 pt-20 overflow-x-hidden overflow-y-visible">


      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="max-w-[1600px] max-w-[100vw] w-full grid grid-cols-1 xl:grid-cols-[38%_1fr] gap-8 xl:gap-x-8 items-center hero-grid relative z-10"
      >
        {/* Left Column - Text Content */}
        <div className="flex flex-col justify-center h-full gap-8 xl:gap-10">
          {/* Status & Identity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4"
          >
            {/* Terminal-style Status */}
            <TerminalStatus texts={tHero.raw("terminalTexts") as string[]} />

            {/* Name & Role as Code Comment */}
            <div className="font-mono text-sm text-ide-muted" style={{ fontFamily: "'Fira Code', 'Roboto Mono', monospace" }}>
              <span className="text-ide-accent">{"//"}</span> {tHero("name")} <span className="text-neutral-300">|</span> {tHero("title")}
            </div>
          </motion.div>

          {/* Main Title - Line-by-line Reveal */}
          <div>
            <h1 className="text-3xl min-[400px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight font-heading text-brand break-words hyphens-auto">
              <GrainyTextLines
                lines={[
                  { text: tHero("headline.line1.text"), highlightWords: [tHero("headline.line1.highlight")] },
                  { text: tHero("headline.line2.text"), highlightWords: [tHero("headline.line2.highlight")] },
                ]}
                baseDelay={0.2}
                blurAmount={10}
                duration={0.8}
              />
            </h1>
          </div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Button asChild size="lg">
              <Link href="/projects">
                {tHero("cta.projects")}
                <ArrowRight size={18} className="ml-1" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link href="/#contact">{tHero("cta.contact")}</Link>
            </Button>
          </motion.div>

          {/* Socials - Minimalist */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="flex items-center gap-6 pt-4 border-t border-ide-border/50 max-w-md"
          >
            <a
              href="https://github.com/Badie005"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tHero("social.githubAria")}
              className="group flex items-center gap-2 text-ide-muted hover:text-ide-accent transition-colors duration-300"
            >
              <Github size={20} className="group-hover:stroke-ide-accent transition-colors" />
              <span className="text-sm font-medium font-mono" style={{ fontFamily: "'Fira Code', 'Roboto Mono', monospace" }}>{tContact("social.github")}</span>
            </a>
            <a
              href="https://linkedin.com/in/abdelbadie-khoubiza"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tHero("social.linkedinAria")}
              className="group flex items-center gap-2 text-ide-muted hover:text-ide-accent transition-colors duration-300"
            >
              <Linkedin size={20} className="group-hover:stroke-ide-accent transition-colors" />
              <span className="text-sm font-medium font-mono" style={{ fontFamily: "'Fira Code', 'Roboto Mono', monospace" }}>{tContact("social.linkedin")}</span>
            </a>
            <a
              href="mailto:a.khoubiza.dev@gmail.com"
              aria-label={tHero("social.emailAria", { email: "a.khoubiza.dev@gmail.com" })}
              className="group flex items-center gap-2 text-ide-muted hover:text-ide-accent transition-colors duration-300"
            >
              <Mail size={20} className="group-hover:stroke-ide-accent transition-colors" />
              <span className="text-sm font-medium font-mono" style={{ fontFamily: "'Fira Code', 'Roboto Mono', monospace" }}>{tContact("social.email")}</span>
            </a>
          </motion.div>
        </div>

        {/* Right Column - Photo */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="relative mx-auto xl:mx-0 xl:ml-auto w-full max-w-full overflow-hidden"
        >
          <div
            className="relative w-full h-[350px] sm:h-[450px] md:h-[600px] lg:h-[750px] xl:h-[800px]"
            style={{
              perspective: '1000px'
            }}
          >
            <motion.div
              className="relative w-full h-full"
              initial={{ rotateY: 0, rotateX: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Background Image Container */}
              <Image
                src="/background B.411 IDE.jpeg"
                alt={tHero("imageAlt")}
                fill
                className="object-cover rounded-xl"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 800px"
              />

              {/* IDE with padding to show background around edges */}
              <div className="relative w-full h-full p-2 sm:p-4 md:p-6 overflow-hidden">
                <CodeWindow />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}