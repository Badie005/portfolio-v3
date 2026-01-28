import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ["fr", "en"],

    // Used when no locale matches
    defaultLocale: "en",

    // The prefix mode for locale in URLs
    // 'as-needed': default locale has no prefix, others do
    // 'always': all locales have prefix
    // 'never': no locale prefix
    localePrefix: "as-needed",
});
