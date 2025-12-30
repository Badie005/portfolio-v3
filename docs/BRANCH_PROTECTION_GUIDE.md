# 🛡️ GitHub Branch Protection Rules

Ce guide explique comment configurer les règles de protection pour renforcer ton workflow CI/CD.

## Configuration recommandée pour `main`

### 1. Activer la protection de branche

1. Va sur **Settings** → **Branches** → **Add rule**
2. Branch name pattern: `main`

### 2. Règles à activer

| Règle | Valeur | Description |
|-------|--------|-------------|
| **Require a pull request before merging** | ✅ | Pas de push direct sur main |
| **Require approvals** | 0 (ou 1 si équipe) | Review optionnelle pour solo dev |
| **Dismiss stale PR approvals** | ✅ | Nouvelle review si code modifié |
| **Require status checks to pass** | ✅ | CI doit être vert |
| **Status checks required** | `lint`, `test`, `build` | Jobs critiques |
| **Require branches to be up to date** | ✅ | Force le rebase |
| **Require conversation resolution** | ✅ | Tous les commentaires résolus |
| **Do not allow bypassing** | ✅ | Même les admins doivent suivre |

### 3. Checks à exiger (Status checks)

Ajoute ces checks comme **required** :
- `Lint & Type Check`
- `Unit Tests`
- `Build`

### 4. Ligne de commande (GitHub CLI)

```bash
gh api -X PUT /repos/Badie005/portfolio-v3/branches/main/protection \
  -f required_status_checks='{"strict":true,"contexts":["Lint & Type Check","Unit Tests","Build"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":0}' \
  -f restrictions=null
```

## Secrets à configurer

Pour que le workflow fonctionne complètement, configure ces secrets dans **Settings** → **Secrets and variables** → **Actions** :

| Secret | Description | Où le trouver |
|--------|-------------|---------------|
| `VERCEL_TOKEN` | Token API Vercel | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | ID de ton org Vercel | Dashboard Vercel → Project Settings |
| `VERCEL_PROJECT_ID` | ID du projet | Dashboard Vercel → Project Settings |
| `LHCI_GITHUB_APP_TOKEN` | Token Lighthouse CI | [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci) |

## Résultat attendu

Avec cette configuration :
- ✅ Aucun push direct sur `main`
- ✅ Toutes les PRs passent par le CI
- ✅ Build, lint et tests obligatoires
- ✅ Mises à jour auto des dépendances (Dependabot)
- ✅ Audits de sécurité automatiques
