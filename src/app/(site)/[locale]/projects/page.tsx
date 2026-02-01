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
        title: t("title"),
        description: t("description"),
    };
}

export default async function ProjectsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const projects = getProjects(locale);

    return <ProjectsPageClient projects={projects} />;
}
