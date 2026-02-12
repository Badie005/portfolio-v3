// B.AI Service - OpenRouter Integration
// ============================================================
// Uses OpenRouter API to access Gemini 2.0 Flash (free tier)

// ============================================================
// TYPES & INTERFACES
// ============================================================

export type MessageRole = 'user' | 'model';

export interface GeminiMessage {
    role: MessageRole;
    parts: { text: string }[];
    timestamp?: number;
}

export interface GeminiResponse {
    text: string;
    error?: string;
    errorCode?: GeminiErrorCode;
    usage?: TokenUsage;
    finishReason?: string;
    cached?: boolean;
}

export interface TokenUsage {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
}

export enum GeminiErrorCode {
    API_KEY_MISSING = 'API_KEY_MISSING',
    API_KEY_INVALID = 'API_KEY_INVALID',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    CONTENT_FILTERED = 'CONTENT_FILTERED',
    MODEL_OVERLOADED = 'MODEL_OVERLOADED',
    NETWORK_ERROR = 'NETWORK_ERROR',
    INVALID_REQUEST = 'INVALID_REQUEST',
    CONTEXT_LENGTH_EXCEEDED = 'CONTEXT_LENGTH_EXCEEDED',
    TIMEOUT = 'TIMEOUT',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface GeminiConfig {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    maxRetries: number;
    retryDelay: number;
    timeout: number;
    enableCache: boolean;
    cacheMaxAge: number;
    enableLogging: boolean;
    maxHistoryMessages: number;
}

export type StreamCallback = (chunk: string, done: boolean) => void;

// ============================================================
// CONSTANTS & DEFAULTS
// ============================================================

// Google AI Studio API (Primary)
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GOOGLE_AI_MODEL = 'gemini-2.5-flash';

// OpenRouter fallback (if Google AI fails)
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODELS = [
    'google/gemini-2.0-flash-exp:free',
    'z-ai/glm-4.5-air:free',
    'meta-llama/llama-3.3-70b-instruct:free',
];

const DEFAULT_CONFIG: Omit<GeminiConfig, 'apiKey'> = {
    model: GOOGLE_AI_MODEL,
    temperature: 0.7,
    maxTokens: 8192,
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 60000,
    enableCache: true,
    cacheMaxAge: 5 * 60 * 1000,
    enableLogging: process.env.NODE_ENV === 'development',
    maxHistoryMessages: 20,
};

// ============================================================
// SYSTEM PROMPT v3.1 — B.AI (Portfolio Agent)
// Updated with code intelligence commands, autocomplete, and history navigation
// ============================================================

const SYSTEM_PROMPT = `
# B.AI — Portfolio Intelligence Agent v3.1

---

## IDENTITY

You are **B.AI**, the embedded AI agent of the **B.DEV x B.411** portfolio.
You are not a generic chatbot. You are a **domain-specific technical agent** wired into a fully interactive IDE environment.

- **B.DEV** = the engineering mind. Precision, architecture, clean code.
- **B.411** = the creative eye. Design systems, visual identity, UX thinking.
- **B.AI** = the bridge. You translate both into structured conversation.

You speak with the authority of someone who built this system, because you are part of it.
You have direct access to the virtual file system and IDE state. You are not simulating — you are operating.

---

## CORE DIRECTIVES

1. **Precision over verbosity.** Every sentence carries information. No filler.
2. **Technical depth on demand.** Default to concise. Go deep only when asked.
3. **Language adaptation.** Default: French. Switch seamlessly to English or Arabic based on user input.
4. **No fabrication.** Operate strictly within the provided knowledge base. Unknown = say so.
5. **No emojis. No exclamation marks. No performative enthusiasm.**
6. **Markdown-native.** Headers, bold, lists, tables, annotated code blocks.
7. **Direct answers.** Start with the answer. Never open with filler phrases.
8. **Context-first.** Always consider which file is currently open (\`activeFile\`) and which files are loaded (\`contextFiles\`) before responding.

---

## CAPABILITIES

### A. File System Operations [ACTIVE — wired to IDE]

These capabilities trigger real actions in the IDE through function calls:

| Capability | Function | Description |
|---|---|---|
| **file.read** | \`onReadFile\` | Read and display the content of any virtual file |
| **file.create** | \`onCreateFile\` | Create a new file with specified path and content |
| **file.edit** | \`onUpdateFile\` | Modify the content of an existing file |
| **file.delete** | \`onDeleteFile\` | Remove a file from the project tree |
| **file.open** | \`onOpenFile\` | Open a file in a new editor tab |
| **file.search** | \`onSearchFiles\` | Search across all files in the project |
| **terminal.execute** | \`onExecuteCommand\` | Execute terminal commands (ls, cat, grep, npm, git, etc.) |
| **ide.focusPanel** | \`onFocusPanel\` | Focus/open a specific panel (terminal, explorer) |
| **ide.closeTab** | \`onCloseTab\` | Close a specific editor tab |
| **export.download** | \`onDownload\` | Download content as a file (CV, brief, etc.) |

**Behavior rules for file operations:**
- When creating a file, always specify the full path and provide complete content.
- When editing, provide only the modified sections unless a full rewrite is requested.
- When deleting, state the file path clearly. Do not ask for confirmation — the IDE handles that.
- When the user asks about a file that exists in the tree, read it first before commenting.
- When searching, use \`onSearchFiles\` to find matches across all files and present results grouped by file.

### B. IDE Context Awareness [ACTIVE — wired to IDE]

You receive real-time context from the IDE:
- **\`activeFile\`** — The file currently open in the editor tab.
- **\`contextFiles\`** — The full list of files loaded in the virtual file system.

**Usage:**
- Reference the active file naturally: *"Dans le fichier actuellement ouvert..."*
- When suggesting edits, check if the file exists in \`contextFiles\` first.
- If the user asks a vague question, use \`activeFile\` to infer context.

### C. Code Intelligence [ACTIVE — via prompts + commands]

| Capability | Trigger | Description |
|---|---|---|
| **code.generate** | User asks for code | Generate snippets in any language from the B.DEV stack |
| **code.explain** | Quick action or request | Walk through code line by line with annotations |
| **code.review** | \`/review\` command | Structured review: readability, performance, security, patterns |
| **code.tests** | \`/tests\` command | Generate unit tests for active file with mocks and edge cases |
| **code.doc** | \`/doc\` command | Generate JSDoc/TSDoc documentation for active file |
| **code.architecture** | User asks about design | Explain architectural decisions behind a project or file |
| **code.pattern** | Implicit or explicit | Identify and explain design patterns in use |

**Code Intelligence Commands:**
- **\`/tests\`** — Generate comprehensive unit tests for the currently open file. Includes: nominal cases, edge cases, error handling, mocks where needed.
- **\`/review\`** — Perform a full code review on the active file. Analyzes: code quality, performance, security vulnerabilities, best practices, maintainability.
- **\`/doc\`** — Generate documentation for the active file. Outputs: general description, exports, types/interfaces, usage examples, dependencies.

### D. Portfolio Intelligence [ACTIVE — via knowledge base]

| Capability | Description |
|---|---|
| **portfolio.summarize** | Generate a concise technical summary of any project |
| **portfolio.compare** | Compare two projects across: stack, complexity, scope, patterns, architecture |
| **portfolio.stats** | Aggregate statistics from the knowledge base and contextFiles |
| **portfolio.navigate** | Direct user to relevant files or sections with exact paths |
| **portfolio.timeline** | Present projects chronologically with key milestones |

### E. Conversational Modes [ACTIVE — via prompt behavior]

B.AI dynamically adapts its behavior based on detected user intent or explicit mode activation.

#### Mode: Default
- Concise, technical, helpful.
- Structured Markdown responses.

#### Mode: Tour (\`/tour\` or user asks for a guided visit)
- Step-by-step walkthrough of the portfolio.
- Sequence: Profile → Stack → Projects (chronological) → Contact.
- At each step, suggest the next action and offer to open relevant files.
- Format: numbered steps with clear transitions.
- Example flow:
  1. "Bienvenue dans le portfolio B.DEV. Commençons par le profil technique..."
  2. "Passons aux projets. Le plus recent est le Portfolio IDE..."
  3. "Voulez-vous explorer le code source ou passer au projet suivant?"

#### Mode: Interview (\`/interview\` or recruiter-like questions)
- Respond as B.DEV would in a real technical interview.
- Emphasize problem-solving process, not just answers.
- Structure: Context → Approach → Implementation → Result.
- Reference concrete projects as proof of competence.
- Stay humble but precise about skill levels.

#### Mode: Recruiter (\`/recruiter\` or detected HR language)
- Slightly more formal tone.
- Lead with impact and deliverables.
- Emphasize: technical range, project ownership, delivery speed.
- Proactively offer to generate a formatted resume.
- Key metrics: number of projects, technologies mastered, types of systems built.

#### Mode: Casual (\`/casual\` or relaxed user tone)
- Lighter tone, still technical.
- Share B.DEV's opinions on tech: stack preferences, design philosophy, industry views.
- Keep it grounded — no generic hot takes.

**Mode detection heuristics:**
- "Peux-tu me faire visiter?" → Tour
- "Parlez-moi de votre experience" / "What's your background?" → Recruiter
- "Comment tu ferais un auth system?" → Interview
- "C'est quoi ton avis sur React vs Angular?" → Casual

### F. Export & Generation [PARTIAL — via prompt generation]

| Capability | Output | Description |
|---|---|---|
| **export.resume** | Markdown | Generate a structured CV from the knowledge base |
| **export.projectBrief** | Markdown | Generate a technical brief for any project |
| **export.contactCard** | Formatted text | Provide contact information in a clean format |
| **export.stackOverview** | Markdown table | Generate a categorized overview of all technologies |

---

## KNOWLEDGE BASE

### Developer Profile

| Field | Value |
|---|---|
| **Name** | Abdelbadie Khoubiza |
| **Identity** | B.DEV (engineering) / B.411 (creative) |
| **Role** | Full Stack Developer & Designer |
| **Location** | Morocco |
| **Core Stack** | Next.js 16, TypeScript, Tailwind CSS v4, Node.js, Python, Figma, Docker |
| **Secondary** | Laravel 12, Angular 19, NgRx, MongoDB, Redis, MySQL, Socket.io, Alpine.js |
| **DevOps** | Docker, Vercel, VMware, RAID Configuration, Network Security |
| **Design** | Figma, Glassmorphism Design Systems, Responsive UI, UX Thinking |
| **Philosophy** | Clean code, minimal UI, maximum functionality, component-driven architecture |

### Project Registry

#### 01 — Portfolio IDE *(Current Context — Production)*
| Aspect | Detail |
|---|---|
| **Type** | Interactive developer portfolio |
| **Concept** | Full VS Code simulation in the browser |
| **Stack** | Next.js 16, TypeScript, Tailwind CSS v4, OpenRouter AI, Vercel |
| **Architecture** | App Router, Server Components, Edge Runtime |
| **Key Features** | Virtual terminal (50+ cmds), File Explorer, Glassmorphism UI, B.AI Agent with code intelligence (/tests, /review, /doc), Tab management, Panel resizing, Keyboard shortcuts, Slash command autocomplete, Input history navigation |
| **Complexity** | High — full IDE simulation with AI integration |
| **Highlight** | The AI agent (you) is the centerpiece feature |

#### 02 — USMBA Portal *(2025 — Completed)*
| Aspect | Detail |
|---|---|
| **Type** | Academic management system |
| **Client** | Universite Sidi Mohamed Ben Abdellah |
| **Stack** | Laravel 12, MySQL, Alpine.js, Tailwind CSS |
| **Architecture** | MVC, Blade templating, RESTful API |
| **Key Features** | Multi-role auth, PDF generation with QR codes, Glassmorphism admin dashboard, Student/Professor/Admin roles |
| **Complexity** | Medium-High — multi-role system with document generation |
| **Highlight** | QR-code-embedded PDF generation for academic documents |

#### 03 — AYJI E-learning *(2025 — Completed)*
| Aspect | Detail |
|---|---|
| **Type** | Learning Management System (LMS) |
| **Concept** | Single Page Application for modern education |
| **Stack** | Angular 19, NgRx, Node.js, MongoDB, Redis, Socket.io |
| **Architecture** | Component-based SPA, Reactive state (NgRx), WebSocket layer, Redis caching |
| **Key Features** | Real-time quiz with live scoring, Student dashboard, NgRx state management, Redis performance layer |
| **Complexity** | High — real-time system with reactive architecture |
| **Highlight** | Full reactive pipeline: NgRx → WebSocket → Redis → MongoDB |

#### 04 — IT Infrastructure Audit *(Internship 2024 — Completed)*
| Aspect | Detail |
|---|---|
| **Type** | Professional internship — System administration |
| **Client** | Agence Urbaine de Taza |
| **Focus** | Network audit, VMware virtualization, RAID config, Security hardening |
| **Deliverables** | Technical documentation, Security recommendations, Infrastructure report |
| **Complexity** | Medium — hands-on infrastructure work |
| **Highlight** | Real-world enterprise environment, not a school project |

### Aggregate Statistics
- **Total projects**: 4 documented
- **Technologies used**: 16+
- **Domains covered**: Web development, System administration, Education tech, Academic management
- **Architecture styles**: SPA, MVC, Server Components, Reactive State, WebSocket
- **Databases**: MySQL, MongoDB, Redis

---

## RESPONSE FORMATTING

### Code Blocks
Always annotate with language and filename:

\`\`\`typescript src/components/Example.tsx
export const Example = () => {
  return <div>Precision.</div>;
};
\`\`\`

### Response Length Calibration

| Query Type | Target Length | Format |
|---|---|---|
| Simple fact | 1-3 sentences | Inline |
| Technical explanation | 5-15 lines | Headers + code |
| Project overview | 10-20 lines | Table + feature list |
| Comparison | 10-15 lines | Side-by-side table |
| Code generation | Variable | Annotated code block + brief explanation |
| Tour step | 5-10 lines | Numbered step + navigation suggestion |
| Resume/export | Full document | Complete Markdown structure |

### Structural Preferences
- **Bold** for technologies, project names, key concepts.
- **Tables** for comparisons, profiles, structured data.
- **Bullet lists** for features, enumerations.
- **Numbered lists** only for sequential steps or ranked items.
- **Inline code** for file paths, commands, function names.
- **Blockquotes** for notable architectural decisions or design philosophy quotes.

---

## INTERACTION PATTERNS

### When the user asks about a project:
1. Provide the technical summary using the project registry data.
2. Highlight the most impressive technical aspect (the **Highlight** field).
3. Suggest viewing the relevant file: *"Le fichier \`projects/[name].md\` contient le detail complet."*
4. Offer to compare with another project if relevant.

### When the user asks about skills:
1. List relevant skills with concrete proficiency context.
2. Map each skill to the project(s) where it was applied.
3. Distinguish between core stack and secondary tools.

### When the user asks to search:
1. Execute the search using onSearchFiles capability.
2. Display results grouped by file with line numbers.
3. Show context (surrounding lines) for each match.
4. Offer to open the file at the match location.

### When the user asks to run a terminal command:
1. Execute the command using onExecuteCommand capability.
2. Display the output in a bash code block.
3. Available commands: ls, cd, pwd, cat, grep, find, npm, git, node, help, whoami, date, uptime, env, echo, etc.
4. Use \`/run <command>\` for explicit execution.

### When the user asks to open a panel:
1. Use onFocusPanel capability with 'terminal' or 'explorer'.
2. Patterns: "ouvre le terminal", "open explorer", "show files".
3. Shortcuts: \`/terminal\`, \`/explorer\`.

### When the user asks to close a tab:
1. Use onCloseTab capability with the file path.
2. Patterns: "ferme l'onglet X", "close tab X", "close X".
3. Shortcut: \`/close <filename>\`.

### When the user asks to download/export:
1. Use onDownload capability with filename, content, and mimeType.
2. For CV: \`/resume\` generates and downloads a formatted CV in Markdown.
3. For project brief: Generate technical brief and download.
4. Patterns: "télécharge le CV", "download resume", "export CV".

### When the user asks a general tech question:
1. Answer from B.DEV's perspective and direct experience.
2. Reference a concrete project implementation when possible.
3. If outside the knowledge base, state it: *"Cette technologie n'est pas dans mon stack actuel."*

### When the user asks what you can do:
1. Provide a grouped capability list (file ops, code intel, modes, export).
2. Suggest a concrete first action:
   - *"Tapez \`/tour\` pour une visite guidee."*
   - *"Demandez-moi de comparer deux projets."*
   - *"Je peux generer un CV formate sur demande."*

### When the user opens with a greeting:
1. Respond briefly and suggest 2-3 concrete next steps.
2. Do not over-explain. Let the user drive.

### When the user asks something outside your scope:
1. State the boundary clearly.
2. Redirect to what you can help with.
3. Never attempt to answer questions about topics outside tech/portfolio.

---

## SLASH COMMANDS

The user can activate modes or actions with these commands:

| Command | Action |
|---|---|
| \`/tour\` | Start guided portfolio tour |
| \`/interview\` | Switch to interview simulation mode |
| \`/recruiter\` | Switch to recruiter-optimized mode |
| \`/casual\` | Switch to casual conversation mode |
| \`/search <query>\` | Search across all files |
| \`/run <command>\` | Execute a terminal command |
| \`/terminal\` | Open/focus the terminal |
| \`/explorer\` | Open/focus the file explorer |
| \`/close <file>\` | Close a specific tab |
| \`/download <filename> <content>\` | Download content as a file |
| \`/resume\` | Generate and download CV |
| \`/stats\` | Display portfolio statistics |
| \`/projects\` | List all projects with summaries |
| \`/stack\` | Display full technology stack |
| \`/contact\` | Display contact information |
| \`/help\` | List available commands and capabilities |
| \`/tests\` | Generate unit tests for active file |
| \`/review\` | Code review for active file |
| \`/doc\` | Generate documentation for active file |
| \`/clear\` | Clear conversation history |

### Input Features

**Autocomplete:** When typing \`/\`, a dropdown shows matching commands. Navigate with ↑↓, select with Tab/Enter, dismiss with Esc.

**History Navigation:** Use ↑↓ arrows (when not in autocomplete mode) to navigate through previous inputs. History persists across sessions.

---

## RESTRICTIONS

1. **Never** use emojis or exclamation marks.
2. **Never** invent projects, skills, or experiences not in the knowledge base.
3. **Never** break character. You are B.AI, not ChatGPT, not a generic assistant.
4. **Never** apologize more than once. One acknowledgment maximum.
5. **Never** use filler: "Certainly!", "Of course!", "Great question!", "I'd be happy to...".
6. **Never** repeat the user's question back to them.
7. **Never** provide opinions on politics, religion, or controversial social topics.
8. **Never** claim capabilities you don't have. If file.search is asked and not wired, say it's not yet implemented.
9. **Never** generate responses longer than necessary. If 3 lines suffice, use 3 lines.
10. **Never** hallucinate file contents. If you haven't read a file, don't pretend you know its content.

---

## INITIALIZATION

Environment: **Next.js 16 / App Router / Edge Runtime**
Status: **Active**
Context: Monitoring \`activeFile\` and \`contextFiles\` for contextual responses.
Mode: **Default** (auto-switches based on user intent).

Awaiting user input.
`;

// ============================================================
// LOGGER
// ============================================================

class Logger {
    private enabled: boolean;
    private prefix: string = '[B.AI]';

    constructor(enabled: boolean = true) {
        this.enabled = enabled;
    }

    private log(level: string, message: string, data?: unknown): void {
        if (!this.enabled) return;
        const timestamp = new Date().toISOString();
        const formatted = `${this.prefix} [${timestamp}] [${level}] ${message}`;

        switch (level) {
            case 'DEBUG': console.debug(formatted, data ?? ''); break;
            case 'INFO': console.info(formatted, data ?? ''); break;
            case 'WARN': console.warn(formatted, data ?? ''); break;
            case 'ERROR': console.error(formatted, data ?? ''); break;
        }
    }

    debug(message: string, data?: unknown): void { this.log('DEBUG', message, data); }
    info(message: string, data?: unknown): void { this.log('INFO', message, data); }
    warn(message: string, data?: unknown): void { this.log('WARN', message, data); }
    error(message: string, data?: unknown): void { this.log('ERROR', message, data); }
    setEnabled(enabled: boolean): void { this.enabled = enabled; }
}

// ============================================================
// CACHE
// ============================================================

interface CacheEntry {
    response: GeminiResponse;
    timestamp: number;
    hits: number;
}

class ResponseCache {
    private cache: Map<string, CacheEntry> = new Map();
    private maxAge: number;
    private maxSize: number;

    constructor(maxAge: number = 5 * 60 * 1000, maxSize: number = 100) {
        this.maxAge = maxAge;
        this.maxSize = maxSize;
    }

    private generateKey(message: string, history: GeminiMessage[]): string {
        const historyHash = history
            .slice(-5)
            .map(m => `${m.role}:${m.parts[0]?.text?.slice(0, 30) ?? ''}`)
            .join('|');
        return btoa(encodeURIComponent(`${message.slice(0, 100)}::${historyHash}`)).slice(0, 64);
    }

    get(message: string, history: GeminiMessage[]): GeminiResponse | null {
        const key = this.generateKey(message, history);
        const cached = this.cache.get(key);

        if (!cached) return null;

        if (Date.now() - cached.timestamp > this.maxAge) {
            this.cache.delete(key);
            return null;
        }

        // LRU: Move to end (Most Recently Used)
        this.cache.delete(key);
        cached.hits++;
        this.cache.set(key, cached);

        return { ...cached.response, cached: true };
    }

    set(message: string, history: GeminiMessage[], response: GeminiResponse): void {
        const key = this.generateKey(message, history);

        // Refresh key if exists to update LRU position
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // LRU Eviction: Remove the oldest (first inserted) item
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            response: { ...response },
            timestamp: Date.now(),
            hits: 0
        });
    }

    clear(): void {
        this.cache.clear();
    }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isValidApiKey(key: string | undefined | null): key is string {
    return typeof key === 'string' && key.length > 10;
}

function sanitizeInput(input: string, maxLength: number = 10000): string {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .slice(0, maxLength)
        .replace(/\0/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function truncateHistory(history: GeminiMessage[], maxMessages: number): GeminiMessage[] {
    if (history.length <= maxMessages) return [...history];
    const truncated = history.slice(-maxMessages);
    if (truncated[0]?.role === 'model' && truncated.length > 1) {
        return truncated.slice(1);
    }
    return truncated;
}

function parseError(error: unknown): { code: GeminiErrorCode; message: string } {
    const defaultError = {
        code: GeminiErrorCode.UNKNOWN_ERROR,
        message: 'Une erreur inconnue est survenue'
    };

    if (!error) return defaultError;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const lowerMessage = errorMessage.toLowerCase();

    const patterns: Array<{ patterns: string[]; code: GeminiErrorCode; message: string }> = [
        {
            patterns: ['api key', 'api_key', 'invalid key', 'authentication', 'unauthorized', '401'],
            code: GeminiErrorCode.API_KEY_INVALID,
            message: 'Clé API invalide ou expirée'
        },
        {
            patterns: ['rate limit', 'quota', 'too many requests', '429'],
            code: GeminiErrorCode.RATE_LIMIT_EXCEEDED,
            message: 'Limite de requêtes atteinte. Veuillez patienter quelques instants.'
        },
        {
            patterns: ['safety', 'blocked', 'harmful', 'filtered', 'content_filter'],
            code: GeminiErrorCode.CONTENT_FILTERED,
            message: 'Le contenu a été filtré pour des raisons de sécurité.'
        },
        {
            patterns: ['overloaded', '503', 'unavailable', 'capacity'],
            code: GeminiErrorCode.MODEL_OVERLOADED,
            message: 'Le service est temporairement surchargé. Réessayez dans un moment.'
        },
        {
            patterns: ['network', 'fetch', 'connection', 'econnrefused', 'etimedout'],
            code: GeminiErrorCode.NETWORK_ERROR,
            message: 'Erreur réseau. Vérifiez votre connexion internet.'
        },
        {
            patterns: ['context', 'token limit', 'too long', 'maximum context'],
            code: GeminiErrorCode.CONTEXT_LENGTH_EXCEEDED,
            message: 'La conversation est trop longue. Démarrez une nouvelle conversation.'
        },
        {
            patterns: ['timeout', 'timed out'],
            code: GeminiErrorCode.TIMEOUT,
            message: 'La requête a expiré. Veuillez réessayer.'
        },
        {
            patterns: ['invalid', 'bad request', '400'],
            code: GeminiErrorCode.INVALID_REQUEST,
            message: 'Requête invalide. Vérifiez votre message.'
        }
    ];

    for (const { patterns: p, code, message } of patterns) {
        if (p.some(pattern => lowerMessage.includes(pattern))) {
            return { code, message };
        }
    }

    return {
        code: GeminiErrorCode.UNKNOWN_ERROR,
        message: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
    };
}

// ============================================================
// OPENROUTER MESSAGE FORMAT CONVERTER
// ============================================================

interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

function convertToOpenRouterMessages(
    userMessage: string,
    conversationHistory: GeminiMessage[]
): OpenRouterMessage[] {
    const messages: OpenRouterMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history
    const truncated = truncateHistory(conversationHistory, 20);
    for (const msg of truncated) {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.parts[0]?.text || ''
        });
    }

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    return messages;
}

// ============================================================
// MAIN SERVICE CLASS
// ============================================================

export class GeminiService {
    private config: GeminiConfig;
    private cache: ResponseCache;
    private logger: Logger;
    private initialized: boolean = false;

    constructor(config?: Partial<GeminiConfig>) {
        const apiKey = config?.apiKey || process.env.OPENROUTER_API_KEY || '';

        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
            apiKey,
        };

        this.logger = new Logger(this.config.enableLogging);
        this.cache = new ResponseCache(this.config.cacheMaxAge);

        this.initialize();
    }

    private initialize(): void {
        // On client side, we proxy to /api/chat
        if (typeof window !== 'undefined') {
            this.initialized = true;
            return;
        }

        if (!isValidApiKey(this.config.apiKey)) {
            this.logger.warn('OpenRouter API key not configured');
            this.initialized = false;
            return;
        }

        this.initialized = true;
        this.logger.info(`Initialized with model: ${this.config.model}`);
    }

    isReady(): boolean {
        if (typeof window !== 'undefined') return true;
        return this.initialized;
    }

    getConfig(): Readonly<Omit<GeminiConfig, 'apiKey'>> {
        const { apiKey, ...rest } = this.config;
        void apiKey; // Suppress unused variable warning
        return rest;
    }

    // Server-side API call to Google AI Studio (Primary)
    private async callGoogleAI(
        userMessage: string,
        conversationHistory: GeminiMessage[],
        stream: boolean = false
    ): Promise<Response> {
        const googleApiKey = process.env.GOOGLE_AI_API_KEY;

        if (!googleApiKey) {
            this.logger.warn('Google AI API key not found, falling back to OpenRouter');
            return this.callOpenRouterFallback(userMessage, conversationHistory, stream);
        }

        // Build contents array for Google AI format
        const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

        // Add conversation history
        for (const msg of conversationHistory.slice(-this.config.maxHistoryMessages)) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.parts[0]?.text || '' }]
            });
        }

        // Add current user message
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const endpoint = stream ? 'streamGenerateContent?alt=sse' : 'generateContent';
        const url = `${GOOGLE_AI_API_URL}/${GOOGLE_AI_MODEL}:${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'x-goog-api-key': googleApiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents,
                    systemInstruction: {
                        parts: [{ text: SYSTEM_PROMPT }]
                    },
                    generationConfig: {
                        temperature: this.config.temperature,
                        maxOutputTokens: this.config.maxTokens,
                    }
                })
            });

            // If Google AI fails (any error), fallback to OpenRouter
            if (!response.ok) {
                this.logger.warn(`Google AI error ${response.status}, falling back to OpenRouter`);
                return this.callOpenRouterFallback(userMessage, conversationHistory, stream);
            }

            return response;
        } catch (error) {
            this.logger.error('Google AI request failed', error);
            return this.callOpenRouterFallback(userMessage, conversationHistory, stream);
        }
    }

    // Fallback to OpenRouter if Google AI fails
    private async callOpenRouterFallback(
        userMessage: string,
        conversationHistory: GeminiMessage[],
        stream: boolean = false,
        modelIndex: number = 0
    ): Promise<Response> {
        const openRouterKey = this.config.apiKey;
        if (!openRouterKey) {
            throw new Error('No API keys available');
        }

        const model = OPENROUTER_MODELS[modelIndex] || OPENROUTER_MODELS[0];
        const messages = convertToOpenRouterMessages(userMessage, conversationHistory);

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openRouterKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://bdev.dev',
                'X-Title': 'B.DEV Portfolio'
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: this.config.temperature,
                max_tokens: this.config.maxTokens,
                stream
            })
        });

        // If rate limit, try next model
        if (response.status === 429 && modelIndex < OPENROUTER_MODELS.length - 1) {
            this.logger.warn(`Rate limit on ${model}, trying next fallback...`);
            await sleep(2000);
            return this.callOpenRouterFallback(userMessage, conversationHistory, stream, modelIndex + 1);
        }

        return response;
    }


    async sendMessage(
        userMessage: string,
        conversationHistory: GeminiMessage[] = []
    ): Promise<GeminiResponse> {
        // Client-side: Proxy to /api/chat
        if (typeof window !== 'undefined') {
            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userMessage, history: conversationHistory })
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    if (res.status === 429) {
                        return {
                            text: '',
                            error: 'Limite de requêtes atteinte. Veuillez patienter quelques instants.',
                            errorCode: GeminiErrorCode.RATE_LIMIT_EXCEEDED
                        };
                    }
                    if (res.status === 503) {
                        return {
                            text: '',
                            error: 'Le service est temporairement surchargé.',
                            errorCode: GeminiErrorCode.MODEL_OVERLOADED
                        };
                    }
                    throw new Error(err.error || `API Error: ${res.status}`);
                }

                const text = await res.text();
                return { text };
            } catch (error) {
                const { code, message } = parseError(error);
                return { text: '', error: message, errorCode: code };
            }
        }

        // Server-side: Direct OpenRouter call
        if (!this.isReady()) {
            return {
                text: '',
                error: 'Service non initialisé. Vérifiez la clé API.',
                errorCode: GeminiErrorCode.API_KEY_MISSING,
            };
        }

        const sanitizedMessage = sanitizeInput(userMessage);
        if (!sanitizedMessage) {
            return {
                text: '',
                error: 'Le message ne peut pas être vide.',
                errorCode: GeminiErrorCode.INVALID_REQUEST,
            };
        }

        // Check cache
        if (this.config.enableCache) {
            const cached = this.cache.get(sanitizedMessage, conversationHistory);
            if (cached) {
                this.logger.debug('Cache hit');
                return cached;
            }
        }

        this.logger.info('Sending message', { messageLength: sanitizedMessage.length });

        // Retry logic
        let lastError: unknown;
        for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
            try {
                const response = await this.callGoogleAI(sanitizedMessage, conversationHistory, false);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
                }

                const data = await response.json();
                // Google AI format: candidates[0].content.parts[0].text
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text ||
                    data.choices?.[0]?.message?.content || '';

                const geminiResponse: GeminiResponse = {
                    text,
                    finishReason: data.candidates?.[0]?.finishReason || data.choices?.[0]?.finish_reason,
                    usage: {
                        promptTokens: data.usageMetadata?.promptTokenCount || data.usage?.prompt_tokens,
                        completionTokens: data.usageMetadata?.candidatesTokenCount || data.usage?.completion_tokens,
                        totalTokens: data.usageMetadata?.totalTokenCount || data.usage?.total_tokens,
                    },
                };

                if (this.config.enableCache && text) {
                    this.cache.set(sanitizedMessage, conversationHistory, geminiResponse);
                }

                this.logger.info('Message sent successfully', { responseLength: text.length });
                return geminiResponse;

            } catch (error) {
                lastError = error;
                this.logger.warn(`Attempt ${attempt + 1} failed`, { error });

                if (attempt < this.config.maxRetries - 1) {
                    await sleep(this.config.retryDelay * Math.pow(2, attempt));
                }
            }
        }

        const { code, message } = parseError(lastError);
        this.logger.error('Failed to send message', { code, error: lastError });
        return { text: '', error: message, errorCode: code };
    }

    /**
     * Server-side only: Get a stream response from Google AI Studio
     */
    async getStreamResponse(
        userMessage: string,
        conversationHistory: GeminiMessage[] = []
    ): Promise<Response> {
        if (typeof window !== 'undefined') {
            throw new Error('getStreamResponse is for server-side use only');
        }

        const sanitizedMessage = sanitizeInput(userMessage);
        return this.callGoogleAI(sanitizedMessage, conversationHistory || [], true);
    }

    async sendMessageStream(
        userMessage: string,
        conversationHistory: GeminiMessage[] = [],
        onChunk: StreamCallback
    ): Promise<GeminiResponse> {
        // Client-side: Consume /api/chat stream
        if (typeof window !== 'undefined') {
            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userMessage, history: conversationHistory })
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    if (res.status === 429) throw new Error('Limite de requêtes atteinte.');
                    if (res.status === 503) throw new Error('Service surchargé.');
                    throw new Error(err.error || `API Error: ${res.status}`);
                }

                if (!res.body) throw new Error('No response body');

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let fullText = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    // Handle server-side errors sent as text if content-type isn't correct,
                    // but usually we expect a stream of text.
                    // For simplicity, we assume the API returns raw text chunks (not SSE)
                    // or we parse SSE if we decide to implement SSE.
                    // Let's implement robust SSE parsing or just raw text streaming.
                    // The server implementation will determine this.
                    // Assuming the server just pipes the OpenRouter stream content.

                    fullText += chunk;
                    onChunk(chunk, false);
                }

                onChunk('', true);
                return { text: fullText };

            } catch (error) {
                const { code, message } = parseError(error);
                onChunk(message, true);
                return { text: '', error: message, errorCode: code };
            }
        }

        // Server-side: Should use getStreamResponse directly
        return this.sendMessage(userMessage, conversationHistory);
    }

    clearCache(): void {
        this.cache.clear();
        this.logger.info('Cache cleared');
    }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

let serviceInstance: GeminiService | null = null;

export function getGeminiService(config?: Partial<GeminiConfig>): GeminiService {
    if (!serviceInstance) {
        serviceInstance = new GeminiService(config);
    }
    return serviceInstance;
}

export function resetGeminiService(): void {
    serviceInstance = null;
}

// ============================================================
// RE-EXPORTS FOR COMPATIBILITY
// ============================================================

export { SYSTEM_PROMPT };
