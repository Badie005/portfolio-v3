import Image from "next/image";
import { TerminalStatus } from "@/components/ui/TerminalStatus";

const experiences = [
  {
    title: "Stage Développeur Full-Stack",
    company: "Agence Urbaine de Taza",
    period: "Jan - Fév 2024",
    description:
      "Audit complet de l'infrastructure Windows Server, création de scripts PowerShell pour automatiser les tâches administratives, et élaboration d'un plan de migration vers Azure.",
    technologies: ["PowerShell", "Windows Server", "Active Directory", "Azure"],
    icon: "/icons/server-icon.svg",
    type: "stage",
  },
  {
    title: "Projet Académique - Portail USMBA",
    company: "Université Sidi Mohamed Ben Abdellah",
    period: "Mars - Juin 2024",
    description:
      "Développement d'une application web complète pour automatiser l'inscription et la gestion académique des étudiants. Plus de 500 utilisateurs avec 99.8% de disponibilité.",
    technologies: ["Laravel", "PHP 8.2", "MySQL", "Tailwind CSS"],
    icon: "/icons/code-icon.svg",
    type: "academic",
  },
  {
    title: "Projet Personnel - Plateforme E-learning",
    company: "AYJI E-learning",
    period: "Sept - Déc 2023",
    description:
      "Conception et développement d'une plateforme d'apprentissage en ligne avec système de cours, quiz interactifs et suivi de progression en temps réel.",
    technologies: ["Node.js", "Angular", "MongoDB", "Socket.io"],
    icon: "/icons/globe-icon.svg",
    type: "personal",
  },
];

// Palette harmonisée avec le thème cuivre/terra cotta
const typeColors = {
  stage: "text-ide-accent bg-ide-accent/10 border-ide-accent/30",
  academic: "text-ide-string bg-ide-string/10 border-ide-string/30",
  personal: "text-ide-keyword bg-ide-keyword/10 border-ide-keyword/30",
};

const typeLabels = {
  stage: "Stage",
  academic: "Académique",
  personal: "Personnel",
};

export function ExperienceSection() {
  return (
    <section id="experience" className="py-32 px-6 relative overflow-hidden">

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header - Style Terminal */}
        <div className="mb-16 lg:mb-24">
          <TerminalStatus texts={["Fetching history...", "git log --oneline", "Loading timeline..."]} className="mb-6 animate-fade-in" />

          <h2 className="text-4xl lg:text-5xl font-medium text-ide-accent mb-6 font-heading tracking-tight animate-fade-in">
            Expérience
          </h2>
          <p className="text-lg text-ide-muted leading-relaxed font-body max-w-2xl animate-fade-in animation-delay-100">
            Mon parcours professionnel et académique, des projets concrets qui m&apos;ont permis de développer mes compétences techniques.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Main Timeline Line with Gradient */}
          <div className="absolute left-4 sm:left-6 lg:left-1/2 top-0 bottom-0 w-px lg:-translate-x-1/2">
            <div className="absolute inset-0 bg-gradient-to-b from-ide-accent via-ide-border to-transparent" />
          </div>

          <div className="space-y-8 lg:space-y-12">
            {experiences.map((exp, index) => (
              <div
                key={exp.title}
                className={`relative flex flex-col lg:flex-row gap-8 ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  } animate-fade-in-up`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Timeline Node */}
                <div className="absolute left-4 sm:left-6 lg:left-1/2 lg:-translate-x-1/2 z-10">
                  <div className="relative">
                    {/* Outer ring */}
                    <div className="w-12 h-12 rounded-full backdrop-blur-md bg-white/50 border-2 border-white/30 flex items-center justify-center -translate-x-1/2 lg:translate-x-0">
                      {/* Inner glow */}
                      <div className="absolute inset-2 bg-ide-accent/20 rounded-full animate-pulse" />
                      {/* Icon container */}
                      <div className="relative w-6 h-6 flex items-center justify-center">
                        <Image
                          src={exp.icon}
                          alt=""
                          width={20}
                          height={20}
                          className="w-5 h-5 opacity-80"
                        />
                      </div>
                    </div>
                    {/* Connection line to card */}
                    <div className={`hidden lg:block absolute top-1/2 w-8 h-px bg-ide-border ${index % 2 === 0 ? "-right-8" : "-left-8"
                      }`} />
                  </div>
                </div>

                {/* Content Card */}
                <div className={`ml-12 sm:ml-16 lg:ml-0 lg:w-[calc(50%-3rem)] ${index % 2 === 0 ? "lg:pr-4" : "lg:pl-4 lg:ml-auto"
                  }`}>
                  <div className="group liquid-glass-card rounded-xl transition-all duration-500 hover:shadow-xl">
                    {/* Top accent border - subtle */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ide-accent/40 to-transparent z-10" />

                    {/* Card Header - Terminal Style */}
                    <div className="relative z-10 px-5 py-3 bg-white/30 backdrop-blur-sm border-b border-white/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                        </div>
                        <span className="font-mono text-xs text-ide-muted ml-2">
                          experience_{index + 1}.md
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-mono rounded border ${typeColors[exp.type as keyof typeof typeColors]}`}>
                        {typeLabels[exp.type as keyof typeof typeLabels]}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10 p-5 lg:p-6">
                      {/* Title & Company */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-brand font-heading mb-1 group-hover:text-ide-accent transition-colors duration-300">
                          {exp.title}
                        </h3>
                        <p className="text-sm text-ide-accent font-medium flex items-center gap-2">
                          <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {exp.company}
                        </p>
                      </div>

                      {/* Period Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-lg mb-4 border border-white/30">
                        <svg className="w-3.5 h-3.5 text-ide-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-mono text-xs text-ide-muted">
                          {exp.period}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-ide-muted text-sm leading-relaxed mb-5 font-body">
                        {exp.description}
                      </p>

                      {/* Technologies - Code style */}
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="group/tech relative px-2.5 py-1 bg-white/50 backdrop-blur-sm text-ide-text text-xs font-mono rounded-md border border-white/30 hover:border-ide-accent/50 hover:bg-ide-accent/10 transition-all duration-200 cursor-default"
                          >
                            <span className="text-ide-accent/70 mr-1">#</span>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline End Node */}
          <div className="relative mt-8 flex justify-start lg:justify-center">
            <div className="ml-6 lg:ml-0 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full backdrop-blur-md bg-white/50 border-2 border-white/30 flex items-center justify-center -translate-x-1/2 lg:translate-x-0">
                <div className="w-2 h-2 bg-ide-accent/50 rounded-full" />
              </div>
              <span className="font-mono text-xs text-ide-muted lg:hidden">La suite s&apos;écrit...</span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center animate-fade-in animation-delay-300">
          <div className="inline-flex items-center gap-3 px-5 py-3 backdrop-blur-md bg-white/40 border border-white/20 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-mono text-sm text-ide-muted">Status:</span>
            </div>
            <span className="font-mono text-sm text-ide-accent">
              Disponible pour de nouvelles opportunités
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}