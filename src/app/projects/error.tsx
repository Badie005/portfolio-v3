'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { FolderX, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Projects Error]', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full text-center"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="mx-auto w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6"
                >
                    <FolderX className="w-10 h-10 text-amber-600" />
                </motion.div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                    Erreur de chargement des projets
                </h1>

                {/* Description */}
                <p className="text-neutral-600 mb-6">
                    Impossible de charger les données du projet. Vérifiez votre connexion
                    et réessayez.
                </p>

                {/* Error digest */}
                {error.digest && (
                    <p className="text-xs text-neutral-400 mb-6 font-mono">
                        Code: {error.digest}
                    </p>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Réessayer
                    </motion.button>

                    <Link
                        href="/projects"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 text-neutral-900 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Tous les projets
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
