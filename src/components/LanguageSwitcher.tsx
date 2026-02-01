"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/request";
import { useState, useEffect } from "react";


const localeDisplay: Record<Locale, string> = {
    fr: "FR",
    en: "EN",
};

export function LanguageSwitcher() {
    const locale = useLocale() as Locale;
    const t = useTranslations("nav");
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLocaleChange = (newLocale: Locale) => {
        if (newLocale === locale) return;

        // Strip any existing locale prefix from pathname to prevent double prefixes like /fr/fr
        let cleanPathname = pathname;

        // Remove any locale prefix that might be in the pathname
        for (const loc of locales) {
            // Handle exact match like "/fr" -> "/"
            if (cleanPathname === `/${loc}`) {
                cleanPathname = "/";
                break;
            }
            // Handle prefix like "/fr/projects" -> "/projects"
            if (cleanPathname.startsWith(`/${loc}/`)) {
                cleanPathname = cleanPathname.slice(loc.length + 1);
                break;
            }
        }

        // Ensure pathname starts with "/"
        if (!cleanPathname.startsWith("/")) {
            cleanPathname = "/" + cleanPathname;
        }

        // Use window.location for a full page reload to ensure Server Components re-render
        // This is necessary for pages like blog that fetch locale-specific data server-side
        const newUrl = `/${newLocale}${cleanPathname}`;
        window.location.href = newUrl;
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="inline-flex items-center p-1 rounded-full border border-[#2D2A24]/20 bg-[#2D2A24]/5">
                {locales.map((loc) => (
                    <span
                        key={loc}
                        className={`w-7 h-6 flex items-center justify-center rounded-full text-xs font-medium tracking-wide ${locale === loc
                            ? "bg-white text-[#2D2A24] shadow-sm"
                            : "text-[#2D2A24]/50"
                            }`}
                        style={{ fontFamily: "'Saans', sans-serif" }}
                    >
                        {localeDisplay[loc]}
                    </span>
                ))}
            </div>
        );
    }

    return (
        <div
            className="inline-flex items-center p-1 rounded-full border border-[#2D2A24]/20 bg-[#2D2A24]/5"
            role="group"
            aria-label={t("changeLanguage")}
        >
            {locales.map((loc) => {
                const isActive = locale === loc;
                return (
                    <button
                        key={loc}
                        type="button"
                        onClick={() => handleLocaleChange(loc)}
                        aria-pressed={isActive}
                        className={`relative w-7 h-6 flex items-center justify-center rounded-full text-xs font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D2A24]/30 ${isActive ? "bg-white shadow-sm text-[#2D2A24]" : "text-[#2D2A24]/50 hover:text-[#2D2A24]/80"
                            }`}
                        style={{ fontFamily: "'Saans', sans-serif" }}
                    >
                        {localeDisplay[loc]}
                    </button>
                );
            })}
        </div>
    );
}
