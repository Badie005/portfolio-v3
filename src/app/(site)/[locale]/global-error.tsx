'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import frMessages from '../../../../messages/fr.json';
import enMessages from '../../../../messages/en.json';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const params = useParams<{ locale?: string }>();
    const localeParam = typeof params?.locale === 'string' ? params.locale : undefined;
    const locale = localeParam === 'fr' ? 'fr' : 'en';
    const messages = locale === 'en' ? enMessages : frMessages;

    const t = (key: string) => {
        const parts = key.split('.');
        let value: unknown = messages;
        for (const part of parts) {
            value = (value as Record<string, unknown>)?.[part];
        }
        return typeof value === 'string' ? value : key;
    };

    useEffect(() => {
        // Log critical error (this catches layout-level errors)
        if (process.env.NODE_ENV !== 'production') {
            console.error('[Global Error Boundary]', error);
        }
    }, [error]);

    return (
        <html lang={locale}>
            <body className="min-h-screen flex items-center justify-center bg-neutral-100">
                <div className="max-w-md w-full text-center p-8">
                    {/* Icon */}
                    <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                        {t('errors.globalTitle')}
                    </h1>

                    {/* Description */}
                    <p className="text-neutral-600 mb-6">
                        {t('errors.globalDescription')}
                    </p>

                    {/* Error digest */}
                    {error.digest && (
                        <p className="text-xs text-neutral-400 mb-6 font-mono">
                            {t('errors.code').replace('{code}', error.digest)}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            {t('errors.tryAgain')}
                        </button>

                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-200 text-neutral-900 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
                        >
                            {t('errors.reloadPage')}
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
