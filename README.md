# 🎨 Portfolio Abdelbadie Khoubiza

Portfolio professionnel moderne développé avec Next.js 16, React 19, TypeScript et Tailwind CSS v4.

## 🚀 Technologies utilisées

- **Framework** : Next.js 16.0.7 (App Router)
- **UI** : React 19.2.0
- **Styling** : Tailwind CSS v4
- **Langage** : TypeScript 5
- **Animations** : Framer Motion (motion)
- **Formulaires** : React Hook Form
- **Validation** : Zod
- **Emails** : Resend API
- **Icônes** : Lucide React
- **UI Components** : Radix UI, shadcn/ui
- **Notifications** : Sonner

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Créer un fichier .env.local à la racine :
RESEND_API_KEY=votre_clé_resend
FROM_EMAIL=onboarding@resend.dev
TO_EMAIL=badiekhoubiza05@gmail.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Lancer le serveur de développement
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🎯 Fonctionnalités

### ✅ Implémentées
- 🎨 Design minimaliste noir et blanc
- 📱 Responsive (mobile, tablet, desktop)
- ⚡ Navigation sticky avec menu mobile
- 🎭 Animations fluides avec Framer Motion
- 📝 Formulaire de contact fonctionnel avec Resend
- ✉️ Rate limiting sur l'API (5 emails/heure)
- 🔍 SEO optimisé (metadata, Open Graph, Twitter Cards)
- 📄 Sitemap.xml et robots.txt automatiques
- 🌐 JSON-LD structured data (Schema.org)
- 🎪 PWA Support (manifest.json)
- ♿ Accessibilité (WCAG 2.1)
- 🚀 Performance optimisée (Next.js Image)

### 📄 Pages
- **/** - Page d'accueil avec toutes les sections
  - Hero avec appel à l'action
  - À propos avec principes et statistiques
  - 3 projets mis en avant
  - Expérience professionnelle
  - Compétences techniques
  - Formulaire de contact
- **/projects** - Page dédiée aux projets

## 📁 Structure du projet

```
portfolio-v.3.02/
├── src/
│   ├── app/
│   │   ├── api/contact/         # API Route Resend
│   │   ├── projects/            # Page projets
│   │   ├── layout.tsx           # Layout global
│   │   ├── page.tsx             # Homepage
│   │   ├── globals.css          # Styles Tailwind
│   │   ├── sitemap.ts           # Génération sitemap
│   │   └── robots.ts            # Génération robots.txt
│   ├── components/
│   │   ├── sections/            # Sections homepage
│   │   │   ├── HeroSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── ProjectsSection.tsx
│   │   │   ├── ExperienceSection.tsx
│   │   │   ├── SkillsSection.tsx
│   │   │   └── ContactSection.tsx
│   │   ├── ui/                  # Composants UI réutilisables
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   ├── ProjectCard.tsx
│   │   └── ProjectDetailCard.tsx
│   ├── data/
│   │   └── projects.ts          # Données des projets
│   ├── lib/
│   │   └── utils.ts             # Fonctions utilitaires
│   └── types/
│       └── index.ts             # Types TypeScript
├── public/
│   └── manifest.json            # PWA manifest
├── .env.local                   # Variables d'environnement
├── next.config.ts               # Configuration Next.js
├── tailwind.config.ts           # Configuration Tailwind
└── tsconfig.json                # Configuration TypeScript
```

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer le serveur production
npm start

# Linter
npm run lint
```

## 📧 Configuration du formulaire de contact

1. Créer un compte sur [Resend](https://resend.com)
2. Générer une clé API
3. Ajouter la clé dans `.env.local`
4. Tester le formulaire sur la page d'accueil

Le formulaire inclut :
- Validation en temps réel
- Messages d'erreur clairs
- Rate limiting (5 messages/heure par IP)
- Compteur de caractères
- States de chargement
- Notifications toast

## 🚀 Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Déployer en production
vercel --prod
```

N'oubliez pas d'ajouter les variables d'environnement dans les paramètres Vercel.

## 👨‍💻 Auteur

**Abdelbadie Khoubiza**
- GitHub : [@Badie005](https://github.com/Badie005)
- LinkedIn : [abdelbadie-khoubiza](https://linkedin.com/in/abdelbadie-khoubiza)
- Email : badiekhoubiza05@gmail.com

## 📝 License

Ce projet est sous licence MIT.
