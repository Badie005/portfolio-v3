"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import throttle from "lodash/throttle";
import { AnimatedLogo } from "@/components/AnimatedLogo";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = throttle(() => {
      setIsScrolled(window.scrollY > 20);
    }, 100);
    const handleScroll: EventListener = () => {
      onScroll();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      onScroll.cancel?.();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset pour le header fixe (hauteur du header + marge)
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { name: "À propos", href: "/#about", isAnchor: true },
    { name: "Projets", href: "/projects", isAnchor: false },
    { name: "Compétences", href: "/#skills", isAnchor: true },
    { name: "Contact", href: "/#contact", isAnchor: true },
  ];

  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (item.isAnchor) {
      const id = item.href.split("#")[1];

      if (pathname === "/") {
        // Sur la page d'accueil, empêcher la navigation et faire un scroll smooth
        e.preventDefault();
        scrollToSection(id);
      }
      // Si on n'est pas sur la page d'accueil, laisser Next.js naviguer puis scroller
    }
    setIsMobileMenuOpen(false);
  };

  const headerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    headerRef.current.style.setProperty("--mouse-x", `${x}px`);
    headerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          padding: isScrolled ? '12px 16px 0 16px' : '0',
        }}
      >
        {/* Liquid Glass Container - Apple Style */}
        <div
          ref={headerRef}
          onMouseMove={handleMouseMove}
          className="relative mx-auto transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group overflow-hidden"
          style={{
            width: isScrolled ? 'min(100% - 32px, 1280px)' : '100%',
            borderRadius: isScrolled ? '16px' : '0',
          }}

        >
          {/* Spotlight Effect - Subtle */}
          <div
            className="absolute pointer-events-none opacity-0 group-hover:opacity-60 transition-opacity duration-500"
            style={{
              width: "250px",
              height: "250px",
              background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
              borderRadius: "50%",
              top: 0,
              left: 0,
              transform: "translate(calc(var(--mouse-x, -500px) - 50%), calc(var(--mouse-y, -500px) - 50%))",
              zIndex: 1,
            }}
          />

          {/* Glassmorphism background */}
          <div
            className="absolute inset-0 transition-all duration-500"
            style={{
              background: isScrolled
                ? 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.55) 100%)'
                : 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(20px) saturate(150%)',
              WebkitBackdropFilter: 'blur(20px) saturate(150%)',
            }}
          />

          <div className="relative px-4 sm:px-6 py-3 max-w-7xl mx-auto z-10">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Link href="/" className="block hover:opacity-80 transition-opacity">
                  <AnimatedLogo isScrolled={isScrolled} />
                </Link>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item)}
                      className="text-ide-muted hover:text-brand transition-colors px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button asChild size="sm">
                    <Link
                      href="/#contact"
                      onClick={(e) => {
                        if (pathname === "/") {
                          e.preventDefault();
                          scrollToSection("contact");
                        }
                      }}
                    >
                      Démarrer un projet
                    </Link>
                  </Button>
                </motion.div>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden text-brand"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-4 pb-4 border-t border-white/30 pt-4"
              >
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item)}
                      className="text-ide-text/80 hover:text-brand transition-colors text-left px-4 py-2 rounded-xl hover:bg-white/40 font-medium"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.nav>
    </>
  );
}
