import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getProjects } from "@/data/projects";
import { ProjectsPageClient } from "./ProjectsPageClient";

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "projects" });

    return {
        openGraph: {
            title: t("title"),
            description: t("description"),
            images: [{ url: "/api/og?type=default&title=Projects", width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image",
            title: t("title"),
            description: t("description"),
            images: ["/api/og?type=default&title=Projects"],
        },
    };
}

export default async function ProjectsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const projects = getProjects(locale);

    return <ProjectsPageClient projects={projects} />;
}
