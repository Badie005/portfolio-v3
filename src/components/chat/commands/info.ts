import { CommandRegistry } from '../ChatCommands';
import { CommandContext } from '../ChatContext';
import { computePortfolioStats, formatPortfolioStats } from '@/lib/fileSearch';

const handleStats = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    const files = ctx.contextFiles.filter((f): f is FileData => 'content' in f);
    const stats = computePortfolioStats(files);
    const formattedStats = formatPortfolioStats(stats);
    
    ctx.dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: { text: formattedStats }
    });
    return true;
};

const handleProjects = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    const text = `## Projets

### 01 — Portfolio IDE *(Current Context — Production)*
**Type:** Interactive developer portfolio
**Stack:** Next.js 16, TypeScript, Tailwind CSS v4, OpenRouter AI, Vercel
**Key Features:** Virtual terminal (50+ cmds), File Explorer, Glassmorphism UI, B.AI Agent, Tab management

### 02 — USMBA Portal *(2025 — Completed)*
**Type:** Academic management system
**Client:** Université Sidi Mohamed Ben Abdellah
**Stack:** Laravel 12, MySQL, Alpine.js, Tailwind CSS
**Highlight:** QR-code-embedded PDF generation

### 03 — AYJI E-learning *(2025 — Completed)*
**Type:** Learning Management System (LMS)
**Stack:** Angular 19, NgRx, Node.js, MongoDB, Redis, Socket.io
**Highlight:** Real-time quiz with live scoring

### 04 — IT Infrastructure Audit *(2024 — Internship)*
**Client:** Agence Urbaine de Taza
**Focus:** Network audit, VMware virtualization, Security hardening`;

    ctx.dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: { text }
    });
    return true;
};

const handleStack = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    const text = `## Stack Technique

| Category | Technologies |
|----------|--------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Node.js, Laravel 12, Python |
| Database | MongoDB, MySQL, Redis |
| DevOps | Docker, Vercel, VMware |
| Design | Figma, Glassmorphism, Responsive UI |
| State | NgRx, React Context, Zustand |
| Real-time | Socket.io, WebSockets |
| Testing | Vitest, Jest, Playwright |`;

    ctx.dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: { text }
    });
    return true;
};

const handleContact = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    const text = `## Contact

**Name:** Abdelbadie Khoubiza
**Email:** a.khoubiza.dev@gmail.com
**Location:** Morocco
**GitHub:** github.com/abdelbadie
**LinkedIn:** linkedin.com/in/abdelbadie

---

Open to freelance, full-time, and collaboration opportunities.`;

    ctx.dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: { text }
    });
    return true;
};

const handleHelp = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    const text = `## Commandes Disponibles

### Navigation
- \`/tour\` — Visite guidée du portfolio
- \`/terminal\` — Ouvrir le terminal
- \`/explorer\` — Ouvrir l'explorateur
- \`/close <file>\` — Fermer un onglet

### Code Intelligence
- \`/tests\` — Générer des tests unitaires
- \`/review\` — Code review du fichier actif
- \`/doc\` — Générer la documentation

### Fichiers
- \`/search <query>\` — Rechercher dans les fichiers
- \`/run <command>\` — Exécuter une commande terminal

### Export
- \`/resume\` — Télécharger le CV
- \`/download <file> <content>\` — Télécharger un fichier

### Info
- \`/stats\` — Statistiques du portfolio
- \`/projects\` — Lister les projets
- \`/stack\` — Stack technique
- \`/contact\` — Informations de contact

### Modes
- \`/interview\` — Mode entretien
- \`/recruiter\` — Mode recruteur
- \`/casual\` — Mode décontracté

### Autre
- \`/clear\` — Effacer la conversation
- \`/help\` — Cette aide`;

    ctx.dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: { text }
    });
    return true;
};

import { FileData } from '@/components/code-window/types';

export function register(reg: CommandRegistry): void {
    reg.register('/stats', handleStats);
    reg.register('/projects', handleProjects);
    reg.register('/stack', handleStack);
    reg.register('/contact', handleContact);
    reg.register('/help', handleHelp);

    reg.registerPattern(
        /(?:statistiques?|stats|métriques?|combien\s+de\s+(?:fichiers?|lignes?|fiches?)|how\s+many\s+(?:files?|lines?))/i,
        handleStats
    );
}
