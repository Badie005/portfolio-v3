import { CommandRegistry } from '../ChatCommands';
import { CommandContext } from '../ChatContext';
import { executeTerminalCommand } from '@/lib/fileSearch';

const handleRun = async (args: string, ctx: CommandContext): Promise<boolean> => {
    const cmd = args.trim();
    
    if (!cmd) {
        ctx.dispatch({
            type: 'ADD_BOT_MESSAGE',
            payload: { text: 'Veuillez spécifier une commande. Ex: `/run ls -la`' }
        });
        return true;
    }

    const result = ctx.onExecuteCommand
        ? ctx.onExecuteCommand(cmd)
        : executeTerminalCommand(cmd, { files: ctx.contextFiles.filter((f): f is FileData => 'content' in f) });

    ctx.dispatch({
        type: 'ADD_BOT_MESSAGE',
        payload: {
            text: `\`\`\`bash\n$ ${cmd}\n${result.output}\n\`\`\``,
            actions: [{ type: 'thought', filename: cmd, status: 'done', timestamp: Date.now() }],
        },
    });
    return true;
};

import { FileData } from '@/components/code-window/types';

export function register(reg: CommandRegistry): void {
    reg.register('/run', handleRun);
}
