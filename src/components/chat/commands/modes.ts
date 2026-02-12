import { CommandRegistry } from '../ChatCommands';
import { CommandContext } from '../ChatContext';

const handleTour = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    const text = `## Bienvenue dans le Portfolio B.DEV

Je suis B.AI, l'agent intelligent intégré à ce portfolio. Laissez-moi vous guider.

### Étape 1 — Profil Technique
Abdelbadie Khoubiza, Full Stack Developer & Designer basé au Maroc.

**Stack principale:** Next.js 16, TypeScript, Tailwind CSS v4, Node.js
**Stack secondaire:** Laravel 12, Angular 19, MongoDB, Redis

### Étape 2 — Projets
4 projets documentés:
- **Portfolio IDE** — VS Code simulation en browser
- **USMBA Portal** — Gestion académique multi-rôles
- **AYJI E-learning** — LMS temps réel
- **IT Audit** — Infrastructure enterprise

### Étape 3 — Exploration
Tapez \`/projects\` pour les détails, ou explorez les fichiers dans l'explorateur.

Que souhaitez-vous découvrir en premier ?`;

    ctx.dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: { text }
    });
    return true;
};

const handleInterview = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    const text = `## Mode Entretien Activé

Je réponds maintenant comme si j'étais Abdelbadie en entretien technique.

**Approche:** Context → Approach → Implementation → Result

Je vais:
- Expliquer mon processus de résolution de problèmes
- Référencer des projets concrets comme preuve de compétence
- Rester humble mais précis sur mes niveaux de compétence

Posez votre première question.`;

    ctx.dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: { text }
    });
    return true;
};

const handleRecruiter = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    const text = `## Mode Recruteur Activé

Je présente les informations de manière optimisée pour les recruteurs.

**Métriques clés:**
- 4 projets documentés
- 16+ technologies maîtrisées
- Expérience full-stack: frontend, backend, DevOps

**Disponibilité:** Freelance, CDI, collaboration

Tapez \`/resume\` pour télécharger le CV formaté.

Que souhaitez-vous savoir ?`;

    ctx.dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: { text }
    });
    return true;
};

const handleCasual = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    const text = `## Mode Décontracté

On peut discuter tech plus librement. 

Quelques opinions:
- **React vs Angular:** J'utilise les deux. React pour la flexibilité, Angular pour les gros projets enterprise.
- **Tailwind vs CSS:** Tailwind pour la vitesse, CSS custom pour les design systems uniques.
- **Next.js:** Mon choix par défaut pour le web moderne.

Votre question ?`;

    ctx.dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: { text }
    });
    return true;
};

export function register(reg: CommandRegistry): void {
    reg.register('/tour', handleTour);
    reg.register('/interview', handleInterview);
    reg.register('/recruiter', handleRecruiter);
    reg.register('/casual', handleCasual);

    reg.registerPattern(
        /(?:peux-tu\s+)?(?:me\s+)?(?:faire\s+)?(?:une\s+)?(?:visite|tour)/i,
        handleTour
    );
}
