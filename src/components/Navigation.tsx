"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Empêche le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
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
    { name: t("about"), href: "/#about", isAnchor: true },
    { name: t("skills"), href: "/#skills", isAnchor: true },
    { name: t("projects"), href: "/projects", isAnchor: false },
    { name: t("blog"), href: "/blog", isAnchor: false },
    { name: t("contact"), href: "/#contact", isAnchor: true },
  ];

  const isActiveLink = (item: typeof navItems[0]) => {
    if (item.href === "/projects") {
      return pathname === "/projects" || pathname.startsWith("/projects/");
    }
    if (item.href === "/blog") {
      return pathname === "/blog" || pathname.startsWith("/blog/");
    }
    if (item.isAnchor) {
      return pathname === "/" && item.href.startsWith("/#");
    }
    return pathname === item.href;
  };

  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (item.isAnchor && pathname === "/") {
      e.preventDefault();
      const id = item.href.split("#")[1];
      scrollToSection(id);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out border-b border-transparent ${isScrolled
          ? "bg-[#FAFAF7]/95 backdrop-blur-md border-[#E5E4DF]/50 shadow-[0_4px_20px_-2px_rgba(25,25,25,0.06)]"
          : "bg-transparent"
          }`}
      >
        <div className="w-full px-6 lg:px-[276px]">
          <div className="flex items-center justify-between h-[68px]">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center"
            >
              <AnimatedLogo isScrolled={isScrolled} className="h-5 text-[#1A1A1A]" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">
              <nav className="flex items-center">
                {navItems.map((item) => {
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item)}
                      className="text-[15px] font-normal text-[#2D2A24] underline decoration-1 decoration-transparent hover:decoration-[#2D2A24] transition-[text-decoration-color] duration-150 antialiased px-3"
                      style={{
                        fontFamily: "'Saans', sans-serif",
                        letterSpacing: '-0.0375px',
                        textUnderlineOffset: '4px',
                        lineHeight: '21px'
                      }}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Section droite */}
              <div className="flex items-center gap-2 pl-4 border-l border-[#E5E4DF]">
                <LanguageSwitcher />

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full border-[#2D2A24]/20 text-[#2D2A24] hover:bg-[#2D2A24]/10 hover:border-[#2D2A24]/40 transition-all duration-300 font-medium px-4 h-8 text-[13px]"
                  style={{ fontFamily: "'Saans', sans-serif" }}
                >
                  <Link href="/api/cv">
                    {t("downloadCV")}
                  </Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-[#2D2A24] text-white hover:bg-[#3D3A34] active:scale-95 transition-all duration-300 font-medium px-4 h-8 text-[13px]"
                  style={{ fontFamily: "'Saans', sans-serif" }}
                >
                  <Link
                    href="/#contact"
                    onClick={(e) => {
                      if (pathname === "/") {
                        e.preventDefault();
                        scrollToSection("contact");
                      }
                    }}
                  >
                    {t("contactMe")}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Bouton Menu Mobile - Style organique */}
            <button
              className="lg:hidden relative w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:text-[#1A1A1A] hover:bg-[#E5E5E5]/20 transition-all duration-300 rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="relative w-5 h-5">
                <Menu
                  size={20}
                  strokeWidth={1.5}
                  className={`absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
                />
                <X
                  size={20}
                  strokeWidth={1.5}
                  className={`absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Menu Mobile - Overlay avec tons chauds */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#1A1A1A]/10 backdrop-blur-sm transition-opacity duration-500"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Carte Menu */}
        <div
          className={`absolute top-24 left-4 right-4 bg-[#FAFAF7] rounded-[2rem] shadow-2xl border border-[#E5E4DF] overflow-hidden transition-all duration-500 ease-out ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
            }`}
        >
          <nav className="flex flex-col p-2">
            {navItems.map((item, index) => {
              const isActive = isActiveLink(item);
              return (
                <div
                  key={item.name}
                  className="transition-all duration-300"
                  style={{
                    transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : "0ms",
                    transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-10px)",
                    opacity: isMobileMenuOpen ? 1 : 0
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`flex items-center justify-between mx-2 px-4 py-4 text-[17px] font-medium transition-all duration-300 rounded-2xl ${isActive
                      ? "bg-[#E5E5E5]/50 text-[#1A1A1A]"
                      : "text-[#666663] hover:text-[#1A1A1A] hover:bg-[#F0F0EB]/50"
                      }`}
                    style={{ fontFamily: "'Clash Display', sans-serif" }}
                  >
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]" />
                    )}
                  </Link>
                </div>
              );
            })}

            <div className="m-4 mt-6 pt-6 border-t border-[#E5E4DF] flex flex-col gap-3">
              <div className="px-2 mb-2">
                <LanguageSwitcher />
              </div>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-full border-[#1A1A1A]/15 text-[#1A1A1A] hover:bg-[#F0F0EB]/50 py-5 text-[15px]"
              >
                <Link href="/api/cv" onClick={() => setIsMobileMenuOpen(false)}>
                  {t("downloadCV")}
                </Link>
              </Button>
              <Button
                asChild
                className="w-full rounded-full bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] py-5 text-[15px] shadow-none"
              >
                <Link
                  href="/#contact"
                  onClick={(e) => {
                    if (pathname === "/") {
                      e.preventDefault();
                      scrollToSection("contact");
                      setIsMobileMenuOpen(false);
                    }
                  }}
                >
                  {t("contactMe")}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}