"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Globe, ArrowRight } from "lucide-react";

interface TranslationInfo {
    locale: string;
    slug: string;
    title: string;
}

interface ArticleLanguageSwitcherProps {
    translations: TranslationInfo[];
}

export function ArticleLanguageSwitcher({ translations }: ArticleLanguageSwitcherProps) {
    const currentLocale = useLocale();
    const t = useTranslations("blog");

    // Filter out current locale
    const otherTranslations = translations.filter((t) => t.locale !== currentLocale);

    // If no other translations, don't show switcher
    if (otherTranslations.length === 0) {
        return null;
    }

    // Locale display names
    const localeNames: Record<string, string> = {
        fr: "Français",
        en: "English",
    };

    return (
        <div className="flex items-center gap-3 text-sm">
            <Globe className="w-4 h-4 text-ide-muted" />
            <span className="text-ide-muted">{t("availableIn")}</span>
            <div className="flex items-center gap-2">
                {otherTranslations.map((translation) => (
                    <Link
                        key={translation.locale}
                        href={`/blog/${translation.slug}`}
                        locale={translation.locale}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ide-accent bg-ide-accent/10 border border-ide-accent/20 rounded-full hover:bg-ide-accent/20 transition-colors"
                    >
                        {localeNames[translation.locale] || translation.locale}
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                ))}
            </div>
        </div>
    );
}

interface ArticleLanguageNoticeProps {
    requestedLocale: string;
}

export function ArticleLanguageNotice({ requestedLocale }: ArticleLanguageNoticeProps) {
    const t = useTranslations("blog");

    const localeNames: Record<string, string> = {
        fr: "français",
        en: "English",
    };

    return (
        <div className="mb-8 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
                {t("notAvailableInLanguage", { language: localeNames[requestedLocale] || requestedLocale })}
            </p>
        </div>
    );
}
