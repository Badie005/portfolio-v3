"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import { TerminalStatus } from "@/components/ui/TerminalStatus";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navItems = [
    { name: "Projets", href: "/projects" },
    { name: "À propos", href: "/#about" },
    { name: "Compétences", href: "/#skills" },
    { name: "Contact", href: "/#contact" },
    { name: "Gallery", href: "/#gallery" },
  ];

  const socialLinks = [
    { name: "GitHub", href: "https://github.com/Badie005", icon: Github },
    { name: "LinkedIn", href: "https://linkedin.com/in/abdelbadie-khoubiza", icon: Linkedin },
    { name: "Email", href: "mailto:a.khoubiza.dev@gmail.com", icon: Mail },
  ];

  return (
    <footer className="relative z-20 border-t border-[#1A1A1A]/5 bg-[#F0EEE6]">
      {/* Decorative top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-ide-accent/30 to-transparent" />

      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Image
              src="/logo/SVG/Logo-B.svg"
              alt="B.DEV"
              width={100}
              height={32}
              className="h-8 w-auto mb-5"
            />
            <p className="text-neutral-600 text-[15px] leading-relaxed max-w-md mb-6">
              Full-Stack Developer passionné par la création d&apos;expériences
              web modernes, performantes et accessibles.
            </p>

            {/* Terminal Status */}
            <TerminalStatus
              texts={["Building portfolio...", "Ready to collaborate...", "Open for projects..."]}
            />
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-800 uppercase tracking-wider mb-5">
              Navigation
            </h4>
            <nav className="space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center gap-1 text-[15px] text-neutral-500 hover:text-ide-accent transition-colors"
                >
                  <span>{item.name}</span>
                  <ArrowUpRight
                    size={14}
                    className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                  />
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-800 uppercase tracking-wider mb-5">
              Contact
            </h4>
            <div className="space-y-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.name !== "Email" ? "_blank" : undefined}
                  rel={link.name !== "Email" ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-3 text-[15px] text-neutral-500 hover:text-ide-accent transition-colors"
                >
                  <span className="p-1.5 rounded-lg bg-white/50 group-hover:bg-ide-accent/10 transition-colors">
                    <link.icon size={16} strokeWidth={1.5} />
                  </span>
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-300/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-neutral-400">
            © {currentYear} Abdelbadie Khoubiza
          </p>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-400">By</span>
            <span className="font-medium text-neutral-600">B.411</span>
            <span className="text-ide-accent">×</span>
            <span className="font-medium text-neutral-600">B.DEV</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
