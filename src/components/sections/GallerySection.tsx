"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { TerminalStatus } from "@/components/ui/TerminalStatus";
import { useTranslations } from "next-intl";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface GalleryImage {
    src: string;
    alt: string;
    title: string;
    desc: string;
}

const AUTOPLAY_INTERVAL = 5000;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GallerySection() {
    const tGallery = useTranslations("gallery");
    const galleryImages = tGallery.raw("images") as GalleryImage[];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Navigation
    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    }, [galleryImages.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }, [galleryImages.length]);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore events from input elements (allow normal typing)
            const target = e.target as HTMLElement;
            const isInputElement =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;

            if (isInputElement) return;

            if (e.key === "ArrowLeft") prevSlide();
            if (e.key === "ArrowRight") nextSlide();
            if (e.key === " ") {
                e.preventDefault();
                setIsAutoPlaying((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextSlide, prevSlide]);

    // Auto-play
    useEffect(() => {
        if (!isAutoPlaying) {
            if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
            return;
        }
        autoPlayTimerRef.current = setInterval(nextSlide, AUTOPLAY_INTERVAL);
        return () => {
            if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
        };
    }, [isAutoPlaying, nextSlide]);

    return (
        <section id="gallery" className="py-24 md:py-32" aria-label={tGallery("ariaLabel")}>
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header - Harmonisé avec le design system */}
                <div className="mb-16 lg:mb-20 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <TerminalStatus
                            texts={tGallery.raw("terminalTexts") as string[]}
                            className="mb-6"
                        />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        className="text-4xl lg:text-5xl font-medium text-ide-accent mb-6 font-heading tracking-tight"
                    >
                        {tGallery("title")}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg text-ide-muted leading-relaxed font-body"
                    >
                        {tGallery("description")}
                    </motion.p>
                </div>

                {/* Gallery Content */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                >
                    {/* Main Layout */}
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Main Image */}
                        <div className="flex-1 relative">
                            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="absolute inset-0 bg-neutral-100"
                                    >
                                        <Image
                                            src={galleryImages[currentIndex].src}
                                            alt={galleryImages[currentIndex].alt}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1024px) 100vw, 70vw"
                                            priority
                                            unoptimized
                                        />
                                    </motion.div>
                                </AnimatePresence>

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

                                {/* Counter */}
                                <div className="absolute bottom-5 left-5 text-white font-mono">
                                    <span className="text-3xl font-light">
                                        {String(currentIndex + 1).padStart(2, "0")}
                                    </span>
                                    <span className="text-white/50 text-lg ml-1">
                                        / {String(galleryImages.length).padStart(2, "0")}
                                    </span>
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setIsAutoPlaying((prev) => !prev)}
                                    className="w-12 h-12 rounded-full bg-white border border-ide-border flex items-center justify-center text-ide-muted hover:bg-ide-accent hover:text-white hover:border-transparent transition-all"
                                    aria-label={isAutoPlaying ? tGallery("controls.pause") : tGallery("controls.play")}
                                >
                                    {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                                <button
                                    onClick={prevSlide}
                                    className="w-12 h-12 rounded-full bg-white border border-ide-border flex items-center justify-center text-ide-muted hover:bg-ide-accent hover:text-white hover:border-transparent transition-all"
                                    aria-label={tGallery("controls.previous")}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="w-12 h-12 rounded-full bg-ide-accent flex items-center justify-center text-white hover:bg-brand transition-all"
                                    aria-label={tGallery("controls.next")}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="w-full lg:w-52 flex flex-col gap-4 sm:gap-6">
                            {/* Info */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h3 className="text-xl font-heading font-semibold text-brand mb-1">
                                        {galleryImages[currentIndex].title}
                                    </h3>
                                    <p className="text-ide-muted text-sm font-body">
                                        {galleryImages[currentIndex].desc}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            {/* Thumbnails */}
                            <div className="grid grid-cols-3 lg:grid-cols-2 gap-2 sm:gap-3">
                                {galleryImages.map((image, index) => (
                                    <button
                                        key={image.src}
                                        onClick={() => goToSlide(index)}
                                        className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-200 ${index === currentIndex
                                            ? "ring-2 ring-ide-accent ring-offset-2"
                                            : "opacity-60 hover:opacity-100"
                                            }`}
                                        aria-label={tGallery("controls.viewImage", { title: image.title })}
                                    >
                                        <Image
                                            src={image.src}
                                            alt={image.alt}
                                            fill
                                            className="object-cover"
                                            sizes="100px"
                                            unoptimized
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Progress */}
                            <div className="mt-auto">
                                <div className="h-1 bg-ide-border rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-ide-accent"
                                        animate={{ width: `${((currentIndex + 1) / galleryImages.length) * 100}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-ide-muted mt-2 font-mono">
                                    <span>{tGallery("progress.label")}</span>
                                    <span>{currentIndex + 1} / {galleryImages.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
