# Portfolio Abdelbadie Khoubiza (portfolio-v3) <!-- CI Test -->

Portfolio professionnel moderne développé avec Next.js 16, React 19, TypeScript et Tailwind CSS v4.

## Technologies utilisées

- **Framework** : Next.js 16 (App Router)
- **UI** : React 19
- **Styling** : Tailwind CSS v4
- **Langage** : TypeScript 5
- **Animations** : motion/react
- **Formulaires** : React Hook Form + Zod
- **Emails** : Resend API
- **UI Components** : Radix UI, shadcn/ui
- **Analytics** : Vercel Analytics

## Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Créer un fichier .env.local à la racine :
RESEND_API_KEY=votre_clé_resend
FROM_EMAIL=onboarding@resend.dev
TO_EMAIL=badiekhoubiza05@gmail.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GOOGLE_AI_API_KEY=votre_clé_google_ai
OPENROUTER_API_KEY=votre_clé_openrouter
UPSTASH_REDIS_REST_URL=votre_url_upstash
UPSTASH_REDIS_REST_TOKEN=votre_token_upstash

# Lancer le serveur de développement
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## Fonctionnalités

### Implémentées
- Design minimaliste avec thème clair
- Responsive (mobile, tablet, desktop)
- Navigation sticky avec menu mobile
- Animations fluides avec motion/react
- Formulaire de contact fonctionnel avec Resend
- Rate limiting sur l'API (5 emails/heure)
- SEO optimisé (metadata, Open Graph, Twitter Cards)
- Sitemap.xml et robots.txt automatiques
- JSON-LD structured data (Schema.org)
- PWA Support (manifest.json)
- Accessibilité (WCAG 2.1)
- Performance optimisée (Next.js Image, WebP/AVIF)

### Pages
- **/** - Page d'accueil avec toutes les sections
  - Hero avec IDE interactif et agent B.AI
  - Services proposés
  - À propos
  - Expérience professionnelle
  - Compétences techniques (Tech Stack)
  - Galerie AI Generated Art
  - Formulaire de contact
- **/projects** - Page dédiée aux projets
- **/projects/[id]** - Détail d'un projet

## Structure du projet

```
portfolio-v3/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/            # API Gemini AI
│   │   │   ├── contact/         # API Resend
│   │   │   └── health/          # Health check
│   │   ├── projects/            # Pages projets
│   │   ├── layout.tsx           # Layout global
│   │   ├── page.tsx             # Homepage
│   │   └── globals.css          # Styles Tailwind
│   ├── components/
│   │   ├── sections/            # Sections homepage
│   │   ├── code-window/         # IDE interactif avec B.AI Agent
│   │   ├── ui/                  # Composants shadcn/ui
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   ├── data/
│   │   └── projects.ts          # Données des projets
│   ├── lib/
│   │   ├── gemini.ts            # Service Gemini AI
│   │   └── utils.ts             # Fonctions utilitaires
│   └── types/
├── public/
│   ├── images/                  # Images galerie
│   ├── icons/                   # Icônes SVG
│   └── logo/                    # Logos
├── e2e/                         # Tests Playwright
└── docs/                        # Documentation
```

## Scripts disponibles

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer le serveur production
npm start

# Linter
npm run lint

# Tests E2E
npm run test:e2e
```

## Configuration du formulaire de contact

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

## Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Déployer en production
vercel --prod
```

N'oubliez pas d'ajouter les variables d'environnement dans les paramètres Vercel.

## Auteur

**Abdelbadie Khoubiza**
- GitHub : [@Badie005](https://github.com/Badie005)
- LinkedIn : [abdelbadie-khoubiza](https://linkedin.com/in/abdelbadie-khoubiza)
- Email : a.khoubiza.dev@gmail.com

## License

Ce projet est sous licence MIT.
