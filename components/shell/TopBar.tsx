'use client';

import { ReactNode } from 'react';
import { useTheme } from './ThemeProvider';
import { PrivacyBadge } from './PrivacyBadge';
import styles from './TopBar.module.css';

interface TopBarProps {
  onCommandPaletteOpen: () => void;
  onPrivacyModalOpen: () => void;
  /** Optional tool-specific actions (e.g., Share button) */
  actions?: ReactNode;
}

/**
 * TopBar - Global header with three-zone grid layout
 *
 * Layout:
 * - Left: Logo, product name, tagline
 * - Center: Command bar (visually dominant, centered)
 * - Right: Privacy badge, Theme toggle, Tool actions
 *
 * Design Goals:
 * - Clear visual hierarchy
 * - No overlaps at any desktop width (1024px+)
 * - Consistent spacing
 * - Professional developer console feel
 */
export function TopBar({ onCommandPaletteOpen, onPrivacyModalOpen, actions }: TopBarProps) {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <header className={styles.header}>
      {/* Left Zone: Logo */}
      <div className={styles.leftZone}>
        <span className={styles.logoIcon}>{'{0}'}</span>
        <div className={styles.logoContent}>
          <span className={styles.logoText}>json0</span>
          <span className={styles.logoTagline}>json tools, zero hassle</span>
        </div>
      </div>

      {/* Center Zone: Command Bar */}
      <div className={styles.centerZone}>
        <button
          className={styles.commandBar}
          onClick={onCommandPaletteOpen}
          aria-label="Open command palette"
        >
          <span className={styles.searchIcon}>🔍</span>
          <span className={styles.placeholder}>Type a command or search...</span>
          <kbd className={styles.shortcut}>
            <span className={styles.shortcutText}>Ctrl+K</span>
          </kbd>
        </button>
      </div>

      {/* Right Zone: Actions */}
      <div className={styles.rightZone}>
        {/* Privacy Badge - Desktop only */}
        <div className={styles.desktopOnly}>
          <button
            className={styles.privacyBadge}
            onClick={onPrivacyModalOpen}
            title="Privacy information"
            aria-label="View privacy information"
          >
            <span className={styles.lockIcon}>🔒</span>
            <span className={styles.badgeText}>Runs locally in your browser</span>
          </button>
        </div>

        {/* Mobile Privacy Badge */}
        <div className={styles.mobileOnly}>
          <PrivacyBadge variant="compact" onOpenModal={onPrivacyModalOpen} />
        </div>

        {/* Theme Toggle - Desktop */}
        <div className={`${styles.themeToggle} ${styles.desktopOnly}`}>
          <button
            className={theme === 'dark' ? styles.themeActive : styles.themeButton}
            onClick={() => setTheme('dark')}
            title="Dark console theme"
            aria-label="Switch to dark theme"
          >
            🌙
          </button>
          <button
            className={theme === 'light' ? styles.themeActive : styles.themeButton}
            onClick={() => setTheme('light')}
            title="Paper light theme"
            aria-label="Switch to light theme"
          >
            ☀️
          </button>
          <button
            className={theme === 'terminal' ? styles.themeActive : styles.themeButton}
            onClick={() => setTheme('terminal')}
            title="Terminal green theme"
            aria-label="Switch to terminal theme"
          >
            💻
          </button>
        </div>

        {/* Mobile Theme Toggle */}
        <div className={styles.mobileOnly}>
          <button
            className={styles.iconButton}
            onClick={toggleTheme}
            title="Switch theme"
            aria-label="Switch theme"
          >
            <span>{theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '💻'}</span>
          </button>
        </div>

        {/* Tool-specific Actions (e.g., Share button) */}
        {actions && <div className={styles.toolActions}>{actions}</div>}
      </div>
    </header>
  );
}
