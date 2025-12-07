'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalStatus } from "@/components/ui/TerminalStatus";
import { AnimatedLogo } from "@/components/AnimatedLogo";

interface LoadingScreenProps {
    onLoadComplete?: () => void;
    minDisplayTime?: number;
}

export function LoadingScreen({
    onLoadComplete,
    minDisplayTime = 4000
}: LoadingScreenProps) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                onLoadComplete?.();
            }, 800); // Wait for exit animation
        }, minDisplayTime);

        return () => clearTimeout(timer);
    }, [minDisplayTime, onLoadComplete]);

    return (
        <AnimatePresence>
            {!isExiting && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAFAFA] overflow-hidden"
                >
                    {/* Technical Grid Background */}
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}
                    />

                    {/* Ambient Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ide-accent/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />

                    <div className="relative flex flex-col items-center gap-10 z-10">
                        {/* Brand Logo Animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 2 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="mb-2"
                        >
                            <AnimatedLogo loopPingPong={true} />
                        </motion.div>

                        {/* System Boot Sequence */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <TerminalStatus
                                texts={[
                                    "Abdelbadie Khoubiza",
                                    "Full-Stack Developer",
                                    "Loading Portfolio v3.02...",
                                    "Welcome.",
                                    "B.411 x B.DEV"
                                ]}
                                className="!bg-white/50 !backdrop-blur-xl !border-black/5 shadow-2xl scale-110"
                            />

                            {/* Minimal Progress Line */}
                            <div className="w-48 h-[2px] bg-black/5 rounded-full overflow-hidden">
                                <div className="h-full bg-ide-accent animate-[loading_2.5s_ease-in-out_infinite] w-full origin-left" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Version Tag */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="absolute bottom-8 text-xs font-mono text-ide-muted/60 tracking-widest uppercase"
                    >
                        System Booting
                    </motion.div>

                    <style>{`
                        @keyframes loading {
                            0% { transform: scaleX(0); transform-origin: left; }
                            50% { transform: scaleX(0.7); transform-origin: left; }
                            100% { transform: scaleX(0); transform-origin: right; }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default LoadingScreen;
