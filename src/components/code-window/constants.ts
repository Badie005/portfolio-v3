import { FileSystemItem } from './types';

export const INITIAL_FILES: FileSystemItem[] = [
  {
    name: 'portfolio',
    type: 'folder',
    isOpen: true,
    children: [
      {
        name: 'experience',
        type: 'folder',
        isOpen: false,
        children: [
          {
            name: 'formation.md',
            type: 'markdown',
            content: `# 🎓 Formation Universitaire

## Licence en Sciences Mathématiques et Informatique
**Université Sidi Mohamed Ben Abdellah (USMBA)** | Fès, Maroc
*2021 - 2024*

### Compétences acquises
- Algorithmique et structures de données
- Programmation orientée objet (Java, C++)
- Bases de données relationnelles (SQL, MySQL)
- Développement web (HTML, CSS, JavaScript)
- Réseaux et systèmes d'exploitation

### Moyenne générale
**14.5/20** - Mention Bien`
          },
          {
            name: 'pfe_bts_mcw.md',
            type: 'markdown',
            content: `# 🎓 PFE - BTS Management Commercial et Web

## Plateforme E-learning AYJI
**Projet de Fin d'Études** | Fès, Maroc | 2024

### Contexte académique
Projet de fin d'études pour l'obtention du BTS MCW.

### Réalisations techniques
- **Frontend**: Interface moderne avec React.js et Tailwind CSS
- **Backend**: API RESTful avec Node.js et Express
- **Base de données**: MongoDB avec Mongoose ODM
- **Auth**: Système d'authentification JWT sécurisé
- **Paiement**: Intégration CMI pour les abonnements

### Résultats
- +500 utilisateurs inscrits en 3 mois
- 50+ cours vidéo publiés
- Note de satisfaction: 4.7/5
- **Mention**: Très Bien`
          },
          {
            name: 'projets_freelance.md',
            type: 'markdown',
            content: `# 🚀 Projets & Freelance

## Portail de Gestion USMBA
*Projet académique + Freelance*

### Stack technique
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Laravel 11, PHP 8.3
- **BDD**: PostgreSQL
- **Infra**: Docker, Nginx, CI/CD GitHub Actions

### Fonctionnalités
- Dashboard administrateur complet
- Gestion des inscriptions et réinscriptions
- Génération automatique des bulletins de notes
- Export PDF/Excel des données

---

## Audit Infrastructure Datacenter
*Mission de conseil*

### Livrables
- Rapport d'audit 50+ pages
- Recommandations de sécurité
- Plan de modernisation 3 ans`
          }
        ]
      },
      {
        name: 'projets',
        type: 'folder',
        isOpen: false,
        children: [
          {
            name: 'ayji_elearning.md',
            type: 'markdown',
            content: `# 📚 Plateforme E-learning AYJI

## Technologies
- React.js + Tailwind CSS
- Node.js + Express
- MongoDB + Docker

## Métriques
| Indicateur | Valeur |
|------------|--------|
| Utilisateurs | 500+ |
| Cours | 50+ |
| Satisfaction | 4.7/5 |`
          },
          {
            name: 'portail_usmba.md',
            type: 'markdown',
            content: `# 🏫 Portail de Gestion USMBA

## Technologies
- Next.js 14 + TypeScript
- Laravel 11 + PHP 8.3
- PostgreSQL + Docker

## Modules
- Gestion des étudiants
- Gestion des notes
- Emplois du temps
- Notifications email/SMS`
          }
        ]
      },
      {
        name: 'skills.json',
        type: 'json',
        content: `{
  "frontend": {
    "frameworks": ["Next.js", "React.js", "Vue.js"],
    "styling": ["Tailwind CSS", "CSS3", "SASS"],
    "languages": ["TypeScript", "JavaScript"]
  },
  "backend": {
    "frameworks": ["Node.js", "Express", "Laravel"],
    "databases": ["PostgreSQL", "MongoDB", "MySQL"],
    "languages": ["Python", "PHP", "Java"]
  },
  "devops": {
    "containers": ["Docker", "Kubernetes"],
    "ci_cd": ["GitHub Actions", "Jenkins"],
    "cloud": ["AWS", "Vercel", "DigitalOcean"]
  }
}`
      }
    ]
  },
  {
    name: 'src',
    type: 'folder',
    isOpen: false,
    children: [
      {
        name: 'components',
        type: 'folder',
        isOpen: false,
        children: [
          {
            name: 'ContactForm.tsx',
            type: 'typescript',
            content: `"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  subject: z.string().min(5, "Sujet trop court"),
  message: z.string().min(20, "Message trop court"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = (data: ContactFormData) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        
        if (res.ok) {
          toast.success("Message envoyé !");
          form.reset();
        } else {
          toast.error("Erreur d'envoi");
        }
      } catch (e) {
        toast.error("Erreur de connexion");
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input {...form.register("name")} placeholder="Nom" />
      <Input {...form.register("email")} type="email" placeholder="Email" />
      <Input {...form.register("subject")} placeholder="Sujet" />
      <Textarea {...form.register("message")} placeholder="Message..." />
      
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="animate-spin" /> : <Send />}
        {isPending ? "Envoi..." : "Envoyer"}
      </Button>
    </form>
  );
}`
          },
          {
            name: 'HeroSection.tsx',
            type: 'typescript',
            content: `"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Github, Linkedin } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const CodeWindow = dynamic(() => import("./CodeWindow"), {
  loading: () => <div className="animate-pulse bg-muted h-96 rounded-xl" />,
});

export function HeroSection() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const y = useTransform(scrollY, [0, 300], [0, 50]);

  return (
    <section className="relative min-h-screen flex items-center py-20">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12">
        <motion.div style={{ opacity, y }} className="space-y-8">
          <div className="inline-flex items-center gap-2 text-sm font-mono">
            <span className="animate-pulse text-green-500">●</span>
            Available for work
          </div>
          
          <h1 className="text-6xl lg:text-7xl font-heading leading-[1.1]">
            Code with <span className="text-accent">Passion</span>,
            <br />Build with <span className="text-accent">Purpose</span>
          </h1>
          
          <p className="text-xl text-muted max-w-lg">
            Full Stack Developer créant des expériences web modernes.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/projects" className="btn-primary">
              Voir projets <ArrowRight />
            </Link>
            <Link href="#contact" className="btn-outline">
              Me contacter
            </Link>
          </div>
          
          <div className="flex gap-4">
            <a href="https://github.com/Badie005" className="text-muted hover:text-foreground">
              <Github size={20} />
            </a>
            <a href="https://linkedin.com/in/abdelbadie-khoubiza" className="text-muted hover:text-foreground">
              <Linkedin size={20} />
            </a>
          </div>
        </motion.div>
        
        <div className="hidden lg:block">
          <CodeWindow />
        </div>
      </div>
    </section>
  );
}`
          }
        ]
      },
      {
        name: 'lib',
        type: 'folder',
        isOpen: false,
        children: [
          {
            name: 'utils.ts',
            type: 'typescript',
            content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names with Tailwind merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date in French locale
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "..." : str;
}`
          }
        ]
      }
    ]
  },
  {
    name: 'config',
    type: 'folder',
    isOpen: true,
    children: [
      {
        name: 'B.DEV.json',
        type: 'json',
        content: `{
  "identity": {
    "name": "Abdelbadie Khoubiza",
    "alias": "B.DEV",
    "role": "Full Stack Developer",
    "status": "🟢 Disponible",
    "version": "3.0.2"
  },
  "contact": {
    "email": "a.khoubiza.dev@gmail.com",
    "location": "Fès, Maroc",
    "timezone": "GMT+1"
  },
  "stack": {
    "frontend": ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    "backend": ["Node.js", "Laravel", "Python"],
    "database": ["PostgreSQL", "MongoDB"],
    "devops": ["Docker", "GitHub Actions", "Vercel"]
  }
}`
      },
      {
        name: 'B.411.json',
        type: 'json',
        content: `{
  "identity": {
    "alias": "B.411",
    "role": "Creative Designer",
    "aesthetic": "Minimalist Modern"
  },
  "design_system": {
    "colors": {
      "primary": "#1A1A1A",
      "accent": "#CD7C5B",
      "surface": "#FAFAFA"
    },
    "typography": {
      "heading": "Outfit",
      "body": "Inter",
      "mono": "JetBrains Mono"
    }
  },
  "principles": [
    "La fonction dicte la forme",
    "L'espace blanc est un élément",
    "Les micro-interactions comptent"
  ]
}`
      }
    ]
  },
  {
    name: 'README.md',
    type: 'markdown',
    content: `# 👋 B.DEV x B.411
### Portfolio Abdelbadie Khoubiza

![Version](https://img.shields.io/badge/version-3.0.2-black)
![Status](https://img.shields.io/badge/status-available-success)

## À propos
Développeur Full Stack passionné par la création d'expériences web modernes.

## Stack technique
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind v4
- **Backend**: Node.js, Laravel, PostgreSQL, Docker
- **Design**: Figma, UI/UX, Design System

## Projets phares
- 🎓 **AYJI E-learning** - Plateforme éducative (PFE BTS)
- 🏫 **Portail USMBA** - Gestion universitaire
- 🔐 **Audit Datacenter** - Sécurité infrastructure

## Contact
a.khoubiza.dev@gmail.com`
  },
  {
    name: 'package.json',
    type: 'json',
    content: `{
  "name": "portfolio-abdelbadie",
  "version": "3.0.2",
  "author": "Abdelbadie Khoubiza",
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "16.0.7",
    "react": "19.2.0",
    "tailwindcss": "4.0.0",
    "framer-motion": "11.0.0",
    "typescript": "5.7.0"
  }
}`
  }
];
