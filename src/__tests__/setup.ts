import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: { src: string; alt: string;[key: string]: unknown }) => {
    return React.createElement('img', { ...rest, src, alt });
  },
}));

// Mock Framer Motion
vi.mock('motion/react', () => ({
  motion: {
    div: (props: { children?: React.ReactNode;[key: string]: unknown }) =>
      React.createElement('div', props, props.children),
    section: (props: { children?: React.ReactNode;[key: string]: unknown }) =>
      React.createElement('section', props, props.children),
    h1: (props: { children?: React.ReactNode;[key: string]: unknown }) =>
      React.createElement('h1', props, props.children),
    h2: (props: { children?: React.ReactNode;[key: string]: unknown }) =>
      React.createElement('h2', props, props.children),
    p: (props: { children?: React.ReactNode;[key: string]: unknown }) =>
      React.createElement('p', props, props.children),
  },
  AnimatePresence: (props: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, props.children),
}));

// Mock window.matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  class MockIntersectionObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
  });

  // Mock ResizeObserver
  class MockResizeObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: MockResizeObserver,
  });
}
