# Rapport d'Audit - Portfolio v3.02

**Date:** 03 Décembre 2025
**Auditeur:** Antigravity (Google Deepmind)

## 1. Résumé Exécutif

Le projet repose sur une stack technologique très moderne et performante (Next.js 16, React 19, Tailwind v4). L'architecture globale est saine, modulaire et respecte les standards du App Router. La configuration de sécurité via le middleware est excellente (CSP, Headers).

Cependant, deux problèmes majeurs nécessitent une attention immédiate :
1.  **CRITIQUE (Sécurité)** : La clé API Google Gemini est exposée côté client (`NEXT_PUBLIC_GEMINI_API_KEY`), permettant à n'importe qui de l'utiliser à vos frais.
2.  **MAJEUR (Qualité)** : La couverture de tests est quasi inexistante (un seul test E2E et un test unitaire trouvés), ce qui rend le projet fragile aux régressions.

## 2. Contexte Technique

*   **Framework** : Next.js 16.0.1 (App Router)
*   **Langage** : TypeScript 5
*   **Styling** : Tailwind CSS v4 (Alpha/Beta), `clsx`, `tailwind-merge`
*   **UI** : Radix UI (Primitives), Shadcn/ui, Framer Motion (Animations), Lottie
*   **Backend / Services** :
    *   Email : Resend
    *   Rate Limiting : Upstash (Redis)
    *   AI : Google Gemini (`@google/generative-ai`)
*   **Tests** : Vitest, Playwright

## 3. Architecture et Design

### Architecture Globale
*   **Type** : Application Next.js (SSR/SSG/ISR) hébergée probablement sur Vercel (vu l'usage de Next.js et Upstash).
*   **Routing** : Utilisation correcte du **App Router** (`src/app`).
*   **Séparation** :
    *   `src/app` : Pages et Layouts.
    *   `src/components` : Composants UI et Sections.
    *   `src/lib` : Logique métier (Gemini, Rate Limit).
    *   `src/api` : Routes API Backend.

### Points Forts
*   Utilisation de `ClientLayout` pour isoler les providers client-side, gardant le Root Layout propre.
*   Structure de dossiers claire dans `components` (`ui`, `sections`, `code-window`).

### Points d'Amélioration
*   **Service Gemini** : La classe `GeminiService` (`src/lib/gemini.ts`) est bien conçue (retry, cache), mais elle est instanciée et utilisée côté client (via `useGemini` et `ChatPanel`), ce qui force l'exposition de la clé API.
    *   **Solution** : Déplacer l'appel à Gemini dans une Route API (`src/app/api/chat/route.ts`) et faire appeler cette route par le client.

## 4. Qualité du Code

### Analyse Statique
*   Le code est propre, bien typé et utilise les fonctionnalités modernes de React (Hooks, Components).
*   Utilisation cohérente de `clsx` et `tailwind-merge` pour les classes conditionnelles.

### Composant `ProjectDetailCard.tsx`
*   **Positif** : Utilisation de `next/image` avec `sizes`, animations fluides avec `motion`.
*   **Négatif** : Présence de couleurs hexadécimales en dur (lignes 34-36 : `#FF5F56`, etc.) pour les boutons de fenêtre. Elles devraient être dans la config Tailwind ou des variables CSS pour supporter le theming.

### Tests
*   **État** : Très insuffisant.
    *   `e2e/contact.spec.ts` : Seul test E2E visible.
    *   `__tests__/components/ContactSection.test.tsx` : Seul test unitaire trouvé.
*   **Risque** : Élevé. Toute refactorisation ou mise à jour de dépendance (surtout avec Tailwind v4 et Next 16 qui sont récents) risque de casser des fonctionnalités sans avertissement.

## 5. Sécurité

### Points Forts
*   **Middleware (`middleware.ts`)** : Configuration exemplaire.
    *   Content Security Policy (CSP) stricte avec gestion des nonces.
    *   Headers de sécurité (HSTS, X-Frame-Options, X-Content-Type-Options).
    *   Vérification de `NODE_ENV`.

### Vulnérabilités Critiques
*   **Exposition Clé API** : `process.env.NEXT_PUBLIC_GEMINI_API_KEY` est utilisé dans `src/lib/gemini.ts`. Comme ce service est importé dans des composants clients (`ChatPanel`), la clé se retrouve dans le bundle JS du navigateur.
    *   **Preuve** : Préfixe `NEXT_PUBLIC_`.
    *   **Impact** : Vol de quota, surcoût financier, déni de service.

## 6. Performance et Scalabilité

*   **Images** : Bonne utilisation de `next/image` et configuration des formats (`avif`, `webp`) dans `next.config.ts`.
*   **Fontes** : Utilisation de `next/font` (Google Fonts) qui optimise le chargement et évite le CLS (Cumulative Layout Shift).
*   **Rate Limiting** : Implémenté via Upstash (`src/lib/rate-limit.ts`), excellent pour protéger les routes API et le chat AI.

## 7. Expérience Utilisateur et Accessibilité

*   **Accessibilité** :
    *   Présence d'un "Skip Link" (`Aller au contenu principal`) dans `layout.tsx`.
    *   Utilisation de balises sémantiques (`main`, `article`, `h3`).
    *   Attributs `aria-hidden` sur les éléments décoratifs.
*   **UX** : Animations soignées (Framer Motion) et feedback utilisateur (Toaster Sonner).

## 8. Liste Priorisée d'Actions

### 🔴 Priorité Haute (Blockers / Critique)
1.  **Sécuriser l'API Gemini** :
    *   Créer une route API `src/app/api/chat/route.ts`.
    *   Déplacer l'instanciation de `GeminiService` dans cette route (côté serveur).
    *   Utiliser `process.env.GEMINI_API_KEY` (sans `NEXT_PUBLIC_`).
    *   Modifier le client (`useGemini` / `ChatPanel`) pour appeler `/api/chat` au lieu d'utiliser le service directement.

### 🟡 Priorité Moyenne (Important)
2.  **Mettre en place des tests** :
    *   Ajouter des tests unitaires pour les utilitaires (`src/lib`).
    *   Ajouter des tests de composants pour les éléments critiques (`ProjectCard`, `ChatPanel`).
    *   Configurer un workflow CI (GitHub Actions) pour lancer les tests à chaque push.
3.  **Refactoriser les couleurs en dur** :
    *   Remplacer les codes hexadécimaux dans `ProjectDetailCard` et autres par des classes Tailwind ou variables CSS.

### 🟢 Priorité Basse (Optimisation)
4.  **Audit de dépendances** : Vérifier la stabilité de Tailwind v4 (encore récent) et ses plugins.
5.  **Monitoring** : Ajouter un outil comme Sentry pour tracker les erreurs JS en production.

## 9. Recommandations Concrètes

### Pour sécuriser Gemini (Exemple de Route API)

```typescript
// src/app/api/chat/route.ts
import { GeminiService } from "@/lib/gemini";
import { NextResponse } from "next/server";

// Initialiser le service avec la clé PRIVÉE (côté serveur uniquement)
const gemini = new GeminiService({
  apiKey: process.env.GEMINI_API_KEY // Pas de NEXT_PUBLIC_ ici !
});

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    const response = await gemini.sendMessage(message, history);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

### Commandes utiles pour l'audit local
*   Lancer les tests : `npm run test` ou `npm run test:e2e`
*   Vérifier le build : `npm run build` (pour voir les erreurs de type et la taille des bundles)
*   Linter : `npm run lint`
