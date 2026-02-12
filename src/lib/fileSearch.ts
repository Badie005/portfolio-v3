import { FileData } from '@/components/code-window/types';

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
  maxResults?: number;
  contextLines?: number;
}

export interface SearchResult {
  filePath: string;
  line: number;
  column: number;
  content: string;
  match: string;
  contextBefore?: string;
  contextAfter?: string;
}

export function searchFiles(
  files: FileData[],
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  const {
    caseSensitive = false,
    wholeWord = false,
    regex = false,
    maxResults = 50,
    contextLines = 2,
  } = options;

  if (!query.trim()) return [];

  const results: SearchResult[] = [];

  let pattern: RegExp;
  try {
    if (regex) {
      pattern = new RegExp(query, caseSensitive ? 'g' : 'gi');
    } else {
      let escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (wholeWord) escaped = `\\b${escaped}\\b`;
      pattern = new RegExp(escaped, caseSensitive ? 'g' : 'gi');
    }
  } catch {
    return [];
  }

  for (const file of files) {
    if (results.length >= maxResults) break;
    if (!file.content) continue;

    const lines = file.content.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      if (results.length >= maxResults) break;

      const line = lines[lineIndex];
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(line)) !== null) {
        if (results.length >= maxResults) break;

        results.push({
          filePath: file.name,
          line: lineIndex + 1,
          column: match.index + 1,
          content: line.trim(),
          match: match[0],
          contextBefore:
            lines.slice(Math.max(0, lineIndex - contextLines), lineIndex).join('\n') || undefined,
          contextAfter:
            lines.slice(lineIndex + 1, lineIndex + 1 + contextLines).join('\n') || undefined,
        });

        if (match[0].length === 0) break;
      }
    }
  }

  return results;
}

export function formatSearchResults(results: SearchResult[], query: string): string {
  if (results.length === 0) {
    return `Aucun resultat pour "${query}".`;
  }

  const grouped = new Map<string, SearchResult[]>();
  for (const r of results) {
    const existing = grouped.get(r.filePath) || [];
    existing.push(r);
    grouped.set(r.filePath, existing);
  }

  let output = `**${results.length} resultat(s) pour "${query}"**\n\n`;

  for (const [filePath, fileResults] of grouped) {
    output += `### ${filePath}\n`;
    for (const r of fileResults) {
      const highlighted = r.content.replace(
        new RegExp(`(${escapeRegex(r.match)})`, 'gi'),
        '**$1**'
      );
      output += `- L${r.line}: ${highlighted}\n`;
    }
    output += '\n';
  }

  return output.trim();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface TerminalCommandResult {
  success: boolean;
  output: string;
}

export interface PortfolioStats {
  totalFiles: number;
  filesByExtension: Record<string, number>;
  totalLines: number;
  technologies: string[];
  fileTypes: string[];
}

export function computePortfolioStats(files: FileData[]): PortfolioStats {
  const filesByExtension: Record<string, number> = {};
  let totalLines = 0;
  const technologies = new Set<string>();
  const fileTypes = new Set<string>();

  for (const file of files) {
    if (!file.content) continue;

    const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown';
    filesByExtension[ext] = (filesByExtension[ext] || 0) + 1;
    
    totalLines += file.content.split('\n').length;

    if (ext === 'ts' || ext === 'tsx') {
      technologies.add('TypeScript');
      fileTypes.add('TypeScript');
    }
    if (ext === 'js' || ext === 'jsx') {
      technologies.add('JavaScript');
      fileTypes.add('JavaScript');
    }
    if (ext === 'css') {
      technologies.add('CSS');
      fileTypes.add('Stylesheet');
    }
    if (ext === 'json') {
      fileTypes.add('JSON');
    }
    if (ext === 'md') {
      fileTypes.add('Markdown');
    }

    if (file.content.includes('Next.js') || file.content.includes('next')) {
      technologies.add('Next.js');
    }
    if (file.content.includes('React') || file.content.includes('react')) {
      technologies.add('React');
    }
    if (file.content.includes('Tailwind') || file.content.includes('tailwind')) {
      technologies.add('Tailwind CSS');
    }
    if (file.content.includes('Node') || file.content.includes('node')) {
      technologies.add('Node.js');
    }
  }

  return {
    totalFiles: files.length,
    filesByExtension,
    totalLines,
    technologies: Array.from(technologies),
    fileTypes: Array.from(fileTypes),
  };
}

export function formatPortfolioStats(stats: PortfolioStats): string {
  const extList = Object.entries(stats.filesByExtension)
    .sort((a, b) => b[1] - a[1])
    .map(([ext, count]) => `${ext}: ${count}`)
    .join(', ');

  return `**Portfolio Statistics**

| Metric | Value |
|--------|-------|
| Total Files | ${stats.totalFiles} |
| Total Lines | ${stats.totalLines.toLocaleString()} |

**Files by Extension:** ${extList}

**Detected Technologies:** ${stats.technologies.join(', ') || 'None detected'}
`;
}

const ALLOWED_COMMANDS = [
  'help', 'ls', 'cd', 'pwd', 'tree', 'find', 'cat', 'head', 'tail', 'wc', 'grep', 'open',
  'whoami', 'date', 'uptime', 'env', 'export', 'echo', 'alias', 'history',
  'npm', 'node', 'git', 'curl', 'ping', 'clear', 'cls',
  'neofetch', 'cowsay', 'matrix', 'calc', 'weather', 'joke', 'fortune', 'figlet',
  'hostname', 'uname', 'df', 'free', 'ps', 'top', 'exit',
  'about', 'skills', 'contact', 'projects', 'social', 'theme', 'time', 'welcome'
];

export function executeTerminalCommand(
  command: string,
  context: {
    files: FileData[];
    onOpenFile?: (filename: string) => string | null;
  }
): TerminalCommandResult {
  const trimmed = command.trim();
  if (!trimmed) {
    return { success: false, output: 'Commande vide.' };
  }

  const parts = trimmed.split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (!ALLOWED_COMMANDS.includes(cmd)) {
    return {
      success: false,
      output: `Commande non autorisee: "${cmd}". Commandes disponibles: ${ALLOWED_COMMANDS.slice(0, 10).join(', ')}...`
    };
  }

  const outputs: string[] = [];

  switch (cmd) {
    case 'help':
      outputs.push('Commandes disponibles: ls, cd, pwd, cat, grep, find, npm, git, node...');
      break;

    case 'ls':
      const path = args[0] || '/';
      outputs.push(`Contenu de ${path}:`);
      if (context.files.length > 0) {
        context.files.slice(0, 10).forEach(f => outputs.push(`  ${f.name}`));
        if (context.files.length > 10) outputs.push(`  ... et ${context.files.length - 10} autres`);
      }
      break;

    case 'pwd':
      outputs.push('/home/guest/portfolio');
      break;

    case 'whoami':
      outputs.push('guest');
      break;

    case 'date':
      outputs.push(new Date().toLocaleString('fr-FR'));
      break;

    case 'uptime':
      const hours = Math.floor(Math.random() * 100) + 1;
      outputs.push(`up ${hours} hours`);
      break;

    case 'env':
      outputs.push('USER=guest', 'HOME=/home/guest', 'SHELL=/bin/bash');
      break;

    case 'echo':
      outputs.push(args.join(' '));
      break;

    case 'cat':
      if (args[0]) {
        const file = context.files.find(f => f.name === args[0] || f.name.endsWith(args[0]));
        if (file) {
          outputs.push(file.content.slice(0, 500));
          if (file.content.length > 500) outputs.push('... (tronque)');
        } else {
          outputs.push(`cat: ${args[0]}: Fichier introuvable`);
        }
      } else {
        outputs.push('Usage: cat <fichier>');
      }
      break;

    case 'find':
      if (args[0]) {
        const pattern = args[0].toLowerCase();
        const matches = context.files.filter(f => f.name.toLowerCase().includes(pattern));
        if (matches.length > 0) {
          matches.slice(0, 10).forEach(f => outputs.push(`./${f.name}`));
          if (matches.length > 10) outputs.push(`... et ${matches.length - 10} autres`);
        } else {
          outputs.push(`Aucun fichier trouve pour "${args[0]}"`);
        }
      } else {
        outputs.push('Usage: find <pattern>');
      }
      break;

    case 'grep':
      if (args.length >= 1) {
        const pattern = args[0];
        const results = searchFiles(context.files, pattern, { maxResults: 10 });
        if (results.length > 0) {
          results.forEach(r => outputs.push(`${r.filePath}:${r.line}: ${r.content}`));
        } else {
          outputs.push(`Aucun resultat pour "${pattern}"`);
        }
      } else {
        outputs.push('Usage: grep <pattern>');
      }
      break;

    case 'npm':
      const npmCmd = args[0];
      if (npmCmd === 'run' || npmCmd === 'start' || npmCmd === 'dev' || npmCmd === 'build') {
        outputs.push(`> portfolio-v3@3.0.2 ${npmCmd}`, '> next dev', '', 'Ready in 1.2s');
      } else if (npmCmd === '-v' || npmCmd === '--version') {
        outputs.push('10.2.3');
      } else {
        outputs.push('npm: commande simulee');
      }
      break;

    case 'node':
      if (args[0] === '-v' || args[0] === '--version') {
        outputs.push('v20.10.0');
      } else {
        outputs.push('Node.js v20.10.0');
      }
      break;

    case 'git':
      const gitCmd = args[0];
      if (gitCmd === 'status') {
        outputs.push('On branch main', 'nothing to commit, working tree clean');
      } else if (gitCmd === 'branch') {
        outputs.push('* main');
      } else if (gitCmd === 'log') {
        outputs.push('commit abc123 - feat: update portfolio');
      } else {
        outputs.push('git: commande simulee');
      }
      break;

    case 'about':
      outputs.push('B.DEV x B.411 Portfolio', 'Developer: Abdelbadie Khoubiza', 'Version: 3.0.2');
      break;

    case 'skills':
      outputs.push('Frontend: React, Next.js, TypeScript, Tailwind CSS');
      outputs.push('Backend: Node.js, Laravel, PHP');
      outputs.push('Database: PostgreSQL, MongoDB, MySQL');
      break;

    case 'contact':
      outputs.push('Email: a.khoubiza.dev@gmail.com', 'GitHub: github.com/abdelbadie', 'LinkedIn: linkedin.com/in/abdelbadie');
      break;

    case 'projects':
      outputs.push('[1] Portfolio v3.0 - Next.js, TypeScript, Tailwind');
      outputs.push('[2] USMBA Portal - Laravel, MySQL');
      outputs.push('[3] AYJI E-learning - Angular, Node.js, MongoDB');
      break;

    case 'neofetch':
      outputs.push('B.DEV OS v2.0', 'Kernel: Next.js 14.1.0', 'Shell: bdev-sh', 'Terminal: B.DEV Terminal');
      break;

    case 'clear':
    case 'cls':
      return { success: true, output: '[Terminal efface]' };

    default:
      outputs.push(`${cmd}: execute avec succes`);
  }

  return { success: true, output: outputs.join('\n') };
}
