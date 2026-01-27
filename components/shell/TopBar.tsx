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
  const { theme, toggleTheme } = useTheme();

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

      {/* Tool Switcher */}
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

        <button
          className={styles.iconButton}
          onClick={onCommandPaletteOpen}
          title="Command Palette (Cmd+K)"
          aria-label="Open command palette"
        >
          <span>⌘K</span>
        </button>

        <button
          className={styles.iconButton}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
      </div>
    </header>
  );
}
