"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { FolderGit2, ArrowUpRight } from "lucide-react";
import { Project } from "@/types";
import Image from "next/image";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <div
        ref={divRef}
        onMouseMove={handleMouseMove}
        className="group relative h-full overflow-hidden rounded-2xl border border-ide-border bg-surface-1 transition-all duration-300 hover:border-ide-accent/50 hover:shadow-xl flex flex-col"
      >
        {/* Adaptive Spotlight Effect */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-10"
          style={{
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, var(--ide-accent-rgb, 120, 120, 120), transparent 40%)`,
            opacity: 0.05
          }}
        />

        {/* Image Section - Clean & Sharp */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2 border-b border-ide-border/50">
          {project.image && !project.image.includes("placeholder") ? (
            <Image
              src={project.image}
              alt={project.imageAlt || project.title}
              fill
              className="absolute inset-0 w-full h-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-30 text-ide-muted">
              <FolderGit2 size={48} />
            </div>
          )}
        </div>

        {/* Content Section - Cleanly Below */}
        <div className="relative px-6 py-6 flex-1 flex flex-col z-20">
          {/* Header: Badge & Title */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-ide-muted bg-surface-2 px-2 py-1 rounded border border-ide-border block w-fit mb-2">
                {project.category}
              </span>
              <h3 className="text-xl font-heading font-bold text-ide-text tracking-tight group-hover:text-ide-accent transition-colors">
                {project.title}
              </h3>
            </div>
            
            <div className="w-10 h-10 rounded-lg bg-surface-2 border border-ide-border flex items-center justify-center shrink-0 group-hover:border-ide-accent/30 group-hover:text-ide-accent transition-colors">
               <ArrowUpRight size={20} className="text-ide-muted group-hover:text-ide-accent transition-colors" />
            </div>
          </div>

          {/* Description */}
          <p className="text-ide-muted text-sm leading-relaxed mb-6 line-clamp-2 group-hover:text-ide-text/80 transition-colors flex-1">
            {project.description}
          </p>

          {/* Footer: Tech & Metrics */}
          <div className="space-y-4">
             {/* Tech Stack */}
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-surface-2 border border-ide-border text-ide-muted rounded text-[10px] font-mono group-hover:border-ide-accent/20 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Results / Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-ide-border/50">
              {project.results.map((result) => (
                <div key={result.metric}>
                  <div className="text-sm font-bold text-ide-text group-hover:text-ide-accent transition-colors">
                    {result.value}
                  </div>
                  <div className="text-[9px] text-ide-muted truncate">
                    {result.metric}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
