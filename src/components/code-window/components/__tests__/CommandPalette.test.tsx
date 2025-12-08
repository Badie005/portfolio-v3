/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommandPalette } from '../CommandPalette';
import { FileSystemItem } from '../../types';

// Mock cmdk since it uses ResizeObserver and other browser APIs not fully supported in jsdom
// But cmdk is logic heavy, so a full mock might hide issues.
// Let's try to mock the parts that fail or just use it if possible.
// Often mocking `cmdk` structure is better for unit tests.
vi.mock('cmdk', () => {
    return {
        Command: Object.assign(
            ({ children, label }: any) => <div aria-label={label} data-testid="command-root">{children}</div>,
            {
                Input: ({ value, onValueChange, placeholder }: any) => (
                    <input
                        data-testid="command-input"
                        value={value}
                        onChange={e => onValueChange(e.target.value)}
                        placeholder={placeholder}
                    />
                ),
                List: ({ children }: any) => <div data-testid="command-list">{children}</div>,
                Empty: ({ children }: any) => <div data-testid="command-empty">{children}</div>,
                Group: ({ children, heading }: any) => (
                    <div data-testid="command-group" data-heading={heading}>
                        <div>{heading}</div>
                        {children}
                    </div>
                ),
                Item: ({ children, onSelect, value, className }: any) => (
                    <div
                        data-testid="command-item"
                        data-value={value}
                        onClick={onSelect}
                        className={className}
                    >
                        {children}
                    </div>
                ),
                Separator: () => <hr data-testid="command-separator" />,
            }
        )
    };
});

describe('CommandPalette Component', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnFileSelect = vi.fn();
    const mockActions = {
        toggleTerminal: vi.fn(),
        toggleSidebar: vi.fn(),
        toggleChat: vi.fn(),
        downloadCV: vi.fn(),
        scrollToContact: vi.fn(),
    };

    const mockFiles: FileSystemItem[] = [
        {
            name: 'src',
            type: 'folder',
            children: [
                { name: 'App.tsx', type: 'file', content: '' }
            ]
        },
        { name: 'README.md', type: 'file', content: '' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not render when open is false', () => {
        render(
            <CommandPalette
                open={false}
                onOpenChange={mockOnOpenChange}
                files={mockFiles}
                onFileSelect={mockOnFileSelect}
                actions={mockActions}
            />
        );
        expect(screen.queryByTestId('command-root')).not.toBeInTheDocument();
    });

    it('should render when open is true', () => {
        render(
            <CommandPalette
                open={true}
                onOpenChange={mockOnOpenChange}
                files={mockFiles}
                onFileSelect={mockOnFileSelect}
                actions={mockActions}
            />
        );
        expect(screen.getByTestId('command-root')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Type a command or search files...')).toBeInTheDocument();
    });

    it('should list files flattened', () => {
        render(
            <CommandPalette
                open={true}
                onOpenChange={mockOnOpenChange}
                files={mockFiles}
                onFileSelect={mockOnFileSelect}
                actions={mockActions}
            />
        );

        // Should see flattened files
        expect(screen.getByText('App.tsx')).toBeInTheDocument();
        expect(screen.getByText('README.md')).toBeInTheDocument();
    });

    it('should handle file selection', () => {
        render(
            <CommandPalette
                open={true}
                onOpenChange={mockOnOpenChange}
                files={mockFiles}
                onFileSelect={mockOnFileSelect}
                actions={mockActions}
            />
        );

        fireEvent.click(screen.getByText('README.md'));

        expect(mockOnFileSelect).toHaveBeenCalledWith('README.md');
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should handle action execution', () => {
        render(
            <CommandPalette
                open={true}
                onOpenChange={mockOnOpenChange}
                files={mockFiles}
                onFileSelect={mockOnFileSelect}
                actions={mockActions}
            />
        );

        fireEvent.click(screen.getByText('Toggle Terminal'));
        expect(mockActions.toggleTerminal).toHaveBeenCalled();
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);

        fireEvent.click(screen.getByText('Toggle Sidebar'));
        expect(mockActions.toggleSidebar).toHaveBeenCalled();

        fireEvent.click(screen.getByText('Toggle AI Chat'));
        expect(mockActions.toggleChat).toHaveBeenCalled();

        fireEvent.click(screen.getByText('Download Resume'));
        expect(mockActions.downloadCV).toHaveBeenCalled();

        fireEvent.click(screen.getByText('Contact Me'));
        expect(mockActions.scrollToContact).toHaveBeenCalled();
    });

    it('should close on backdrop click', () => {
        const { container } = render(
            <CommandPalette
                open={true}
                onOpenChange={mockOnOpenChange}
                files={mockFiles}
                onFileSelect={mockOnFileSelect}
                actions={mockActions}
            />
        );

        // The first child of AnimatePresence is the fixed container.
        // The first motion.div inside is the backdrop.
        // We can find it by class or just index.
        const backdrop = container.querySelector('.fixed > div:first-child');
        expect(backdrop).toBeInTheDocument();

        fireEvent.click(backdrop!);
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should open on Ctrl+K', () => {
        // Need to render with open=false to test opening?
        // Wait, the hook listens to global keydown.
        // But the component is only mounted when we render it.
        // If we render with open=false, AnimatePresence will hide children,
        // BUT the component itself must be mounted for useEffect to run?

        // CommandPalette renders: <AnimatePresence>{open && (...)}</AnimatePresence>
        // If open is false, the content inside {} is not rendered.
        // But CommandPalette component function IS executed if parent renders it.
        // Wait, looking at code:
        /*
        export function CommandPalette(...) {
           useEffect(...) -> Adds listener
           return <AnimatePresence>...
        }
        */
        // So yes, listener is added even if not visible.

        render(
            <CommandPalette
                open={false}
                onOpenChange={mockOnOpenChange}
                files={mockFiles}
                onFileSelect={mockOnFileSelect}
                actions={mockActions}
            />
        );

        fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
        expect(mockOnOpenChange).toHaveBeenCalledWith(true);
    });
});
