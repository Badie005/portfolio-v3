import { Project } from "@/types";

export const projectsFr: Project[] = [
  {
    id: "usmba-portal",
    title: "Portail de Gestion Étudiant USMBA",
    category: "Application Web Full-Stack",
    description:
      "Application web complète et sécurisée pour l'Université Sidi Mohamed Ben Abdellah. Digitalisation de l'orientation académique et génération de documents officiels.",
    fullDescription:
      "Une plateforme intuitive qui modernise la gestion universitaire : administration des parcours académiques, inscriptions automatisées, validation des prérequis et génération de documents sécurisés par QR Code. Interface 'Glassmorphism' responsive respectant les normes WCAG.",
    image: "/projet-image/USMBA x B.DEV FR.svg",
    imageAlt: "Interface du portail de gestion étudiant USMBA",
    period: "Mars - Juin 2025",
    technologies: ["Laravel 12", "PHP 8.2+", "MySQL 8.0", "Tailwind CSS 3", "Alpine.js", "Blade", "Sanctum", "Vite"],
    results: [
      { metric: "Utilisateurs", value: "500+" },
      { metric: "Sécurité", value: "A+" },
      { metric: "Disponibilité", value: "99.8%" },
    ],
    features: [
      "Authentification sécurisée via email académique USMBA avec rate limiting",
      "Système de choix intelligent basé sur l'éligibilité et les prérequis",
      "Validation automatique des crédits et notes par semestre",
      "Génération PDF d'attestations et relevés sécurisés par QR Code",
      "Tableau de bord personnalisé (admin & étudiant) avec suivi temps réel",
      "Interface Glassmorphism responsive (mobile & desktop)",
      "Journalisation des actions sensibles (Spatie Activity Log)",
      "Protection CSRF, XSS, et sessions sécurisées",
    ],
    githubUrl: "https://github.com/Badie005/gestion-parcours-usmba",
    liveUrl: "https://gestion-parcours-usmba-production.up.railway.app/",
    // Contexte du projet
    context: {
      structure: "Projet de fin d'études - Université USMBA Taza",
      objective: "Moderniser et digitaliser la gestion des parcours académiques universitaires",
      role: "Développeur Full-Stack Laravel + Conception BDD",
    },
    // Compétences développées
    learnings: [
      "Modélisation BDD : Conception du schéma basé sur les données réelles USMBA Taza",
      "Architecture Laravel : Services, Repositories, Policies et Middleware",
      "Sécurité Web avancée : Sanctum, Rate Limiting, Protection CSRF/XSS",
      "Génération PDF dynamique : DomPDF avec QR Codes sécurisés",
      "UI/UX moderne : Glassmorphism, Tailwind CSS, composants Blade réutilisables",
    ],
  },
  {
    id: "ayji-elearning",
    title: "Plateforme E-learning AYJI",
    category: "Application Web Full-Stack",
    description:
      "Application web éducative (LMS) moderne conçue pour moderniser le suivi pédagogique avec une expérience utilisateur fluide et interactive.",
    fullDescription:
      "AYJI est une Single Page Application éducative offrant un espace étudiant complet (dashboard, catalogue de cours, quiz interactifs) et un back-office administrateur. Construite avec Angular 19 et NgRx pour une gestion d'état robuste, elle intègre Socket.io pour les notifications en temps réel.",
    image: "/projet-image/B.DEV%20%C3%97%20AYJI%20FR.svg",
    imageAlt: "Dashboard de la plateforme e-learning AYJI",
    period: "Sept - Déc 2025",
    technologies: ["Angular 19", "TypeScript", "NgRx", "RxJS", "Node.js", "MongoDB", "Mongoose", "Redis", "Socket.io", "PouchDB", "Cypress", "SCSS"],
    results: [
      { metric: "Modules", value: "5+" },
      { metric: "Composants", value: "40+" },
      { metric: "Lighthouse", value: "90+" },
    ],
    features: [
      "Tableau de bord étudiant avec progression et statistiques d'apprentissage",
      "Catalogue de cours avec navigation intuitive et filtrage avancé",
      "Lecteur PDF intégré et interface de cours optimisée",
      "Quiz interactifs (QCM) avec correction automatique et feedback immédiat",
      "Gestion d'état centralisée avec NgRx (Store, Effects, Entity)",
      "Notifications temps réel avec Socket.io-client",
      "Back-office complet pour la gestion des utilisateurs et contenus",
      "Interface responsive (Desktop, Tablette, Mobile) avec SCSS",
    ],
    githubUrls: [
      { label: "Frontend", url: "https://github.com/Badie005/ayji-frontend" },
      { label: "Backend", url: "https://github.com/Badie005/ayji-backend" },
    ],
    liveUrl: "",
    // Contexte du projet
    context: {
      structure: "Projet personnel - 3 mois de développement",
      objective: "Créer une alternative LMS moderne et accessible aux plateformes étrangères coûteuses",
      role: "Développeur Full-Stack + Conception BDD (Angular, Node.js, MongoDB)",
    },
    // Compétences développées
    learnings: [
      "Architecture Frontend avancée : Maîtrise de NgRx (Store, Effects, Entity)",
      "Base de données : MongoDB + Mongoose (backend), Redis (cache/sessions), PouchDB (offline)",
      "Programmation réactive : Utilisation poussée de RxJS pour l'asynchrone",
      "WebSockets & Temps réel : Intégration Socket.io pour les notifications",
      "Bonnes pratiques Angular : Lazy loading, guards, interceptors, modularité",
    ],
  },
  {
    id: "infrastructure-audit",
    title: "Stage Infrastructure IT - Agence Urbaine Taza",
    category: "Infrastructure & Support IT",
    description:
      "Stage de découverte de l'infrastructure informatique au sein d'un établissement public. Observation, maintenance et support technique.",
    fullDescription:
      "Stage de 15 jours à l'Agence Urbaine de Taza pour découvrir le fonctionnement d'une infrastructure IT professionnelle. Observation de l'audit serveurs/réseau, initiation à la virtualisation VMware, pratique du diagnostic réseau et support utilisateurs.",
    image: "/projet-image/AUT x B.DEV FR.svg",
    imageAlt: "Infrastructure IT et diagnostic réseau",
    period: "Juin 2024",
    technologies: ["Windows Server", "VMware vSphere", "RAID", "Active Directory", "TCP/IP", "Diagnostic Réseau"],
    results: [
      { metric: "Durée", value: "15 jours" },
      { metric: "Domaines explorés", value: "6" },
      { metric: "Technologies", value: "8+" },
    ],
    features: [],
    // Contexte du stage
    context: {
      structure: "Agence Urbaine de Taza (établissement public)",
      objective: "Découvrir le fonctionnement d'une infrastructure IT professionnelle",
      role: "Stagiaire Support IT & Observation Infrastructure",
    },
    // Fonctionnalités organisées par thème
    featureGroups: [
      {
        icon: "",
        title: "Infrastructure Serveurs",
        items: [
          "Observation d'audit serveurs (CPU, RAM, logs, sauvegardes)",
          "Découverte des configurations RAID (0, 1, 5, 10) et reconstruction",
        ],
      },
      {
        icon: "",
        title: "Réseau & Connectivité",
        items: [
          "Découverte topologie réseau (routeurs, switchs, points d'accès)",
          "Pratique diagnostic réseau (ping, traceroute, ipconfig, nslookup)",
        ],
      },
      {
        icon: "",
        title: "Virtualisation VMware",
        items: [
          "Création supervisée de machines virtuelles",
          "Observation gestion ressources et snapshots",
        ],
      },
      {
        icon: "",
        title: "Support & Maintenance",
        items: [
          "Support utilisateurs et maintenance matérielle/logicielle",
          "Installation et mise à jour de systèmes et logiciels",
          "Sensibilisation sécurité (pare-feu, gestion accès)",
        ],
      },
    ],
    // Ce que j'ai appris
    learnings: [
      "Vision globale d'un SI d'établissement public (serveurs, réseau, sécurité)",
      "Approche structurée pour évaluer l'état d'une infrastructure",
      "RAID, virtualisation, Active Directory dans un contexte réel",
      "Communication technique et gestion des priorités en support utilisateurs",
    ],
    liveUrl: "",
  },
];

export const projectsEn: Project[] = [
  {
    id: "usmba-portal",
    title: "USMBA Student Management Portal",
    category: "Full-Stack Web Application",
    description:
      "Complete and secure web application for Sidi Mohamed Ben Abdellah University. Digitization of academic orientation and generation of official documents.",
    fullDescription:
      "An intuitive platform that modernizes university management: administration of academic tracks, automated enrollments, prerequisite validation, and generation of QR-code secured documents. Responsive glassmorphism interface compliant with WCAG.",
    image: "/projet-image/USMBA x B.DEV ENG.svg",
    imageAlt: "USMBA student management portal interface",
    period: "March - June 2025",
    technologies: ["Laravel 12", "PHP 8.2+", "MySQL 8.0", "Tailwind CSS 3", "Alpine.js", "Blade", "Sanctum", "Vite"],
    results: [
      { metric: "Users", value: "500+" },
      { metric: "Security", value: "A+" },
      { metric: "Uptime", value: "99.8%" },
    ],
    features: [
      "Secure authentication via USMBA academic email with rate limiting",
      "Smart selection system based on eligibility and prerequisites",
      "Automatic validation of credits and semester grades",
      "PDF generation of certificates and transcripts secured by QR Code",
      "Personalized dashboard (admin & student) with real-time tracking",
      "Responsive glassmorphism interface (mobile & desktop)",
      "Logging of sensitive actions (Spatie Activity Log)",
      "CSRF/XSS protection and secure sessions",
    ],
    githubUrl: "https://github.com/Badie005/gestion-parcours-usmba",
    liveUrl: "https://gestion-parcours-usmba-production.up.railway.app/",
    context: {
      structure: "Capstone project - USMBA University, Taza",
      objective: "Modernize and digitize academic track management",
      role: "Laravel Full-Stack Developer + Database Design",
    },
    learnings: [
      "Database modeling: schema design based on real USMBA Taza data",
      "Laravel architecture: services, repositories, policies and middleware",
      "Advanced web security: Sanctum, rate limiting, CSRF/XSS protection",
      "Dynamic PDF generation: DomPDF with secure QR Codes",
      "Modern UI/UX: glassmorphism, Tailwind CSS, reusable Blade components",
    ],
  },
  {
    id: "ayji-elearning",
    title: "AYJI E-learning Platform",
    category: "Full-Stack Web Application",
    description:
      "Modern educational (LMS) web application designed to improve learning tracking with a smooth and interactive user experience.",
    fullDescription:
      "AYJI is an educational Single Page Application offering a complete student space (dashboard, course catalog, interactive quizzes) and an admin back office. Built with Angular 19 and NgRx for robust state management, it integrates Socket.io for real-time notifications.",
    image: "/projet-image/B.DEV%20%C3%97%20AYJI%20ENG.svg",
    imageAlt: "AYJI e-learning platform dashboard",
    period: "September - December 2025",
    technologies: ["Angular 19", "TypeScript", "NgRx", "RxJS", "Node.js", "MongoDB", "Mongoose", "Redis", "Socket.io", "PouchDB", "Cypress", "SCSS"],
    results: [
      { metric: "Modules", value: "5+" },
      { metric: "Components", value: "40+" },
      { metric: "Lighthouse", value: "90+" },
    ],
    features: [
      "Student dashboard with progress and learning statistics",
      "Course catalog with intuitive navigation and advanced filtering",
      "Embedded PDF reader and optimized course interface",
      "Interactive quizzes (MCQ) with automatic correction and instant feedback",
      "Centralized state management with NgRx (Store, Effects, Entity)",
      "Real-time notifications with Socket.io-client",
      "Full back office for managing users and content",
      "Responsive interface (Desktop, Tablet, Mobile) with SCSS",
    ],
    githubUrls: [
      { label: "Frontend", url: "https://github.com/Badie005/ayji-frontend" },
      { label: "Backend", url: "https://github.com/Badie005/ayji-backend" },
    ],
    liveUrl: "",
    context: {
      structure: "Personal project - 3 months of development",
      objective: "Build a modern and accessible LMS alternative to expensive foreign platforms",
      role: "Full-Stack Developer + Database Design (Angular, Node.js, MongoDB)",
    },
    learnings: [
      "Advanced frontend architecture: mastering NgRx (Store, Effects, Entity)",
      "Databases: MongoDB + Mongoose (backend), Redis (cache/sessions), PouchDB (offline)",
      "Reactive programming: extensive use of RxJS for async flows",
      "WebSockets & real-time: integrating Socket.io for notifications",
      "Angular best practices: lazy loading, guards, interceptors, modular design",
    ],
  },
  {
    id: "infrastructure-audit",
    title: "IT Infrastructure Internship - Urban Agency of Taza",
    category: "Infrastructure & IT Support",
    description:
      "Introductory internship discovering IT infrastructure within a public institution. Observation, maintenance and technical support.",
    fullDescription:
      "15-day internship at the Urban Agency of Taza to discover how a professional IT infrastructure operates. Observed server/network audits, got introduced to VMware virtualization, practiced network diagnostics and provided user support.",
    image: "/projet-image/AUT x B.DEV ENG.svg",
    imageAlt: "IT infrastructure and network diagnostics",
    period: "June 2024",
    technologies: ["Windows Server", "VMware vSphere", "RAID", "Active Directory", "TCP/IP", "Network Diagnostics"],
    results: [
      { metric: "Duration", value: "15 days" },
      { metric: "Areas explored", value: "6" },
      { metric: "Technologies", value: "8+" },
    ],
    features: [],
    context: {
      structure: "Urban Agency of Taza (public institution)",
      objective: "Understand the workings of a professional IT infrastructure",
      role: "IT Support Intern & Infrastructure Observation",
    },
    featureGroups: [
      {
        icon: "",
        title: "Server Infrastructure",
        items: [
          "Observed server audits (CPU, RAM, logs, backups)",
          "Discovered RAID configurations (0, 1, 5, 10) and rebuild",
        ],
      },
      {
        icon: "",
        title: "Network & Connectivity",
        items: [
          "Explored network topology (routers, switches, access points)",
          "Practiced network diagnostics (ping, traceroute, ipconfig, nslookup)",
        ],
      },
      {
        icon: "",
        title: "VMware Virtualization",
        items: [
          "Supervised creation of virtual machines",
          "Observed resource management and snapshots",
        ],
      },
      {
        icon: "",
        title: "Support & Maintenance",
        items: [
          "User support and hardware/software maintenance",
          "Installing and updating systems and software",
          "Security awareness (firewalls, access management)",
        ],
      },
    ],
    learnings: [
      "High-level view of a public institution IS (servers, network, security)",
      "Structured approach to assessing infrastructure health",
      "RAID, virtualization, Active Directory in a real context",
      "Technical communication and prioritization in user support",
    ],
    liveUrl: "",
  },
];

export function getProjects(locale: string): Project[] {
  return locale === "en" ? projectsEn : projectsFr;
}

export function getProjectById(id: string, locale: string): Project | undefined {
  return getProjects(locale).find((project) => project.id === id);
}

export const projects = projectsFr;
