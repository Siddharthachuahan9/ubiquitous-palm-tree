'use client';

import { ReactNode } from 'react';
import { useTheme } from './ThemeProvider';
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
      {/* Logo */}
      <div className={styles.leftZone}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>json0</span>
          <span className={styles.logoDivider} aria-hidden />
          <span className={styles.logoSub}>dev tools</span>
        </div>
      </div>

      {/* Command Bar */}
      <div className={styles.centerZone}>
        <button
          className={styles.commandBar}
          onClick={onCommandPaletteOpen}
          aria-label="Open command palette"
        >
          <svg className={styles.searchIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span className={styles.placeholder}>Search tools...</span>
          <kbd className={styles.shortcut}>
            <span>⌘K</span>
          </kbd>
        </button>
      </div>

      {/* Right Zone */}
      <div className={styles.rightZone}>
        {/* Privacy — Desktop */}
        <div className={styles.desktopOnly}>
          <button
            className={styles.privacyBadge}
            onClick={onPrivacyModalOpen}
            title="Privacy: all processing is local"
            aria-label="View privacy information"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className={styles.badgeText}>Local only</span>
          </button>
        </div>

        {/* Privacy — Mobile (icon only) */}
        <div className={styles.mobileOnly}>
          <button
            className={styles.iconButton}
            onClick={onPrivacyModalOpen}
            title="Privacy"
            aria-label="View privacy information"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </button>
        </div>

        {/* Theme Toggle — Desktop */}
        <div className={`${styles.themeGroup} ${styles.desktopOnly}`}>
          <button
            className={theme === 'dark' ? styles.themeActive : styles.themeBtn}
            onClick={() => setTheme('dark')}
            title="Dark"
            aria-label="Dark theme"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
          <button
            className={theme === 'light' ? styles.themeActive : styles.themeBtn}
            onClick={() => setTheme('light')}
            title="Light"
            aria-label="Light theme"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            className={theme === 'terminal' ? styles.themeActive : styles.themeBtn}
            onClick={() => setTheme('terminal')}
            title="Terminal"
            aria-label="Terminal theme"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </button>
        </div>

        {/* Theme Toggle — Mobile */}
        <div className={styles.mobileOnly}>
          <button
            className={styles.iconButton}
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : theme === 'light' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
            )}
          </button>
        </div>

        {actions && <div className={styles.toolActions}>{actions}</div>}
      </div>
    </header>
  );
}
