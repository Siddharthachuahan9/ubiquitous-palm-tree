'use client';

import { ReactNode } from 'react';
import styles from './ToolHeader.module.css';

interface ToolHeaderProps {
  /** Tool name/title */
  title: string;
  /** One-sentence tool description */
  description: string;
  /** Optional action buttons (Share, Copy, Upload, etc.) */
  actions?: ReactNode;
  /** Optional icon/emoji */
  icon?: string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * ToolHeader - Standard header for all json0 tools
 *
 * Features:
 * - Tool name with optional icon
 * - One-sentence description
 * - Primary action buttons on the right
 * - Consistent spacing and typography
 * - Responsive behavior (actions stack on mobile)
 *
 * Usage:
 * ```tsx
 * <ToolHeader
 *   title="JSON Diff"
 *   description="Compare two JSON objects and see the differences"
 *   icon="🔍"
 *   actions={<ShareButton />}
 * />
 * ```
 */
export function ToolHeader({
  title,
  description,
  actions,
  icon,
  className,
}: ToolHeaderProps) {
  return (
    <header className={`${styles.header} ${className || ''}`}>
      <div className={styles.info}>
        <div className={styles.titleRow}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <h1 className={styles.title}>{title}</h1>
        </div>
        <p className={styles.description}>{description}</p>
      </div>
      {actions && (
        <div className={styles.actions}>
          {actions}
        </div>
      )}
    </header>
  );
}
