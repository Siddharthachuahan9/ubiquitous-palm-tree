'use client';

import { ReactNode } from 'react';
import { useTheme } from './ThemeProvider';
import { PrivacyBadge } from './PrivacyBadge';
import styles from './TopBar.module.css';

interface TopBarProps {
  onCommandPaletteOpen: () => void;
  onPrivacyModalOpen: () => void;
  actions?: ReactNode;
}

export function TopBar({ onCommandPaletteOpen, onPrivacyModalOpen, actions }: TopBarProps) {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <header className={styles.header}>
      {/* Left Zone: Logo */}
      <div className={styles.leftZone}>
        <span className={styles.logoIcon}>{'{0}'}</span>
        <div className={styles.logoContent}>
          <span className={styles.logoText}>json0</span>
          <span className={styles.logoTagline}>dev tools</span>
        </div>
      </div>

      {/* Center Zone: Command Bar */}
      <div className={styles.centerZone}>
        <button
          className={styles.commandBar}
          onClick={onCommandPaletteOpen}
          aria-label="Open command palette"
        >
          <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className={styles.placeholder}>Search tools...</span>
          <kbd className={styles.shortcut}>
            <span className={styles.shortcutText}>⌘K</span>
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className={styles.badgeText}>Local only</span>
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
            title="Dark theme"
            aria-label="Switch to dark theme"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
          <button
            className={theme === 'light' ? styles.themeActive : styles.themeButton}
            onClick={() => setTheme('light')}
            title="Light theme"
            aria-label="Switch to light theme"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </button>
          <button
            className={theme === 'terminal' ? styles.themeActive : styles.themeButton}
            onClick={() => setTheme('terminal')}
            title="Terminal theme"
            aria-label="Switch to terminal theme"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
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
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            ) : theme === 'light' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
            )}
          </button>
        </div>

        {/* Tool-specific Actions */}
        {actions && <div className={styles.toolActions}>{actions}</div>}
      </div>
    </header>
  );
}
