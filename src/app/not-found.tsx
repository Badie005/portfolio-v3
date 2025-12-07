import Link from "next/link";
import { Home, ArrowRight, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32 bg-surface-1">
      <div className="max-w-2xl mx-auto text-center">
        {/* Terminal Style Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-2 border border-ide-border mb-8">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="font-mono text-xs text-ide-muted tracking-wide">
            ~/error/404
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-8xl lg:text-9xl font-bold text-brand mb-4 font-heading">
            404
          </h1>
          <h2 className="text-2xl lg:text-3xl font-medium text-brand mb-4 font-heading">
            Page introuvable
          </h2>
          <p className="text-ide-muted text-lg max-w-md mx-auto">
            Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button asChild size="lg">
            <Link href="/">
              <Home size={18} className="mr-2" />
              Retour à l&apos;accueil
            </Link>
          </Button>
          <Button asChild variant="glass" size="lg">
            <Link href="/projects">
              <FolderOpen size={18} className="mr-2" />
              Voir les projets
            </Link>
          </Button>
        </div>

        <div className="mt-16 pt-8 border-t border-ide-border">
          <p className="text-sm text-ide-muted mb-4">
            Vous cherchez quelque chose de spécifique ?
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
            <Link
              href="/#about"
              className="text-ide-muted hover:text-ide-accent transition-colors flex items-center gap-1"
            >
              À propos
              <ArrowRight size={12} />
            </Link>
            <Link
              href="/projects"
              className="text-ide-muted hover:text-ide-accent transition-colors flex items-center gap-1"
            >
              Projets
              <ArrowRight size={12} />
            </Link>
            <Link
              href="/#skills"
              className="text-ide-muted hover:text-ide-accent transition-colors flex items-center gap-1"
            >
              Compétences
              <ArrowRight size={12} />
            </Link>
            <Link
              href="/#contact"
              className="text-ide-muted hover:text-ide-accent transition-colors flex items-center gap-1"
            >
              Contact
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
