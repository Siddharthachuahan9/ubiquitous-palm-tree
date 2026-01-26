'use client';

import { useState } from 'react';
import { WorkspacePanel } from '@/components/studio/WorkspacePanel';
import { EditorPanel } from '@/components/studio/EditorPanel';
import { InspectorPanel } from '@/components/studio/InspectorPanel';
import { Toast } from '@/components/studio/Toast';
import styles from './JSONTools.module.css';

export type JSONToolMode = 'diff' | 'jsonpath' | 'validate';

interface JSONToolsProps {
  initialMode?: JSONToolMode;
}

export function JSONTools({ initialMode = 'diff' }: JSONToolsProps) {
  const [mode, setMode] = useState<JSONToolMode>(initialMode);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  return (
    <div className={styles.container}>
      {/* Mode Selector */}
      <div className={styles.modeSelector}>
        <button
          className={mode === 'diff' ? styles.modeActive : styles.modeButton}
          onClick={() => setMode('diff')}
        >
          <span className={styles.modeIcon}>⚖️</span>
          <span className={styles.modeLabel}>Diff</span>
        </button>
        <button
          className={mode === 'jsonpath' ? styles.modeActive : styles.modeButton}
          onClick={() => setMode('jsonpath')}
        >
          <span className={styles.modeIcon}>🔍</span>
          <span className={styles.modeLabel}>Query</span>
        </button>
        <button
          className={mode === 'validate' ? styles.modeActive : styles.modeButton}
          onClick={() => setMode('validate')}
        >
          <span className={styles.modeIcon}>✓</span>
          <span className={styles.modeLabel}>Validate</span>
        </button>

        <div className={styles.spacer}></div>

        <button
          className={styles.panelToggle}
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          title="Toggle workspace panel"
        >
          📁
        </button>
        <button
          className={styles.panelToggle}
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          title="Toggle inspector panel"
        >
          📊
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {leftPanelOpen && (
          <aside className={styles.leftPanel}>
            <WorkspacePanel />
          </aside>
        )}

        <main className={styles.centerPanel}>
          <EditorPanel mode={mode} />
        </main>

        {rightPanelOpen && (
          <aside className={styles.rightPanel}>
            <InspectorPanel mode={mode} />
          </aside>
        )}
      </div>

      <Toast />
    </div>
  );
}
