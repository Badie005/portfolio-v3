"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/data/projects";
import { Button } from "@/components/ui/button";

export function ProjectsSection() {
  // Afficher seulement les 3 premiers projets sur la page d'accueil
  const featuredProjects = projects.slice(0, 3);

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
              <h2 className="mb-6 text-brand font-heading">Mes réalisations</h2>
            </div>
            <div>
              <p className="text-ide-muted leading-relaxed font-body">
                Une sélection de projets où performance, innovation et expérience utilisateur se rencontrent.
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
          <Button asChild size="lg" className="w-[220px]">
            <Link href="/projects">
              Voir tous mes projets
              <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="glass" size="lg" className="w-[220px]">
            <a
              href="https://github.com/Badie005"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
