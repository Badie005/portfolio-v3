import { useState, useMemo, useCallback } from 'react';
import { FileSystemItem } from '../types';

// Helper function defined outside the hook to avoid circular dependency/initialization issues
const filterFileSystemRecursive = (
    items: FileSystemItem[],
    query: string
): FileSystemItem[] => {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase();

    return items
        .map((item): FileSystemItem | null => {
            if ('children' in item && item.children) {
                const filteredChildren = filterFileSystemRecursive(item.children as FileSystemItem[], query);
                const nameMatches = item.name.toLowerCase().includes(lowerQuery);

                if (nameMatches || filteredChildren.length > 0) {
                    return {
                        ...item,
                        isOpen: true,
                        children: filteredChildren.length > 0 ? filteredChildren : item.children,
                    };
                }
                return null;
            }

            return item.name.toLowerCase().includes(lowerQuery) ? item : null;
        })
        .filter((item): item is FileSystemItem => item !== null);
};

export function useFileSearch(files: FileSystemItem[]) {
    const [searchQuery, setSearchQuery] = useState('');

    const filterFileSystem = useCallback((
        items: FileSystemItem[],
        query: string
    ): FileSystemItem[] => {
        return filterFileSystemRecursive(items, query);
    }, []);

    const filteredFiles = useMemo(
        () => filterFileSystem(files, searchQuery),
        [files, searchQuery, filterFileSystem]
    );

    const clearSearch = useCallback(() => setSearchQuery(''), []);

    return {
        searchQuery,
        setSearchQuery,
        filteredFiles,
        clearSearch,
        hasResults: filteredFiles.length > 0,
    };
}
