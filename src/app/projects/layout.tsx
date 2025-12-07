import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projets - Abdelbadie Khoubiza | Portfolio",
  description:
    "Portfolio complet de mes projets : applications web full-stack, plateformes e-learning et infrastructure DevOps. Technologies : Laravel, React, Node.js, Angular, PHP, MongoDB.",
  keywords: [
    "Portfolio",
    "Développeur Full-Stack",
    "Laravel",
    "React",
    "Node.js",
    "Angular",
    "PHP",
    "MongoDB",
    "DevOps",
    "Azure",
    "Maroc"
  ],
  authors: [{ name: "Abdelbadie Khoubiza" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/projects`,
    siteName: "Abdelbadie Khoubiza Portfolio",
    title: "Projets - Abdelbadie Khoubiza",
    description: "Découvrez mes réalisations professionnelles en développement web et DevOps",
    images: [
      {
        url: "/og-projects.jpg",
        width: 1200,
        height: 630,
        alt: "Projets de Abdelbadie Khoubiza",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projets - Abdelbadie Khoubiza",
    description: "Découvrez mes réalisations professionnelles",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
