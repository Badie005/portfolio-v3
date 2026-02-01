import { FileSystemItem } from './types';

export const INITIAL_FILES: FileSystemItem[] = [
  {
    name: '.config',
    type: 'folder',
    isOpen: true,
    children: [
      {
        name: 'B.DEV.json',
        type: 'json',
        content: `{
  "identity": {
    "name": "Abdelbadie Khoubiza",
    "alias": "B.DEV",
    "role": "Full Stack Developer",
    "status": "Open to Work",
    "version": "3.0.3"
  },
  "contact": {
    "email": "a.khoubiza.dev@gmail.com",
    "location": "Fes, Morocco",
    "timezone": "GMT+1",
    "response_time": "24h"
  },
  "core_stack": {
    "frontend": ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    "backend": ["Node.js", "Laravel", "Python"],
    "database": ["PostgreSQL", "MongoDB", "MySQL"],
    "devops": ["Docker", "GitHub Actions", "Vercel"]
  }
}`
      },
      {
        name: 'B.411.json',
        type: 'json',
        content: `{
  "identity": {
    "alias": "B.411",
    "role": "Creative Designer",
    "aesthetic": "Minimalist Modern"
  },
  "design_system": {
    "colors": {
      "primary": "#1A1A1A",
      "accent": "#D97757",
      "surface": "#FAFAFA"
    },
    "typography": {
      "heading": "Cormorant Garamond",
      "body": "Saans",
      "mono": "JetBrains Mono"
    }
  },
  "principles": [
    "Function drives form",
    "Whitespace is intentional",
    "Details matter"
  ]
}`
      }
    ]
  },
  {
    name: 'profile',
    type: 'folder',
    isOpen: false,
    children: [
      {
        name: 'about.md',
        type: 'markdown',
        content: `# About

## Abdelbadie Khoubiza
**Full Stack Developer** | Fes, Morocco

I build modern, high-performance web applications.
Clean code. Scalable architecture. Pixel-perfect interfaces.

### Key Metrics
| Metric | Value |
|--------|-------|
| Projects Delivered | 3 |
| Technologies Mastered | 10+ |
| Professional Experience | 2 internships |
| Response Time | 24h |

### Contact
a.khoubiza.dev@gmail.com`
      },
      {
        name: 'approach.md',
        type: 'markdown',
        content: `# Development Approach

\> "Ship fast. Ship quality. Ship often."

## Core Principles

### Performance First
Every millisecond counts. I optimize for speed, accessibility, and maintainability from day one.

### Clean Architecture
Modular, testable, scalable. Code that teams can maintain and extend.

### User-Centric Design
Interfaces that work. Experiences that convert. Details that matter.`
      }
    ]
  },
  {
    name: 'experience',
    type: 'folder',
    isOpen: true,
    children: [
      {
        name: 'experience_1.md',
        type: 'markdown',
        content: `# IT Infrastructure Internship

## Urban Agency of Taza
**Jan - Feb 2024** | Internship

### Scope
Complete infrastructure audit. PowerShell automation. Azure migration roadmap.

### Tech Stack
\`\`\`
PowerShell | Windows Server | Active Directory | Azure
\`\`\`

### Deliverables
- Full datacenter infrastructure audit
- Automated admin scripts (PowerShell)
- Cloud migration plan (Azure)
- Security recommendations report`
      },
      {
        name: 'experience_2.md',
        type: 'markdown',
        content: `# USMBA Student Portal

## Sidi Mohamed Ben Abdellah University
**Mar - Jun 2024** | Academic Project

### Scope
End-to-end student management system. Automated registration. Secure document generation.

### Tech Stack
\`\`\`
Laravel 12 | PHP 8.2 | MySQL 8 | Tailwind CSS
\`\`\`

### Results
| Metric | Value |
|--------|-------|
| Active Users | 500+ |
| Uptime | 99.8% |
| Modules Built | 12 |`
      },
      {
        name: 'experience_3.md',
        type: 'markdown',
        content: `# AYJI E-learning Platform

## Personal Project
**Sep - Dec 2023** | Full Stack Development

### Scope
Modern LMS from scratch. Real-time features. Interactive assessments.

### Tech Stack
\`\`\`
Angular 19 | Node.js | MongoDB | Socket.io | Redis
\`\`\`

### Results
| Metric | Value |
|--------|-------|
| Users Onboarded | 500+ |
| Video Courses | 50+ |
| User Satisfaction | 4.7/5 |`
      }
    ]
  },
  {
    name: 'stack',
    type: 'folder',
    isOpen: false,
    children: [
      {
        name: 'skills.json',
        type: 'json',
        content: `{
  "frontend": {
    "frameworks": ["Next.js", "React", "Angular", "Vue.js"],
    "styling": ["Tailwind CSS", "CSS3", "SCSS"],
    "languages": ["TypeScript", "JavaScript"]
  },
  "backend": {
    "frameworks": ["Node.js", "Express", "Laravel", "NestJS"],
    "databases": ["PostgreSQL", "MongoDB", "MySQL", "Redis"],
    "languages": ["Python", "PHP", "Java"]
  },
  "devops": {
    "containers": ["Docker", "Kubernetes"],
    "ci_cd": ["GitHub Actions", "Jenkins"],
    "cloud": ["AWS", "Vercel", "Railway"]
  }
}`
      },
      {
        name: 'tools.md',
        type: 'markdown',
        content: `# Daily Tools

## Development
- **IDE**: VS Code, WebStorm
- **Terminal**: Windows Terminal, PowerShell
- **Version Control**: Git, GitHub

## Design
- **UI/UX**: Figma
- **Prototyping**: Figma, Excalidraw

## Productivity
- **Documentation**: Notion, Obsidian
- **Communication**: Discord, Slack`
      }
    ]
  },
  {
    name: 'projects',
    type: 'folder',
    isOpen: false,
    children: [
      {
        name: 'project_ayji.md',
        type: 'markdown',
        content: `# AYJI E-learning

## Modern Learning Management System

A full-featured educational platform with real-time capabilities.

### Tech Stack
- Angular 19 + NgRx + RxJS
- Node.js + Express + MongoDB
- Socket.io + Redis + Docker

### Metrics
| Metric | Value |
|--------|-------|
| Users | 500+ |
| Courses | 50+ |
| Satisfaction | 4.7/5 |`
      },
      {
        name: 'project_usmba.md',
        type: 'markdown',
        content: `# USMBA Management Portal

## University Administration System

Streamlined academic workflows. Secure document generation. Admin dashboards.

### Tech Stack
- Laravel 12 + PHP 8.2 + Blade
- MySQL 8 + Tailwind CSS
- Sanctum + QR Code PDF

### Features
- Student registration automation
- Prerequisite validation engine
- Secure certificate generation
- Real-time admin dashboard`
      },
      {
        name: 'project_audit.md',
        type: 'markdown',
        content: `# Infrastructure Audit

## IT Consulting - Urban Agency

Comprehensive datacenter assessment and modernization roadmap.

### Deliverables
- 50+ page audit report
- Security vulnerability analysis
- 3-year modernization plan

### Scope
- Windows Server 2019
- Active Directory
- Network infrastructure
- Security policies`
      }
    ]
  },
  {
    name: 'contact',
    type: 'folder',
    isOpen: false,
    children: [
      {
        name: 'channels.md',
        type: 'markdown',
        content: `# Get In Touch

## Abdelbadie Khoubiza

### Contact Channels
| Channel | Link |
|---------|------|
| Email | a.khoubiza.dev@gmail.com |
| LinkedIn | /in/abdelbadie-khoubiza |
| GitHub | /Badie005 |

### Availability
Currently open for:
- Full-time positions (CDI)
- Freelance projects
- Technical collaborations

Response time: **Under 24 hours**`
      }
    ]
  },
  {
    name: 'README.md',
    type: 'markdown',
    content: `# B.DEV x B.411
### Abdelbadie Khoubiza - Portfolio

![Version](https://img.shields.io/badge/version-3.0.2-black)
![Status](https://img.shields.io/badge/status-available-success)

## About
Full Stack Developer building modern, scalable web applications.

## Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind v4
- **Backend**: Node.js, Laravel, PostgreSQL, Docker
- **Design**: Figma, UI/UX, Design Systems

## Featured Projects
- **AYJI E-learning** - LMS Platform (BTS Final Project)
- **USMBA Portal** - University Management System
- **Infrastructure Audit** - IT Consulting

## Contact
a.khoubiza.dev@gmail.com`
  },
  {
    name: 'package.json',
    type: 'json',
    content: `{
  "name": "portfolio-abdelbadie",
  "version": "3.0.3",
  "author": "Abdelbadie Khoubiza",
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "16.0.7",
    "react": "19.2.0",
    "tailwindcss": "4.0.0",
    "motion": "12.23.24",
    "typescript": "5.7.0"
  }
}`
  }
];
