'use client';

import { useState } from 'react';
import { WorkspacePanel } from '@/components/studio/WorkspacePanel';
import { EditorPanel } from '@/components/studio/EditorPanel';
import { InspectorPanel } from '@/components/studio/InspectorPanel';
import { Toast } from '@/components/studio/Toast';
import { ShareButton } from '@/components/common/ShareButton';
import { useStudioStore } from '@/lib/store';
import { EditorProvider } from '@/lib/contexts/EditorContext';
import { useShareStateRestoration } from '@/hooks/useShareStateRestoration';
import styles from './JSONTools.module.css';

export type JSONToolMode = 'diff' | 'jsonpath' | 'validate';

interface JSONToolsProps {
  initialMode?: JSONToolMode;
}

export function JSONTools({ initialMode = 'diff' }: JSONToolsProps) {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [restoredFromShare, setRestoredFromShare] = useState(false);

  // Get current state for sharing
  const { jsonA, jsonB, jsonSource, jsonpathQuery, diffResults } = useStudioStore();

  // Restore state from shared URL on mount
  useShareStateRestoration({
    mode: initialMode,
    onRestore: () => {
      setRestoredFromShare(true);
    },
  });

  // Prepare share data based on mode
  const getShareData = () => {
    if (initialMode === 'diff') {
      return { jsonA, jsonB };
    } else if (initialMode === 'jsonpath') {
      return { jsonSource, query: jsonpathQuery };
    } else {
      return { jsonSource };
    }
  };

  return (
    <EditorProvider>
      <div className={styles.container}>
        {/* Panel Controls and Actions */}
        <div className={styles.toolbar}>
          <div className={styles.panelToggles}>
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

          <div className={styles.toolbarActions}>
            <ShareButton tool={initialMode} data={getShareData()} />
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {leftPanelOpen && (
            <aside className={styles.leftPanel}>
              <WorkspacePanel />
            </aside>
          )}

          <main className={styles.centerPanel}>
            <EditorPanel mode={initialMode} />
          </main>

          {rightPanelOpen && (
            <aside className={styles.rightPanel}>
              <InspectorPanel mode={initialMode} />
            </aside>
          )}
        </div>

        <Toast />
      </div>
    </EditorProvider>
  );
}
