import Image from "next/image";
import { TerminalStatus } from "@/components/ui/TerminalStatus";

export function SkillsSection() {
  const skillCategories = [
    {
      icon: "/icons/code-icon.svg",
      title: "Frontend",
      skills: [
        "React & Next.js",
        "Angular",
        "TypeScript",
        "JavaScript (ES6+)",
        "Tailwind CSS",
        "Alpine.js",
        "HTML5 & CSS3",
      ],
    },
    {
      icon: "/icons/server-icon.svg",
      title: "Backend",
      skills: [
        "Node.js & Express.js",
        "PHP & Laravel",
        "RESTful APIs & MVC",
        "MySQL",
        "NoSQL (MongoDB)",
      ],
    },
    {
      icon: "/icons/settings-icon.svg",
      title: "Outils & DevOps",
      skills: [
        "Git & GitHub",
        "Docker",
        "Vite",
        "Postman",
        "PowerShell",
        "Figma (UI/UX)",
      ],
    },
  ];

  return (
    <section id="skills" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 lg:mb-24 max-w-2xl">
          <TerminalStatus texts={["Scanning skills...", "npm list --depth=0", "Indexing stack..."]} className="mb-6 animate-fade-in" />

          <h2 className="text-4xl lg:text-5xl font-medium text-ide-accent mb-6 font-heading tracking-tight animate-fade-in">
            Compétences
          </h2>
          <p className="text-lg text-ide-muted leading-relaxed font-body animate-fade-in animation-delay-100">
            Une stack technique moderne et polyvalente. Je maîtrise l&apos;ensemble du cycle de développement, du frontend réactif au backend robuste, pour répondre à tous vos besoins numériques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skillCategories.map((category, index) => (
            <div
              key={category.title}
              className="group liquid-glass-card rounded-2xl p-8 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-ide-border">
                <div className="w-10 h-10 flex items-center justify-center">
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
          ))}
        </div>

        <div className="mt-16 rounded-2xl p-10 lg:p-12 text-card-dark-text bg-card-dark animate-fade-in-up animation-delay-300">
          <div className="mb-10">
            <div className="text-xs text-accent-on-dark mb-3" style={{ fontFamily: "'Fira Code', 'Roboto Mono', monospace" }}>$ ./stack --info</div>
            <h3 className="text-2xl lg:text-3xl font-medium text-card-dark-text mb-4 font-heading">Stack complète Full-Stack</h3>
            <p className="text-card-dark-muted text-base max-w-2xl leading-relaxed font-body">
              De la conception UI/UX à la mise en production, je maîtrise l&apos;ensemble du cycle de développement pour créer des applications web performantes et évolutives.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/10">
            <div>
              <div className="text-2xl lg:text-3xl font-medium text-card-dark-text mb-2 font-heading">8+</div>
              <div className="text-sm text-card-dark-muted font-body">Technologies</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-medium text-card-dark-text mb-2 font-heading">3</div>
              <div className="text-sm text-card-dark-muted font-body">Frameworks JS</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-medium text-card-dark-text mb-2 font-heading">2</div>
              <div className="text-sm text-card-dark-muted font-body">Langages Backend</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-medium text-card-dark-text mb-2 font-heading">100%</div>
              <div className="text-sm text-card-dark-muted font-body">Engagé</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
