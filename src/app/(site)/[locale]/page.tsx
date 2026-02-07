import { setRequestLocale, getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

// Hero section - Keep static for LCP (Largest Contentful Paint)
import { HeroSection } from "@/components/sections/HeroSection";

// Loading skeleton for below-the-fold sections
const SectionSkeleton = () => (
    <div className="animate-pulse h-96 bg-ide-sidebar/20 rounded-lg mx-6 my-12" />
);

// Dynamic imports for below-the-fold sections (code splitting)
const ServicesSection = dynamic(
    () => import("@/components/sections/ServicesSection").then(mod => ({ default: mod.ServicesSection })),
    { loading: () => <SectionSkeleton /> }
);

const AboutSection = dynamic(
    () => import("@/components/sections/AboutSection").then(mod => ({ default: mod.AboutSection })),
    { loading: () => <SectionSkeleton /> }
);

const ExperienceSection = dynamic(
    () => import("@/components/sections/ExperienceSection").then(mod => ({ default: mod.ExperienceSection })),
    { loading: () => <SectionSkeleton /> }
);

const SkillsSection = dynamic(
    () => import("@/components/sections/SkillsSection").then(mod => ({ default: mod.SkillsSection })),
    { loading: () => <SectionSkeleton /> }
);

const GallerySection = dynamic(
    () => import("@/components/sections/GallerySection").then(mod => ({ default: mod.GallerySection })),
    { loading: () => <SectionSkeleton /> }
);

const ContactSection = dynamic(
    () => import("@/components/sections/ContactSection").then(mod => ({ default: mod.ContactSection })),
    { loading: () => <SectionSkeleton /> }
);

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "meta" });

    return {
        title: t("title"),
        description: t("description"),
        openGraph: {
            images: ["/api/og?type=default&title=B.DEV&description=Full-Stack%20Developer"],
        },
    };
}

export default async function Home({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <main>
            <HeroSection />
            <ServicesSection />
            <AboutSection />
            <ExperienceSection />
            <SkillsSection />
            <GallerySection />
            <ContactSection />
        </main>
    );
}
