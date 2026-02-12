# AGENTS.md - Portfolio B.DEV x B.411

Project: Interactive developer portfolio with VS Code simulation
Stack: Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, next-intl

---

## Build/Lint/Test Commands

```bash
# Development
npm run dev                    # Start dev server (localhost:3000)

# Build
npm run build                  # Production build
npm run start                  # Start production server

# Linting & Type Checking
npm run lint                   # ESLint check
npm run type-check             # TypeScript check (no emit)

# Testing - Vitest
npm run test                   # Run all unit tests
npm run test:watch             # Watch mode
npm run test:coverage          # Run with coverage

# Single test file
npx vitest run src/lib/__tests__/gemini.test.ts

# E2E Testing - Playwright
npm run test:e2e               # Run Playwright tests
npm run test:e2e:ui            # Playwright UI mode

# Analysis
npm run analyze                # Bundle analysis (ANALYZE=true)
npm run lighthouse             # Lighthouse CI
```

---

## Code Style Guidelines

### Imports Order

```typescript
// 1. React/Next imports
import { useState, useEffect } from 'react';
import Image from 'next/image';

// 2. Third-party libraries
import { Trash2, ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

// 3. Internal components/hooks
import { chatReducer, initialState } from './ChatReducer';
import { useThinkingTimer } from './hooks';

// 4. Types
import type { ChatMessage } from './types';
import { FileSystemItem, FileData } from '@/components/code-window/types';

// 5. Utils
import { sanitizeInput } from './utils';
```

### File Naming

- **Components**: PascalCase (`ChatPanel.tsx`, `ErrorBanner.tsx`)
- **Hooks**: camelCase with `use` prefix (`useThinkingTimer.ts`)
- **Utils**: camelCase (`sanitize.ts`, `rateLimiter.ts`)
- **Types**: PascalCase for interfaces/types
- **Constants**: UPPER_SNAKE_CASE (`STORAGE_KEY`, `MAX_MESSAGES`)

### TypeScript Rules

- **Strict mode enabled**: All code must pass `strict: true`
- **No unused locals/parameters**: Use `_` prefix if intentionally unused
  ```typescript
  const { data, loading: _loading } = useQuery();  // OK
  const unused = getData();  // ERROR
  ```
- **Prefer `interface` over `type`** for object shapes
- **Use `const` assertions** for readonly arrays/objects
- **Avoid `any`**: Use `unknown` and narrow with type guards

### React/Components

- **Functional components only** - no class components
- **Named exports for components**: `export default memo(Component);`
- **Memoize with `memo()`**: Export wrapped components
- **Use `useCallback`/`useMemo`** for expensive operations
- **Props interfaces**: Define above component
  ```typescript
  interface ChatPanelProps {
      contextFiles?: FileSystemItem[];
      onOpenFile: (filename: string) => void;
  }
  ```

### Error Handling

- **Always handle errors in async functions**:
  ```typescript
  try {
      const result = await fetchData();
  } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: { message } });
  }
  ```
- **Silent failures in non-critical paths**: Use empty catch blocks with comment
  ```typescript
  try {
      localStorage.setItem(key, value);
  } catch { /* Storage unavailable, gracefully degrade */ }
  ```
- **Error boundaries**: Use for component-level errors

### State Management

- **Local state**: `useState` for component-local state
- **Complex state**: `useReducer` for multi-value state
- **Lift state up**: When multiple components need same state
- **Avoid prop drilling**: Consider context for deep trees

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   └── [locale]/          # Internationalized pages
├── components/
│   ├── chat/              # B.AI Chat Agent (refactored)
│   │   ├── ChatPanel.tsx  # Main component (<300 lines)
│   │   ├── ChatReducer.ts # useReducer state
│   │   ├── commands/      # Slash commands (Command Pattern)
│   │   ├── components/    # UI sub-components
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utilities
│   ├── code-window/       # VS Code simulation
│   └── sections/          # Page sections
├── lib/                    # Core utilities
│   ├── gemini.ts          # AI service (OpenRouter/Gemini)
│   └── fileSearch.ts      # Virtual file system
├── hooks/                  # Global hooks
├── i18n/                   # Internationalization
├── config/                 # App configuration
└── types/                  # Global TypeScript types
```

---

## Architecture Patterns

### Command Pattern (Chat Commands)

```typescript
// commands/search.ts
export function register(reg: CommandRegistry): void {
    reg.register('/search', handleSearch);
    reg.registerPattern(/(?:cherche|search)\s+(.+)/i, handleSearch);
}
```

### Reducer Pattern (Complex State)

```typescript
// ChatReducer.ts
export function chatReducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case 'ADD_MESSAGE':
            return { ...state, messages: [...state.messages, action.payload] };
        default:
            return state;
    }
}
```

---

## Internationalization (next-intl)

- **All user-facing text** must use `useTranslations()`
- **No hardcoded strings** in components
- **Dictionary files**: `messages/en.json`, `messages/fr.json`

```typescript
const t = useTranslations('ide');
return <span>{t('chat.title')}</span>;
```

---

## Key Dependencies

- **next-intl**: i18n with App Router
- **framer-motion**: Animations (import as `motion`)
- **lucide-react**: Icons (tree-shakable)
- **tailwind-merge**: Conditional class merging (`cn()`)
- **zod**: Runtime validation

---

## Performance Guidelines

- **Dynamic imports**: Use `next/dynamic` for heavy components
- **Image optimization**: Always use `next/image`
- **Memoization**: Profile before adding `useMemo`/`useCallback`
- **Bundle size**: Run `npm run analyze` after major changes

---

## Security

- **Sanitize user input**: Always validate before use
- **No secrets in code**: Use environment variables
- **URL sanitization**: Validate external URLs before use
- **Rate limiting**: Implemented for AI endpoints
