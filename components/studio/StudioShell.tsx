'use client';

import { useState } from 'react';
import styles from './StudioShell.module.css';
import { Toolbar } from './Toolbar';
import { StatusBar } from './StatusBar';
import { WorkspacePanel } from './WorkspacePanel';
import { EditorPanel } from './EditorPanel';
import { InspectorPanel } from './InspectorPanel';
import { Toast } from './Toast';

export type Mode = 'diff' | 'jsonpath' | 'validate';

export function StudioShell() {
  const [mode, setMode] = useState<Mode>('diff');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  return (
    <div className={styles.shell}>
      <Toolbar
        mode={mode}
        onModeChange={setMode}
        onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
        onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
      />

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

      <StatusBar />
      <Toast />
    </div>
  );
}
