"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { TerminalStatus } from "@/components/ui/TerminalStatus";
import animationData from "../../../public/video-a-propos.json";

export function AboutSection() {
  const [isMounted, setIsMounted] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const directionRef = useRef<1 | -1>(1);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simple yoyo: avant puis arrière en boucle
  const handleComplete = () => {
    const anim = lottieRef.current?.animationItem;
    if (!anim) return;

    // Inverser la direction
    directionRef.current = directionRef.current === 1 ? -1 : 1;
    anim.setDirection(directionRef.current);
    anim.play();
  };

  const principles = [
    {
      icon: "/icons/settings-icon.svg",
      title: "Performance",
      description: "Je conçois des applications en pensant performance, accessibilité et maintenabilité.",
    },
    {
      icon: "/icons/lightbulb-icon.svg",
      title: "Simplicité",
      description: "Une approche minimaliste avec une attention méticuleuse aux détails techniques.",
    },
    {
      icon: "/icons/workflow-icon.svg",
      title: "Efficacité",
      description: "Transformer des idées en produits numériques efficaces, élégants et pérennes.",
    },
  ];

  return (
    <section id="about" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 lg:mb-24 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <TerminalStatus texts={["Reading profile...", "Loading bio...", "Parsing data..."]} className="mb-6" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl lg:text-5xl font-medium text-ide-accent mb-6 font-heading tracking-tight"
          >
            À propos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-ide-muted leading-relaxed font-body"
          >
            Passionné par la création d&apos;expériences web modernes et performantes. J&apos;allie une approche minimaliste à une attention méticuleuse aux détails techniques pour transformer vos idées en produits numériques efficaces, élégants et pérennes.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-square rounded-2xl overflow-hidden border border-ide-border bg-surface-1 flex items-center justify-center">
              {isMounted && (
                <Lottie
                  lottieRef={lottieRef}
                  animationData={animationData}
                  loop={false}
                  autoplay={true}
                  className="w-full h-full"
                  aria-label="Animation - À propos"
                  onComplete={handleComplete}
                />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="relative rounded-2xl p-8 border border-ide-border backdrop-blur-md bg-white/40 shadow-sm overflow-hidden">
              {/* Glass shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60 pointer-events-none" />

              <div className="relative z-10 grid grid-cols-2 gap-y-8 gap-x-6">
                <div className="flex flex-col">
                  <span className="text-3xl lg:text-4xl font-medium font-heading text-brand mb-1">3</span>
                  <span className="text-xs text-ide-muted font-body tracking-wide uppercase opacity-80">Projets réalisés</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl lg:text-4xl font-medium font-heading text-brand mb-1">8+</span>
                  <span className="text-xs text-ide-muted font-body tracking-wide uppercase opacity-80">Technologies</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl lg:text-4xl font-medium font-heading text-brand mb-1">2</span>
                  <span className="text-xs text-ide-muted font-body tracking-wide uppercase opacity-80">Stages effectués</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl lg:text-4xl font-medium font-heading text-brand mb-1">24h</span>
                  <span className="text-xs text-ide-muted font-body tracking-wide uppercase opacity-80">Temps de réponse</span>
                </div>
              </div>
            </div>

            <div className="text-card-dark-text rounded-xl p-8 bg-card-dark shadow-lg">
              <div className="mb-2 text-accent-on-dark text-sm font-mono"># Philosophie</div>
              <p className="text-lg">
                &quot;Simplicité, élégance et efficacité dans chaque ligne de code.&quot;
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {principles.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex flex-col items-start pl-8 border-l border-ide-border py-2"
            >
              <div className="mb-4">
                <Image
                  src={principle.icon}
                  alt={principle.title}
                  width={24}
                  height={24}
                  className="w-6 h-6 opacity-80"
                />
              </div>
              <h3 className="text-2xl font-medium text-brand mb-3 font-heading tracking-tight">
                {principle.title}
              </h3>
              <p className="text-ide-muted leading-relaxed text-base font-body">
                {principle.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
