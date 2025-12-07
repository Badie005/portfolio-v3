'use client';

import { useState, useEffect, ReactNode } from 'react';
import { LoadingScreen } from './LoadingScreen';

interface ClientLayoutProps {
    children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    const handleLoadComplete = () => {
        setIsLoading(false);
    };

    // Éviter le flash côté serveur
    if (!isMounted) {
        return (
            <div className="opacity-0">
                {children}
            </div>
        );
    }

    return (
        <>
            {isLoading && (
                <LoadingScreen
                    onLoadComplete={handleLoadComplete}
                    minDisplayTime={4000}
                />
            )}
            <div
                className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'
                    }`}
            >
                {children}
            </div>
        </>
    );
}

export default ClientLayout;
