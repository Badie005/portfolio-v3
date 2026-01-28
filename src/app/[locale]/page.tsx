import { setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { GallerySection } from "@/components/sections/GallerySection";

type Props = {
    params: Promise<{ locale: string }>;
};

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
