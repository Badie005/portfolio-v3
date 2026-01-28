import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// Supported locales
export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = "en";

// Locale labels for UI
export const localeLabels: Record<Locale, string> = {
    fr: "Français",
    en: "English",
};

// Locale flags for UI
export const localeFlags: Record<Locale, string> = {
    fr: "🇫🇷",
    en: "🇬🇧",
};

export default getRequestConfig(async ({ requestLocale }) => {
    // Validate that the incoming locale is valid
    const locale = await requestLocale;

    if (!locale || !locales.includes(locale as Locale)) {
        notFound();
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
