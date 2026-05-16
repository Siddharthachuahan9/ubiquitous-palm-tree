'use client';

import { useRef } from 'react';
import styles from './WorkspacePanel.module.css';
import { useStudioStore } from '@/lib/store';
import { useFileUpload } from '@/hooks/useFileUpload';

export function WorkspacePanel() {
  const { mode, setJsonA, setJsonB, setJsonSource, clearAll, showToast } = useStudioStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { handleInputChange } = useFileUpload({
    onFileLoad: (content) => {
      if (mode === 'diff') {
        const store = useStudioStore.getState();
        if (!store.jsonA) {
          setJsonA(content);
        } else if (!store.jsonB) {
          setJsonB(content);
        } else {
          setJsonA(content);
        }
      } else {
        setJsonSource(content);
      }
    },
    onError: (error) => {
      showToast(error, 'error');
    },
  });

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Workspace</span>
      </div>

      <div className={styles.content}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        <div className={styles.section}>
          <p className={styles.sectionLabel}>Actions</p>
          <button className={styles.actionBtn} onClick={() => fileInputRef.current?.click()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload JSON
          </button>
          <button className={styles.actionBtn} onClick={clearAll}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Clear All
          </button>
        </div>

        <div className={styles.section}>
          <p className={styles.sectionLabel}>Shortcuts</p>
          <div className={styles.shortcutList}>
            <div className={styles.shortcut}>
              <span className={styles.shortcutKeys}>
                <kbd>⌘</kbd><kbd>V</kbd>
              </span>
              <span className={styles.shortcutDesc}>Paste JSON</span>
            </div>
            <div className={styles.shortcut}>
              <span className={styles.shortcutKeys}>
                <kbd>⌘</kbd><kbd>↵</kbd>
              </span>
              <span className={styles.shortcutDesc}>Run / Compare</span>
            </div>
            <div className={styles.shortcut}>
              <span className={styles.shortcutKeys}>
                <kbd>⌘</kbd><kbd>K</kbd>
              </span>
              <span className={styles.shortcutDesc}>Switch tool</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.credit}>built by sidheart ❤️</span>
      </div>
    </div>
  );
}
