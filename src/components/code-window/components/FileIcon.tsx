import {
  FileText,
  FileCode,
  Image as ImageIcon,
  Lock,
  Settings,
  Braces,
  Hash,
  Palette,
  File,
  GitBranch,
  Terminal,
  Database
} from 'lucide-react';

interface FileIconProps {
  name: string;
  type: 'file' | 'folder';
  className?: string;
  size?: number;
}

// 🎨 Configuration des icônes par extension
const FILE_ICONS: Record<string, {
  icon: React.ReactNode;
  color: string;
  bgColor?: string;
}> = {
  // React / JSX
  tsx: {
    icon: <span className="font-bold text-[9px]">TS</span>,
    color: 'text-[#3178C6]',
    bgColor: 'bg-[#3178C6]/10'
  },
  jsx: {
    icon: <span className="font-bold text-[9px]">JS</span>,
    color: 'text-[#61DAFB]',
    bgColor: 'bg-[#61DAFB]/10'
  },

  // TypeScript / JavaScript
  ts: {
    icon: <span className="font-bold text-[9px]">TS</span>,
    color: 'text-[#3178C6]',
    bgColor: 'bg-[#3178C6]/10'
  },
  js: {
    icon: <span className="font-bold text-[9px]">JS</span>,
    color: 'text-[#F7DF1E]',
    bgColor: 'bg-[#F7DF1E]/10'
  },
  mjs: {
    icon: <span className="font-bold text-[9px]">MJ</span>,
    color: 'text-[#F7DF1E]',
    bgColor: 'bg-[#F7DF1E]/10'
  },

  // Styles
  css: {
    icon: <Hash size={12} strokeWidth={2.5} />,
    color: 'text-[#264DE4]',
    bgColor: 'bg-[#264DE4]/10'
  },
  scss: {
    icon: <Hash size={12} strokeWidth={2.5} />,
    color: 'text-[#CC6699]',
    bgColor: 'bg-[#CC6699]/10'
  },
  sass: {
    icon: <Hash size={12} strokeWidth={2.5} />,
    color: 'text-[#CC6699]',
    bgColor: 'bg-[#CC6699]/10'
  },
  less: {
    icon: <Hash size={12} strokeWidth={2.5} />,
    color: 'text-[#1D365D]',
    bgColor: 'bg-[#1D365D]/10'
  },
  tailwind: {
    icon: <Palette size={12} />,
    color: 'text-[#06B6D4]',
    bgColor: 'bg-[#06B6D4]/10'
  },

  // Data / Config
  json: {
    icon: <Braces size={12} strokeWidth={2.5} />,
    color: 'text-[#F7DF1E]',
    bgColor: 'bg-[#F7DF1E]/10'
  },
  yaml: {
    icon: <FileCode size={12} />,
    color: 'text-[#CB171E]',
    bgColor: 'bg-[#CB171E]/10'
  },
  yml: {
    icon: <FileCode size={12} />,
    color: 'text-[#CB171E]',
    bgColor: 'bg-[#CB171E]/10'
  },
  toml: {
    icon: <Settings size={12} />,
    color: 'text-[#9C4121]',
    bgColor: 'bg-[#9C4121]/10'
  },
  env: {
    icon: <Settings size={12} />,
    color: 'text-[#ECD53F]',
    bgColor: 'bg-[#ECD53F]/10'
  },

  // Documentation
  md: {
    icon: <span className="font-bold text-[9px]">M↓</span>,
    color: 'text-[#083FA1]',
    bgColor: 'bg-[#083FA1]/10'
  },
  mdx: {
    icon: <span className="font-bold text-[9px]">MDX</span>,
    color: 'text-[#FCB32C]',
    bgColor: 'bg-[#FCB32C]/10'
  },
  txt: {
    icon: <FileText size={12} />,
    color: 'text-[#78716C]',
  },

  // Images
  png: {
    icon: <ImageIcon size={12} />,
    color: 'text-[#8B5CF6]',
    bgColor: 'bg-[#8B5CF6]/10'
  },
  jpg: {
    icon: <ImageIcon size={12} />,
    color: 'text-[#8B5CF6]',
    bgColor: 'bg-[#8B5CF6]/10'
  },
  jpeg: {
    icon: <ImageIcon size={12} />,
    color: 'text-[#8B5CF6]',
    bgColor: 'bg-[#8B5CF6]/10'
  },
  gif: {
    icon: <ImageIcon size={12} />,
    color: 'text-[#8B5CF6]',
    bgColor: 'bg-[#8B5CF6]/10'
  },
  webp: {
    icon: <ImageIcon size={12} />,
    color: 'text-[#8B5CF6]',
    bgColor: 'bg-[#8B5CF6]/10'
  },
  svg: {
    icon: <ImageIcon size={12} />,
    color: 'text-[#FFB13B]',
    bgColor: 'bg-[#FFB13B]/10'
  },
  ico: {
    icon: <ImageIcon size={12} />,
    color: 'text-[#CB171E]',
    bgColor: 'bg-[#CB171E]/10'
  },

  // Package / Lock files
  lock: {
    icon: <Lock size={12} />,
    color: 'text-[#78716C]',
  },

  // Git
  gitignore: {
    icon: <GitBranch size={12} />,
    color: 'text-[#F05032]',
    bgColor: 'bg-[#F05032]/10'
  },

  // Shell / Scripts
  sh: {
    icon: <Terminal size={12} />,
    color: 'text-[#4EAA25]',
    bgColor: 'bg-[#4EAA25]/10'
  },
  bash: {
    icon: <Terminal size={12} />,
    color: 'text-[#4EAA25]',
    bgColor: 'bg-[#4EAA25]/10'
  },
  zsh: {
    icon: <Terminal size={12} />,
    color: 'text-[#4EAA25]',
    bgColor: 'bg-[#4EAA25]/10'
  },

  // Database
  sql: {
    icon: <Database size={12} />,
    color: 'text-[#336791]',
    bgColor: 'bg-[#336791]/10'
  },
  prisma: {
    icon: <Database size={12} />,
    color: 'text-[#2D3748]',
    bgColor: 'bg-[#2D3748]/10'
  },

  // HTML
  html: {
    icon: <span className="font-bold text-[9px]">&lt;/&gt;</span>,
    color: 'text-[#E34F26]',
    bgColor: 'bg-[#E34F26]/10'
  },

  // Python
  py: {
    icon: <span className="font-bold text-[9px]">Py</span>,
    color: 'text-[#3776AB]',
    bgColor: 'bg-[#3776AB]/10'
  },

  // Go
  go: {
    icon: <span className="font-bold text-[9px]">Go</span>,
    color: 'text-[#00ADD8]',
    bgColor: 'bg-[#00ADD8]/10'
  },

  // Rust
  rs: {
    icon: <span className="font-bold text-[9px]">Rs</span>,
    color: 'text-[#CE422B]',
    bgColor: 'bg-[#CE422B]/10'
  },
};

// 🎯 Noms de fichiers spéciaux
const SPECIAL_FILES: Record<string, {
  icon: React.ReactNode;
  color: string;
  bgColor?: string;
}> = {
  'package.json': {
    icon: <Braces size={12} strokeWidth={2.5} />,
    color: 'text-[#4EAA25]',
    bgColor: 'bg-[#4EAA25]/10'
  },
  'tsconfig.json': {
    icon: <Settings size={12} />,
    color: 'text-[#3178C6]',
    bgColor: 'bg-[#3178C6]/10'
  },
  'next.config.js': {
    icon: <span className="font-bold text-[8px]">N</span>,
    color: 'text-[#000000] dark:text-[#FFFFFF]',
    bgColor: 'bg-[#000000]/10 dark:bg-[#FFFFFF]/10'
  },
  'next.config.mjs': {
    icon: <span className="font-bold text-[8px]">N</span>,
    color: 'text-[#000000] dark:text-[#FFFFFF]',
    bgColor: 'bg-[#000000]/10 dark:bg-[#FFFFFF]/10'
  },
  'tailwind.config.js': {
    icon: <Palette size={12} />,
    color: 'text-[#06B6D4]',
    bgColor: 'bg-[#06B6D4]/10'
  },
  'tailwind.config.ts': {
    icon: <Palette size={12} />,
    color: 'text-[#06B6D4]',
    bgColor: 'bg-[#06B6D4]/10'
  },
  '.gitignore': {
    icon: <GitBranch size={12} />,
    color: 'text-[#F05032]',
    bgColor: 'bg-[#F05032]/10'
  },
  '.env': {
    icon: <Settings size={12} />,
    color: 'text-[#ECD53F]',
    bgColor: 'bg-[#ECD53F]/10'
  },
  '.env.local': {
    icon: <Settings size={12} />,
    color: 'text-[#ECD53F]',
    bgColor: 'bg-[#ECD53F]/10'
  },
  'README.md': {
    icon: <span className="font-bold text-[9px]">M↓</span>,
    color: 'text-[#083FA1]',
    bgColor: 'bg-[#083FA1]/10'
  },
  'LICENSE': {
    icon: <FileText size={12} />,
    color: 'text-[#D4A418]',
    bgColor: 'bg-[#D4A418]/10'
  },
  'Dockerfile': {
    icon: <span className="font-bold text-[9px]">🐳</span>,
    color: 'text-[#2496ED]',
    bgColor: 'bg-[#2496ED]/10'
  },
};

export function FileIcon({ name, type, className }: FileIconProps) {
  // Ne pas afficher d'icône pour les dossiers (géré ailleurs)
  if (type === 'folder') return null;

  // Vérifier d'abord les fichiers spéciaux
  const specialFile = SPECIAL_FILES[name] || SPECIAL_FILES[name.toLowerCase()];
  if (specialFile) {
    return (
      <div
        className={`
          w-4 h-4 flex items-center justify-center rounded-sm
          ${specialFile.color} 
          ${specialFile.bgColor || ''} 
          ${className}
        `}
      >
        {specialFile.icon}
      </div>
    );
  }

  // Extraire l'extension
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const fileConfig = FILE_ICONS[ext];

  if (fileConfig) {
    return (
      <div
        className={`
          w-4 h-4 flex items-center justify-center rounded-sm
          ${fileConfig.color} 
          ${fileConfig.bgColor || ''} 
          ${className}
        `}
      >
        {fileConfig.icon}
      </div>
    );
  }

  // Icône par défaut
  return (
    <div className={`w-4 h-4 flex items-center justify-center ${className}`}>
      <File size={12} className="text-ide-muted" />
    </div>
  );
}

// 🎁 Bonus: Hook pour obtenir la config d'une icône
export function useFileIconConfig(name: string) {
  const specialFile = SPECIAL_FILES[name] || SPECIAL_FILES[name.toLowerCase()];
  if (specialFile) return specialFile;

  const ext = name.split('.').pop()?.toLowerCase() || '';
  return FILE_ICONS[ext] || null;
}