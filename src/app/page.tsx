import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { GallerySection } from "@/components/sections/GallerySection";

export default function Home() {
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
