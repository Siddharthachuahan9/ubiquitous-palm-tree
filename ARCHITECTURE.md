# json0.dev Architecture Documentation

**Version:** 1.0
**Last Updated:** January 2026
**Website:** https://json0.dev

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Libraries & Dependencies](#libraries--dependencies)
4. [Project Structure](#project-structure)
5. [Core Concepts](#core-concepts)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [Routing System](#routing-system)
9. [Tool Implementation](#tool-implementation)
10. [Design System](#design-system)
11. [Performance Optimizations](#performance-optimizations)
12. [Build & Deployment](#build--deployment)

---

## Overview

**json0** is a privacy-first, client-side JSON tools application built with modern web technologies. All processing happens in the browser with zero server-side data handling.

### Core Principles

- **Privacy First**: No data sent to servers
- **100% Client-Side**: All operations run in the browser
- **Zero Hassle**: Simple, fast, intuitive UX
- **Offline Capable**: Works offline after first load (except Ping/IP tools)
- **Shareable**: URL-based state sharing via hash fragments

---

## Tech Stack

### Framework & Runtime
- **Next.js 14** (App Router) - React framework with SSG
- **React 18** - UI library
- **TypeScript** - Type safety

### Build Tools
- **Turbopack** - Fast bundler (via Next.js)
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking

### Deployment
- **Vercel** - Hosting platform with edge network
- **Static Site Generation (SSG)** - Pre-rendered pages

---

## Libraries & Dependencies

### Core Dependencies

#### **next** (^14.2.35)
- Purpose: React framework with App Router, SSG, and routing
- Why: Provides excellent DX, performance, and SEO capabilities
- Used for: App structure, routing, static generation

#### **react** (^18.3.1) & **react-dom**
- Purpose: UI library for building component-based interfaces
- Why: Industry standard, excellent ecosystem
- Used for: All UI components and rendering

#### **zustand** (^4.5.5)
- Purpose: Lightweight state management
- Why: Simple API, no boilerplate, great TypeScript support
- Used for: Global state (tool data, results, UI state)

#### **@monaco-editor/react** (^4.6.0)
- Purpose: Monaco editor integration (VS Code's editor)
- Why: Best-in-class code editor with JSON support
- Used for: JSON input/output editors in tools

#### **jsonpath-plus** (^7.2.0)
- Purpose: JSONPath query execution
- Why: Spec-compliant, feature-rich JSONPath implementation
- Used for: JSONPath tool query execution

#### **json-diff-kit** (^5.4.1)
- Purpose: JSON comparison and diff generation
- Why: Accurate diffs, supports patch format, tree visualization
- Used for: JSON Diff tool

#### **lz-string** (^1.5.0)
- Purpose: String compression for URL encoding
- Why: Excellent compression ratio, URI-safe encoding
- Used for: Share button URL state encoding

### Utility Libraries

#### **date-fns** (^3.0.0)
- Purpose: Date/time utilities
- Why: Modern, tree-shakeable, immutable
- Used for: Timestamp formatting in JWT decoder

### Development Dependencies

#### **@types/** packages
- TypeScript type definitions for libraries

#### **eslint** & **eslint-config-next**
- Code quality and consistency

---

## Project Structure

```
ubiquitous-palm-tree/
├── app/                          # Next.js App Router
│   ├── [tool]/                   # Dynamic route for all tools
│   │   └── page.tsx             # Tool page component
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
│
├── components/                   # React components
│   ├── common/                  # Shared UI components
│   │   ├── CopyButton.tsx
│   │   ├── RedactionToggle.tsx
│   │   └── ShareButton.tsx
│   │
│   ├── shell/                   # App shell components
│   │   ├── AppShell.tsx        # Main app container
│   │   ├── CommandPalette.tsx  # Cmd+K command menu
│   │   ├── LeftSidebar.tsx     # Navigation sidebar
│   │   ├── RightSidebar.tsx    # Settings sidebar
│   │   ├── ThemeProvider.tsx   # Theme management
│   │   ├── ToolRouter.tsx      # Tool routing logic
│   │   └── TopBar.tsx          # Top navigation bar
│   │
│   ├── studio/                  # Studio/editor components
│   │   ├── EditorPanel.tsx     # JSON editor panel
│   │   ├── InspectorPanel.tsx  # Results inspector
│   │   ├── MonacoEditor.tsx    # Monaco wrapper
│   │   └── WorkspacePanel.tsx  # Workspace controls
│   │
│   └── tools/                   # Tool implementations
│       ├── Base64Tool.tsx       # Base64 encoder/decoder
│       ├── HashGenerator.tsx    # Hash generation
│       ├── IPInspector.tsx      # IP address lookup
│       ├── JSONPathTool.tsx     # JSONPath query
│       ├── JSONTools.tsx        # Diff/Validate tools
│       ├── JSONTreeViewer.tsx   # Interactive JSON tree
│       ├── JWTDecoder.tsx       # JWT token decoder
│       ├── PingTool.tsx         # Network ping
│       └── UUIDGenerator.tsx    # UUID generation
│
├── lib/                          # Business logic & utilities
│   ├── diff/                    # JSON diffing
│   │   └── engine.ts
│   ├── jsonpath/                # JSONPath execution
│   │   └── executor.ts
│   ├── seo/                     # SEO utilities
│   │   └── jsonld.ts
│   ├── utils/                   # Shared utilities
│   │   ├── base64.ts
│   │   ├── format.ts
│   │   ├── hashGenerator.ts
│   │   ├── jwt.ts
│   │   ├── redaction.ts
│   │   ├── sessionHistory.ts
│   │   └── shareState.ts
│   ├── redactionStore.ts        # Redaction state
│   ├── routing.ts               # Route configuration
│   ├── sessionStore.ts          # Session state
│   └── store.ts                 # Main Zustand store
│
├── hooks/                        # Custom React hooks
│   ├── useDebounce.ts           # Debounce hook
│   ├── useFileUpload.ts         # File upload logic
│   └── useKeyboardShortcuts.ts  # Keyboard shortcuts
│
├── types/                        # TypeScript types
│   └── studio.ts                # Core type definitions
│
├── public/                       # Static assets
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
│
└── Configuration Files
    ├── next.config.mjs          # Next.js configuration
    ├── tsconfig.json            # TypeScript configuration
    ├── package.json             # Dependencies
    └── CLAUDE.md                # Project instructions
```

---

## Core Concepts

### 1. Privacy-First Architecture

**All data processing happens client-side:**
- No backend API calls for data processing
- No analytics on user input
- No cookies or tracking
- Data never sent to servers (except Ping/IP tools which need external APIs)

**Share links are privacy-safe:**
- State encoded in URL hash fragment (`#s=...`)
- Hash fragments never sent to servers
- LZ-string compression for shorter URLs
- Backwards compatible with legacy format

### 2. Static Site Generation (SSG)

All pages are pre-rendered at build time:
```typescript
// app/[tool]/page.tsx
export async function generateStaticParams() {
  return getAllRouteSlugs().map((slug) => ({ tool: slug }));
}
```

Benefits:
- Instant page loads
- SEO-friendly
- CDN cacheable
- Offline-capable (after first visit)

### 3. Tool Architecture

Each tool follows a consistent pattern:
1. **Input Panel** (left): User inputs, options, actions
2. **Results Panel** (right): Computed results, visualizations
3. **State Management**: Zustand store for data
4. **Share Support**: URL-based state sharing

---

## Component Architecture

### Shell Components

#### **AppShell** (`components/shell/AppShell.tsx`)
- Root application container
- Manages layout: TopBar + LeftSidebar + Main Content + RightSidebar
- Handles tool switching
- Manages global keyboard shortcuts

#### **ToolRouter** (`components/shell/ToolRouter.tsx`)
- Routes between tool components
- Switch statement based on current tool
- Lazy loads tool components

#### **CommandPalette** (`components/shell/CommandPalette.tsx`)
- Cmd+K quick access menu
- Fuzzy search for tools
- Keyboard navigation

### Tool Components

#### Common Pattern
```typescript
export function SomeTool() {
  // 1. State from Zustand
  const { input, setInput, execute, results } = useStore();

  // 2. Local UI state
  const [option, setOption] = useState();

  // 3. Handlers
  const handleExecute = () => execute();

  // 4. Render: Input Panel + Results Panel
  return (
    <div className={styles.container}>
      <div className={styles.inputPanel}>...</div>
      <div className={styles.resultsPanel}>...</div>
    </div>
  );
}
```

#### JSONPath Tool (`components/tools/JSONPathTool.tsx`)
Comprehensive example with all features:
- Input metrics (size, node count, depth)
- View modes (editor vs tree)
- Session history (localStorage)
- Click-to-populate from tree
- Debounced calculations
- Share and copy functions

---

## State Management

### Zustand Store (`lib/store.ts`)

**Global State Structure:**
```typescript
interface StudioState {
  // Current mode/tool
  mode: 'diff' | 'jsonpath' | 'validate';

  // JSON content
  jsonA: string;
  jsonB: string;
  jsonSource: string;

  // JSONPath specific
  jsonpathQuery: string;
  jsonpathOutputPaths: boolean;

  // Results
  diffResults: DiffResult | null;
  jsonpathResults: JSONPathResult[] | null;
  validationResults: ValidationResult | null;

  // UI state
  processing: boolean;
  error: string | null;
  fileSize: number;
  processingTime: number | null;

  // Toast notifications
  toastMessage: string | null;
  toastType: 'error' | 'success' | 'info' | 'warning' | null;

  // Actions
  executeDiff: () => void;
  executeJsonPath: () => void;
  executeValidation: () => void;
  clearAll: () => void;
}
```

**Usage:**
```typescript
const { jsonSource, setJsonSource, executeJsonPath } = useStudioStore();
```

### Redaction Store (`lib/redactionStore.ts`)

Global privacy toggle for hiding sensitive data:
- Emails, API keys, tokens, UUIDs, IPs, credit cards
- Applied to all tool outputs
- Persistent in localStorage

### Session Store (`lib/sessionStore.ts`)

Tracks user actions for session history:
- Last 5 sessions per tool
- Stored in localStorage
- Restoreable with one click

---

## Routing System

### Dynamic Routes (`app/[tool]/page.tsx`)

**URL → Tool Mapping:**
```
/json-diff     → diff tool
/jsonpath      → JSONPath tool
/json-validate → validate tool
/jwt           → JWT decoder
/base64        → Base64 encoder
/ping          → Ping tool
/ip            → IP inspector
/hash          → Hash generator
/uuid          → UUID generator
```

**Route Configuration** (`lib/routing.ts`):
```typescript
export const TOOL_ROUTES: ToolRoute[] = [
  {
    slug: 'jsonpath',
    toolId: 'jsonpath',
    title: 'JSONPath Query Tool - Query JSON Online | json0',
    description: 'Query JSON documents with JSONPath expressions...',
  },
  // ... more routes
];
```

**SEO Metadata:**
Each route has unique:
- Page title
- Meta description
- Open Graph tags
- Twitter Card tags
- JSON-LD structured data

---

## Tool Implementation

### Example: JSONPath Tool

**Libraries Used:**
- `jsonpath-plus` - Query execution
- `@monaco-editor/react` - Code editor
- `lz-string` - Share URL compression

**Features:**
1. **JSONPath Execution**
   ```typescript
   const results = JSONPath({
     path: query,
     json: parsed,
     resultType: outputPaths ? 'path' : 'value',
     wrap: true,
   });
   ```

2. **Interactive Tree Viewer**
   - Click nodes to populate JSONPath
   - Expand/collapse navigation
   - Smart bracket notation for special keys

3. **Session History**
   - Stores last 5 queries in localStorage
   - Restoreable sessions
   - Per-tool isolation

4. **Input Metrics**
   - File size (KB)
   - Node count (recursive traversal)
   - Max depth calculation
   - Debounced for performance

5. **Share Support**
   - Encodes: JSON source, query, output mode
   - LZ-string compression
   - URL hash fragment

---

## Design System

### CSS Variables (`app/globals.css`)

**Colors:**
```css
--brand-500: #10b981;  /* Emerald green */
--brand-600: #059669;

--text-primary: #111827;
--text-secondary: #6b7280;
--text-tertiary: #9ca3af;

--surface-primary: #ffffff;
--surface-secondary: #f9fafb;
--surface-tertiary: #f3f4f6;

--border-default: #e5e7eb;
--border-subtle: #f3f4f6;
--border-hover: #d1d5db;
```

**Spacing:**
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

**Typography:**
```css
--font-body: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Component Patterns

**2-Column Grid Layout:**
```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  padding: var(--space-6);
}
```

**Button Styles:**
```css
.primaryButton {
  background: var(--interactive-primary);
  color: var(--text-on-brand);
  transition: transform var(--duration-fast);
}

.primaryButton:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

---

## Performance Optimizations

### 1. Code Splitting

**Lazy Loading:**
```typescript
// lib/store.ts
executeJsonPath: async () => {
  const { executeJSONPath } = await import('@/lib/jsonpath/executor');
  // ...
}
```

### 2. Debouncing

**Input Metrics:**
```typescript
const debouncedJsonSource = useDebounce(jsonSource, 500);

const inputMetrics = useMemo(() => {
  // Expensive calculation only runs after 500ms of no changes
  return calculateMetrics(debouncedJsonSource);
}, [debouncedJsonSource]);
```

### 3. Memoization

**Parsed JSON Caching:**
```typescript
const parsedJson = useMemo(() => {
  try {
    return JSON.parse(jsonSource);
  } catch {
    return null;
  }
}, [jsonSource]);
```

### 4. Monaco Editor Optimization

- Single editor instance per tool
- Lazy loaded with dynamic import
- Virtual scrolling for large files
- Syntax highlighting on worker thread

---

## Build & Deployment

### Build Process

**Development:**
```bash
npm run dev
```
- Turbopack for instant HMR
- TypeScript type checking
- ESLint on save

**Production:**
```bash
npm run build
```
1. TypeScript compilation
2. ESLint checks
3. Next.js build with SSG
4. Static page generation for all routes
5. Output to `.next/` directory

### Deployment (Vercel)

**Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

**Environment:**
- Node.js 18+
- Serverless functions (for API routes, if any)
- Edge network CDN
- Automatic HTTPS

**Git Integration:**
- Push to `main` branch triggers deploy
- Preview deployments for PRs
- Automatic rollback support

---

## Browser Support

### Target Browsers

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android 90+)

### Required APIs

- **Web Crypto API** - Hash generation, UUID v4
- **FileReader API** - File uploads
- **localStorage** - Session history, preferences
- **Clipboard API** - Copy functions
- **fetch API** - Ping/IP tools only

---

## Security Considerations

### 1. No Server-Side Processing
- All JSON processing client-side
- No CSRF/XSS vectors from server
- No database or API to attack

### 2. Content Security Policy
- Strict CSP headers via Vercel
- No inline scripts (except JSON-LD)
- Monaco editor uses worker-src

### 3. Input Validation
- JSON parsing with try/catch
- JSONPath query sanitization
- File size limits (10MB max)

### 4. Redaction System
- Automatic PII detection
- User-controlled privacy toggle
- Applied before sharing

---

## Future Enhancements

### Planned Features

1. **Offline Support**
   - Service worker for true offline
   - Cache-first strategy
   - Update notifications

2. **Additional Tools**
   - YAML converter
   - XML to JSON
   - JSON Schema validator
   - GraphQL query tester

3. **Power User Features**
   - Schema view
   - Complexity meter
   - Export formats (CSV, Excel)
   - Batch processing

4. **Themes**
   - Paper theme (light, high contrast)
   - Terminal theme (dark, monochrome)
   - Custom theme builder

5. **Collaboration**
   - Snapshot sharing
   - Diff links (A vs B)
   - Collaborative editing (WebRTC P2P)

---

## Contributing

### Development Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
4. Open http://localhost:3000

### Code Standards

- TypeScript strict mode
- ESLint rules enforced
- Component naming: PascalCase
- File naming: kebab-case
- CSS Modules for styling

### Commit Guidelines

- Author: Siddharthachuahan9
- No co-authors
- Clear, descriptive messages
- Conventional commits format

---

## License & Attribution

**License:** MIT
**Author:** Siddharthachuahan9
**Built with Claude Code**

---

**Last Updated:** January 2026
**Documentation Version:** 1.0
