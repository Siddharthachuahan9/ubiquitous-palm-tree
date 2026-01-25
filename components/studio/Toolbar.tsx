'use client';

import styles from './Toolbar.module.css';
import type { Mode } from './StudioShell';

interface ToolbarProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
}

export function Toolbar({ mode, onModeChange, onToggleLeftPanel, onToggleRightPanel }: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>◬</span>
          <span className={styles.logoText}>JSON Studio</span>
        </div>

        <nav className={styles.modeTabs}>
          <button
            className={mode === 'diff' ? styles.tabActive : styles.tab}
            onClick={() => onModeChange('diff')}
          >
            Diff
          </button>
          <button
            className={mode === 'jsonpath' ? styles.tabActive : styles.tab}
            onClick={() => onModeChange('jsonpath')}
          >
            JSONPath
          </button>
          <button
            className={mode === 'validate' ? styles.tabActive : styles.tab}
            onClick={() => onModeChange('validate')}
          >
            Validate
          </button>
        </nav>
      </div>

      <div className={styles.right}>
        <button className={styles.iconButton} onClick={onToggleLeftPanel} title="Toggle workspace panel">
          <span>◧</span>
        </button>
        <button className={styles.iconButton} onClick={onToggleRightPanel} title="Toggle inspector panel">
          <span>◨</span>
        </button>
        {/* Hidden on mobile - incomplete features */}
        <button className={`${styles.iconButton} ${styles.shareButton}`} title="Share workspace (Cmd+S)" style={{ display: 'none' }}>
          <span>↗</span>
        </button>
        <button className={styles.commandButton} title="Command palette (Cmd+K)" style={{ display: 'none' }}>
          <span>⌘K</span>
        </button>
      </div>
    </div>
  );
}
