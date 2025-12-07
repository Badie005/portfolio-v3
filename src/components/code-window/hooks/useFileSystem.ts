import { useState, useCallback, useMemo, useEffect } from 'react';
import { FileData, FileSystemItem, FileType, FolderData } from '../types';

interface UseFileSystemOptions {
    initialFiles: FileSystemItem[];
    initialOpenFiles?: string[];
    initialActiveFile?: string;
}

export function useFileSystem({
    initialFiles,
    initialOpenFiles = [],
    initialActiveFile = ''
}: UseFileSystemOptions) {
    const [openFiles, setOpenFiles] = useState<string[]>(initialOpenFiles);
    const [activeFile, setActiveFile] = useState<string>(initialActiveFile);
    const [fileModifications, setFileModifications] = useState<Record<string, string>>({});

    // IMPORTANT: Declare these BEFORE useMemo that depends on them
    const [deletedFiles, setDeletedFiles] = useState<string[]>([]);
    const [createdFiles, setCreatedFiles] = useState<FileData[]>([]);
    // State for created folders
    const [createdFolders, setCreatedFolders] = useState<string[]>([]);

    // Version counter to force re-renders
    const [fileTreeVersion, setFileTreeVersion] = useState(0);

    // Get file type from extension
    const getFileType = (filename: string): FileType => {
        const ext = filename.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'json': return 'json';
            case 'md': return 'markdown';
            case 'lock': return 'lock';
            case 'ts':
            case 'tsx': return 'typescript';
            case 'js':
            case 'jsx': return 'javascript';
            case 'css': return 'css';
            case 'xml': return 'xml';
            default: return 'markdown';
        }
    };

    // Flatten file tree for searching (excludes deleted, includes created)
    const allFiles = useMemo(() => {
        const files: FileData[] = [];
        const collect = (items: FileSystemItem[]) => {
            items.forEach(item => {
                if ((item as FolderData).type === 'folder') {
                    const folder = item as FolderData;
                    if (folder.children) {
                        collect(folder.children);
                    }
                } else {
                    const file = item as FileData;
                    // Skip deleted files
                    if (deletedFiles.includes(file.name)) return;

                    const modifiedContent = fileModifications[file.name];
                    if (modifiedContent !== undefined) {
                        files.push({ ...file, content: modifiedContent });
                    } else {
                        files.push(file);
                    }
                }
            });
        };
        collect(initialFiles);

        // Add created files WITH modifications applied (excluding deleted ones)
        createdFiles.forEach(file => {
            // Skip if this created file was later deleted
            if (deletedFiles.includes(file.name)) return;

            const modifiedContent = fileModifications[file.name];
            if (modifiedContent !== undefined) {
                files.push({ ...file, content: modifiedContent });
            } else {
                files.push(file);
            }
        });

        return files;
    }, [initialFiles, fileModifications, deletedFiles, createdFiles]);

    // Get file tree with changes applied (for Sidebar)
    const fileTree = useMemo((): FileSystemItem[] => {
        // Create a Set for O(1) lookup of deleted files
        const deletedSet = new Set(deletedFiles);

        // Helper to deep clone and filter the tree
        const filterAndCloneTree = (items: FileSystemItem[]): FileSystemItem[] => {
            const result: FileSystemItem[] = [];

            for (const item of items) {
                // Check if this item is deleted
                if (deletedSet.has(item.name)) {
                    continue; // Skip deleted files/folders
                }

                if ((item as FolderData).type === 'folder') {
                    // It's a folder - recursively filter children
                    const folderItem = item as FolderData;
                    const children = folderItem.children ? filterAndCloneTree(folderItem.children) : [];
                    result.push({
                        ...folderItem,
                        children
                    });
                } else {
                    // It's a file - apply modifications if any
                    const fileItem = item as FileData;
                    const modifiedContent = fileModifications[fileItem.name];
                    if (modifiedContent !== undefined) {
                        result.push({ ...fileItem, content: modifiedContent });
                    } else {
                        result.push(fileItem);
                    }
                }
            }

            return result;
        };

        // 1. Start with the filtered initial tree
        const root = filterAndCloneTree(initialFiles);

        // Helper to find or create a folder node in the tree
        const findOrCreateFolder = (tree: FileSystemItem[], pathParts: string[], currentPath: string): FileSystemItem[] => {
            if (pathParts.length === 0) return tree;

            const folderName = pathParts[0];
            const fullFolderPath = currentPath ? `${currentPath}/${folderName}` : folderName;

            // Check if folder exists in current level
            let folder = tree.find(item =>
                (item as FolderData).type === 'folder' && item.name === fullFolderPath
            ) as FolderData | undefined;

            if (!folder) {
                // Create new folder node
                folder = {
                    name: folderName,
                    type: 'folder',
                    isOpen: true, // Auto-open created folders
                    children: []
                };
                tree.push(folder);
            }

            // Ensure folder is open
            folder.isOpen = true;

            // If we have more parts, recurse into children
            if (pathParts.length > 1) {
                // Ensure children array exists
                if (!folder.children) folder.children = [];

                // Recurse
                findOrCreateFolder(
                    folder.children as FileSystemItem[],
                    pathParts.slice(1),
                    fullFolderPath
                );
            }

            return tree;
        };

        // 2. Add explicitly created folders
        // Sort by length to ensure parents are created before children
        const sortedFolders = [...createdFolders].sort((a, b) => a.length - b.length);

        for (const folderPath of sortedFolders) {
            if (deletedSet.has(folderPath)) continue;

            const parts = folderPath.split('/');
            // We need to insert this into the root
            // Note: findOrCreateFolder modifies the tree in-place
            findOrCreateFolder(root, parts, '');
        }

        // 3. Add created files
        for (const file of createdFiles) {
            if (deletedSet.has(file.name)) continue;

            const modifiedContent = fileModifications[file.name];
            const fileToAdd = modifiedContent !== undefined
                ? { ...file, content: modifiedContent }
                : file;

            const parts = file.name.split('/');
            parts.pop(); // Remove filename

            if (parts.length === 0) {
                // Root level file
                root.push(fileToAdd);
            } else {
                // Nested file - find parent folder
                // We use the same helper, but we need to find the *parent* folder's children array

                // Helper to find the target children array
                const findTargetChildren = (nodes: FileSystemItem[], folderParts: string[], currentPath: string): FileSystemItem[] => {
                    if (folderParts.length === 0) return nodes;

                    const folderName = folderParts[0];
                    const fullFolderPath = currentPath ? `${currentPath}/${folderName}` : folderName;

                    let folder = nodes.find(item => (item as FolderData).type === 'folder' && item.name === fullFolderPath) as FolderData | undefined;

                    if (!folder) {
                        // Should have been created by createdFolders or implicit creation, 
                        // but let's create it just in case
                        folder = {
                            name: folderName,
                            type: 'folder',
                            isOpen: true,
                            children: []
                        };
                        nodes.push(folder);
                    }

                    // Ensure folder is open
                    folder.isOpen = true;

                    if (!folder.children) folder.children = [];

                    return findTargetChildren(
                        folder.children as FileSystemItem[],
                        folderParts.slice(1),
                        fullFolderPath
                    );
                };

                const targetChildren = findTargetChildren(root, parts, '');

                // Check if file already exists (e.g. from initialFiles) to avoid duplicates
                const existingIdx = targetChildren.findIndex(f => f.name === file.name);
                if (existingIdx >= 0) {
                    targetChildren[existingIdx] = fileToAdd;
                } else {
                    targetChildren.push(fileToAdd);
                }
            }
        }

        return root;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialFiles, deletedFiles, createdFiles, createdFolders, fileModifications, fileTreeVersion]);

    const getFileByName = useCallback((filename: string): FileData | null => {
        let found = allFiles.find(f => f.name === filename);
        if (found) return found;
        found = allFiles.find(f => f.name.toLowerCase() === filename.toLowerCase());
        return found || null;
    }, [allFiles]);

    const openFile = useCallback((file: FileData | string) => {
        const fileData = typeof file === 'string' ? getFileByName(file) : file;
        if (!fileData) return null;

        setOpenFiles(prev =>
            prev.includes(fileData.name) ? prev : [...prev, fileData.name]
        );
        setActiveFile(fileData.name);
        return fileData.name;
    }, [getFileByName]);

    const closeFile = useCallback((fileName: string) => {
        setOpenFiles(prev => {
            const newFiles = prev.filter(f => f !== fileName);
            if (activeFile === fileName && newFiles.length > 0) {
                setActiveFile(newFiles[newFiles.length - 1]);
            } else if (newFiles.length === 0) {
                setActiveFile('');
            }
            return newFiles;
        });
    }, [activeFile]);

    const closeAllFiles = useCallback(() => {
        setOpenFiles([]);
        setActiveFile('');
    }, []);

    const closeOtherFiles = useCallback((keepFileName: string) => {
        setOpenFiles([keepFileName]);
        setActiveFile(keepFileName);
    }, []);

    const currentFile = useMemo(() =>
        getFileByName(activeFile),
        [activeFile, getFileByName]
    );

    // Auto-select another file when active file is deleted or empty
    useEffect(() => {
        if (activeFile === '' && openFiles.length > 0) {
            setActiveFile(openFiles[openFiles.length - 1]);
        }
    }, [activeFile, openFiles]);

    const updateFileContent = useCallback((filename: string, newContent: string) => {
        setFileModifications(prev => ({ ...prev, [filename]: newContent }));
    }, []);

    const resetFile = useCallback((filename: string) => {
        setFileModifications(prev => {
            const newMods = { ...prev };
            delete newMods[filename];
            return newMods;
        });
    }, []);

    const isFileModified = useCallback((filename: string) => {
        return fileModifications[filename] !== undefined;
    }, [fileModifications]);

    const createFile = useCallback((filename: string, content: string = '') => {
        const newFile: FileData = {
            name: filename,
            type: getFileType(filename),
            content,
            isOpen: true
        };

        // Remove from deletedFiles if it was there
        setDeletedFiles(prev => prev.filter(f => f !== filename));

        // Add to createdFiles (replace if exists)
        setCreatedFiles(prev => {
            const filtered = prev.filter(f => f.name !== filename);
            return [...filtered, newFile];
        });

        // Open the file
        setOpenFiles(prev => prev.includes(filename) ? prev : [...prev, filename]);
        setActiveFile(filename);

        // Force re-render of file tree
        setFileTreeVersion(v => v + 1);

        return newFile;
    }, []);

    const deleteFile = useCallback((filename: string) => {
        // ALWAYS add to deletedFiles for consistent filtering
        setDeletedFiles(prev => {
            if (prev.includes(filename)) return prev;
            return [...prev, filename];
        });

        // Also remove from createdFiles
        setCreatedFiles(prev => prev.filter(f => f.name !== filename));

        // Remove from open files and get remaining files
        setOpenFiles(prev => {
            const newFiles = prev.filter(f => f !== filename);
            // If deleted file was active, select another
            if (activeFile === filename && newFiles.length > 0) {
                setActiveFile(newFiles[newFiles.length - 1]);
            } else if (activeFile === filename) {
                setActiveFile('');
            }
            return newFiles;
        });

        // Clear any modifications for this file
        setFileModifications(prev => {
            if (filename in prev) {
                const newMods = { ...prev };
                delete newMods[filename];
                return newMods;
            }
            return prev;
        });

        // Force re-render of file tree
        setFileTreeVersion(v => v + 1);

        return true;
    }, [activeFile]);

    const fileExists = useCallback((filename: string) => {
        if (deletedFiles.includes(filename)) return false;
        if (createdFiles.some(f => f.name === filename)) return true;
        return allFiles.some(f => f.name === filename);
    }, [allFiles, createdFiles, deletedFiles]);

    const readFile = useCallback((filename: string): string | null => {
        const file = getFileByName(filename);
        if (file) return file.content;
        return null;
    }, [getFileByName]);

    // Create a folder (supports nested paths like "src/components")
    const createFolder = useCallback((folderPath: string) => {
        const normalizedPath = folderPath.replace(/\\/g, '/').replace(/\/+$/, '');
        if (!normalizedPath) return false;

        setCreatedFolders(prev => {
            if (prev.includes(normalizedPath)) return prev;
            return [...prev, normalizedPath];
        });

        setFileTreeVersion(v => v + 1);
        return true;
    }, []);

    // Create file with path support (e.g., "src/components/Button.tsx")
    const createFileWithPath = useCallback((filePath: string, content: string = '') => {
        const normalizedPath = filePath.replace(/\\/g, '/');
        const parts = normalizedPath.split('/');
        const filename = parts.pop() || '';

        // Create parent folders if path has directories
        if (parts.length > 0) {
            let currentPath = '';
            parts.forEach(part => {
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                createFolder(currentPath);
            });
        }

        // Create the file with full path as name
        const newFile: FileData = {
            name: normalizedPath,
            type: getFileType(filename),
            content,
            isOpen: true
        };

        setDeletedFiles(prev => prev.filter(f => f !== normalizedPath));
        setCreatedFiles(prev => {
            const filtered = prev.filter(f => f.name !== normalizedPath);
            return [...filtered, newFile];
        });

        setOpenFiles(prev => prev.includes(normalizedPath) ? prev : [...prev, normalizedPath]);
        setActiveFile(normalizedPath);
        setFileTreeVersion(v => v + 1);

        return newFile;
    }, [createFolder]);

    // Delete a folder and all its contents
    const deleteFolder = useCallback((folderPath: string) => {
        const normalizedPath = folderPath.replace(/\\/g, '/').replace(/\/+$/, '');

        // Remove folder from created folders
        setCreatedFolders(prev => prev.filter(f => !f.startsWith(normalizedPath)));

        // Delete all files in this folder
        setCreatedFiles(prev => prev.filter(f => !f.name.startsWith(normalizedPath + '/')));

        // Add folder files to deleted
        const filesToDelete = allFiles
            .filter(f => f.name.startsWith(normalizedPath + '/'))
            .map(f => f.name);

        setDeletedFiles(prev => [...new Set([...prev, ...filesToDelete])]);

        // Close any open files from this folder
        setOpenFiles(prev => prev.filter(f => !f.startsWith(normalizedPath + '/')));

        setFileTreeVersion(v => v + 1);
        return true;
    }, [allFiles]);

    // List files in a directory
    const listDirectory = useCallback((dirPath: string = ''): string[] => {
        const normalizedPath = dirPath.replace(/\\/g, '/').replace(/\/+$/, '');
        const prefix = normalizedPath ? normalizedPath + '/' : '';

        const items = new Set<string>();

        // Add files
        allFiles.forEach(file => {
            if (normalizedPath === '') {
                // Root level - get first part of path or filename
                const firstPart = file.name.split('/')[0];
                items.add(firstPart);
            } else if (file.name.startsWith(prefix)) {
                const remaining = file.name.slice(prefix.length);
                const firstPart = remaining.split('/')[0];
                items.add(firstPart);
            }
        });

        // Add created folders
        createdFolders.forEach(folder => {
            if (normalizedPath === '') {
                const firstPart = folder.split('/')[0];
                items.add(firstPart + '/');
            } else if (folder.startsWith(prefix)) {
                const remaining = folder.slice(prefix.length);
                const firstPart = remaining.split('/')[0];
                if (firstPart) items.add(firstPart + '/');
            }
        });

        return Array.from(items).sort();
    }, [allFiles, createdFolders]);

    return {
        openFiles,
        activeFile,
        currentFile,
        allFiles,
        fileTree,
        fileTreeVersion,
        openFile,
        closeFile,
        closeAllFiles,
        closeOtherFiles,
        setActiveFile,
        getFileByName,
        updateFileContent,
        resetFile,
        isFileModified,
        createFile,
        createFileWithPath,
        deleteFile,
        fileExists,
        readFile,
        deletedFiles,
        createdFiles,
        // New folder functions
        createFolder,
        deleteFolder,
        createdFolders,
        listDirectory,
    };
}
