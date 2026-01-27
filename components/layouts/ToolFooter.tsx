'use client';

import styles from './ToolFooter.module.css';

interface ToolFooterProps {
  /** Optional custom message (defaults to privacy message) */
  message?: string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * ToolFooter - Standard footer for all json0 tools
 *
 * Features:
 * - Privacy reassurance message
 * - Subtle, non-intrusive styling
 * - Consistent across all tools
 *
 * Default message: "Your data never leaves this browser"
 */
export function ToolFooter({
  message = 'Your data never leaves this browser',
  className,
}: ToolFooterProps) {
  return (
    <footer className={`${styles.footer} ${className || ''}`}>
      <p className={styles.message}>
        <span className={styles.icon}>🔒</span>
        {message}
      </p>
    </footer>
  );
}
