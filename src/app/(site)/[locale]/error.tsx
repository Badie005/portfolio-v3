'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const tErrors = useTranslations('errors');
    const tNav = useTranslations('nav');

    useEffect(() => {
        // Log error to console (replace with Sentry in production)
        if (process.env.NODE_ENV !== 'production') {
            console.error('[Error Boundary]', error);
        }
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
                    className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6"
                >
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                </motion.div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                    {tErrors('title')}
                </h1>

                {/* Description */}
                <p className="text-neutral-600 mb-6">
                    {tErrors('description')}
                </p>

                {/* Error digest (for debugging) */}
                {error.digest && (
                    <p className="text-xs text-neutral-400 mb-6 font-mono">
                        {tErrors('code', { code: error.digest })}
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
                        {tErrors('tryAgain')}
                    </motion.button>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 text-neutral-900 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        {tNav('home')}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
