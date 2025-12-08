/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { parseAnsi, ansi } from '../ansi';

describe('ansi lib', () => {
    it('should return null for empty input', () => {
        expect(parseAnsi('')).toBeNull();
    });

    it('should return raw string if no ANSI codes', () => {
        const input = 'Hello World';
        const result = parseAnsi(input);
        expect(result).toBe(input);
    });

    it('should parse simple colors', () => {
        const input = `${ansi.red}Red Text${ansi.reset}`;
        render(<div>{parseAnsi(input)}</div>);

        const span = screen.getByText('Red Text');
        expect(span).toHaveClass('text-red-500');
    });

    it('should parse bold text', () => {
        const input = `${ansi.bold}Bold Text${ansi.reset}`;
        render(<div>{parseAnsi(input)}</div>);

        const span = screen.getByText('Bold Text');
        expect(span).toHaveClass('font-bold');
    });

    it('should handle combined styles', () => {
        // \x1b[1;31m = Bold Red
        const input = '\x1b[1;31mBold Red\x1b[0m';
        render(<div>{parseAnsi(input)}</div>);

        const span = screen.getByText('Bold Red');
        expect(span).toHaveClass('font-bold');
        expect(span).toHaveClass('text-red-500');
    });

    it('should handle sequential colors (override)', () => {
        const input = `${ansi.red}Red ${ansi.blue}Blue${ansi.reset}`;
        render(<div>{parseAnsi(input)}</div>);

        const redSpan = screen.getByText('Red');
        const blueSpan = screen.getByText('Blue');

        expect(redSpan).toHaveClass('text-red-500');
        expect(blueSpan).toHaveClass('text-blue-500');
        expect(blueSpan).not.toHaveClass('text-red-500');
    });

    it('should handle multiple text segments', () => {
        const input = `Start ${ansi.green}Green${ansi.reset} End`;
        render(<div>{parseAnsi(input)}</div>);

        // Use custom matcher or textContent exact match since whitespace can be tricky
        // screen.getByText will look for "Start " and " End" but whitespace might be normalized in some views
        // However, here we render <span>Start </span>.

        // Let's use getByText with exact: false or regex
        expect(screen.getByText(/^Start/)).toBeInTheDocument();

        const green = screen.getByText('Green');
        expect(green).toHaveClass('text-emerald-500');

        expect(screen.getByText(/End$/)).toBeInTheDocument();
    });

    it('should handle unknown codes gracefully', () => {
        const input = '\x1b[999mUnknown\x1b[0m';
        render(<div>{parseAnsi(input)}</div>);

        const span = screen.getByText('Unknown');
        // Should have no special classes
        expect(span.className).toBe('');
    });

    it('should handle partial resets or weird sequences', () => {
         // Some terminals use \x1b[m for reset
         const input = '\x1b[31mRed\x1b[mPlain';
         render(<div>{parseAnsi(input)}</div>);

         expect(screen.getByText('Red')).toHaveClass('text-red-500');
         const plain = screen.getByText('Plain');
         expect(plain.className).toBe('');
    });
});
