import React, { useState, useEffect } from 'react';
import { ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { FileSystemItem, FileData } from '../types';
import { FileIcon } from './FileIcon';

interface FileTreeProps {
    items: FileSystemItem[];
    level?: number;
    activeFileName: string | null;
    onFileClick: (file: FileData) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ items, level = 0, activeFileName, onFileClick }) => {
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        items.forEach(item => {
            if ('children' in item && item.isOpen) {
                initialState[item.name] = true;
            }
        });
        return initialState;
    });

    useEffect(() => {
         
        setOpenFolders(prev => {
            const next = { ...prev };
            const traverse = (nodes: FileSystemItem[]) => {
                nodes.forEach(node => {
                    if ('children' in node) {
                        if (node.isOpen) next[node.name] = true;
                        if (node.children) traverse(node.children as FileSystemItem[]);
                    }
                });
            };
            traverse(items);
            return next;
        });
    }, [items]);

    const toggleFolder = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenFolders(prev => ({ ...prev, [name]: !prev[name] }));
    };

    return (
        <div className="select-none">
            {items.map((item) => {
                const isFolder = 'children' in item;
                const isOpen = openFolders[item.name];
                const isActive = !isFolder && item.name === activeFileName;

                return (
                    <div key={item.name}>
                        <div
                            className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer transition-colors text-[13px] overflow-hidden ${isActive
                                ? 'bg-[#e8e8e8] text-gray-800 font-medium'
                                : 'text-gray-600 hover:bg-gray-200/50'
                                }`}
                            style={{ paddingLeft: `${level * 16 + 12}px` }}
                            onClick={(e) => {
                                if (isFolder) {
                                    toggleFolder(item.name, e);
                                } else {
                                    onFileClick(item as FileData);
                                }
                            }}
                        >
                            {isFolder && (
                                <span className="text-gray-400 transition-transform duration-200">
                                    <ChevronRight size={12} className={isOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
                                </span>
                            )}
                            {!isFolder && <span className="w-[12px]"></span>}

                            {isFolder ? (
                                isOpen ? (
                                    <FolderOpen size={14} className="text-ide-accent fill-ide-accent/20 flex-shrink-0" />
                                ) : (
                                    <Folder size={14} className="text-ide-accent fill-ide-accent/20 flex-shrink-0" />
                                )
                            ) : (
                                <span className="flex-shrink-0">
                                    <FileIcon name={item.name} type="file" />
                                </span>
                            )}
                            <span className="truncate min-w-0">{item.name}</span>
                        </div>

                        {isFolder && isOpen && item.children && (
                            <div className="overflow-hidden animate-in slide-in-from-top-1 fade-in duration-200">
                                <FileTree
                                    items={item.children as FileSystemItem[]}
                                    level={level + 1}
                                    activeFileName={activeFileName}
                                    onFileClick={onFileClick}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default FileTree;
