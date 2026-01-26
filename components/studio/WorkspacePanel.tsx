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
      // Determine which JSON slot to fill based on current mode
      if (mode === 'diff') {
        // For diff mode, alternate between jsonA and jsonB
        const store = useStudioStore.getState();
        if (!store.jsonA) {
          setJsonA(content);
        } else if (!store.jsonB) {
          setJsonB(content);
        } else {
          // Both filled, replace jsonA
          setJsonA(content);
        }
      } else {
        // For jsonpath and validate modes, use jsonSource
        setJsonSource(content);
      }
    },
    onError: (error) => {
      showToast(error, 'error');
    },
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Workspace</h2>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Session</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
          <button className={styles.button} onClick={handleUploadClick}>
            <span>📂</span>
            <span>Upload JSON</span>
          </button>
          <button className={styles.button} onClick={clearAll}>
            <span>🗑️</span>
            <span>Clear All</span>
          </button>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Quick Tips</h3>
          <div className={styles.tips}>
            <p className={styles.tip}>• Paste JSON with Cmd+V</p>
            <p className={styles.tip}>• Upload files up to 10MB</p>
            <p className={styles.tip}>• Cmd+Enter to execute query</p>
            <p className={styles.tip}>• Format JSON with Format button</p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.privacyNotice}>
            <span className={styles.privacyIcon}>🔒</span>
            <p className={styles.privacyText}>
              Your data never leaves this browser
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
