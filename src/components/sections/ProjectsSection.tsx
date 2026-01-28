"use client";

import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { getProjects } from "@/data/projects";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";

export function ProjectsSection() {
  const locale = useLocale();
  const tProjects = useTranslations("projects");
  const tContact = useTranslations("contact");

  // Afficher seulement les 3 premiers projets sur la page d'accueil
  const featuredProjects = getProjects(locale).slice(0, 3);

  return (
    <section id="projets" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="mb-6 text-brand font-heading">{tProjects("home.title")}</h2>
            </div>
            <div>
              <p className="text-ide-muted leading-relaxed font-body">
                {tProjects("home.description")}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-12">
          {featuredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex items-center justify-center gap-4 flex-wrap"
        >
          <Button asChild size="lg" className="w-full sm:w-[220px]">
            <Link href="/projects">
              {tProjects("home.viewAll")}
              <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="glass" size="lg" className="w-full sm:w-[220px]">
            <a
              href="https://github.com/Badie005"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tContact("social.github")}
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
