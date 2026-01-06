import { FileSystemItem } from './types';

export const INITIAL_FILES: FileSystemItem[] = [
  {
    name: '.config',
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
    name: 'profile',
    type: 'folder',
    isOpen: false,
    children: [
      {
        name: 'about.md',
        type: 'markdown',
        content: `# 👋 À propos

## Abdelbadie Khoubiza
**Full Stack Developer** | Fès, Maroc

Passionné par la création d'expériences web modernes et performantes.
J'allie une approche minimaliste à une attention méticuleuse aux détails techniques.

### Chiffres clés
| Indicateur | Valeur |
|------------|--------|
| Projets réalisés | 3 |
| Technologies | 8+ |
| Stages effectués | 2 |
| Temps de réponse | 24h |

### Contact
📧 a.khoubiza.dev@gmail.com`
      },
      {
        name: 'philosophie.md',
        type: 'markdown',
        content: `# 💡 Philosophie

> "Simplicité, élégance et efficacité dans chaque ligne de code."

## Principes

### Performance
Je conçois des applications en pensant performance, accessibilité et maintenabilité.

### Simplicité
Une approche minimaliste avec une attention méticuleuse aux détails techniques.

### Efficacité
Transformer des idées en produits numériques efficaces, élégants et pérennes.`
      }
    ]
  },
  {
    name: 'experience',
    type: 'folder',
    isOpen: true,
    children: [
      {
        name: 'experience_1.md',
        type: 'markdown',
        content: `# 🏢 Stage Développeur Full-Stack

## Agence Urbaine de Taza
**Jan - Fév 2024** | Stage

### Mission
Audit complet de l'infrastructure Windows Server, création de scripts PowerShell pour automatiser les tâches administratives, et élaboration d'un plan de migration vers Azure.

### Stack technique
\`\`\`
PowerShell | Windows Server | Active Directory | Azure
\`\`\`

### Réalisations
- Audit infrastructure datacenter
- Scripts d'automatisation PowerShell
- Plan de migration cloud Azure
- Rapport de recommandations sécurité`
      },
      {
        name: 'experience_2.md',
        type: 'markdown',
        content: `# 🎓 Projet Académique - Portail USMBA

## Université Sidi Mohamed Ben Abdellah
**Mars - Juin 2024** | Projet Académique

### Mission
Développement d'une application web complète pour automatiser l'inscription et la gestion académique des étudiants.

### Stack technique
\`\`\`
Laravel | PHP 8.2 | MySQL | Tailwind CSS
\`\`\`

### Résultats
| Métrique | Valeur |
|----------|--------|
| Utilisateurs | 500+ |
| Disponibilité | 99.8% |
| Modules | 12 |`
      },
      {
        name: 'experience_3.md',
        type: 'markdown',
        content: `# 🚀 Projet Personnel - Plateforme E-learning

## AYJI E-learning
**Sept - Déc 2023** | Projet Personnel

### Mission
Conception et développement d'une plateforme d'apprentissage en ligne avec système de cours, quiz interactifs et suivi de progression en temps réel.

### Stack technique
\`\`\`
Node.js | Angular | MongoDB | Socket.io
\`\`\`

### Résultats
| Métrique | Valeur |
|----------|--------|
| Utilisateurs | 500+ |
| Cours vidéo | 50+ |
| Satisfaction | 4.7/5 |`
      }
    ]
  },
  {
    name: 'stack',
    type: 'folder',
    isOpen: false,
    children: [
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
      },
      {
        name: 'tools.md',
        type: 'markdown',
        content: `# 🛠️ Outils Quotidiens

## Développement
- **IDE**: VS Code, WebStorm
- **Terminal**: Windows Terminal, PowerShell
- **Version Control**: Git, GitHub

## Design
- **UI/UX**: Figma
- **Prototypage**: Figma, Excalidraw

## Productivité
- **Notes**: Notion, Obsidian
- **Communication**: Discord, Slack`
      }
    ]
  },
  {
    name: 'projects',
    type: 'folder',
    isOpen: false,
    children: [
      {
        name: 'project_ayji.md',
        type: 'markdown',
        content: `# 📚 AYJI E-learning

## Plateforme d'apprentissage en ligne

### Technologies
- React.js + Tailwind CSS
- Node.js + Express
- MongoDB + Docker

### Métriques
| Indicateur | Valeur |
|------------|--------|
| Utilisateurs | 500+ |
| Cours | 50+ |
| Satisfaction | 4.7/5 |`
      },
      {
        name: 'project_usmba.md',
        type: 'markdown',
        content: `# 🏫 Portail de Gestion USMBA

## Application de gestion universitaire

### Technologies
- Next.js 14 + TypeScript
- Laravel 11 + PHP 8.3
- PostgreSQL + Docker

### Modules
- Gestion des étudiants
- Gestion des notes
- Emplois du temps
- Notifications email/SMS`
      },
      {
        name: 'project_audit.md',
        type: 'markdown',
        content: `# 🔐 Audit Infrastructure Datacenter

## Mission de conseil - Agence Urbaine

### Livrables
- Rapport d'audit 50+ pages
- Recommandations de sécurité
- Plan de modernisation 3 ans

### Technologies auditées
- Windows Server 2019
- Active Directory
- Infrastructure réseau
- Politique de sécurité`
      }
    ]
  },
  {
    name: 'contact',
    type: 'folder',
    isOpen: false,
    children: [
      {
        name: 'channels.md',
        type: 'markdown',
        content: `# 📬 Contact

## Abdelbadie Khoubiza

### Canaux de communication
| Canal | Lien |
|-------|------|
| 📧 Email | a.khoubiza.dev@gmail.com |
| 💼 LinkedIn | /in/abdelbadie-khoubiza |
| 🐙 GitHub | /Badie005 |

### Disponibilité
🟢 **Disponible** pour :
- Freelance
- CDI
- Collaboration ponctuelle

⏱️ Temps de réponse : **< 24h**`
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
