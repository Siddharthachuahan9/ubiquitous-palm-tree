# JSON Exploration Studio

A distinctive, production-grade JSON manipulation tool with **Dark Industrial Interface** aesthetic.

This is not a dashboard. This is a developer instrument — something engineers enjoy inhabiting, not just using.

## Vision

JSON Exploration Studio is a hybrid between:

- **A developer instrument** — precise, technical, powerful
- **A data visualization lab** — visual diffs, query exploration
- **A creative coding canvas** — JSONPath as a query language

## Core Features

### 1. JSON Diff Engine
- Compare two JSON structures visually and semantically
- Support deep nesting, arrays, reordered keys, type changes
- Three visualization modes:
  - **Visual**: Color-coded tree view with highlights
  - **Tree**: Hierarchical structural representation
  - **Patch**: RFC 6902 JSON Patch format

### 2. JSONPath Playground
- Live query execution with syntax highlighting
- Matching nodes pulse and glow
- Full path, type, and size information
- Query history and examples

### 3. Data Integrity Tools
- Real-time validation
- Structural linting (duplicate keys, invalid types, malformed arrays)
- Performance warnings for massive payloads (10MB+)
- Smart formatting modes: Human-readable, Diff-friendly, Machine-compact

## Design Philosophy

### Dark Industrial Aesthetic

**Reject generic patterns:**
- ❌ Centered cards, startup gradients, SaaS dashboards
- ❌ Default Tailwind/MUI/ShadCN layouts
- ❌ Inter, Roboto, system font stacks

**Embrace precision and craft:**
- ✅ Layered depth through shadows
- ✅ Asymmetric panel layouts
- ✅ Functional motion (queries "travel", diffs "emerge")
- ✅ Technical but human typography
- ✅ No rounded corners — industrial precision

### Color System

```
Deep blacks:      #0a0a0a (void) → #1a1a1e (shadow) → #2d2d35 (iron)
Industrial metals: #505058 (zinc) → #88889a (silver) → #e8e8f0 (chrome)
Neon accents:     #00ff88 (green) | #ff0066 (magenta) | #ffaa00 (yellow) | #00ccff (cyan)
```

### Typography

- **Display**: Space Grotesk (geometric, technical, distinctive)
- **Code**: JetBrains Mono (ligatures, clear at small sizes)
- **Body**: Manrope (rounded geometric, modern)

## Technical Architecture

### Frontend
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Editor**: Monaco (VS Code engine)
- **Diff**: json-diff-kit (modern, TypeScript-native)
- **JSONPath**: jsonpath-plus (most complete implementation)
- **Virtualization**: @tanstack/react-virtual (for 10MB+ files)
- **Animation**: Framer Motion (functional, not decorative)
- **Styling**: CSS Modules + CSS Variables (zero runtime, full control)

### Backend (Planned)
- **API Routes**: Next.js Edge functions
- **Endpoints**:
  - `POST /api/diff` — Structural + semantic diff
  - `POST /api/query` — JSONPath execution
  - `POST /api/analyze` — Performance + integrity analysis
  - `POST /api/snapshot` — Create shareable link
- **Storage**: Vercel KV (shareable snapshots, 30-day TTL)

## Project Structure

```
/
├── app/
│   ├── layout.tsx           # Root layout with font preloading
│   ├── page.tsx             # Main studio interface
│   ├── globals.css          # Global styles + design system imports
│   └── api/                 # Edge API routes (TODO)
│
├── components/
│   └── studio/
│       ├── StudioShell.tsx      # Main layout orchestrator
│       ├── Toolbar.tsx          # Mode switcher + panel toggles
│       ├── StatusBar.tsx        # Bottom metrics bar
│       ├── WorkspacePanel.tsx   # Left sidebar (sessions, snapshots)
│       ├── EditorPanel.tsx      # Center workspace (mode-specific)
│       └── InspectorPanel.tsx   # Right sidebar (results, analysis)
│
├── styles/
│   ├── variables.css        # Colors, spacing, typography, animations
│   ├── typography.css       # Font loading + utility classes
│   ├── animations.css       # Motion primitives
│   └── themes/
│       └── dark-industrial.css  # Core theme definitions
│
└── public/
    └── fonts/               # Self-hosted fonts (TODO: download)
```

## Current Status

### ✅ Completed
- [x] Next.js 14 project initialization with TypeScript
- [x] Dark Industrial design system (CSS variables, typography, animations)
- [x] UI shell with three-panel asymmetric layout
- [x] Toolbar with mode switching (Diff/JSONPath/Validate)
- [x] StatusBar with metrics display
- [x] WorkspacePanel, EditorPanel, InspectorPanel components
- [x] Responsive grid layout with collapsible panels
- [x] Mode-specific UI layouts (split view for diff, query input for JSONPath)

### 🚧 In Progress
- [ ] Font downloads and self-hosting
- [ ] Monaco editor integration with Dark Industrial theme
- [ ] JSON validation layer

### 📋 TODO
- [ ] Install npm dependencies (Monaco, Framer Motion, diff libraries)
- [ ] Download fonts: Space Grotesk, JetBrains Mono, Manrope
- [ ] Implement JSON diff engine + API route
- [ ] Build JSONPath playground with live matching
- [ ] Create export system (HTML, Patch, Markdown)
- [ ] Add command palette (Cmd+K)
- [ ] Implement keyboard shortcuts
- [ ] Add Vercel KV integration for snapshots
- [ ] Deploy to Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

```env
# Vercel KV (for shareable snapshots)
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

## Development

### Running Tests
```bash
npm test              # Unit tests (Vitest)
npm run test:e2e      # E2E tests (Playwright)
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Design Principles

1. **Spatial Design**: Use depth, layers, panels, and tension
2. **Asymmetry**: Left sidebar (280px), flexible center, right inspector (360px)
3. **Intentional Space**: Empty space feels designed, not unused
4. **Functional Motion**: Queries "travel", diffs "emerge", panels feel physically docked
5. **Technical Precision**: No rounded corners, exact spacing, industrial feel

## Keyboard Shortcuts (Planned)

- `Cmd+K` — Command palette
- `Cmd+S` — Save snapshot
- `Cmd+D` — Toggle diff mode
- `Cmd+J` — Focus JSONPath
- `Cmd+Shift+F` — Format JSON
- `Cmd+Enter` — Execute query
- `Esc` — Close panels/dialogs

## Performance

### Large File Support (10MB+)
- Web Workers for JSON parsing and diff computation
- Virtual scrolling with @tanstack/react-virtual
- Progressive rendering (load visible chunks)
- Monaco chunked loading

### Security
- Zod validation for API inputs
- Max payload: 10MB (Edge function limit)
- Timeouts: 10s for diff, 5s for query
- Disable script expressions in JSONPath (prevent eval injection)

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Setup
1. Create Vercel KV database
2. Add environment variables
3. Deploy edge functions to optimized regions

## Contributing

This is a focused, opinionated product. Contributions should align with the Dark Industrial aesthetic and avoid generic UI patterns.

## License

MIT

---

**Built with intent, character, precision, and craft.**

This is a tool a senior engineer would bookmark, not a demo someone forgets.
