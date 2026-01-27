# json0 Design System

## Overview

json0 is a privacy-first, browser-based developer console for working with JSON, tokens, and structured data. This design system defines the visual language, interaction patterns, and component library that make json0 feel like a professional debugging workstation.

## Design Principles

### Core Values
- **Privacy First**: All processing happens locally in the browser
- **Fast & Predictable**: Instant interactions, no loading delays
- **Clean Hierarchy**: Clear visual organization
- **Consistent Experience**: All tools feel like part of the same product
- **Trustworthy**: Users feel confident pasting sensitive data

### Tone
- Calm
- Confident
- Focused
- Minimal

## Color System

### Themes

json0 supports three themes:

#### 1. Dark Console (Default)
```css
--surface-page: #0F172A (neutral-900)
--surface-panel: #1E293B (neutral-800)
--surface-elevated: #334155 (neutral-700)
--text-primary: #F8FAFC (neutral-50)
--text-secondary: #CBD5E1 (neutral-300)
--interactive-default: #3B82F6 (brand-500)
```

#### 2. Paper Light
```css
--surface-page: #F8FAFC (neutral-50)
--surface-panel: #FFFFFF (neutral-0)
--surface-elevated: #F1F5F9 (neutral-100)
--text-primary: #0F172A (neutral-900)
--text-secondary: #475569 (neutral-600)
--interactive-default: #2563EB (brand-600)
```

#### 3. Terminal Green
```css
--surface-page: #001100 (terminal-bg)
--surface-panel: #0C0C0C (terminal-black)
--text-primary: #00FF41 (terminal-green)
--text-secondary: #00CC33 (terminal-green-dim)
--interactive-default: #00FF41 (terminal-green)
```

### Status Colors
- **Success**: #16A34A (green)
- **Warning**: #F59E0B (amber)
- **Error**: #DC2626 (red)
- **Info**: #0EA5E9 (blue)

## Typography

### Font Families
```css
--font-display: 'Space Grotesk', system-ui, sans-serif;
--font-body: 'Manrope', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Consolas', monospace;
```

### Scale
```css
--text-xs: 0.75rem    (12px)
--text-sm: 0.875rem   (14px)
--text-base: 1rem     (16px)
--text-lg: 1.125rem   (18px)
--text-xl: 1.25rem    (20px)
--text-2xl: 1.5rem    (24px)
```

### Usage
- **Display Font**: Tool names, headings, emphasis
- **Body Font**: UI labels, descriptions, form inputs
- **Mono Font**: Code editors, JSON output, technical data

## Spacing

### Scale (4px base unit)
```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-7: 32px
--space-8: 40px
--space-9: 48px
--space-10: 56px
```

### Application
- **Tight**: `--space-1` to `--space-2` (icon gaps, inline elements)
- **Default**: `--space-3` to `--space-4` (component padding, gaps)
- **Generous**: `--space-5` to `--space-6` (panel padding, section spacing)
- **Loose**: `--space-7+` (major section breaks)

## Layout System

### Top Bar
- Height: 56px (mobile), 64px (desktop)
- Components: Logo, Command Bar, Privacy Badge, Theme Toggle
- Mobile: Command bar is prominent, tool switcher hidden

### Tool Layout Structure
```
┌─────────────────────────────────────────┐
│ ToolHeader (name, description, actions) │
├──────────────────┬──────────────────────┤
│                  │                      │
│  Left Panel      │  Right Panel         │
│  (Input)         │  (Output)            │
│                  │                      │
├──────────────────┴──────────────────────┤
│ ToolFooter (privacy message)            │
└─────────────────────────────────────────┘
```

### Responsive Behavior
- **Desktop (900px+)**: 50/50 split panels side-by-side, top tool tabs
- **Tablet (768-900px)**: Adjusted panel widths, icons-only tabs
- **Mobile (<768px)**: Panels stack vertically, bottom navigation bar

## Components

### ToolLayout
Standard container for all tools with consistent structure.

```tsx
import { ToolLayout, ToolWorkspace, ToolPanel } from '@/components/layouts/ToolLayout';

<ToolLayout>
  <ToolHeader
    title="JSON Diff"
    description="Compare two JSON objects and see the differences"
    icon="🔍"
    actions={<ShareButton />}
  />
  <ToolWorkspace
    left={
      <ToolPanel title="Before" actions={<FormatButton />}>
        {/* Input content */}
      </ToolPanel>
    }
    right={
      <ToolPanel title="After">
        {/* Output content */}
      </ToolPanel>
    }
  />
  <ToolFooter />
</ToolLayout>
```

### ToolHeader
Consistent header for all tools.

**Props:**
- `title`: Tool name
- `description`: One-sentence description
- `icon`: Optional emoji/icon
- `actions`: Optional action buttons (Share, Copy, etc.)

### ToolFooter
Privacy reassurance message at bottom of each tool.

**Default message:** "Your data never leaves this browser"

### OnboardingCard
First-visit welcome modal with privacy promise and tips.

```tsx
<OnboardingCard
  toolName="JSON Diff"
  description="Compare two JSON objects to find differences"
  tips={[
    "Paste your JSON directly",
    "Click changes to navigate to line",
    "Use Share button to create a URL"
  ]}
/>
```

### BottomNav
Mobile-only navigation bar (hidden on desktop).

- Fixed to bottom of viewport
- Icons with labels
- Active state highlighted
- Touch-friendly 56px height

## Navigation

### Primary: Command Palette
- Keyboard: `Cmd+K` or `Ctrl+K`
- Click: Command bar in top bar
- Shows all tools with search
- Enter to select, Escape to close

### Secondary: Tool Tabs (Desktop)
- Horizontal tabs in top bar
- Active tool highlighted
- Click to switch tools
- Icons with labels

### Mobile: Bottom Navigation
- Fixed bottom bar
- Icons with labels
- Touch-friendly targets (56px min)
- Active indicator (top border)

## Interaction Patterns

### Buttons
```css
/* Primary */
background: var(--interactive-default);
color: var(--text-inverse);
padding: var(--space-3) var(--space-6);
border-radius: var(--radius-sm);

/* Secondary */
background: transparent;
border: 1px solid var(--border-default);
color: var(--text-primary);

/* Icon Button */
width: 36px;
height: 36px;
background: var(--surface-elevated);
```

### Hover States
- Buttons: Lift 1px up + add shadow
- Tool tabs: Background change + color change
- Interactive elements: Subtle color/background change

### Focus States
- 2px solid outline
- `outline-color: var(--border-focus)`
- 2px offset for external focus
- High contrast in all themes

### Active States
- Scale to 0.96-0.98
- Brief transition (120ms)
- Immediate visual feedback

## Motion

### Durations
```css
--duration-fast: 120ms
--duration-normal: 180ms
--duration-slow: 240ms
```

### Easing
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

### Applications
- **Fast**: Button presses, hover states, focus changes
- **Normal**: Panel transitions, theme switching
- **Slow**: Modals, overlays, large UI changes

### Reduced Motion
All animations respect `prefers-reduced-motion` media query.

## Accessibility

### Keyboard Navigation
- Tab order follows visual layout
- All buttons keyboard accessible
- Command palette: `Cmd+K`
- Focus visible on all interactive elements

### Screen Readers
- Semantic HTML (nav, header, main, footer)
- ARIA labels on icon buttons
- ARIA current on active navigation items
- Descriptive button labels

### Contrast
- WCAG AA compliant in all themes
- Text contrast: 4.5:1 minimum
- Interactive elements: 3:1 minimum
- Status colors adjusted per theme

### Touch Targets
- Minimum 44px height/width
- Generous spacing between targets
- No overlapping interactive areas

## Privacy UX

### Privacy Badge
- Visible in top bar
- Text: "local only"
- Click opens Privacy Modal

### Privacy Modal
Clear explanation:
- "All processing happens in your browser"
- "No data is sent to servers"
- "Works offline (except network tools)"
- "Share links store data only in the URL"

### Tool Footer
Every tool shows: "🔒 Your data never leaves this browser"

## File Structure

```
/components
  /layouts
    ToolLayout.tsx        # Standard tool container
    ToolHeader.tsx        # Consistent header
    ToolFooter.tsx        # Privacy footer
  /common
    OnboardingCard.tsx    # First-visit welcome
    PrivacyBadge.tsx      # Top bar privacy indicator
    ShareButton.tsx       # Share via URL
  /shell
    TopBar.tsx            # Main navigation bar
    BottomNav.tsx         # Mobile navigation
    CommandPalette.tsx    # Cmd+K tool switcher
    ThemeProvider.tsx     # Theme management

/styles
  tokens.css              # Design tokens (colors, spacing, typography)
  animations.css          # Motion system
  typography.css          # Font definitions
  themes/                 # Theme-specific overrides
```

## Usage Examples

### Creating a New Tool

```tsx
'use client';

import { ToolLayout, ToolWorkspace, ToolPanel } from '@/components/layouts/ToolLayout';
import { ToolHeader } from '@/components/layouts/ToolHeader';
import { ToolFooter } from '@/components/layouts/ToolFooter';
import { OnboardingCard } from '@/components/common/OnboardingCard';
import { ShareButton } from '@/components/common/ShareButton';

export function MyNewTool() {
  return (
    <>
      <OnboardingCard
        toolName="My Tool"
        description="What this tool does in one sentence"
        tips={["Tip 1", "Tip 2"]}
      />

      <ToolLayout>
        <ToolHeader
          title="My Tool"
          description="A clear, one-sentence description"
          icon="🛠️"
          actions={
            <>
              <button>Format</button>
              <ShareButton tool="my-tool" data={{/* state */}} />
            </>
          }
        />

        <ToolWorkspace
          left={
            <ToolPanel
              title="Input"
              actions={<button>Clear</button>}
            >
              {/* Input UI */}
            </ToolPanel>
          }
          right={
            <ToolPanel title="Output">
              {/* Output UI */}
            </ToolPanel>
          }
        />

        <ToolFooter />
      </ToolLayout>
    </>
  );
}
```

## Best Practices

### DO
✅ Use semantic HTML elements
✅ Follow the spacing scale consistently
✅ Test in all three themes
✅ Make all interactive elements keyboard accessible
✅ Show privacy messaging clearly
✅ Use ToolLayout for consistency
✅ Add OnboardingCard for first-time users
✅ Keep descriptions to one sentence
✅ Use icons from the established set

### DON'T
❌ Create custom layouts (use ToolLayout)
❌ Skip the privacy footer
❌ Use colors outside the token system
❌ Make buttons smaller than 44px on mobile
❌ Hide important actions below scroll
❌ Use complex jargon in descriptions
❌ Skip focus states for accessibility
❌ Send user data to servers
❌ Create tool-specific header styles

## Testing Checklist

- [ ] Works in all three themes (dark, light, terminal)
- [ ] Keyboard navigation functions correctly
- [ ] Mobile layout stacks vertically
- [ ] Desktop layout shows 50/50 panels
- [ ] Bottom nav appears on mobile
- [ ] Command palette opens with Cmd+K
- [ ] Focus states are visible
- [ ] Privacy messaging is clear
- [ ] OnboardingCard shows on first visit
- [ ] Share functionality works
- [ ] All text has sufficient contrast
- [ ] Touch targets are 44px minimum
- [ ] Reduced motion is respected

## Resources

- **Tokens**: `/styles/tokens.css`
- **Component Examples**: `/components/layouts/`
- **Live Site**: https://json0.dev
- **Repository**: https://github.com/[username]/json0

---

**Last Updated**: 2026-01-27
**Version**: 2.0
