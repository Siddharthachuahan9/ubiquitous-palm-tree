'use client';

import { useTheme } from './ThemeProvider';
import { PrivacyBadge } from './PrivacyBadge';
import styles from './TopBar.module.css';

export type Tool = 'diff' | 'jsonpath' | 'validate' | 'ip' | 'ping' | 'base64' | 'jwt' | 'hash' | 'uuid';

interface TopBarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  onCommandPaletteOpen: () => void;
  onPrivacyModalOpen: () => void;
}

const tools: Array<{ id: Tool; label: string; icon: string }> = [
  { id: 'diff', label: 'Diff', icon: '⚖️' },
  { id: 'jsonpath', label: 'Query', icon: '🔍' },
  { id: 'validate', label: 'Validate', icon: '✓' },
  { id: 'ip', label: 'IP', icon: '🌐' },
  { id: 'ping', label: 'Ping', icon: '📡' },
  { id: 'base64', label: 'Base64', icon: '🔤' },
  { id: 'jwt', label: 'JWT', icon: '🔐' },
  { id: 'hash', label: 'Hash', icon: '🔒' },
  { id: 'uuid', label: 'UUID', icon: '🆔' },
];

export function TopBar({ currentTool, onToolChange, onCommandPaletteOpen, onPrivacyModalOpen }: TopBarProps) {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <header className={styles.topBar}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>{'{0}'}</span>
        <div className={styles.logoContent}>
          <span className={styles.logoText}>json0</span>
          <span className={styles.logoTagline}>json tools, zero hassle</span>
        </div>
      </div>

      {/* Command Bar - Primary Navigation */}
      <div className={styles.commandBarWrapper}>
        <button
          className={styles.commandBar}
          onClick={onCommandPaletteOpen}
          aria-label="Open command palette"
        >
          <span className={styles.commandIcon}>🔍</span>
          <span className={styles.commandPlaceholder}>Type a command or search...</span>
          <kbd className={styles.commandKbd}>⌘K</kbd>
        </button>
      </div>

      {/* Desktop Tool Switcher */}
      <nav className={styles.toolSwitcher}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={currentTool === tool.id ? styles.toolActive : styles.tool}
            onClick={() => onToolChange(tool.id)}
            aria-label={`Switch to ${tool.label} tool`}
          >
            <span className={styles.toolIcon}>{tool.icon}</span>
            <span className={styles.toolLabel}>{tool.label}</span>
          </button>
        ))}
      </nav>

      {/* Actions */}
      <div className={styles.actions}>
        {/* Desktop Privacy Badge */}
        <div className={styles.desktopOnly}>
          <PrivacyBadge variant="full" onOpenModal={onPrivacyModalOpen} />
        </div>

        {/* Mobile Privacy Badge */}
        <div className={styles.mobileOnly}>
          <PrivacyBadge variant="compact" onOpenModal={onPrivacyModalOpen} />
        </div>

        {/* Theme Selector - Desktop only */}
        <div className={`${styles.themeSelector} ${styles.desktopOnly}`}>
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
            title={`Switch theme`}
            aria-label="Switch theme"
          >
            <span>{theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '💻'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
