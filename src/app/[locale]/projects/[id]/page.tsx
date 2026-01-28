import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getProjectById, projectsFr } from "@/data/projects";
import { ProjectDetailContent } from "@/app/projects/[id]/ProjectDetailContent";
import { Metadata } from "next";
import { routing } from "@/i18n/routing";

interface Props {
    params: Promise<{ locale: string; id: string }>;
}

export function generateStaticParams() {
    return routing.locales.flatMap((locale) =>
        projectsFr.map((project) => ({ locale, id: project.id }))
    );
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, id } = await params;
    const t = await getTranslations({ locale, namespace: "projects" });
    const project = getProjectById(id, locale);

    if (!project) {
        return { title: t("detail.notFoundTitle") };
    }

    return {
        title: project.title,
        description: project.description,
        openGraph: {
            title: project.title,
            description: project.description,
            images: [{ url: project.image, width: 1200, height: 630, alt: project.title }],
        },
    };
}

export default async function ProjectPage({ params }: Props) {
    const { locale, id } = await params;
    setRequestLocale(locale);

    const project = getProjectById(id, locale);
    if (!project) notFound();

    return <ProjectDetailContent project={project} />;
}
