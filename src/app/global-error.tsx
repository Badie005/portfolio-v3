'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log critical error (this catches layout-level errors)
        console.error('[Global Error Boundary]', error);
    }, [error]);

    return (
        <html lang="fr">
            <body className="min-h-screen flex items-center justify-center bg-neutral-100">
                <div className="max-w-md w-full text-center p-8">
                    {/* Icon */}
                    <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                        Erreur critique
                    </h1>

                    {/* Description */}
                    <p className="text-neutral-600 mb-6">
                        Une erreur inattendue s&apos;est produite. Veuillez réessayer ou
                        recharger la page.
                    </p>

                    {/* Error digest */}
                    {error.digest && (
                        <p className="text-xs text-neutral-400 mb-6 font-mono">
                            Code: {error.digest}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Réessayer
                        </button>

                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-200 text-neutral-900 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
                        >
                            Recharger la page
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
