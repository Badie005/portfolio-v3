"use client";

import { motion } from "motion/react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Github, Linkedin, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TerminalStatus } from "@/components/ui/TerminalStatus";
import { GrainyTextLines } from "@/components/ui/GrainyTextReveal";

// Lazy load CodeWindow pour améliorer LCP
const CodeWindow = dynamic(
  () => import("@/components/code-window/CodeWindow").then((mod) => mod.CodeWindow),
  {
    loading: () => (
      <div className="w-full h-full bg-surface-2 animate-pulse rounded-xl flex items-center justify-center">
        <div className="text-ide-muted font-mono text-sm">Chargement IDE...</div>
      </div>
    ),
    ssr: false,
  }
);

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center relative px-6 pt-20 overflow-hidden">


      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="max-w-[1600px] w-full grid grid-cols-1 lg:grid-cols-[25%_75%] gap-12 lg:gap-x-20 items-center hero-grid relative z-10"
      >
        {/* Left Column - Text Content */}
        <div className="flex flex-col justify-center h-full gap-8 lg:gap-10">
          {/* Status & Identity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4"
          >
            {/* Terminal-style Status */}
            <TerminalStatus texts={["Available for work...", "Open to projects...", "Ready to code..."]} />

            {/* Name & Role as Code Comment */}
            <div className="font-mono text-sm text-ide-muted" style={{ fontFamily: "'Fira Code', 'Roboto Mono', monospace" }}>
              <span className="text-ide-accent">{"//"}</span> Abdelbadie Khoubiza <span className="text-neutral-300">|</span> Full-Stack Developer
            </div>
          </motion.div>

          {/* Main Title - Line-by-line Reveal */}
          <div>
            <h1 className="text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight font-heading text-brand">
              <GrainyTextLines
                lines={[
                  { text: "Code with Passion,", highlightWords: ["Passion,"] },
                  { text: "Build with Purpose", highlightWords: ["Purpose"] },
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
                Voir mes projets
                <ArrowRight size={18} className="ml-1" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link href="/#contact">Me contacter</Link>
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
              className="group flex items-center gap-2 text-ide-muted hover:text-ide-accent transition-colors duration-300"
            >
              <Github size={20} className="group-hover:stroke-ide-accent transition-colors" />
              <span className="text-sm font-medium font-mono" style={{ fontFamily: "'Fira Code', 'Roboto Mono', monospace" }}>GitHub</span>
            </a>
            <a
              href="https://linkedin.com/in/abdelbadie-khoubiza"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-ide-muted hover:text-ide-accent transition-colors duration-300"
            >
              <Linkedin size={20} className="group-hover:stroke-ide-accent transition-colors" />
              <span className="text-sm font-medium font-mono" style={{ fontFamily: "'Fira Code', 'Roboto Mono', monospace" }}>LinkedIn</span>
            </a>
            <a
              href="mailto:a.khoubiza.dev@gmail.com"
              className="group flex items-center gap-2 text-ide-muted hover:text-ide-accent transition-colors duration-300"
            >
              <Mail size={20} className="group-hover:stroke-ide-accent transition-colors" />
              <span className="text-sm font-medium font-mono" style={{ fontFamily: "'Fira Code', 'Roboto Mono', monospace" }}>Email</span>
            </a>
          </motion.div>
        </div>

        {/* Right Column - Photo */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="relative mx-auto lg:mx-0 lg:ml-auto w-full"
        >
          <div
            className="relative w-full h-[700px] lg:h-[800px] lg:-mr-40"
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
              <div
                className="absolute inset-0 bg-cover bg-center rounded-xl"
                style={{
                  backgroundImage: 'url("/background B.411 IDE.jpeg")',
                }}
              />

              {/* IDE with padding to show background around edges */}
              <div className="relative w-full h-full p-6">
                <CodeWindow />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}