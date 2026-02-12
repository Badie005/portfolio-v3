import { CommandRegistry } from '../ChatCommands';
import { CommandContext, generateId } from '../ChatContext';

const handleDemo = async (_args: string, ctx: CommandContext): Promise<boolean> => {
    const demoMsg = {
        id: generateId(),
        text: "I've created a demo component to showcase the syntax highlighting and UI elements. Here is the implementation:",
        thoughts: "Analyzing design requirements and generating demo assets...",
        thinkingTime: 1.8,
        actions: [
            { type: 'read' as const, filename: 'src/app/page.tsx', status: 'done' as const, timestamp: Date.now() },
            { type: 'create' as const, filename: 'components/Demo.tsx', status: 'done' as const, timestamp: Date.now() }
        ],
        codeChanges: [
            {
                filename: 'components/Demo.tsx',
                language: 'tsx',
                description: 'Demo Component',
                applied: false,
                linesAdded: 15,
                linesRemoved: 0,
                newCode: `import React from 'react';

interface DemoProps {
  title: string;
  isActive: boolean;
}

export const DemoComponent: React.FC<DemoProps> = ({ title, isActive }) => {
  // This is a comment to test colors
  const status = isActive ? 'Active' : 'Inactive';

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-gray-600">Status: {status}</p>
      <button onClick={() => console.log('Clicked!')}>
        Click Me
      </button>
    </div>
  );
};`
            }
        ],
    };

    ctx.dispatch({
        type: 'FINISH_RESPONSE',
        payload: demoMsg
    });
    return true;
};

export function register(reg: CommandRegistry): void {
    reg.register('/demo', handleDemo);
    reg.register('test', handleDemo);
}
