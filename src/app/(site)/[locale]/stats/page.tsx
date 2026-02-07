import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { BarChart3, Download, Eye, Users } from "lucide-react";

// Revalidate stats page every minute
export const revalidate = 60;

type Props = {
    params: Promise<{ locale: string }>;
};



export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "stats" });

    return {
        openGraph: {
            title: t("title"),
            description: t("description"),
            images: [{ url: "/api/og?type=default&title=Stats", width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image",
            title: t("title"),
            description: t("description"),
            images: ["/api/og?type=default&title=Stats"],
        },
    };
}

export default async function StatsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const t = await getTranslations({ locale, namespace: "stats" });
    // Mocked stats since we dismantled the tracking system
    const stats = {
        cvDownloads: 0,
        pageViews: 0,
        uniqueVisitors: 0
    };

    const statsCards = [
        {
            label: t("cvDownloads"),
            value: stats.cvDownloads,
            icon: Download,
            color: "text-orange-500",
            bgColor: "bg-orange-100 dark:bg-orange-900/30",
        },
        {
            label: t("pageViews"),
            value: stats.pageViews,
            icon: Eye,
            color: "text-blue-500",
            bgColor: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
            label: t("uniqueVisitors"),
            value: stats.uniqueVisitors,
            icon: Users,
            color: "text-green-500",
            bgColor: "bg-green-100 dark:bg-green-900/30",
        },
    ];

    const infoItems = t.raw("aboutItems") as string[];

    return (
        <div className="min-h-screen py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <header className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                        <BarChart3 className="w-4 h-4" />
                        {t("title")}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                        {t("subtitle")}
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        {t("description")}
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {statsCards.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm"
                        >
                            <div className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-4`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                                {stat.value.toLocaleString(locale === "en" ? "en-US" : "fr-FR")}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                        {t("aboutTitle")}
                    </h2>
                    <ul className="space-y-2 text-neutral-600 dark:text-neutral-400 text-sm">
                        {infoItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-orange-500">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-center text-xs text-neutral-400 mt-8">
                    {t("lastUpdated")}: {new Date().toLocaleString(locale === "en" ? "en-US" : "fr-FR")}
                </p>
            </div>
        </div>
    );
}
