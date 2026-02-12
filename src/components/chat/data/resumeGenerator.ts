import { FileData } from '@/components/code-window/types';

export function generateResume(files: FileData[]): string {
    const aboutFile = files.find(f => f.name.includes('about') || f.name.includes('bio'));
    const projectsFile = files.find(f => f.name.includes('projects'));
    
    let bio = 'Full Stack Developer & Designer spécialisé React, Next.js, Node.js et Laravel.';
    let projects: Array<{ title: string; description: string; stack: string }> = [];
    
    if (aboutFile?.content) {
        const lines = aboutFile.content.split('\n').filter(l => !l.startsWith('#') && l.trim());
        if (lines.length > 0) {
            bio = lines[0];
        }
    }

    if (projectsFile?.content) {
        try {
            const parsed = JSON.parse(projectsFile.content);
            if (Array.isArray(parsed)) {
                projects = parsed.slice(0, 4).map((p: { title?: string; description?: string; stack?: string }) => ({
                    title: p.title || 'Project',
                    description: p.description || '',
                    stack: p.stack || '',
                }));
            }
        } catch {
            // Keep default projects
        }
    }

    if (projects.length === 0) {
        projects = [
            { title: 'Portfolio IDE (2025)', description: 'Interactive developer portfolio with VS Code simulation.', stack: 'Next.js 16, TypeScript, Tailwind CSS v4, OpenRouter AI' },
            { title: 'USMBA Portal (2025)', description: 'Academic management system for Université Sidi Mohamed Ben Abdellah.', stack: 'Laravel 12, MySQL, Alpine.js, Tailwind CSS' },
            { title: 'AYJI E-learning (2025)', description: 'Learning Management System with real-time features.', stack: 'Angular 19, NgRx, Node.js, MongoDB, Redis, Socket.io' },
            { title: 'IT Infrastructure Audit (2024)', description: 'Professional internship — Network audit, VMware virtualization.', stack: 'VMware, Network Security, RAID Configuration' },
        ];
    }

    return `# Abdelbadie Khoubiza

## Full Stack Developer & Designer

**Location:** Morocco  
**Email:** a.khoubiza.dev@gmail.com  
**GitHub:** github.com/abdelbadie  
**LinkedIn:** linkedin.com/in/abdelbadie

---

## Profile

${bio}

---

## Technical Skills

| Category | Technologies |
|----------|--------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Node.js, Laravel 12, Python |
| Database | MongoDB, MySQL, Redis |
| DevOps | Docker, Vercel, VMware |
| Design | Figma, Glassmorphism, Responsive UI |

---

## Projects

${projects.map(p => `### ${p.title}
${p.description}  
**Stack:** ${p.stack}`).join('\n\n')}

---

## Availability

Open to freelance, full-time, and collaboration opportunities.
`;
}
