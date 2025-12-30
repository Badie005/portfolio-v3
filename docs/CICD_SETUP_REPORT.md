# Rapport de Configuration CI/CD - 30 Décembre 2025

## 1. Protection de Branche (`main`)

**État :** ⚠️ Non activée (Limitations GitHub).

**Détails :**
La tentative d'activation des règles de protection de branche via l'API a échoué avec une erreur `403`.
> "Upgrade to GitHub Pro or make this repository public to enable this feature."

La protection de branche (requérir des status checks, bloquer le force push, etc.) est une fonctionnalité réservée aux dépôts publics ou aux organisations/utilisateurs avec un plan GitHub Pro/Team sur les dépôts privés.

**Recommandation :**
Si la protection est critique :
1.  Passer le dépôt en **Public** (si le contenu le permet).
2.  Ou souscrire à **GitHub Pro**.
3.  À défaut, s'appuyer sur la discipline d'équipe : ne jamais commiter directement sur `main`, toujours passer par une PR.

## 2. Secrets Vercel (Environnement)

Pour que le déploiement et l'application fonctionnent correctement, les variables d'environnement suivantes doivent être configurées dans le tableau de bord Vercel (Project Settings > Environment Variables) :

| Variable | Usage | Requis |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | URL canonique du site (ex: `https://votre-domaine.com`). Utilisé pour le SEO, Sitemap, Robots. | ✅ OUI |
| `UPSTASH_REDIS_REST_URL` | URL de connexion à la base Redis Upstash (Rate Limit). | ✅ OUI |
| `UPSTASH_REDIS_REST_TOKEN` | Token d'authentification Redis Upstash. | ✅ OUI |
| `OPENROUTER_API_KEY` | Clé API pour le service de chat (Gemini via OpenRouter). | ✅ OUI |
| `RESEND_API_KEY` | Clé API pour le formulaire de contact (envoi d'emails). | ✅ OUI |
| `GOOGLE_AI_API_KEY` | Clé API de secours (Google Gemini direct). | ⚠️ Recommandé |
| `FROM_EMAIL` | Adresse d'expédition des emails (ex: `onboarding@resend.dev` ou domaine vérifié). | ❌ Optionnel |
| `TO_EMAIL` | Adresse de réception des demandes de contact. | ❌ Optionnel |

**Note :** Ne jamais commiter ces secrets dans le dépôt git (`.env` ou code).

## 3. Dependabot

**État :** ✅ Activé.

Le fichier de configuration `.github/dependabot.yml` est présent et valide.
- **NPM** : Mises à jour hebdomadaires (Lundi 09:00 Paris).
- **GitHub Actions** : Mises à jour hebdomadaires (Lundi).
- **Groupes** : Les mises à jour mineures et patchs sont regroupées pour réduire le bruit (`production-deps`, `dev-deps`).

## 4. Test du Pipeline CI

Une branche de test `test-ci` a été créée et une Pull Request (#16) a été ouverte pour valider le pipeline.

**Lien PR :** [PR #16](https://github.com/Badie005/portfolio-v3/pull/16)

**Checks attendus (définis dans `.github/workflows/ci.yml`) :**
1.  `Lint & Type Check` (ESLint + TSC)
2.  `Unit Tests` (Vitest)
3.  `Build` (Next.js Build)
4.  `E2E Tests` (Playwright) - *Se lance après le build.*
5.  `Lighthouse CI` - *Se lance après le build.*
6.  `Security Audit` (npm audit + trufflehog)

Vérifiez le statut de ces checks directement sur la page de la Pull Request.
