export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  fullDescription: string;
  image: string;
  imageAlt: string;
  period: string;
  technologies: string[];
  results: {
    metric: string;
    value: string;
  }[];
  features: string[];
  githubUrl?: string;
  githubUrls?: { label: string; url: string }[];
  liveUrl?: string;
  // Champs optionnels pour projets enrichis (stages, etc.)
  context?: {
    structure: string;
    objective: string;
    role: string;
  };
  featureGroups?: {
    icon: string;
    title: string;
    items: string[];
  }[];
  learnings?: string[];
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Skill {
  name: string;
  level: number;
  category: string;
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
}
