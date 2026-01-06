import { useState, useCallback, useMemo } from 'react';
import { TerminalMessage, FileSystemItem, FileData } from '../types';
import { ansi } from '@/lib/ansi';

export interface TerminalCommand {
    name: string;
    description: string;
    usage: string;
    execute: (args: string[], context: TerminalContext) => TerminalMessage[];
}

export interface TerminalContext {
    currentPath: string;
    setCurrentPath: (path: string) => void;
    files: FileSystemItem[];
    openFile: (filename: string) => string | null;
    env: Record<string, string>;
    setEnv: (key: string, value: string) => void;
    aliases: Record<string, string>;
    setAlias: (name: string, command: string) => void;
}

interface UseTerminalOptions {
    files: FileSystemItem[];
    onOpenFile: (filename: string) => string | null;
}

// Helper to navigate file system
const getItemAtPath = (files: FileSystemItem[], path: string): FileSystemItem | null => {
    if (path === '/' || path === '~' || path === '') return { name: 'root', type: 'folder', isOpen: true, children: files };

    const parts = path.replace(/^[~/]/, '').split('/').filter(Boolean);
    let current: FileSystemItem[] = files;
    let item: FileSystemItem | null = null;

    for (const part of parts) {
        const found = current.find(f => f.name === part || f.name.toLowerCase() === part.toLowerCase());
        if (!found) return null;
        item = found;
        if ('children' in found && found.children) {
            current = found.children as FileSystemItem[];
        } else {
            break;
        }
    }
    return item;
};

const isFolder = (item: FileSystemItem): boolean => 'children' in item || item.type === 'folder';

const getFilesInPath = (files: FileSystemItem[], path: string): FileSystemItem[] => {
    const item = getItemAtPath(files, path);
    if (!item) return [];
    if ('children' in item && item.children) return item.children as FileSystemItem[];
    return [];
};

const getAllFiles = (files: FileSystemItem[], basePath: string = ''): { path: string; item: FileSystemItem }[] => {
    const result: { path: string; item: FileSystemItem }[] = [];
    for (const item of files) {
        const itemPath = basePath ? `${basePath}/${item.name}` : item.name;
        result.push({ path: itemPath, item });
        if ('children' in item && item.children) {
            result.push(...getAllFiles(item.children as FileSystemItem[], itemPath));
        }
    }
    return result;
};

const resolvePath = (currentPath: string, targetPath: string): string => {
    if (targetPath.startsWith('/') || targetPath.startsWith('~')) {
        return targetPath.replace(/^~/, '');
    }
    if (targetPath === '..') {
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        return '/' + parts.join('/');
    }
    if (targetPath.startsWith('../')) {
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        return resolvePath('/' + parts.join('/'), targetPath.slice(3));
    }
    if (targetPath === '.') return currentPath;
    return currentPath === '/' ? `/${targetPath}` : `${currentPath}/${targetPath}`;
};

export function useTerminal({ files, onOpenFile }: UseTerminalOptions) {
    const [history, setHistory] = useState<TerminalMessage[]>([
        { type: 'output', content: `${ansi.bold}B.DEV Terminal${ansi.reset} [Version 3.0.2]` },
        { type: 'output', content: '(c) 2026 B.DEV x B.411 Portfolio' },
        { type: 'success', content: `Ready. Type "${ansi.accent}help${ansi.reset}" for commands.` },
    ]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [currentPath, setCurrentPath] = useState('/');
    const [env, setEnvState] = useState<Record<string, string>>({
        USER: 'guest',
        HOME: '~',
        SHELL: '/bin/bdev-sh',
        PATH: '/usr/local/bin:/usr/bin:/bin',
        TERM: 'xterm-256color',
        EDITOR: 'code',
        NODE_VERSION: '20.10.0',
        NPM_VERSION: '10.2.3',
    });
    const [aliases, setAliasState] = useState<Record<string, string>>({
        'll': 'ls -la',
        'la': 'ls -a',
        'cls': 'clear',
        '..': 'cd ..',
        'c': 'clear',
    });

    const setEnv = useCallback((key: string, value: string) => {
        setEnvState(prev => ({ ...prev, [key]: value }));
    }, []);

    const setAlias = useCallback((name: string, command: string) => {
        setAliasState(prev => ({ ...prev, [name]: command }));
    }, []);

    const context: TerminalContext = useMemo(() => ({
        currentPath,
        setCurrentPath,
        files,
        openFile: onOpenFile,
        env,
        setEnv,
        aliases,
        setAlias,
    }), [currentPath, files, onOpenFile, env, setEnv, aliases, setAlias]);

    // Command definitions
    const commands: Record<string, TerminalCommand> = useMemo(() => ({
        help: {
            name: 'help',
            description: 'Show available commands',
            usage: 'help [command]',
            execute: (args) => {
                if (args[0]) {
                    const cmd = commands[args[0]];
                    if (cmd) {
                        return [
                            { type: 'output', content: `\n  ${ansi.bold}${cmd.name}${ansi.reset} - ${cmd.description}` },
                            { type: 'output', content: `  Usage: ${ansi.cyan}${cmd.usage}${ansi.reset}\n` },
                        ];
                    }
                    return [{ type: 'error', content: `Unknown command: ${args[0]}` }];
                }
                return [
                    { type: 'output', content: `\n╭${ansi.gray}─────────────────────────────────────────────────────────────${ansi.reset}╮` },
                    { type: 'output', content: `│  ${ansi.bold}B.DEV Terminal${ansi.reset} - Available Commands                        │` },
                    { type: 'output', content: `├${ansi.gray}─────────────────────────────────────────────────────────────${ansi.reset}┤` },
                    { type: 'output', content: `│  ${ansi.bold}NAVIGATION${ansi.reset}                                                 │` },
                    { type: 'output', content: `│    ${ansi.accent}ls${ansi.reset} [-la]        List directory contents                  │` },
                    { type: 'output', content: `│    ${ansi.accent}cd${ansi.reset} <dir>        Change directory                         │` },
                    { type: 'output', content: `│    ${ansi.accent}pwd${ansi.reset}             Print working directory                  │` },
                    { type: 'output', content: `│    ${ansi.accent}tree${ansi.reset}            Display directory tree                   │` },
                    { type: 'output', content: `│    ${ansi.accent}find${ansi.reset} <pattern>  Search for files                         │` },
                    { type: 'output', content: `├${ansi.gray}─────────────────────────────────────────────────────────────${ansi.reset}┤` },
                    { type: 'output', content: `│  ${ansi.bold}FILE OPERATIONS${ansi.reset}                                            │` },
                    { type: 'output', content: `│    ${ansi.accent}cat${ansi.reset} <file>      Display file contents                    │` },
                    { type: 'output', content: `│    ${ansi.accent}open${ansi.reset} <file>     Open file in editor                      │` },
                    { type: 'output', content: `│    ${ansi.accent}head${ansi.reset} <file>     Show first 10 lines                      │` },
                    { type: 'output', content: `│    ${ansi.accent}tail${ansi.reset} <file>     Show last 10 lines                       │` },
                    { type: 'output', content: `│    ${ansi.accent}wc${ansi.reset} <file>       Word/line count                          │` },
                    { type: 'output', content: `│    ${ansi.accent}grep${ansi.reset} <pat> <f>  Search in file                           │` },
                    { type: 'output', content: `├${ansi.gray}─────────────────────────────────────────────────────────────${ansi.reset}┤` },
                    { type: 'output', content: `│  ${ansi.bold}SYSTEM${ansi.reset}                                                     │` },
                    { type: 'output', content: `│    ${ansi.accent}whoami${ansi.reset}          Current user                             │` },
                    { type: 'output', content: `│    ${ansi.accent}date${ansi.reset}            Current date/time                        │` },
                    { type: 'output', content: `│    ${ansi.accent}uptime${ansi.reset}          System uptime                            │` },
                    { type: 'output', content: `│    ${ansi.accent}env${ansi.reset}             Environment variables                    │` },
                    { type: 'output', content: `│    ${ansi.accent}export${ansi.reset} K=V      Set environment variable                 │` },
                    { type: 'output', content: `│    ${ansi.accent}echo${ansi.reset} <text>     Print text                               │` },
                    { type: 'output', content: `│    ${ansi.accent}history${ansi.reset}         Command history                          │` },
                    { type: 'output', content: `│    ${ansi.accent}alias${ansi.reset} [n=cmd]   Manage aliases                           │` },
                    { type: 'output', content: `├${ansi.gray}─────────────────────────────────────────────────────────────${ansi.reset}┤` },
                    { type: 'output', content: `│  ${ansi.bold}DEV TOOLS${ansi.reset}                                                  │` },
                    { type: 'output', content: `│    ${ansi.accent}npm${ansi.reset} <cmd>       NPM commands (start/build/test/install)  │` },
                    { type: 'output', content: `│    ${ansi.accent}node${ansi.reset} -v         Node.js version                          │` },
                    { type: 'output', content: `│    ${ansi.accent}git${ansi.reset} <cmd>       Git commands (status/log/branch)         │` },
                    { type: 'output', content: `│    ${ansi.accent}curl${ansi.reset} <url>      Fetch URL (simulated)                    │` },
                    { type: 'output', content: `│    ${ansi.accent}ping${ansi.reset} <host>     Ping host (simulated)                    │` },
                    { type: 'output', content: `├${ansi.gray}─────────────────────────────────────────────────────────────${ansi.reset}┤` },
                    { type: 'output', content: `│  ${ansi.bold}UTILITIES${ansi.reset}                                                  │` },
                    { type: 'output', content: `│    ${ansi.accent}clear${ansi.reset} / cls     Clear terminal                           │` },
                    { type: 'output', content: `│    ${ansi.accent}neofetch${ansi.reset}        System info                              │` },
                    { type: 'output', content: `│    ${ansi.accent}cowsay${ansi.reset} <msg>    ASCII cow says message                   │` },
                    { type: 'output', content: `│    ${ansi.accent}matrix${ansi.reset}          Matrix rain effect                       │` },
                    { type: 'output', content: `│    ${ansi.accent}calc${ansi.reset} <expr>     Calculator                               │` },
                    { type: 'output', content: `│    ${ansi.accent}snake${ansi.reset}           Play Snake game                          │` },
                    { type: 'output', content: `╰${ansi.gray}─────────────────────────────────────────────────────────────${ansi.reset}╯` },
                    { type: 'output', content: `\n  Shortcuts: ↑↓ History • Tab Autocomplete • Ctrl+L Clear • Ctrl+C Cancel\n` },
                ];
            },
        },

        ls: {
            name: 'ls',
            description: 'List directory contents',
            usage: 'ls [-la] [path]',
            execute: (args, ctx) => {
                const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
                const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
                const pathArg = args.find(a => !a.startsWith('-'));
                const targetPath = pathArg ? resolvePath(ctx.currentPath, pathArg) : ctx.currentPath;

                const items = getFilesInPath(ctx.files, targetPath);
                if (items.length === 0) {
                    const item = getItemAtPath(ctx.files, targetPath);
                    if (item && !isFolder(item)) {
                        return [{ type: 'output', content: item.name }];
                    }
                    return [{ type: 'error', content: `ls: cannot access '${pathArg || targetPath}': No such file or directory` }];
                }

                const filtered = showAll ? items : items.filter(i => !i.name.startsWith('.'));

                if (showLong) {
                    const results: TerminalMessage[] = [
                        { type: 'output', content: `total ${filtered.length}` }
                    ];
                    filtered.forEach(item => {
                        const isDir = isFolder(item);
                        const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
                        const size = 'content' in item ? (item as FileData).content.length.toString().padStart(6) : '  4096';
                        const date = 'Nov 25 10:30';
                        // Use ansi helper for colors: Directories = Bold Blue, Files = White
                        const name = isDir
                            ? `${ansi.bold}${ansi.blue}${item.name}/${ansi.reset}`
                            : `${ansi.white}${item.name}${ansi.reset}`;
                        results.push({ type: 'output', content: `${perms}  1 guest guest ${size} ${date} ${name}` });
                    });
                    return results;
                }

                // Grid-like view for standard ls
                const names = filtered.map(item => {
                    if (isFolder(item)) return `${ansi.bold}${ansi.blue}${item.name}/${ansi.reset}`;
                    return `${ansi.white}${item.name}${ansi.reset}`;
                });

                // Join simple list with spaces
                return [{ type: 'output', content: names.join('  ') }];
            },
        },

        cd: {
            name: 'cd',
            description: 'Change directory',
            usage: 'cd <directory>',
            execute: (args, ctx) => {
                if (!args[0] || args[0] === '~') {
                    ctx.setCurrentPath('/');
                    return [{ type: 'success', content: '~' }];
                }
                const newPath = resolvePath(ctx.currentPath, args[0]);
                const item = getItemAtPath(ctx.files, newPath);

                if (!item) {
                    return [{ type: 'error', content: `cd: no such file or directory: ${args[0]}` }];
                }
                if (!isFolder(item)) {
                    return [{ type: 'error', content: `cd: not a directory: ${args[0]}` }];
                }
                ctx.setCurrentPath(newPath || '/');
                return [];
            },
        },

        pwd: {
            name: 'pwd',
            description: 'Print working directory',
            usage: 'pwd',
            execute: (_, ctx) => [{ type: 'output', content: `~${ctx.currentPath}` }],
        },

        tree: {
            name: 'tree',
            description: 'Display directory tree',
            usage: 'tree [path] [--depth N]',
            execute: (args, ctx) => {
                const depthIdx = args.indexOf('--depth');
                const maxDepth = depthIdx !== -1 ? parseInt(args[depthIdx + 1]) || 3 : 3;
                const pathArg = args.find(a => !a.startsWith('-') && a !== args[depthIdx + 1]);
                const targetPath = pathArg ? resolvePath(ctx.currentPath, pathArg) : ctx.currentPath;

                const results: TerminalMessage[] = [{ type: 'output', content: targetPath || '.' }];

                const buildTree = (items: FileSystemItem[], prefix: string, depth: number) => {
                    if (depth > maxDepth) return;
                    items.forEach((item, idx) => {
                        const isLast = idx === items.length - 1;
                        const connector = isLast ? '└── ' : '├── ';
                        const isDir = isFolder(item);
                        // Tree colors
                        const name = isDir
                            ? `${ansi.bold}${ansi.blue}${item.name}/${ansi.reset}`
                            : `${ansi.white}${item.name}${ansi.reset}`;
                        results.push({ type: isDir ? 'success' : 'output', content: `${prefix}${connector}${name}` });

                        if ('children' in item && item.children && depth < maxDepth) {
                            const newPrefix = prefix + (isLast ? '    ' : '│   ');
                            buildTree(item.children as FileSystemItem[], newPrefix, depth + 1);
                        }
                    });
                };

                const items = getFilesInPath(ctx.files, targetPath);
                buildTree(items, '', 1);

                const allItems = getAllFiles(items);
                const dirs = allItems.filter(i => isFolder(i.item)).length;
                const filesCount = allItems.filter(i => !isFolder(i.item)).length;
                results.push({ type: 'success', content: `\n${dirs} directories, ${filesCount} files` });

                return results;
            },
        },

        find: {
            name: 'find',
            description: 'Search for files',
            usage: 'find <pattern>',
            execute: (args, ctx) => {
                if (!args[0]) return [{ type: 'error', content: 'Usage: find <pattern>' }];
                const pattern = args[0].toLowerCase();
                const allItems = getAllFiles(ctx.files);
                const matches = allItems.filter(i => i.item.name.toLowerCase().includes(pattern));

                if (matches.length === 0) {
                    return [{ type: 'output', content: `No files matching '${args[0]}' found` }];
                }

                return matches.map(m => ({ type: 'success' as const, content: `./${m.path}` }));
            },
        },

        cat: {
            name: 'cat',
            description: 'Display file contents',
            usage: 'cat <file>',
            execute: (args, ctx) => {
                if (!args[0]) return [{ type: 'error', content: 'Usage: cat <file>' }];
                const targetPath = resolvePath(ctx.currentPath, args[0]);
                const item = getItemAtPath(ctx.files, targetPath);

                if (!item) return [{ type: 'error', content: `cat: ${args[0]}: No such file or directory` }];
                if (isFolder(item)) return [{ type: 'error', content: `cat: ${args[0]}: Is a directory` }];

                const content = (item as FileData).content;
                return content.split('\n').map(line => ({ type: 'output' as const, content: line }));
            },
        },

        head: {
            name: 'head',
            description: 'Show first lines of file',
            usage: 'head [-n N] <file>',
            execute: (args, ctx) => {
                const nIdx = args.indexOf('-n');
                const lines = nIdx !== -1 ? parseInt(args[nIdx + 1]) || 10 : 10;
                const file = args.find(a => !a.startsWith('-') && a !== args[nIdx + 1]);

                if (!file) return [{ type: 'error', content: 'Usage: head [-n N] <file>' }];
                const targetPath = resolvePath(ctx.currentPath, file);
                const item = getItemAtPath(ctx.files, targetPath);

                if (!item) return [{ type: 'error', content: `head: ${file}: No such file` }];
                if (isFolder(item)) return [{ type: 'error', content: `head: ${file}: Is a directory` }];

                const content = (item as FileData).content.split('\n').slice(0, lines);
                return content.map(line => ({ type: 'output' as const, content: line }));
            },
        },

        tail: {
            name: 'tail',
            description: 'Show last lines of file',
            usage: 'tail [-n N] <file>',
            execute: (args, ctx) => {
                const nIdx = args.indexOf('-n');
                const lines = nIdx !== -1 ? parseInt(args[nIdx + 1]) || 10 : 10;
                const file = args.find(a => !a.startsWith('-') && a !== args[nIdx + 1]);

                if (!file) return [{ type: 'error', content: 'Usage: tail [-n N] <file>' }];
                const targetPath = resolvePath(ctx.currentPath, file);
                const item = getItemAtPath(ctx.files, targetPath);

                if (!item) return [{ type: 'error', content: `tail: ${file}: No such file` }];
                if (isFolder(item)) return [{ type: 'error', content: `tail: ${file}: Is a directory` }];

                const allLines = (item as FileData).content.split('\n');
                const content = allLines.slice(-lines);
                return content.map(line => ({ type: 'output' as const, content: line }));
            },
        },

        wc: {
            name: 'wc',
            description: 'Word, line, character count',
            usage: 'wc <file>',
            execute: (args, ctx) => {
                if (!args[0]) return [{ type: 'error', content: 'Usage: wc <file>' }];
                const targetPath = resolvePath(ctx.currentPath, args[0]);
                const item = getItemAtPath(ctx.files, targetPath);

                if (!item) return [{ type: 'error', content: `wc: ${args[0]}: No such file` }];
                if (isFolder(item)) return [{ type: 'error', content: `wc: ${args[0]}: Is a directory` }];

                const content = (item as FileData).content;
                const lines = content.split('\n').length;
                const words = content.split(/\s+/).filter(Boolean).length;
                const chars = content.length;

                return [{ type: 'output', content: `  ${lines}  ${words}  ${chars} ${args[0]}` }];
            },
        },

        grep: {
            name: 'grep',
            description: 'Search pattern in file',
            usage: 'grep <pattern> <file>',
            execute: (args, ctx) => {
                if (args.length < 2) return [{ type: 'error', content: 'Usage: grep <pattern> <file>' }];
                const [pattern, file] = args;
                const targetPath = resolvePath(ctx.currentPath, file);
                const item = getItemAtPath(ctx.files, targetPath);

                if (!item) return [{ type: 'error', content: `grep: ${file}: No such file` }];
                if (isFolder(item)) return [{ type: 'error', content: `grep: ${file}: Is a directory` }];

                const content = (item as FileData).content;
                const regex = new RegExp(pattern, 'gi');
                const matches = content.split('\n')
                    .map((line, idx) => ({ line, idx: idx + 1 }))
                    .filter(({ line }) => regex.test(line));

                if (matches.length === 0) {
                    return [{ type: 'output', content: `No matches found for '${pattern}'` }];
                }

                return matches.map(({ line, idx }) => ({
                    type: 'success' as const,
                    content: `${ansi.gray}${idx}:${ansi.reset} ${line.replace(regex, match => `${ansi.red}${ansi.bold}${match}${ansi.reset}`)}`
                }));
            },
        },

        open: {
            name: 'open',
            description: 'Open file in editor',
            usage: 'open <file>',
            execute: (args, ctx) => {
                if (!args[0]) return [{ type: 'error', content: 'Usage: open <file>' }];
                const opened = ctx.openFile(args[0]);
                if (opened) {
                    return [{ type: 'success', content: `Opened ${opened}` }];
                }
                return [{ type: 'error', content: `File not found: ${args[0]}` }];
            },
        },

        whoami: {
            name: 'whoami',
            description: 'Display current user',
            usage: 'whoami',
            execute: (_, ctx) => [{ type: 'output', content: ctx.env.USER || 'guest' }],
        },

        date: {
            name: 'date',
            description: 'Display current date and time',
            usage: 'date',
            execute: () => {
                const now = new Date();
                const formatted = now.toLocaleString('en-US', {
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                });
                return [{ type: 'output', content: formatted }];
            },
        },

        uptime: {
            name: 'uptime',
            description: 'Show system uptime',
            usage: 'uptime',
            execute: () => {
                const hours = Math.floor(Math.random() * 100) + 1;
                const mins = Math.floor(Math.random() * 60);
                return [{ type: 'output', content: ` ${new Date().toLocaleTimeString()} up ${hours}:${mins.toString().padStart(2, '0')}, 1 user, load average: 0.42, 0.38, 0.35` }];
            },
        },

        env: {
            name: 'env',
            description: 'Display environment variables',
            usage: 'env',
            execute: (_, ctx) => {
                return Object.entries(ctx.env).map(([key, value]) => ({
                    type: 'output' as const,
                    content: `${ansi.bold}${key}${ansi.reset}=${value}`
                }));
            },
        },

        export: {
            name: 'export',
            description: 'Set environment variable',
            usage: 'export KEY=VALUE',
            execute: (args, ctx) => {
                const arg = args.join(' ');
                const match = arg.match(/^(\w+)=(.*)$/);
                if (!match) return [{ type: 'error', content: 'Usage: export KEY=VALUE' }];
                ctx.setEnv(match[1], match[2]);
                return [{ type: 'success', content: `Set ${match[1]}=${match[2]}` }];
            },
        },

        echo: {
            name: 'echo',
            description: 'Print text to terminal',
            usage: 'echo <text>',
            execute: (args, ctx) => {
                let text = args.join(' ');
                // Replace $VAR with env values
                text = text.replace(/\$(\w+)/g, (_, key) => ctx.env[key] || '');
                return [{ type: 'output', content: text }];
            },
        },

        alias: {
            name: 'alias',
            description: 'Manage command aliases',
            usage: 'alias [name=command]',
            execute: (args, ctx) => {
                if (!args[0]) {
                    return Object.entries(ctx.aliases).map(([name, cmd]) => ({
                        type: 'output' as const,
                        content: `alias ${ansi.cyan}${name}${ansi.reset}='${cmd}'`
                    }));
                }
                const match = args.join(' ').match(/^(\w+)=(.+)$/);
                if (!match) return [{ type: 'error', content: 'Usage: alias name=command' }];
                ctx.setAlias(match[1], match[2].replace(/^['"]|['"]$/g, ''));
                return [{ type: 'success', content: `Alias: ${match[1]} = ${match[2]}` }];
            },
        },

        npm: {
            name: 'npm',
            description: 'NPM package manager',
            usage: 'npm <command>',
            execute: (args) => {
                const cmd = args[0];
                // Support 'npm run <script>' and direct 'npm <script>' for convenience
                const script = cmd === 'run' ? args[1] : cmd;

                switch (script) {
                    case 'start':
                        return [
                            { type: 'output', content: `> portfolio-v3@3.0.2 start` },
                            { type: 'output', content: `> next start` },
                            { type: 'success', content: `  ${ansi.bold}Next.js 14.1.0${ansi.reset}` },
                            { type: 'output', content: `  - Local:        ${ansi.cyan}http://localhost:3000${ansi.reset}` },
                            { type: 'output', content: `  - Network:      ${ansi.cyan}http://192.168.1.100:3000${ansi.reset}` },
                            { type: 'success', content: `  ${ansi.green}Ready in 1.2s${ansi.reset}` },
                        ];
                    case 'dev':
                        return [
                            { type: 'output', content: '> portfolio-v3@3.0.2 dev' },
                            { type: 'output', content: '> next dev --turbo' },
                            { type: 'success', content: `  ${ansi.bold}Next.js 15.0.0 (Turbopack)${ansi.reset}` },
                            { type: 'output', content: `  - Local:        ${ansi.cyan}http://localhost:3000${ansi.reset}` },
                            { type: 'success', content: `  ${ansi.green}Ready in 0.8s${ansi.reset} ${ansi.gray}(Turbopack enabled)${ansi.reset}` },
                        ];
                    case 'build':
                        return [
                            { type: 'output', content: '> portfolio-v3@3.0.2 build' },
                            { type: 'output', content: '> next build' },
                            { type: 'output', content: '  Creating an optimized production build...' },
                            { type: 'success', content: '  Compiled successfully' },
                            { type: 'success', content: '  Linting and checking validity of types' },
                            { type: 'success', content: '  Collecting page data' },
                            { type: 'success', content: '  Generating static pages (5/5)' },
                            { type: 'success', content: '  Finalizing page optimization' },
                            { type: 'output', content: '' },
                            { type: 'output', content: `Route (app)                              Size     First Load JS` },
                            { type: 'output', content: `  ${ansi.green}┌${ansi.reset} /                                      5.2 kB        89.2 kB` },
                            { type: 'output', content: `  ${ansi.green}├${ansi.reset} /about                                 2.1 kB        86.1 kB` },
                            { type: 'output', content: `  ${ansi.green}└${ansi.reset} /contact                               3.4 kB        87.4 kB` },
                            { type: 'success', content: `  ${ansi.green}Build completed in 8.4s${ansi.reset}` },
                        ];
                    case 'test':
                        return [
                            { type: 'output', content: '> portfolio-v3@3.0.2 test' },
                            { type: 'output', content: '> vitest --run' },
                            { type: 'success', content: `  ${ansi.green}PASS${ansi.reset} src/__tests__/components/Button.test.tsx (3 tests) 45ms` },
                            { type: 'success', content: `  ${ansi.green}PASS${ansi.reset} src/__tests__/hooks/useLocalStorage.test.ts (5 tests) 23ms` },
                            { type: 'success', content: `  ${ansi.green}PASS${ansi.reset} src/__tests__/lib/utils.test.ts (4 tests) 12ms` },
                            { type: 'success', content: `  ${ansi.bold}Test Files  3 passed${ansi.reset} (3)` },
                            { type: 'success', content: `  ${ansi.bold}Tests       12 passed${ansi.reset} (12)` },
                            { type: 'output', content: `  Duration    1.24s` },
                        ];

                    // Creative Scripts
                    case 'drink:coffee':
                        return [
                            { type: 'output', content: '> abdelbadie-portfolio@3.0.2 drink:coffee' },
                            { type: 'output', content: '> brew install caffeine' },
                            { type: 'output', content: `  ${ansi.yellow}☕ Brewing...${ansi.reset}` },
                            { type: 'output', content: `  [██████████] 100%` },
                            { type: 'success', content: `  ${ansi.green}Success!${ansi.reset} Energy levels restored.` },
                            { type: 'output', content: `  ${ansi.blue}Code quality increased by 50%${ansi.reset}` },
                        ];
                    case 'solve:problem':
                        return [
                            { type: 'output', content: '> abdelbadie-portfolio@3.0.2 solve:problem' },
                            { type: 'output', content: '> node ./brain/solve.js' },
                            { type: 'output', content: `  ${ansi.magenta}Analyzing complexity...${ansi.reset}` },
                            { type: 'output', content: `  Optimizing algorithms...` },
                            { type: 'success', content: `  ${ansi.green}Solution found!${ansi.reset}` },
                            { type: 'output', content: `  Output: Simple, scalable, and robust code.` },
                        ];
                    case 'design:ui':
                        return [
                            { type: 'output', content: '> abdelbadie-portfolio@3.0.2 design:ui' },
                            { type: 'output', content: '> figma --open' },
                            { type: 'output', content: `  ${ansi.cyan}Launching creative kernel...${ansi.reset}` },
                            { type: 'output', content: `  Aligning pixels...` },
                            { type: 'success', content: `  ${ansi.green}Interface rendered.${ansi.reset}` },
                            { type: 'output', content: `  Aesthetic: Minimalist Industrial.` },
                        ];

                    case 'install':
                    case 'i':
                        const pkg = args[1];
                        if (pkg) {
                            return [
                                { type: 'output', content: `\nadded 1 package in 2.3s` },
                                { type: 'success', content: `\n+ ${pkg}@latest` },
                                { type: 'output', content: 'added 1 package, and audited 342 packages in 3s' },
                                { type: 'success', content: `\n${ansi.green}found 0 vulnerabilities${ansi.reset}` },
                            ];
                        }
                        return [
                            { type: 'output', content: '\nadded 341 packages in 8.2s' },
                            { type: 'success', content: '\n341 packages are looking for funding' },
                            { type: 'output', content: '  run `npm fund` for details' },
                            { type: 'success', content: `\n${ansi.green}found 0 vulnerabilities${ansi.reset}` },
                        ];
                    case '-v':
                    case '--version':
                        return [{ type: 'output', content: '10.2.3' }];
                    default:
                        // If we are here, it means script didn't match any case.
                        // If the user typed 'npm run <unknown>', args[1] is the script name
                        if (cmd === 'run') {
                            return [{ type: 'error', content: `npm run: script '${script || ''}' not found` }];
                        }
                        return [{ type: 'error', content: `npm: '${cmd || ''}' is not a npm command. See 'npm help'.` }];
                }
            },
        },

        node: {
            name: 'node',
            description: 'Node.js runtime',
            usage: 'node [-v | -e "code"]',
            execute: (args, ctx) => {
                if (args[0] === '-v' || args[0] === '--version') {
                    return [{ type: 'output', content: `v${ctx.env.NODE_VERSION}` }];
                }
                if (args[0] === '-e' && args[1]) {
                    try {
                        const code = args.slice(1).join(' ').replace(/^["']|["']$/g, '');
                        // Safe eval for simple expressions
                        if (/^[\d\s+\-*/().]+$/.test(code)) {
                            return [{ type: 'output', content: String(eval(code)) }];
                        }
                        if (code.startsWith('console.log')) {
                            const match = code.match(/console\.log\((.+)\)/);
                            if (match) return [{ type: 'output', content: match[1].replace(/^["']|["']$/g, '') }];
                        }
                        return [{ type: 'output', content: 'undefined' }];
                    } catch {
                        return [{ type: 'error', content: 'SyntaxError: Invalid expression' }];
                    }
                }
                return [
                    { type: 'output', content: `Welcome to Node.js v${ctx.env.NODE_VERSION}.` },
                    { type: 'output', content: 'Type ".help" for more information.' },
                    { type: 'output', content: '> (Interactive mode not available in demo)' },
                ];
            },
        },

        git: {
            name: 'git',
            description: 'Git version control',
            usage: 'git <command>',
            execute: (args) => {
                const cmd = args[0];
                switch (cmd) {
                    case 'status':
                        return [
                            { type: 'output', content: `On branch ${ansi.bold}main${ansi.reset}` },
                            { type: 'output', content: "Your branch is up to date with 'origin/main'.\n" },
                            { type: 'success', content: 'Changes not staged for commit:' },
                            { type: 'output', content: '  (use "git add <file>..." to update what will be committed)\n' },
                            { type: 'error', content: `        ${ansi.red}modified:   src/components/Terminal.tsx${ansi.reset}` },
                            { type: 'error', content: `        ${ansi.red}modified:   src/hooks/useTerminal.ts${ansi.reset}\n` },
                            { type: 'output', content: 'no changes added to commit (use "git add" and/or "git commit -a")' },
                        ];
                    case 'log':
                        return [
                            { type: 'output', content: `${ansi.yellow}commit a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9${ansi.reset}` },
                            { type: 'output', content: 'Author: Abdelbadie Khoubiza <a.khoubiza.dev@gmail.com>' },
                            { type: 'output', content: 'Date:   Mon Nov 25 2025 10:30:00\n' },
                            { type: 'output', content: '    feat: enhance terminal with advanced features\n' },
                            { type: 'output', content: `${ansi.yellow}commit b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0${ansi.reset}` },
                            { type: 'output', content: 'Author: Abdelbadie Khoubiza <a.khoubiza.dev@gmail.com>' },
                            { type: 'output', content: 'Date:   Sun Nov 24 2025 18:45:00\n' },
                            { type: 'output', content: '    refactor: improve code window components' },
                        ];
                    case 'branch':
                        return [
                            { type: 'success', content: `${ansi.green}* main${ansi.reset}` },
                            { type: 'output', content: '  develop' },
                            { type: 'output', content: '  feature/terminal-v2' },
                        ];
                    case 'diff':
                        return [
                            { type: 'output', content: `${ansi.bold}diff --git a/src/components/Terminal.tsx b/src/components/Terminal.tsx${ansi.reset}` },
                            { type: 'output', content: 'index a1b2c3d..e4f5g6h 100644' },
                            { type: 'output', content: '--- a/src/components/Terminal.tsx' },
                            { type: 'output', content: '+++ b/src/components/Terminal.tsx' },
                            { type: 'output', content: `${ansi.cyan}@@ -1,5 +1,10 @@${ansi.reset}` },
                            { type: 'error', content: `${ansi.red}-// Old terminal implementation${ansi.reset}` },
                            { type: 'success', content: `${ansi.green}+// Enhanced terminal with advanced features${ansi.reset}` },
                            { type: 'success', content: `${ansi.green}+// Supports: history, autocomplete, aliases${ansi.reset}` },
                        ];
                    case '--version':
                    case '-v':
                        return [{ type: 'output', content: 'git version 2.43.0' }];
                    default:
                        return [{ type: 'error', content: `git: '${cmd || ''}' is not a git command. See 'git --help'.` }];
                }
            },
        },

        curl: {
            name: 'curl',
            description: 'Transfer data from URL',
            usage: 'curl <url>',
            execute: (args) => {
                if (!args[0]) return [{ type: 'error', content: 'Usage: curl <url>' }];
                const url = args[0];
                return [
                    { type: 'output', content: `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current` },
                    { type: 'output', content: `                                 Dload  Upload   Total   Spent    Left  Speed` },
                    { type: 'success', content: `100  1256  100  1256    0     0  12560      0 --:--:-- --:--:-- --:--:-- 12560` },
                    { type: 'output', content: `\n${ansi.cyan}<!DOCTYPE html>${ansi.reset}` },
                    { type: 'output', content: `<html lang="en">` },
                    { type: 'output', content: `<head><title>${url}</title></head>` },
                    { type: 'output', content: `<body>...</body>` },
                    { type: 'output', content: `</html>` },
                ];
            },
        },

        ping: {
            name: 'ping',
            description: 'Ping a host',
            usage: 'ping <host>',
            execute: (args) => {
                if (!args[0]) return [{ type: 'error', content: 'Usage: ping <host>' }];
                const host = args[0];
                const results: TerminalMessage[] = [
                    { type: 'output', content: `PING ${host} (93.184.216.34): 56 data bytes` },
                ];
                for (let i = 0; i < 4; i++) {
                    const time = (Math.random() * 50 + 10).toFixed(1);
                    results.push({ type: 'success', content: `64 bytes from 93.184.216.34: icmp_seq=${i} ttl=56 time=${time} ms` });
                }
                results.push({ type: 'output', content: `\n--- ${host} ping statistics ---` });
                results.push({ type: 'output', content: `4 packets transmitted, 4 packets received, 0.0% packet loss` });
                return results;
            },
        },

        clear: {
            name: 'clear',
            description: 'Clear terminal screen',
            usage: 'clear',
            execute: () => [],
        },

        cls: {
            name: 'cls',
            description: 'Clear terminal screen',
            usage: 'cls',
            execute: () => [],
        },

        history: {
            name: 'history',
            description: 'Show command history',
            usage: 'history',
            execute: () => [], // Handled specially in executeCommand
        },
        neofetch: {
            name: 'neofetch',
            description: 'Display system information',
            usage: 'neofetch',
            execute: (_, ctx) => [
                { type: 'output', content: '' },
                // Ligne 1 : Haut du B
                { type: 'success', content: `   ${ansi.white}██████████${ansi.reset}                    ${ansi.bold}${ctx.env.USER}@b-dev-portfolio${ansi.reset}` },
                // Ligne 2 : Corps haut
                { type: 'success', content: `   ${ansi.white}██      ██${ansi.reset}                    ─────────────────────` },
                // Ligne 3 : Corps haut + Haut de l'étoile
                { type: 'success', content: `   ${ansi.white}██      ██${ansi.reset}          ${ansi.blue}│${ansi.reset}         OS: B.DEV OS 2.0` },
                // Ligne 4 : Barre centrale + Centre de l'étoile
                { type: 'success', content: `   ${ansi.white}██████████${ansi.reset}      ${ansi.blue}─── ┼ ───${ansi.reset}      Host: Portfolio v3.0.2` },
                // Ligne 5 : Corps bas + Bas de l'étoile
                { type: 'success', content: `   ${ansi.white}██      ██${ansi.reset}          ${ansi.blue}│${ansi.reset}         Kernel: Next.js 14.1.0` },
                // Ligne 6 : Corps bas
                { type: 'success', content: `   ${ansi.white}██      ██${ansi.reset}                    Uptime: Always Online` },
                // Ligne 7 : Bas du B
                { type: 'success', content: `   ${ansi.white}██████████${ansi.reset}                    Packages: 341 (npm)` },
                // Suite des infos alignées
                { type: 'success', content: `                                  Shell: bdev-sh 2.0` },
                { type: 'success', content: `                                  Terminal: B.DEV Terminal` },
                { type: 'success', content: `                                  CPU: TypeScript Engine` },
                { type: 'success', content: `                                  Memory: 128MB / 512MB` },
                { type: 'output', content: '' },
                { type: 'output', content: `                                  Node: v${ctx.env.NODE_VERSION}` },
                { type: 'output', content: `                                  NPM: v${ctx.env.NPM_VERSION}` },
                { type: 'output', content: '' },
            ],
        },

        cowsay: {
            name: 'cowsay',
            description: 'ASCII cow says your message',
            usage: 'cowsay <message>',
            execute: (args) => {
                const msg = args.join(' ') || 'Moo!';
                const border = '─'.repeat(msg.length + 2);
                return [
                    { type: 'output', content: ` ╭${border}╮` },
                    { type: 'output', content: ` │ ${msg} │` },
                    { type: 'output', content: ` ╰${border}╯` },
                    { type: 'output', content: '        \\   ^__^' },
                    { type: 'output', content: '         \\  (oo)\\_______' },
                    { type: 'output', content: '            (__)\\       )\\/\\' },
                    { type: 'output', content: '                ||----w |' },
                    { type: 'output', content: '                ||     ||' },
                ];
            },
        },

        matrix: {
            name: 'matrix',
            description: 'Matrix rain effect',
            usage: 'matrix',
            execute: () => {
                const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01234567890';
                const lines: TerminalMessage[] = [];
                for (let i = 0; i < 8; i++) {
                    const lineChars = new Array(60);
                    for (let j = 0; j < 60; j++) {
                        lineChars[j] = chars[Math.floor(Math.random() * chars.length)];
                    }
                    lines.push({ type: 'success', content: `${ansi.green}${lineChars.join('')}${ansi.reset}` });
                }
                lines.push({ type: 'output', content: '\n[Matrix simulation - Press any key to exit]' });
                return lines;
            },
        },

        calc: {
            name: 'calc',
            description: 'Simple calculator',
            usage: 'calc <expression>',
            execute: (args) => {
                const expr = args.join('');
                if (!expr) return [{ type: 'error', content: 'Usage: calc <expression> (e.g., calc 2+2*3)' }];
                if (!/^[\d\s+\-*/().]+$/.test(expr)) {
                    return [{ type: 'error', content: 'Invalid expression. Only numbers and +, -, *, /, (, ) allowed.' }];
                }
                try {
                    const result = eval(expr);
                    return [{ type: 'success', content: `= ${ansi.bold}${result}${ansi.reset}` }];
                } catch {
                    return [{ type: 'error', content: 'Error evaluating expression' }];
                }
            },
        },

        weather: {
            name: 'weather',
            description: 'Show weather (simulated)',
            usage: 'weather [city]',
            execute: (args) => {
                const city = args[0] || 'Fes';
                return [
                    { type: 'output', content: '' },
                    { type: 'output', content: `  Weather for ${ansi.bold}${city}${ansi.reset}:` },
                    { type: 'output', content: '' },
                    { type: 'success', content: '    \\  /       Partly Cloudy' },
                    { type: 'success', content: `  _ /\"\".-.     ${ansi.bold}22°C${ansi.reset}` },
                    { type: 'success', content: "    \\_(   ).   ↗ 12 km/h" },
                    { type: 'success', content: '    /(___(__)  10 km visibility' },
                    { type: 'output', content: '' },
                    { type: 'output', content: '  Humidity: 45%  |  UV Index: 5' },
                    { type: 'output', content: '' },
                ];
            },
        },

        joke: {
            name: 'joke',
            description: 'Tell a programming joke',
            usage: 'joke',
            execute: () => {
                const jokes = [
                    "Why do programmers prefer dark mode? Because light attracts bugs!",
                    "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'",
                    "Why do Java developers wear glasses? Because they can't C#!",
                    "There are only 10 types of people in the world: those who understand binary and those who don't.",
                    "Why was the JavaScript developer sad? Because he didn't Node how to Express himself!",
                    "A programmer's wife tells him: 'Go to the store and buy a loaf of bread. If they have eggs, buy a dozen.' He comes home with 12 loaves of bread.",
                    "Why do programmers hate nature? It has too many bugs.",
                    "['hip', 'hip'] // hip hip array!",
                ];
                const joke = jokes[Math.floor(Math.random() * jokes.length)];
                return [{ type: 'output', content: `\n  😄 ${joke}\n` }];
            },
        },

        fortune: {
            name: 'fortune',
            description: 'Display a random fortune',
            usage: 'fortune',
            execute: () => {
                const fortunes = [
                    "The best time to plant a tree was 20 years ago. The second best time is now.",
                    "Code is like humor. When you have to explain it, it's bad.",
                    "First, solve the problem. Then, write the code.",
                    "Experience is the name everyone gives to their mistakes.",
                    "The only way to learn a new programming language is by writing programs in it.",
                    "Simplicity is the soul of efficiency.",
                    "Make it work, make it right, make it fast.",
                ];
                const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
                return [{ type: 'output', content: `  ${ansi.italic}${fortune}${ansi.reset}` }];
            },
        },

        figlet: {
            name: 'figlet',
            description: 'Display text in ASCII art',
            usage: 'figlet <text>',
            execute: (args) => {
                // Combine les arguments pour accepter "figlet hello world"
                const text = (args.join(' ') || 'BDEV').toUpperCase();

                // Dictionnaire complet (Style: ANSI Shadow / Block)
                const chars: Record<string, string[]> = {
                    'A': ['██████╗ ', '██╔══██╗', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
                    'B': ['██████╗ ', '██╔══██╗', '██████╔╝', '██╔══██╗', '██████╔╝', '╚═════╝ '],
                    'C': ['██████╗ ', '██╔══██╗', '██║     ', '██║     ', '╚██████╗', ' ╚═════╝'],
                    'D': ['██████╗ ', '██╔══██╗', '██║  ██║', '██║  ██║', '██████╔╝', '╚═════╝ '],
                    'E': ['███████╗', '██╔════╝', '█████╗  ', '██╔══╝  ', '███████╗', '╚══════╝'],
                    'F': ['███████╗', '██╔════╝', '█████╗  ', '██╔══╝  ', '██║     ', '╚═╝     '],
                    'G': ['██████╗ ', '██╔════╝', '██║  ███╗', '██║   ██║', '╚██████╔╝', ' ╚═════╝ '],
                    'H': ['██╗  ██╗', '██║  ██║', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
                    'I': ['██╗', '██║', '██║', '██║', '██║', '╚═╝'],
                    'J': ['     ██╗', '     ██║', '     ██║', '██   ██║', '╚█████╔╝', ' ╚════╝ '],
                    'K': ['██╗  ██╗', '██║ ██╔╝', '█████╔╝ ', '██╔═██╗ ', '██║  ██╗', '╚═╝  ╚═╝'],
                    'L': ['██╗     ', '██║     ', '██║     ', '██║     ', '███████╗', '╚══════╝'],
                    'M': ['███╗   ███╗', '████╗ ████║', '██╔████╔██║', '██║╚██╔╝██║', '██║ ╚═╝ ██║', '╚═╝     ╚═╝'],
                    'N': ['███╗   ██╗', '████╗  ██║', '██╔██╗ ██║', '██║╚██╗██║', '██║ ╚████║', '╚═╝  ╚═══╝'],
                    'O': ['██████╗ ', '██╔══██╗', '██║  ██║', '██║  ██║', '╚██████╔╝', ' ╚═════╝ '],
                    'P': ['██████╗ ', '██╔══██╗', '██████╔╝', '██╔═══╝ ', '██║     ', '╚═╝     '],
                    'Q': ['██████╗ ', '██╔══██╗', '██║  ██║', '██║  ██║', '╚██████╗', ' ╚═════╝'],
                    'R': ['██████╗ ', '██╔══██╗', '██████╔╝', '██╔══██╗', '██║  ██║', '╚═╝  ╚═╝'],
                    'S': ['███████╗', '██╔════╝', '███████╗', '╚════██║', '███████║', '╚══════╝'],
                    'T': ['████████╗', '╚══██╔══╝', '   ██║   ', '   ██║   ', '   ██║   ', '   ╚═╝   '],
                    'U': ['██╗  ██╗', '██║  ██║', '██║  ██║', '██║  ██║', '╚█████╔╝', ' ╚════╝ '],
                    'V': ['██╗   ██╗', '██║   ██║', '██║   ██║', '╚██╗ ██╔╝', ' ╚████╔╝ ', '  ╚═══╝  '],
                    'W': ['██╗    ██╗', '██║    ██║', '██║ █╗ ██║', '██║███╗██║', '╚███╔███╔╝', ' ╚══╝╚══╝ '],
                    'X': ['██╗  ██╗', '╚██╗██╔╝', ' ╚███╔╝ ', ' ██╔██╗ ', '██╔╝ ██╗', '╚═╝  ╚═╝'],
                    'Y': ['██╗   ██╗', '╚██╗ ██╔╝', ' ╚████╔╝ ', '  ╚██╔╝  ', '   ██║   ', '   ╚═╝   '],
                    'Z': ['████████╗', '╚══██╔══╝', '   ██╔╝  ', '  ██╔╝   ', ' ████████╗', '╚════════╝'],
                    '0': ['██████╗ ', '██╔═██╗ ', '██║ ██║ ', '██║ ██║ ', '╚████╔╝ ', ' ╚═══╝  '],
                    '1': [' ██╗', '███║', '╚██║', ' ██║', ' ██║', ' ╚═╝'],
                    '2': ['██████╗ ', '╚════██╗', ' █████╔╝', '██╔═══╝ ', '███████╗', '╚══════╝'],
                    '3': ['██████╗ ', '╚════██╗', ' █████╔╝', ' ╚═══██╗', '██████╔╝', '╚═════╝ '],
                    '4': ['██╗  ██╗', '██║  ██║', '███████║', '╚════██║', '     ██║', '     ╚═╝'],
                    '5': ['███████╗', '██╔════╝', '███████╗', '╚════██║', '███████║', '╚══════╝'],
                    '6': ['██████╗ ', '██╔════╝', '███████╗', '██╔══██║', '██████╔╝', '╚═════╝ '],
                    '7': ['████████╗', '╚══════██║', '     ██╔╝', '    ██╔╝ ', '   ██╔╝  ', '   ╚═╝   '],
                    '8': ['██████╗ ', '██╔══██╗', '╚█████╔╝', '██╔══██╗', '██████╔╝', '╚═════╝ '],
                    '9': ['██████╗ ', '██╔══██╗', '╚██████║', '     ██║', '██████╔╝', '╚═════╝ '],
                    ' ': ['  ', '  ', '  ', '  ', '  ', '  '],
                    '?': ['██████╗ ', '╚════██╗', ' █████╔╝', ' ╚═══╝  ', '   ██╗  ', '   ╚═╝  '],
                    '.': ['   ', '   ', '   ', '   ', '   ', '██╗'],
                    '!': ['██╗', '██║', '██║', '██║', '   ', '██╗'],
                    '-': ['      ', '      ', '█████╗', '╚════╝', '      ', '      ']
                };

                const lines = ['', '', '', '', '', ''];

                // Construction ligne par ligne
                for (const char of text) {
                    // Fallback sur '?' si le caractère n'existe pas
                    const art = chars[char] || chars['?'];
                    for (let i = 0; i < 6; i++) {
                        lines[i] += art[i];
                    }
                }

                return lines.map(line => ({
                    type: 'success',
                    content: `${ansi.blue}${line}${ansi.reset}`
                }));
            },
        },
        hostname: {
            name: 'hostname',
            description: 'Display hostname',
            usage: 'hostname',
            execute: () => [{ type: 'output', content: 'b-dev-portfolio.local' }],
        },

        uname: {
            name: 'uname',
            description: 'System information',
            usage: 'uname [-a]',
            execute: (args) => {
                if (args.includes('-a')) {
                    return [{ type: 'output', content: 'B.DEV-OS 2.0.0 b-dev-portfolio x86_64 Next.js/14.1.0' }];
                }
                return [{ type: 'output', content: 'B.DEV-OS' }];
            },
        },

        df: {
            name: 'df',
            description: 'Disk space usage',
            usage: 'df [-h]',
            execute: () => [
                { type: 'output', content: `${ansi.bold}Filesystem      Size  Used Avail Use% Mounted on${ansi.reset}` },
                { type: 'output', content: '/dev/sda1       500G  125G  375G  25% /' },
                { type: 'output', content: '/dev/sda2       100G   45G   55G  45% /home' },
                { type: 'output', content: 'tmpfs           8.0G  1.2G  6.8G  15% /tmp' },
            ],
        },

        free: {
            name: 'free',
            description: 'Memory usage',
            usage: 'free [-h]',
            execute: () => [
                { type: 'output', content: `              ${ansi.bold}total        used        free      shared  buff/cache   available${ansi.reset}` },
                { type: 'output', content: 'Mem:          16Gi       4.2Gi       8.1Gi       512Mi       3.7Gi        11Gi' },
                { type: 'output', content: 'Swap:         2.0Gi          0B       2.0Gi' },
            ],
        },

        ps: {
            name: 'ps',
            description: 'Process status',
            usage: 'ps [aux]',
            execute: () => [
                { type: 'output', content: `  ${ansi.bold}PID TTY          TIME CMD${ansi.reset}` },
                { type: 'output', content: '    1 pts/0    00:00:00 next-server' },
                { type: 'output', content: '   42 pts/0    00:00:01 node' },
                { type: 'output', content: '  100 pts/0    00:00:00 typescript' },
                { type: 'output', content: '  256 pts/1    00:00:00 bdev-sh' },
            ],
        },

        top: {
            name: 'top',
            description: 'System monitor',
            usage: 'top',
            execute: () => [
                { type: 'output', content: 'top - 10:30:00 up 42 days, load average: 0.42, 0.38, 0.35' },
                { type: 'output', content: 'Tasks:  42 total,   1 running,  41 sleeping' },
                { type: 'output', content: '%Cpu(s):  5.2 us,  1.3 sy,  0.0 ni, 93.5 id' },
                { type: 'output', content: 'MiB Mem :  16384.0 total,   8192.0 free,   4096.0 used' },
                { type: 'output', content: '' },
                { type: 'output', content: `  ${ansi.bold}PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND${ansi.reset}` },
                { type: 'success', content: '    1 guest     20   0  512000  64000  32000 S   2.0   0.4   0:42.00 next-server' },
                { type: 'output', content: '   42 guest     20   0  256000  32000  16000 S   1.0   0.2   0:12.00 node' },
                { type: 'output', content: '\n[Press q to exit - simulated]' },
            ],
        },

        exit: {
            name: 'exit',
            description: 'Exit terminal',
            usage: 'exit',
            execute: () => [{ type: 'output', content: 'logout\n[Process completed]' }],
        },

        // Portfolio specific commands
        about: {
            name: 'about',
            description: 'About this portfolio',
            usage: 'about',
            execute: () => [
                { type: 'output', content: '' },
                { type: 'success', content: `╔═══════════════════════════════════════════════════════════╗` },
                { type: 'success', content: `║           ${ansi.bold}B.DEV x B.411 Portfolio Terminal${ansi.reset}                ║` },
                { type: 'success', content: `╠═══════════════════════════════════════════════════════════╣` },
                { type: 'output', content: `║  Developer: Abdelbadie Khoubiza                           ║` },
                { type: 'output', content: `║  Email: a.khoubiza.dev@gmail.com                          ║` },
                { type: 'output', content: `║  Version: 3.0.2                                           ║` },
                { type: 'output', content: `╠═══════════════════════════════════════════════════════════╣` },
                { type: 'output', content: `║  ${ansi.bold}B.DEV${ansi.reset} = Code & Infrastructure Signature                  ║` },
                { type: 'output', content: `║  ${ansi.bold}B.411${ansi.reset} = Design & Visual Identity Signature               ║` },
                { type: 'success', content: `╚═══════════════════════════════════════════════════════════╝` },
                { type: 'output', content: '' },
            ],
        },

        skills: {
            name: 'skills',
            description: 'List developer skills',
            usage: 'skills',
            execute: () => [
                { type: 'output', content: `\n  ${ansi.bold}Technical Skills:${ansi.reset}` },
                { type: 'success', content: `  ├── ${ansi.cyan}Frontend${ansi.reset}: React, Next.js, TypeScript, Tailwind CSS` },
                { type: 'success', content: `  ├── ${ansi.cyan}Backend${ansi.reset}: Node.js, Express, Laravel, PHP` },
                { type: 'success', content: `  ├── ${ansi.cyan}Database${ansi.reset}: PostgreSQL, MongoDB, MySQL` },
                { type: 'success', content: `  ├── ${ansi.cyan}DevOps${ansi.reset}: Docker, Git, CI/CD, Linux` },
                { type: 'success', content: `  └── ${ansi.cyan}Tools${ansi.reset}: VS Code, Figma, Postman\n` },
            ],
        },

        contact: {
            name: 'contact',
            description: 'Contact information',
            usage: 'contact',
            execute: () => [
                { type: 'output', content: `\n  ${ansi.bold}Contact Information:${ansi.reset}` },
                { type: 'output', content: '  ─────────────────────' },
                { type: 'success', content: '  Email:    a.khoubiza.dev@gmail.com' },
                { type: 'success', content: '  GitHub:   github.com/abdelbadie' },
                { type: 'success', content: '  LinkedIn: linkedin.com/in/abdelbadie\n' },
            ],
        },

        projects: {
            name: 'projects',
            description: 'List portfolio projects',
            usage: 'projects',
            execute: () => [
                { type: 'output', content: `\n  ${ansi.bold}Featured Projects:${ansi.reset}` },
                { type: 'output', content: '  ─────────────────────' },
                { type: 'success', content: `  [1] ${ansi.bold}Portfolio v3.0${ansi.reset} - Next.js, TypeScript, Tailwind` },
                { type: 'success', content: `  [2] ${ansi.bold}E-Commerce Platform${ansi.reset} - React, Node.js, MongoDB` },
                { type: 'success', content: `  [3] ${ansi.bold}Task Manager${ansi.reset} - Laravel, Vue.js, PostgreSQL` },
                { type: 'output', content: '\n  Type "open README.md" for more details\n' },
            ],
        },

        social: {
            name: 'social',
            description: 'Open social links',
            usage: 'social [github|linkedin|email]',
            execute: (args) => {
                const links: Record<string, string> = {
                    github: 'https://github.com/abdelbadie',
                    linkedin: 'https://linkedin.com/in/abdelbadie',
                    email: 'mailto:a.khoubiza.dev@gmail.com',
                };
                if (args[0] && links[args[0].toLowerCase()]) {
                    return [{ type: 'success', content: `Opening ${args[0]}... (simulated)` }];
                }
                return [
                    { type: 'output', content: 'Available social links:' },
                    { type: 'output', content: `  social ${ansi.cyan}github${ansi.reset}   - GitHub profile` },
                    { type: 'output', content: `  social ${ansi.cyan}linkedin${ansi.reset} - LinkedIn profile` },
                    { type: 'output', content: `  social ${ansi.cyan}email${ansi.reset}    - Send email` },
                ];
            },
        },

        theme: {
            name: 'theme',
            description: 'Terminal theme info',
            usage: 'theme',
            execute: () => [
                { type: 'output', content: `\n  ${ansi.bold}B.411 Design System:${ansi.reset}` },
                { type: 'output', content: '  ─────────────────────' },
                { type: 'output', content: '  Primary:   #E1E0DB (UI Stone)' },
                { type: 'output', content: '  Accent:    #26251E (Dark)' },
                { type: 'output', content: '  Canvas:    #FFFFFF (White)' },
                { type: 'output', content: '  Font:      Inter / JetBrains Mono\n' },
            ],
        },

        time: {
            name: 'time',
            description: 'Current time in different zones',
            usage: 'time',
            execute: () => {
                const now = new Date();
                const zones = [
                    { name: 'Local', offset: 0 },
                    { name: 'UTC', offset: -now.getTimezoneOffset() / 60 },
                    { name: 'NYC', offset: -5 },
                    { name: 'Paris', offset: 1 },
                    { name: 'Tokyo', offset: 9 },
                ];
                const results: TerminalMessage[] = [{ type: 'output', content: `\n  ${ansi.bold}World Clock:${ansi.reset}` }];
                zones.forEach(zone => {
                    const time = new Date(now.getTime() + zone.offset * 3600000);
                    results.push({
                        type: 'output',
                        content: `  ${ansi.cyan}${zone.name.padEnd(8)}${ansi.reset} ${time.toLocaleTimeString('en-US', { hour12: false })}`
                    });
                });
                results.push({ type: 'output', content: '' });
                return results;
            },
        },

        welcome: {
            name: 'welcome',
            description: 'Show welcome message',
            usage: 'welcome',
            execute: () => [
                { type: 'output', content: `${ansi.bold}B.DEV Terminal${ansi.reset} [Version 3.0.2]` },
                { type: 'output', content: '(c) 2025 B.DEV x B.411 Portfolio' },
                { type: 'success', content: `Ready. Type "${ansi.cyan}help${ansi.reset}" for commands.` },
            ],
        },
    }), []);

    const getCommandSuggestions = useCallback((input: string): string[] => {
        const allCommands = Object.keys(commands);
        const allAliases = Object.keys(aliases);
        const all = [...allCommands, ...allAliases];

        if (!input) return all.slice(0, 10);

        return all.filter(cmd => cmd.startsWith(input.toLowerCase())).slice(0, 8);
    }, [commands, aliases]);

    const getFileSuggestions = useCallback((input: string, currentDir: string): string[] => {
        const items = getFilesInPath(files, currentDir);
        return items
            .filter(item => item.name.toLowerCase().startsWith(input.toLowerCase()))
            .map(item => isFolder(item) ? `${item.name}/` : item.name)
            .slice(0, 8);
    }, [files]);



    const navigateHistory = useCallback((direction: 'up' | 'down'): string => {
        if (commandHistory.length === 0) return '';

        let newIndex: number;
        if (direction === 'up') {
            newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        } else {
            newIndex = historyIndex === -1 ? -1 : Math.min(commandHistory.length - 1, historyIndex + 1);
            if (historyIndex === commandHistory.length - 1) newIndex = -1;
        }

        setHistoryIndex(newIndex);
        return newIndex === -1 ? '' : commandHistory[newIndex];
    }, [commandHistory, historyIndex]);

    const getPrompt = useCallback(() => {
        const path = currentPath === '/' ? '~' : `~${currentPath}`;
        // Claude Code style: Minimalist path display
        return {
            path,
            user: env.USER,
            // Visual cues for the renderer
            style: 'modern'
        };
    }, [currentPath, env.USER]);

    // Simulated AI Agent logic for the terminal
    const handleAgentQuery = (input: string): TerminalMessage[] => {
        const lowerInput = input.toLowerCase();


        // Helper for thinking steps
        const addStep = (text: string) => ({
            type: 'output' as const,
            content: `${ansi.gray}⠋ ${text}...${ansi.reset}`
        });

        const addSuccess = (text: string) => ({
            type: 'output' as const,
            content: `${ansi.green}✓${ansi.reset} ${ansi.gray}${text}${ansi.reset}`
        });

        // 1. Analysis Phase simulation
        if (lowerInput.includes('fix') || lowerInput.includes('bug')) {
            return [
                addStep('Reading active context'),
                addStep('Analyzing control flow'),
                addSuccess('Context loaded'),
                { type: 'output', content: `\n${ansi.bold}Analysis:${ansi.reset}\nI've scanned the directory. To fix issues, I recommend running the test suite first:\n\n  ${ansi.cyan}npm run test${ansi.reset}\n` }
            ];
        }

        if (lowerInput.includes('optimize') || lowerInput.includes('perf')) {
            return [
                addStep('Measuring bundle size'),
                addStep('Checking hydration metrics'),
                addSuccess('Performance profile ready'),
                { type: 'output', content: `\n${ansi.bold}Optimization Plan:${ansi.reset}\n1. Implement code splitting for the Terminal component.\n2. Use Next.js Image optimization.\n\nRun ${ansi.cyan}npm run solve:problem${ansi.reset} to apply auto-fixes.` }
            ];
        }

        if (lowerInput.includes('hello') || lowerInput.includes('hi ') || lowerInput.toLowerCase() === 'hi') {
            return [
                { type: 'output', content: `\n${ansi.bold}Hello!${ansi.reset} I am B.DEV Agent (v3.0.2).\nI can help you navigate the system, execute code, or answer questions about the portfolio.\n` }
            ];
        }

        // Default AI response for unknown queries
        return [
            addStep('Parsing intent'),
            { type: 'output', content: `\nI understand you want to "${ansi.italic}${input}${ansi.reset}".\nAs a terminal interface, I can execute commands. For complex reasoning, please use the **Chat Panel** on the right.\n\nTry running ${ansi.cyan}help${ansi.reset} to see what I can do here.` }
        ];
    };

    const executeCommand = useCallback((rawInput: string) => {
        const trimmed = rawInput.trim();
        if (!trimmed) return;

        // Add to command history
        setCommandHistory(prev => [...prev.filter(c => c !== trimmed), trimmed]);
        setHistoryIndex(-1);

        // Check for alias
        const parts = trimmed.split(' ');
        const cmdName = parts[0].toLowerCase();
        const resolvedCmd = aliases[cmdName] ? `${aliases[cmdName]} ${parts.slice(1).join(' ')}`.trim() : trimmed;

        const resolvedParts = resolvedCmd.split(' ');
        const cmd = resolvedParts[0].toLowerCase();
        const args = resolvedParts.slice(1);

        // Add command to history display with "Claude Code" styling (handled in renderer, but we flag it)
        const newHistory: TerminalMessage[] = [...history, { type: 'command', content: trimmed }];

        // Handle special commands
        if (cmd === 'clear' || cmd === 'cls') {
            setHistory([]);
            return;
        }

        if (cmd === 'history') {
            const historyOutput = commandHistory.map((c, i) => ({
                type: 'output' as const,
                content: `  ${ansi.gray}${(i + 1).toString().padStart(4)}${ansi.reset}  ${c}`
            }));
            setHistory([...newHistory, ...historyOutput]);
            return;
        }

        // Execute command OR Fallback to Agent
        const command = commands[cmd];
        if (command) {
            const output = command.execute(args, context);
            setHistory([...newHistory, ...output]);
        } else {
            // NEW: Instead of error, use Agent Logic
            const agentResponse = handleAgentQuery(trimmed);
            setHistory([...newHistory, ...agentResponse]);
        }
    }, [history, commands, context, aliases, commandHistory]);

    return {
        history,
        setHistory,
        executeCommand,
        navigateHistory,
        getCommandSuggestions,
        getFileSuggestions,
        getPrompt,
        currentPath,
        commandHistory,
    };
}
