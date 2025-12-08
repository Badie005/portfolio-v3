/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileTree from '../FileTree';
import { FileSystemItem } from '../../types';

describe('FileTree Component', () => {
    const mockFiles: FileSystemItem[] = [
        {
            name: 'src',
            type: 'folder',
            isOpen: true,
            children: [
                {
                    name: 'components',
                    type: 'folder',
                    children: [
                        {
                            name: 'Button.tsx',
                            type: 'file',
                            content: '...',
                            language: 'typescript'
                        }
                    ]
                },
                {
                    name: 'App.tsx',
                    type: 'file',
                    content: '...',
                    language: 'typescript'
                }
            ]
        },
        {
            name: 'README.md',
            type: 'file',
            content: '...',
            language: 'markdown'
        }
    ];

    const mockOnFileClick = vi.fn();

    it('should render file tree structure correctly', () => {
        render(
            <FileTree
                items={mockFiles}
                activeFileName="App.tsx"
                onFileClick={mockOnFileClick}
            />
        );

        expect(screen.getByText('src')).toBeInTheDocument();
        expect(screen.getByText('README.md')).toBeInTheDocument();
        expect(screen.getByText('App.tsx')).toBeInTheDocument();
    });

    it('should handle folder toggle', () => {
        render(
            <FileTree
                items={mockFiles}
                activeFileName={null}
                onFileClick={mockOnFileClick}
            />
        );

        const folder = screen.getByText('components');
        // It starts closed (default undefined isOpen means closed or controlled by state)
        // Wait, the mock data for 'components' has no isOpen, so it should be closed.

        // However, 'src' has isOpen: true.
        expect(screen.getByText('App.tsx')).toBeInTheDocument(); // Inside src

        // 'Button.tsx' is inside 'components', which is inside 'src'.
        // 'components' should be rendered but closed?
        expect(screen.getByText('components')).toBeInTheDocument();

        // Button.tsx should NOT be visible if components is closed
        expect(screen.queryByText('Button.tsx')).not.toBeInTheDocument();

        // Click to open components folder
        fireEvent.click(screen.getByText('components'));

        // Now Button.tsx should be visible
        expect(screen.getByText('Button.tsx')).toBeInTheDocument();
    });

    it('should handle file click', () => {
        render(
            <FileTree
                items={mockFiles}
                activeFileName={null}
                onFileClick={mockOnFileClick}
            />
        );

        const file = screen.getByText('README.md');
        fireEvent.click(file);

        expect(mockOnFileClick).toHaveBeenCalledWith(expect.objectContaining({
            name: 'README.md',
            type: 'file'
        }));
    });

    it('should highlight active file', () => {
        render(
            <FileTree
                items={mockFiles}
                activeFileName="README.md"
                onFileClick={mockOnFileClick}
            />
        );

        const fileElement = screen.getByText('README.md').closest('div');
        // We check for the highlighting class
        expect(fileElement?.className).toContain('bg-[#e8e8e8]');
    });
});
