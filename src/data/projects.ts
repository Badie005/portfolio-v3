import { Project } from "@/types";

export const projects: Project[] = [
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
    image: "/projet-image/B.DEV × AYJI FR.svg",
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
