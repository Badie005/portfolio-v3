"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Github, ExternalLink, Calendar, CheckCircle2, Target, Lightbulb } from "lucide-react";
import { Project } from "@/types";
import { TerminalStatus } from "@/components/ui/TerminalStatus";
import { projects } from "@/data/projects";

interface Props {
  project: Project;
}

export function ProjectDetailContent({ project }: Props) {
  // Get previous and next projects for navigation
  const currentIndex = projects.findIndex(p => p.id === project.id);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  return (
    <div className="min-h-screen relative">
      <section className="pt-28 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-ide-muted hover:text-ide-accent transition-colors mb-8 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Retour aux projets</span>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            {/* Terminal Status */}
            <TerminalStatus
              texts={["Loading project...", "Fetching details...", "Rendering content..."]}
              className="mb-6"
            />

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-ide-accent/10 text-ide-accent text-xs font-mono rounded-full">
                {project.category}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full text-ide-muted text-sm">
                <Calendar size={14} />
                <span>{project.period}</span>
              </div>
            </div>

            <h1 className="font-heading text-4xl lg:text-5xl font-medium text-brand tracking-tight mb-6">
              {project.title}
            </h1>

            <p className="text-lg text-ide-muted leading-relaxed max-w-3xl">
              {project.fullDescription}
            </p>

            {/* Links */}
            <div className="flex flex-wrap gap-3 mt-8">
              {/* Single GitHub URL */}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  <Github size={16} />
                  Voir le code
                </a>
              )}
              {/* Multiple GitHub URLs (Frontend/Backend) */}
              {project.githubUrls?.map((repo) => (
                <a
                  key={repo.label}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  <Github size={16} />
                  {repo.label}
                </a>
              ))}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/60 backdrop-blur-sm border border-white/40 text-neutral-900 rounded-full text-sm font-medium hover:bg-white/80 transition-colors"
                >
                  <ExternalLink size={16} />
                  Voir le site
                </a>
              )}
            </div>
          </motion.div>

          {/* Project Image - 2912x1820 ratio (1.6:1) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden bg-surface-2 border border-ide-border mb-16"
            style={{ aspectRatio: "2912 / 1820" }}
          >
            <Image
              src={project.image}
              alt={project.imageAlt}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 space-y-12"
            >
              {/* Context Section (for stages/internships) */}
              {project.context && (
                <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-ide-border">
                  <h2 className="font-heading text-2xl font-semibold text-brand mb-5">
                    Contexte
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Image src="/icons/building-icon.svg" alt="" width={18} height={18} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs uppercase tracking-wider text-ide-muted">Structure</span>
                        <p className="text-brand font-medium">{project.context.structure}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target size={18} className="text-ide-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs uppercase tracking-wider text-ide-muted">Objectif</span>
                        <p className="text-brand font-medium">{project.context.objective}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Image src="/icons/user-icon.svg" alt="" width={18} height={18} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs uppercase tracking-wider text-ide-muted">Rôle</span>
                        <p className="text-brand font-medium">{project.context.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Groups (organized by theme) */}
              {project.featureGroups && project.featureGroups.length > 0 ? (
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-brand mb-6">
                    Missions & Activités
                  </h2>
                  <div className="space-y-6">
                    {project.featureGroups.map((group, groupIndex) => (
                      <motion.div
                        key={groupIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + groupIndex * 0.1 }}
                        className="p-5 rounded-xl bg-white/40 border border-white/60"
                      >
                        <h3 className="font-medium text-brand mb-3">
                          {group.title}
                        </h3>
                        <ul className="space-y-2">
                          {group.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2 text-ide-muted text-sm">
                              <CheckCircle2 size={16} className="text-ide-accent mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : project.features.length > 0 && (
                /* Standard Features List */
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-brand mb-6">
                    Fonctionnalités
                  </h2>
                  <ul className="space-y-4">
                    {project.features.map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 size={20} className="text-ide-accent mt-0.5 flex-shrink-0" />
                        <span className="text-ide-muted">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Learnings Section */}
              {project.learnings && project.learnings.length > 0 && (
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-brand mb-6">
                    Ce que j&apos;ai appris
                  </h2>
                  <ul className="space-y-3">
                    {project.learnings.map((learning, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <Lightbulb size={18} className="text-ide-accent mt-0.5 flex-shrink-0" />
                        <span className="text-ide-muted">{learning}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-8"
            >
              {/* Technologies */}
              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                <h3 className="font-heading text-lg font-semibold text-brand mb-4">
                  Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 bg-ide-accent/10 text-ide-accent text-xs font-mono rounded-lg"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                <h3 className="font-heading text-lg font-semibold text-brand mb-4">
                  Résultats
                </h3>
                <div className="space-y-4">
                  {project.results.map((result, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-ide-muted text-sm">{result.metric}</span>
                      <span className="font-mono font-semibold text-ide-accent">{result.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Project Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20 pt-12 border-t border-ide-border"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Previous Project */}
              {prevProject ? (
                <Link
                  href={`/projects/${prevProject.id}`}
                  className="group flex items-center gap-3 text-ide-muted hover:text-ide-accent transition-colors"
                >
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  <div className="text-left">
                    <span className="text-xs uppercase tracking-wider opacity-60">Précédent</span>
                    <p className="font-medium">{prevProject.title}</p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {/* All Projects */}
              <Link
                href="/projects"
                className="px-4 py-2 text-sm text-ide-muted hover:text-ide-accent border border-ide-border rounded-full transition-colors"
              >
                Tous les projets
              </Link>

              {/* Next Project */}
              {nextProject ? (
                <Link
                  href={`/projects/${nextProject.id}`}
                  className="group flex items-center gap-3 text-ide-muted hover:text-ide-accent transition-colors"
                >
                  <div className="text-right">
                    <span className="text-xs uppercase tracking-wider opacity-60">Suivant</span>
                    <p className="font-medium">{nextProject.title}</p>
                  </div>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
