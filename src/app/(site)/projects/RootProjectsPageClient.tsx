"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { TerminalStatus } from "@/components/ui/TerminalStatus";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Project } from "@/types";

interface Props {
  projects: Project[];
}

export function RootProjectsPageClient({ projects }: Props) {
    const tProjects = useTranslations("projects");
    const tNav = useTranslations("nav");

    const terminalTexts = tProjects.raw("list.terminalTexts") as string[];

    return (
        <div className="min-h-screen relative overflow-hidden">
            <section className="pt-32 pb-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-16 lg:mb-20"
                    >
                        <TerminalStatus texts={terminalTexts} className="mb-8" />

                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
                            <span className="text-brand">{tProjects("list.titleBrand")}</span>
                            <span className="text-ide-accent">{tProjects("list.titleAccent")}</span>
                        </h1>

                        <div className="max-w-2xl">
                            <p className="text-lg lg:text-xl text-ide-muted leading-relaxed mb-5">
                                {tProjects.rich("list.description", {
                                    realProblems: (chunks) => (
                                        <span className="text-brand font-medium">{chunks}</span>
                                    ),
                                    measurableResults: (chunks) => (
                                        <span className="text-brand font-medium">{chunks}</span>
                                    ),
                                })}
                            </p>

                            <div className="font-mono text-sm bg-surface-2/50 border border-ide-border rounded-lg px-4 py-3 inline-block">
                                <span className="text-ide-keyword">const</span>{" "}
                                <span className="text-ide-function">portfolio</span>{" "}
                                <span className="text-ide-text">=</span>{" "}
                                <span className="text-ide-text">{"{"}</span>{" "}
                                <span className="text-ide-string">projects</span>
                                <span className="text-ide-text">:</span>{" "}
                                <span className="text-ide-number">{projects.length}</span>
                                <span className="text-ide-text">,</span>{" "}
                                <span className="text-ide-string">status</span>
                                <span className="text-ide-text">:</span>{" "}
                                <span className="text-green-600">&quot;production&quot;</span>{" "}
                                <span className="text-ide-text">{"}"}</span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, index) => (
                            <article key={project.id}>
                                <Link href={`/projects/${project.id}`} className="block h-full">
                                    <ProjectCard project={project} index={index} />
                                </Link>
                            </article>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mt-32 mb-12"
                    >
                        <div className="relative p-8 md:p-12 rounded-2xl bg-surface-2 dark:bg-[#121212] border border-ide-border overflow-hidden text-neutral-900 dark:text-neutral-100">
                            <div
                                className="absolute inset-0 opacity-[0.07] dark:opacity-[0.05]"
                                style={{
                                    backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
                                    backgroundSize: "24px 24px",
                                }}
                            />

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="text-left space-y-4 max-w-2xl">
                                    <TerminalStatus
                                        texts={tProjects.raw("list.cta.terminalTexts") as string[]}
                                        className="mb-2 border-none bg-transparent p-0 shadow-none"
                                    />

                                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-neutral-900 dark:text-white tracking-tight">
                                        {tProjects("list.cta.titleLine1")} <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-ide-accent to-orange-400">
                                            {tProjects("list.cta.titleLine2")}
                                        </span>
                                    </h2>

                                    <div className="font-mono text-sm text-neutral-500 dark:text-neutral-400 bg-white dark:bg-black/20 px-4 py-2 rounded border border-neutral-200 dark:border-white/10 inline-block">
                                        <span className="text-green-500">$</span> git checkout -b{" "}
                                        <span className="text-ide-accent">new-collaboration</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                    <Link
                                        href="mailto:a.khoubiza.dev@gmail.com"
                                        className="px-6 py-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 text-neutral-900 hover:bg-white/80 transition-colors duration-200 text-center font-medium"
                                    >
                                        a.khoubiza.dev@gmail.com
                                    </Link>
                                    <Link
                                        href="/#contact"
                                        className="px-8 py-4 rounded-xl bg-[#26251E] text-white font-semibold hover:bg-[#3B3A33] active:bg-[#1A1914] transition-colors duration-200 text-center flex items-center justify-center gap-2"
                                    >
                                        <span>{tNav("startProject")}</span>
                                        <ArrowUpRight size={18} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
