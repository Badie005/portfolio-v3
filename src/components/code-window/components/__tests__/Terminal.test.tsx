/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Terminal from '../Terminal';
import { useTerminal } from '../../hooks/useTerminal';
import { useConsoleCapture } from '../../hooks/useConsoleCapture';

// Mock child components that we don't need to test deeply here
// Path must be relative to THIS test file: ../SnakeGame refers to src/components/code-window/components/SnakeGame
vi.mock('../SnakeGame', () => ({
    SnakeGame: () => <div data-testid="snake-game">Snake Game</div>
}));

// Mock custom hooks
vi.mock('../../hooks/useTerminal');
vi.mock('../../hooks/useConsoleCapture');

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Terminal Component', () => {
    const mockOnClose = vi.fn();
    const mockOnOpenFile = vi.fn();
    const mockExecuteCommand = vi.fn();
    const mockNavigateHistory = vi.fn();
    const mockGetCommandSuggestions = vi.fn();
    const mockGetFileSuggestions = vi.fn();

    const defaultTerminalReturn = {
        history: [{ type: 'output', content: 'Welcome to Terminal' }],
        executeCommand: mockExecuteCommand,
        navigateHistory: mockNavigateHistory,
        getCommandSuggestions: mockGetCommandSuggestions,
        getFileSuggestions: mockGetFileSuggestions,
        getPrompt: () => ({ path: '~', user: 'guest' }),
        currentPath: '~',
        setHistory: vi.fn(),
    };

    const defaultConsoleReturn = {
        messages: [],
        clearMessages: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks for suggestions
        mockGetCommandSuggestions.mockReturnValue([]);
        mockGetFileSuggestions.mockReturnValue([]);
        mockNavigateHistory.mockReturnValue('');

        (useTerminal as any).mockReturnValue(defaultTerminalReturn);
        (useConsoleCapture as any).mockReturnValue(defaultConsoleReturn);
    });

    it('should not render when closed', () => {
        const { container } = render(
            <Terminal
                isOpen={false}
                onClose={mockOnClose}
                onOpenFile={mockOnOpenFile}
                files={[]}
            />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('should render correct tabs', () => {
        render(
            <Terminal
                isOpen={true}
                onClose={mockOnClose}
                onOpenFile={mockOnOpenFile}
                files={[]}
            />
        );

        expect(screen.getByText('TERMINAL')).toBeInTheDocument();
        expect(screen.getByText('CONSOLE')).toBeInTheDocument();
        expect(screen.getByText('OUTPUT')).toBeInTheDocument();
        expect(screen.getByText('PROBLEMS')).toBeInTheDocument();
        expect(screen.getByText('DEBUG')).toBeInTheDocument();
    });

    it('should handle command execution', () => {
        render(
            <Terminal
                isOpen={true}
                onClose={mockOnClose}
                onOpenFile={mockOnOpenFile}
                files={[]}
            />
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'help' } });
        fireEvent.submit(input.closest('form')!);

        expect(mockExecuteCommand).toHaveBeenCalledWith('help');
        expect(input).toHaveValue('');
    });

    it('should handle special commands like snake', () => {
        render(
            <Terminal
                isOpen={true}
                onClose={mockOnClose}
                onOpenFile={mockOnOpenFile}
                files={[]}
            />
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'snake' } });
        fireEvent.submit(input.closest('form')!);

        expect(screen.getByTestId('snake-game')).toBeInTheDocument();
        // Should not call executeCommand for built-in UI commands handled in component
        expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    it('should switch tabs', () => {
        render(
            <Terminal
                isOpen={true}
                onClose={mockOnClose}
                onOpenFile={mockOnOpenFile}
                files={[]}
            />
        );

        // Click on Console tab
        fireEvent.click(screen.getByText('CONSOLE'));

        // Should show console filter buttons
        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText('Errors (0)')).toBeInTheDocument();
    });

    it('should handle history navigation', () => {
        mockNavigateHistory.mockReturnValueOnce('previous-command');

        render(
            <Terminal
                isOpen={true}
                onClose={mockOnClose}
                onOpenFile={mockOnOpenFile}
                files={[]}
            />
        );

        const input = screen.getByRole('textbox');
        fireEvent.keyDown(input, { key: 'ArrowUp' });

        expect(mockNavigateHistory).toHaveBeenCalledWith('up');
        expect(input).toHaveValue('previous-command');
    });

    it('should handle maximizing', () => {
        const mockOnToggleMaximize = vi.fn();
        render(
            <Terminal
                isOpen={true}
                onClose={mockOnClose}
                onOpenFile={mockOnOpenFile}
                files={[]}
                isMaximized={false}
                onToggleMaximize={mockOnToggleMaximize}
            />
        );

        // Find maximize button (title="Maximize")
        const maxBtn = screen.getByTitle('Maximize');
        fireEvent.click(maxBtn);

        expect(mockOnToggleMaximize).toHaveBeenCalled();
    });
});
