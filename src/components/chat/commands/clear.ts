import { CommandRegistry } from '../ChatCommands';
import { CommandContext } from '../ChatContext';

const handleClear = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    ctx.dispatch({ type: 'CLEAR_ALL' });
    return true;
};

export function register(reg: CommandRegistry): void {
    reg.register('/clear', handleClear);
}
