import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMatches(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setMatches(e.matches); mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, [query]);

    return matches;
}

export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsSidebarBrowser = () => useMediaQuery('(min-width: 800px) and (max-width: 1279px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1279px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1280px)');

