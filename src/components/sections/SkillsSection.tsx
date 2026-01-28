"use client";

import Image from "next/image";
import { TerminalStatus } from "@/components/ui/TerminalStatus";
import { useTranslations } from "next-intl";

export function SkillsSection() {
  const tSkills = useTranslations("skills");

  const skillCategories = [
    {
      icon: "/icons/code-icon.svg",
      title: tSkills("categories.frontend.title"),
      skills: tSkills.raw("categories.frontend.skills") as string[],
    },
    {
      icon: "/icons/server-icon.svg",
      title: tSkills("categories.backend.title"),
      skills: tSkills.raw("categories.backend.skills") as string[],
    },
    {
      icon: "/icons/settings-icon.svg",
      title: tSkills("categories.toolsDevops.title"),
      skills: tSkills.raw("categories.toolsDevops.skills") as string[],
    },
  ];

  return (
    <section id="skills" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 lg:mb-24 max-w-2xl">
          <TerminalStatus texts={tSkills.raw("terminalTexts") as string[]} className="mb-6 animate-fade-in" />

          <h2 className="text-4xl lg:text-5xl font-medium text-ide-accent mb-6 font-heading tracking-tight animate-fade-in">
            {tSkills("title")}
          </h2>
          <p className="text-lg text-ide-muted leading-relaxed font-body animate-fade-in animation-delay-100">
            {tSkills("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, index) => (
            <div
              key={category.title}
              className="group relative p-8 rounded-2xl border border-white/30 shadow-sm hover:shadow-xl transition-all duration-500 ease-out animate-fade-in-up overflow-hidden backdrop-blur-md bg-white/40 hover:bg-white/50 hover:border-ide-accent/40"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Top accent border - subtle */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ide-accent/40 to-transparent" />

              {/* Animated bottom border on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ide-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Glass shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* Hover glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-ide-accent/0 via-ide-accent/10 to-ide-accent/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-ide-border">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-sm border border-white/30">
                    <Image
                      src={category.icon}
                      alt={category.title}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-brand">{category.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="group/skill relative px-2.5 py-1.5 bg-surface-1 text-ide-text text-xs font-mono rounded-lg border border-ide-border/50 hover:border-ide-accent/50 hover:bg-ide-accent/5 transition-all duration-200 cursor-default"
                    >
                      <span className="text-ide-accent/60 mr-1">#</span>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl p-10 lg:p-12 text-card-dark-text bg-card-dark animate-fade-in-up animation-delay-300">
          <div className="mb-10">
            <div className="text-xs text-accent-on-dark mb-3" style={{ fontFamily: "'Fira Code', 'Roboto Mono', monospace" }}>$ ./stack --info</div>
            <h3 className="text-2xl lg:text-3xl font-medium text-card-dark-text mb-4 font-heading">{tSkills("stack.title")}</h3>
            <p className="text-card-dark-muted text-base max-w-2xl leading-relaxed font-body">
              {tSkills("stack.description")}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/10">
            <div>
              <div className="text-2xl lg:text-3xl font-medium text-card-dark-text mb-2 font-heading">8+</div>
              <div className="text-sm text-card-dark-muted font-body">{tSkills("stack.stats.technologies")}</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-medium text-card-dark-text mb-2 font-heading">3</div>
              <div className="text-sm text-card-dark-muted font-body">{tSkills("stack.stats.jsFrameworks")}</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-medium text-card-dark-text mb-2 font-heading">2</div>
              <div className="text-sm text-card-dark-muted font-body">{tSkills("stack.stats.backendLanguages")}</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-medium text-card-dark-text mb-2 font-heading">100%</div>
              <div className="text-sm text-card-dark-muted font-body">{tSkills("stack.stats.committed")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
