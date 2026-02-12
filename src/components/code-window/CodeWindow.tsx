import { useMemo, useCallback, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useDragControls, useMotionValue, animate, useMotionValueEvent } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

import { INITIAL_FILES } from './constants';
import { FileData, SearchOptions, SearchResult, TerminalCommandResult, IdePanel, DownloadOptions, downloadFile } from './types';
import { searchFiles, executeTerminalCommand } from '@/lib/fileSearch';
import { FileIcon } from './components/FileIcon';

// Hooks
import { useFileSystem } from './hooks/useFileSystem';
import { useFileSearch } from './hooks/useFileSearch';
import { useResizablePanel } from './hooks/useResizablePanel';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useIsMobile, useIsSidebarBrowser } from './hooks/useMediaQuery';
import { useToggle } from './hooks/useToggle';

// Components
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { TabBar } from './components/TabBar';
import { EditorPane } from './components/EditorPane';
import ChatPanel from '@/components/chat/ChatPanel';
import Terminal from './components/Terminal';
import StatusBar from './components/StatusBar';
import { CommandPalette } from './components/CommandPalette';

const LAYOUT_CONFIG = {
    leftSidebar: { minWidth: 120, maxWidth: 450, defaultWidth: 200 },
    rightSidebar: { minWidth: 200, maxWidth: 550, defaultWidth: 280 },
    terminal: { minHeight: 100, maxHeight: 400, defaultHeight: 200 },
} as const;

// Compact layout config for sidebar browsers
const COMPACT_LAYOUT_CONFIG = {
    leftSidebar: { minWidth: 100, maxWidth: 200, defaultWidth: 140 },
    rightSidebar: { minWidth: 0, maxWidth: 0, defaultWidth: 0 },
    terminal: { minHeight: 80, maxHeight: 250, defaultHeight: 120 },
} as const;

export function CodeWindow() {
    const t = useTranslations('ide');
    const isMobile = useIsMobile();
    const isSidebarBrowser = useIsSidebarBrowser();
    const isCompactView = isMobile || isSidebarBrowser;
    const dragControls = useDragControls();

    // Use compact config for sidebar browsers
    const layoutConfig = isCompactView ? COMPACT_LAYOUT_CONFIG : LAYOUT_CONFIG;

    // UI State
    const [isTerminalOpen, toggleTerminal, setTerminalOpen] = useToggle(true);
    const [isSidebarOpen, toggleSidebar, setSidebarOpen] = useToggle(true);

    // Auto-close sidebar on mobile to save space
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [isMobile, setSidebarOpen]);
    const [isChatOpen, toggleChat] = useToggle(true);
    const [isTerminalMaximized, toggleTerminalMaximize] = useToggle(false);
    const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);

    // File System
    const {
        openFiles,
        activeFile,
        currentFile,
        allFiles,
        fileTree,
        fileTreeVersion,
        openFile,
        closeFile,
        setActiveFile,
        updateFileContent,
        createFile,
        createFileWithPath,
        deleteFile,
        readFile,
        createFolder,
        deleteFolder,
        listDirectory,
    } = useFileSystem({
        initialFiles: INITIAL_FILES,
        initialOpenFiles: ['BAI_logo.svg'],
        initialActiveFile: 'BAI_logo.svg',
    });

    // Search - include fileTreeVersion to force update
    const { searchQuery, setSearchQuery, filteredFiles } = useFileSearch(fileTree);

    // Resizable Panels - use dynamic config
    const leftPanel = useResizablePanel({
        config: layoutConfig.leftSidebar,
        direction: 'left',
    });

    const rightPanel = useResizablePanel({
        config: layoutConfig.rightSidebar,
        direction: 'right',
    });

    // Handlers
    const handleFileClick = useCallback((file: FileData) => {
        openFile(file);
    }, [openFile]);

    const handleOpenFileByName = useCallback((filename: string): string | null => {
        return openFile(filename);
    }, [openFile]);

    const handleScrollToContact = useCallback(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

const handleDownloadCV = useCallback(() => {
        // Create a fake link to trigger download
        const link = document.createElement('a');
        link.href = '/CV.pdf';
        link.download = 'CV_Abdelbadie_Khoubiza.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    const handleSearchFiles = useCallback((query: string, options?: SearchOptions): SearchResult[] => {
        return searchFiles(allFiles, query, options);
    }, [allFiles]);

    const handleExecuteCommand = useCallback((command: string): TerminalCommandResult => {
        return executeTerminalCommand(command, { 
            files: allFiles, 
            onOpenFile: handleOpenFileByName 
        });
    }, [allFiles, handleOpenFileByName]);

    const handleFocusPanel = useCallback((panel: IdePanel) => {
        switch (panel) {
            case 'terminal':
                setTerminalOpen(true);
                break;
            case 'explorer':
                setSidebarOpen(true);
                break;
            case 'editor':
                break;
            case 'chat':
                break;
        }
    }, [setTerminalOpen, setSidebarOpen]);

    const handleCloseTab = useCallback((filePath: string) => {
        closeFile(filePath);
    }, [closeFile]);

    const handleDownload = useCallback((options: DownloadOptions): boolean => {
        return downloadFile(options);
    }, []);

    // Keyboard Shortcuts
    useKeyboardShortcuts([
        { key: 'j', ctrl: true, action: toggleTerminal, description: 'Toggle terminal' },
        { key: 'b', ctrl: true, action: toggleSidebar, description: 'Toggle sidebar' },
        { key: 'l', ctrl: true, action: toggleChat, description: 'Toggle AI chat' },
        { key: 'p', ctrl: true, action: () => setIsCmdPaletteOpen(true), description: 'Open Command Palette' },
    ]);

    // Derived State
    const tabs = useMemo(() =>
        openFiles.map(fileName => ({
            id: fileName,
            label: fileName,
            icon: <FileIcon name={fileName} type="file" />
        })),
        [openFiles]
    );

    const lineCount = currentFile?.content.split('\n').length || 0;

    // Position state for drag and reset
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // State to track if window moved for button visibility
    const [isMoved, setIsMoved] = useState(false);

    useMotionValueEvent(x, "change", (latest: number) => {
        setIsMoved(Math.abs(latest) > 1 || Math.abs(y.get()) > 1);
    });

    useMotionValueEvent(y, "change", (latest: number) => {
        setIsMoved(Math.abs(x.get()) > 1 || Math.abs(latest) > 1);
    });

    const handleResetPosition = useCallback(() => {
        animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
    }, [x, y]);

    return (
        <>
            <motion.div
                style={{ x, y }}
                drag={!isMobile}
                dragListener={false}
                dragControls={dragControls}
                dragMomentum={false}
                dragElastic={0}
                className="relative w-full h-full max-w-full bg-ide-bg rounded-xl shadow-2xl flex flex-col overflow-hidden border border-white/40 ring-1 ring-black/5"
            >
                {/* ... existing content ... */}

                {/* ===== COMMAND PALETTE ===== */}
                <CommandPalette
                    open={isCmdPaletteOpen}
                    onOpenChange={setIsCmdPaletteOpen}
                    files={fileTree}
                    onFileSelect={handleOpenFileByName}
                    actions={{
                        toggleTerminal,
                        toggleSidebar,
                        toggleChat,
                        downloadCV: handleDownloadCV,
                        scrollToContact: handleScrollToContact
                    }}
                />

                {/* ===== TITLE BAR (Drag Handle) ===== */}
                <div
                    onPointerDown={(e) => {
                        if (!isMobile) dragControls.start(e);
                    }}
                    className={`flex-none ${!isMobile ? 'cursor-grab active:cursor-grabbing' : ''}`}
                >
                    <TitleBar
                        title={t('titleBar.title')}
                        onToggleTerminal={toggleTerminal}
                        onToggleSidebar={toggleSidebar}
                        onToggleChat={toggleChat}
                        showMobileMenu={isMobile}
                    />
                </div>

                {/* ===== MAIN LAYOUT ===== */}
                <div className="flex-1 flex overflow-hidden min-h-0">

                    {/* ========== 1. FILE EXPLORER ========== */}
                    {isSidebarOpen && (
                        <>
                            <aside
                                className="h-full overflow-hidden shrink-0 grow-0 bg-ide-bg"
                                style={{
                                    width: isMobile ? '100%' : `${leftPanel.width}px`,
                                    minWidth: isMobile ? undefined : `${layoutConfig.leftSidebar.minWidth}px`,
                                    maxWidth: isMobile ? undefined : `${layoutConfig.leftSidebar.maxWidth}px`,
                                }}
                            >
                                <Sidebar
                                    key={`sidebar-${fileTreeVersion}`}
                                    title={t('sidebar.title')}
                                    files={filteredFiles}
                                    activeFileName={activeFile}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    onFileClick={handleFileClick}
                                    isOpen={isSidebarOpen}
                                    onClose={() => setSidebarOpen(false)}
                                    width={isMobile ? 280 : leftPanel.width}
                                    isMobile={isMobile}
                                />
                            </aside>

                            {/* Left Resize Handle */}
                            {!isMobile && (
                                <div
                                    className="w-1 h-full cursor-col-resize bg-ide-border hover:bg-ide-accent active:bg-ide-accent transition-colors shrink-0"
                                    onMouseDown={leftPanel.startResizing}
                                />
                            )}
                        </>
                    )}

                    {/* ========== 2 & 3. CENTER: EDITOR + TERMINAL ========== */}
                    <main className="flex-1 flex flex-col bg-white overflow-hidden min-w-0 min-h-0">

                        {/* Tab Bar */}
                        <TabBar
                            tabs={tabs}
                            activeTabId={activeFile}
                            onTabClick={setActiveFile}
                            onTabClose={closeFile}
                        />

                        {/* Editor + Terminal Container */}
                        <div className="flex-1 flex flex-col min-h-0">

                            {/* ===== 2. EDITOR ===== */}
                            <div
                                className={`min-h-0 transition-[flex] duration-200 ${isTerminalMaximized
                                    ? 'flex-none h-0 overflow-hidden'
                                    : 'flex-1'
                                    }`}
                            >
                                <EditorPane file={currentFile} />
                            </div>

                            {/* ===== 3. TERMINAL ===== */}
                            {isTerminalOpen && (
                                <Terminal
                                    isOpen={isTerminalOpen}
                                    onClose={() => setTerminalOpen(false)}
                                    onOpenFile={handleOpenFileByName}
                                    files={INITIAL_FILES}
                                    isMaximized={isTerminalMaximized}
                                    onToggleMaximize={toggleTerminalMaximize}
                                />
                            )}
                        </div>
                    </main>

                    {/* ========== 4. AI AGENT ========== */}
                    {isChatOpen && !isCompactView && (
                        <>
                            {/* Right Resize Handle */}
                            <div
                                className="w-1 h-full cursor-col-resize bg-ide-border hover:bg-ide-accent active:bg-ide-accent transition-colors shrink-0"
                                onMouseDown={rightPanel.startResizing}
                            />

                            <aside
                                className="h-full bg-ide-bg border-l border-ide-border flex flex-col shrink-0 grow-0 overflow-hidden"
                                style={{
                                    width: `${rightPanel.width}px`,
                                    minWidth: `${layoutConfig.rightSidebar.minWidth}px`,
                                    maxWidth: `${layoutConfig.rightSidebar.maxWidth}px`,
                                }}
                            >
<ChatPanel
                                    contextFiles={allFiles}
                                    onOpenFile={handleOpenFileByName}
                                    activeFile={currentFile}
                                    onUpdateFile={updateFileContent}
                                    onCreateFile={createFile}
                                    onCreateFileWithPath={createFileWithPath}
                                    onDeleteFile={deleteFile}
                                    onReadFile={readFile}
                                    onCreateFolder={createFolder}
                                    onDeleteFolder={deleteFolder}
                                    onListDirectory={listDirectory}
                                    onSearchFiles={handleSearchFiles}
                                    onExecuteCommand={handleExecuteCommand}
                                    onFocusPanel={handleFocusPanel}
                                    onCloseTab={handleCloseTab}
                                    onDownload={handleDownload}
                                />
                            </aside>
                        </>
                    )}
                </div>

                {/* ===== STATUS BAR ===== */}
                <StatusBar
                    language={currentFile?.type || t('general.plainText')}
                    lineCount={lineCount}
                />
            </motion.div>

            {/* Floating Reset Button - Simple White Refined Circle */}
            {!isMobile && isMoved && (
                <motion.button
                    onClick={handleResetPosition}
                    className="fixed bottom-8 right-8 z-[100] w-12 h-12 flex items-center justify-center bg-[#FAFAFA] rounded-full shadow-lg border border-black/5 text-gray-600 hover:text-black hover:scale-105 hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileTap={{ scale: 0.95 }}
                    title={t('statusBar.resetPosition') || "Center Window"}
                >
                    <RotateCcw size={18} strokeWidth={1.5} />
                </motion.button>
            )}
        </>
    );
}

export default CodeWindow;