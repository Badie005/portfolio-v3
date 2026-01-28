import * as React from "react";
import { Command } from "cmdk";
import { Search, File, Terminal, Layout, User, Download, Github, Laptop } from "lucide-react";
import { FileSystemItem } from "../types";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: FileSystemItem[];
  onFileSelect: (filename: string) => void;
  actions: {
    toggleTerminal: () => void;
    toggleSidebar: () => void;
    toggleChat: () => void;
    downloadCV: () => void;
    scrollToContact: () => void;
  };
}

export function CommandPalette({
  open,
  onOpenChange,
  files,
  onFileSelect,
  actions
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  // Toggle with keyboard shortcut is handled in parent, 
  // but we need to handle closing with Esc inside the component via onOpenChange

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange, open]);

  // Flatten file tree for search
  const flatFiles = React.useMemo(() => {
    const getAllFiles = (items: FileSystemItem[]): string[] => {
      let result: string[] = [];
      for (const item of items) {
        if (item.type === 'folder' && item.children) {
          result = [...result, ...getAllFiles(item.children)];
        } else {
          result.push(item.name);
        }
      }
      return result;
    };
    return getAllFiles(files);
  }, [files]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.1 }}
            className="relative w-full max-w-xl overflow-hidden rounded-xl border border-ide-border bg-ide-bg shadow-2xl"
          >
            <Command
              label="Command Menu"
              className="w-full bg-transparent"
              shouldFilter={true}
              loop
            >
              <div className="flex items-center border-b border-ide-border px-4 py-3">
                <Search className="mr-2 h-4 w-4 shrink-0 text-ide-muted" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Type a command or search files..."
                  className="flex-1 bg-transparent text-sm text-ide-text placeholder:text-ide-muted outline-none"
                />
                <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-ide-border bg-surface-2 px-1.5 font-mono text-[10px] font-medium text-ide-muted opacity-100">
                  <span className="text-xs">ESC</span>
                </kbd>
              </div>

              <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-ide-border scrollbar-track-transparent">
                <Command.Empty className="py-6 text-center text-sm text-ide-muted">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Files" className="mb-2 px-2 text-[10px] font-medium text-ide-muted uppercase tracking-wider">
                  {flatFiles.map((file) => (
                    <Command.Item
                      key={file}
                      value={file}
                      onSelect={() => {
                        onFileSelect(file);
                        onOpenChange(false);
                        setSearch("");
                      }}
                      className="relative flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm text-ide-text aria-selected:bg-ide-accent/20 aria-selected:text-ide-accent outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors group"
                    >
                      <File className="mr-2 h-4 w-4 text-ide-muted group-aria-selected:text-ide-accent" />
                      <span>{file}</span>
                      {/* Simulate path hint */}
                      <span className="ml-auto text-xs text-ide-muted/50 group-aria-selected:text-ide-accent/50">src/</span>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Separator className="my-1 h-px bg-ide-border" />

                <Command.Group heading="Actions" className="mb-2 px-2 text-[10px] font-medium text-ide-muted uppercase tracking-wider">
                  <Command.Item
                    onSelect={() => {
                      actions.toggleTerminal();
                      onOpenChange(false);
                    }}
                    className="relative flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm text-ide-text aria-selected:bg-ide-accent/20 aria-selected:text-ide-accent outline-none transition-colors group"
                  >
                    <Terminal className="mr-2 h-4 w-4 text-ide-muted group-aria-selected:text-ide-accent" />
                    <span>Toggle Terminal</span>
                    <kbd className="ml-auto text-xs text-ide-muted/50 font-mono">Ctrl+J</kbd>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => {
                      actions.toggleSidebar();
                      onOpenChange(false);
                    }}
                    className="relative flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm text-ide-text aria-selected:bg-ide-accent/20 aria-selected:text-ide-accent outline-none transition-colors group"
                  >
                    <Layout className="mr-2 h-4 w-4 text-ide-muted group-aria-selected:text-ide-accent" />
                    <span>Toggle Sidebar</span>
                    <kbd className="ml-auto text-xs text-ide-muted/50 font-mono">Ctrl+B</kbd>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => {
                      actions.toggleChat();
                      onOpenChange(false);
                    }}
                    className="relative flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm text-ide-text aria-selected:bg-ide-accent/20 aria-selected:text-ide-accent outline-none transition-colors group"
                  >
                    <Laptop className="mr-2 h-4 w-4 text-ide-muted group-aria-selected:text-ide-accent" />
                    <span>Toggle AI Chat</span>
                    <kbd className="ml-auto text-xs text-ide-muted/50 font-mono">Ctrl+L</kbd>
                  </Command.Item>
                </Command.Group>

                <Command.Separator className="my-1 h-px bg-ide-border" />

                <Command.Group heading="General" className="px-2 text-[10px] font-medium text-ide-muted uppercase tracking-wider">
                  <Command.Item
                    onSelect={() => {
                      actions.scrollToContact();
                      onOpenChange(false);
                    }}
                    className="relative flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm text-ide-text aria-selected:bg-ide-accent/20 aria-selected:text-ide-accent outline-none transition-colors group"
                  >
                    <User className="mr-2 h-4 w-4 text-ide-muted group-aria-selected:text-ide-accent" />
                    <span>Contact Me</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => {
                      actions.downloadCV();
                      onOpenChange(false);
                    }}
                    className="relative flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm text-ide-text aria-selected:bg-ide-accent/20 aria-selected:text-ide-accent outline-none transition-colors group"
                  >
                    <Download className="mr-2 h-4 w-4 text-ide-muted group-aria-selected:text-ide-accent" />
                    <span>Download Resume</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => {
                      window.open('https://github.com/Badie005', '_blank');
                      onOpenChange(false);
                    }}
                    className="relative flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm text-ide-text aria-selected:bg-ide-accent/20 aria-selected:text-ide-accent outline-none transition-colors group"
                  >
                    <Github className="mr-2 h-4 w-4 text-ide-muted group-aria-selected:text-ide-accent" />
                    <span>View GitHub Profile</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              <div className="border-t border-ide-border px-4 py-2 text-[10px] text-ide-muted flex items-center justify-between">
                <span>
                  <span className="text-ide-accent">ProTip:</span> Use arrows to navigate, Enter to select
                </span>
                <span>B.DEV IDE v3.02</span>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
