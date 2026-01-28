"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { locales, localeLabels, type Locale } from "@/i18n/request";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

type LanguageSwitcherProps = {
    onLocaleChange?: () => void;
};

export function LanguageSwitcher({ onLocaleChange }: LanguageSwitcherProps) {
    const locale = useLocale() as Locale;
    const t = useTranslations("nav");
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState<
        { top: number; left: number; width: number } | null
    >(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;

            const clickedTrigger = dropdownRef.current?.contains(target);
            const clickedMenu = menuRef.current?.contains(target);

            if (!clickedTrigger && !clickedMenu) setIsOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useLayoutEffect(() => {
        if (!isOpen) {
            setMenuPosition(null);
            return;
        }

        const updatePosition = () => {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const width = 176;
            const left = Math.min(
                window.innerWidth - width - 8,
                Math.max(8, rect.right - width)
            );
            const top = rect.bottom + 8;

            setMenuPosition({ top, left, width });
        };

        updatePosition();

        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [isOpen]);

    const handleLocaleChange = (newLocale: Locale) => {
        router.replace(pathname, { locale: newLocale });
        setIsOpen(false);
        onLocaleChange?.();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/30 bg-white/30 backdrop-blur-md text-ide-muted hover:text-brand hover:bg-white/50 transition-colors text-sm font-medium"
                aria-label={t("changeLanguage")}
                aria-expanded={isOpen}
            >
                <span className="font-mono text-xs tracking-wide">{locale.toUpperCase()}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen &&
                menuPosition &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="fixed z-[60] rounded-xl border border-white/40 bg-white/80 backdrop-blur-md shadow-xl p-1"
                        style={{
                            top: menuPosition.top,
                            left: menuPosition.left,
                            width: menuPosition.width,
                        }}
                    >
                        {locales.map((loc) => (
                            <button
                                key={loc}
                                type="button"
                                onClick={() => handleLocaleChange(loc)}
                                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors ${
                                    locale === loc
                                        ? "bg-ide-accent/15 text-brand"
                                        : "text-ide-muted hover:bg-black/5 hover:text-brand"
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-ide-muted/70">
                                        {loc.toUpperCase()}
                                    </span>
                                    <span className="text-sm">{localeLabels[loc]}</span>
                                </span>
                                {locale === loc ? (
                                    <Check className="w-4 h-4 text-ide-accent" />
                                ) : null}
                            </button>
                        ))}
                    </div>,
                    document.body
                )}
        </div>
    );
}
