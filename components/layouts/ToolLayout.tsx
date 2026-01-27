'use client';

import { ReactNode } from 'react';
import styles from './ToolLayout.module.css';

interface ToolLayoutProps {
  /** Child components (typically ToolHeader, panels, ToolFooter) */
  children: ReactNode;
  /** Optional CSS class name */
  className?: string;
}

/**
 * ToolLayout - Standard container for all json0 tools
 *
 * Provides consistent structure:
 * - Tool header with name, description, actions
 * - Workspace with left (input) and right (output) panels
 * - Footer with privacy messaging
 *
 * Responsive behavior:
 * - Desktop (900px+): 50/50 split panels side-by-side
 * - Mobile (<900px): Panels stack vertically
 */
export function ToolLayout({ children, className }: ToolLayoutProps) {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      {children}
    </div>
  );
}

interface ToolWorkspaceProps {
  /** Left panel content (typically input/editor) */
  left: ReactNode;
  /** Right panel content (typically output/results) */
  right: ReactNode;
  /** Optional CSS class name */
  className?: string;
}

/**
 * ToolWorkspace - Standard two-panel workspace
 *
 * Features:
 * - 50/50 split on desktop (900px+)
 * - Vertical stack on mobile
 * - Equal height panels
 * - Responsive behavior
 */
export function ToolWorkspace({ left, right, className }: ToolWorkspaceProps) {
  return (
    <div className={`${styles.workspace} ${className || ''}`}>
      <div className={styles.leftPanel}>
        {left}
      </div>
      <div className={styles.rightPanel}>
        {right}
      </div>
    </div>
  );
}

interface ToolPanelProps {
  /** Panel title */
  title: string;
  /** Panel content */
  children: ReactNode;
  /** Optional actions (buttons, etc.) */
  actions?: ReactNode;
  /** Optional CSS class name */
  className?: string;
}

/**
 * ToolPanel - Individual panel within workspace
 *
 * Features:
 * - Header with title and optional actions
 * - Scrollable content area
 * - Consistent padding and spacing
 */
export function ToolPanel({ title, children, actions, className }: ToolPanelProps) {
  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{title}</h2>
        {actions && <div className={styles.panelActions}>{actions}</div>}
      </div>
      <div className={styles.panelContent}>
        {children}
      </div>
    </div>
  );
}
