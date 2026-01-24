'use client';

import styles from './InspectorPanel.module.css';
import type { Mode } from './StudioShell';

interface InspectorPanelProps {
  mode: Mode;
}

export function InspectorPanel({ mode }: InspectorPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {mode === 'diff' && 'Diff Results'}
          {mode === 'jsonpath' && 'Query Results'}
          {mode === 'validate' && 'Integrity Report'}
        </h2>
      </div>

      <div className={styles.content}>
        {mode === 'diff' && (
          <>
            <div className={styles.modeSelector}>
              <button className={styles.modeBtnActive}>Visual</button>
              <button className={styles.modeBtn}>Tree</button>
              <button className={styles.modeBtn}>Patch</button>
            </div>

            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>◬</span>
              <p>Compare two JSON files to see differences</p>
            </div>
          </>
        )}

        {mode === 'jsonpath' && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔍</span>
            <p>Execute a query to see matching nodes</p>
          </div>
        )}

        {mode === 'validate' && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>✓</span>
            <p>Paste JSON to see validation results</p>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.exportButton}>
          <span>↓</span>
          <span>Export</span>
        </button>
      </div>
    </div>
  );
}
