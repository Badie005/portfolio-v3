import { CommandHandler, CommandPattern, CommandContext } from './ChatContext';

export class CommandRegistry {
    private commands = new Map<string, CommandHandler>();
    private patterns: CommandPattern[] = [];

    register(name: string, handler: CommandHandler): void {
        this.commands.set(name.toLowerCase(), handler);
    }

    registerPattern(regex: RegExp, handler: CommandHandler): void {
        this.patterns.push({ regex, handler });
    }

    get(name: string): CommandHandler | undefined {
        return this.commands.get(name.toLowerCase());
    }

    getAllCommands(): string[] {
        return Array.from(this.commands.keys());
    }

    async execute(input: string, ctx: CommandContext): Promise<boolean> {
        const trimmedInput = input.trim();
        const [cmd, ...args] = trimmedInput.split(' ');
        const cmdLower = cmd.toLowerCase();

        const handler = this.commands.get(cmdLower);
        if (handler) {
            return handler(args.join(' '), ctx);
        }

        for (const { regex, handler } of this.patterns) {
            if (regex.test(trimmedInput)) {
                return handler(trimmedInput, ctx);
            }
        }

        const terminalCmds = ['ls', 'cd', 'pwd', 'cat', 'grep', 'find', 'npm', 'git', 'node', 'help', 'whoami', 'date', 'uptime', 'env', 'echo'];
        if (terminalCmds.includes(cmdLower) && ctx.onExecuteCommand) {
            const runHandler = this.commands.get('/run');
            if (runHandler) {
                return runHandler(trimmedInput, ctx);
            }
        }

        return false;
    }
}

export const registry = new CommandRegistry();
