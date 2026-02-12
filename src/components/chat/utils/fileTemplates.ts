export function getFileTemplate(filename: string, ext: string): string {
    const templates: Record<string, string> = {
        'ts': `// ${filename}\n\nexport {};\n`,
        'tsx': `// ${filename}\n\nimport React from 'react';\n\nconst Component = () => {\n  return <div></div>;\n};\n\nexport default Component;\n`,
        'js': `// ${filename}\n\n`,
        'jsx': `// ${filename}\n\nimport React from 'react';\n\nconst Component = () => {\n  return <div></div>;\n};\n\nexport default Component;\n`,
        'json': `{\n  "name": "${filename.replace('.json', '')}"\n}\n`,
        'md': `# ${filename.replace('.md', '')}\n\n`,
        'css': `/* ${filename} */\n\n`,
        'html': `<!DOCTYPE html>\n<html lang="fr">\n<head>\n  <meta charset="UTF-8">\n  <title>${filename}</title>\n</head>\n<body>\n  \n</body>\n</html>\n`,
        'py': `# ${filename}\n\n`,
        'lock': `{\n  "signature": "B.DEV x B.411",\n  "version": "1.0"\n}\n`,
    };
    return templates[ext] || `// ${filename}\n`;
}
