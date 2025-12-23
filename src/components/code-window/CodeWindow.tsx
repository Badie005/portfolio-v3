import { useMemo, useCallback, useState, useEffect } from 'react';
import { INITIAL_FILES } from './constants';
import { FileData } from './types';
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
import ChatPanel from './components/ChatPanel';
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
    const isMobile = useIsMobile();
    const isSidebarBrowser = useIsSidebarBrowser();
    const isCompactView = isMobile || isSidebarBrowser;

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
        initialOpenFiles: ['README.md', 'B.DEV.json'],
        initialActiveFile: 'README.md',
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

    return (
        <div className="relative w-full h-full max-w-full bg-ide-bg rounded-xl shadow-2xl flex flex-col overflow-hidden border border-white/40 ring-1 ring-black/5">

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

            {/* ===== TITLE BAR ===== */}
            <TitleBar
                title="B.DEV — Portfolio"
                onToggleTerminal={toggleTerminal}
                onToggleSidebar={toggleSidebar}
                onToggleChat={toggleChat}
                showMobileMenu={isMobile}
            />

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
                                title="Portfolio-v.3.02"
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
                            />
                        </aside>
                    </>
                )}
            </div>

            {/* ===== STATUS BAR ===== */}
            <StatusBar
                language={currentFile?.type || 'Plain Text'}
                lineCount={lineCount}
            />
        </div>
    );
}

export default CodeWindow;