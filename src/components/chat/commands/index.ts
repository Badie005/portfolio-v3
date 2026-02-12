import { registry } from '../ChatCommands';
import { register as registerSearch } from './search';
import { register as registerTerminal } from './terminal';
import { register as registerNavigation } from './navigation';
import { register as registerCodeIntel } from './codeIntel';
import { register as registerExport } from './export';
import { register as registerInfo } from './info';
import { register as registerModes } from './modes';
import { register as registerDemo } from './demo';
import { register as registerClear } from './clear';
import { register as registerFileOps } from './fileOps';

let registered = false;

export function registerAllCommands(): void {
    if (registered) return;
    
    registerSearch(registry);
    registerTerminal(registry);
    registerNavigation(registry);
    registerCodeIntel(registry);
    registerExport(registry);
    registerInfo(registry);
    registerModes(registry);
    registerDemo(registry);
    registerClear(registry);
    registerFileOps(registry);
    
    registered = true;
}

export { registry };
