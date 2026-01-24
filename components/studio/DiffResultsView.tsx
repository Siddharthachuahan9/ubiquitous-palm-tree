'use client';

import { useState } from 'react';
import styles from './DiffResultsView.module.css';
import type { DiffResult, DiffMode } from '@/types/studio';
import { MonacoEditor } from './MonacoEditor';

interface DiffResultsViewProps {
  results: DiffResult;
}

export function DiffResultsView({ results }: DiffResultsViewProps) {
  const [viewMode, setViewMode] = useState<DiffMode>('visual');

  return (
    <div className={styles.container}>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue} style={{ color: 'var(--color-diff-add)' }}>
            {results.additions}
          </span>
          <span className={styles.statLabel}>Additions</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue} style={{ color: 'var(--color-diff-remove)' }}>
            {results.deletions}
          </span>
          <span className={styles.statLabel}>Deletions</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue} style={{ color: 'var(--color-diff-change)' }}>
            {results.modifications}
          </span>
          <span className={styles.statLabel}>Changes</span>
        </div>
        {results.moves > 0 && (
          <div className={styles.stat}>
            <span className={styles.statValue} style={{ color: 'var(--color-diff-move)' }}>
              {results.moves}
            </span>
            <span className={styles.statLabel}>Moves</span>
          </div>
        )}
      </div>

      <div className={styles.modeSelector}>
        <button
          className={viewMode === 'visual' ? styles.modeBtnActive : styles.modeBtn}
          onClick={() => setViewMode('visual')}
        >
          Visual
        </button>
        <button
          className={viewMode === 'tree' ? styles.modeBtnActive : styles.modeBtn}
          onClick={() => setViewMode('tree')}
        >
          Tree
        </button>
        <button
          className={viewMode === 'patch' ? styles.modeBtnActive : styles.modeBtn}
          onClick={() => setViewMode('patch')}
        >
          Patch
        </button>
      </div>

      <div className={styles.content}>
        {viewMode === 'visual' && (
          <div className={styles.changesList}>
            {results.changes.map((change, index) => (
              <div key={index} className={`${styles.change} ${styles[change.type]}`}>
                <div className={styles.changeType}>{change.type.toUpperCase()}</div>
                <div className={styles.changePath}>{change.path}</div>
                {change.oldValue !== undefined && (
                  <div className={styles.changeValue}>
                    <strong>Old:</strong>
                    <pre>{JSON.stringify(change.oldValue, null, 2)}</pre>
                  </div>
                )}
                {change.newValue !== undefined && (
                  <div className={styles.changeValue}>
                    <strong>New:</strong>
                    <pre>{JSON.stringify(change.newValue, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {viewMode === 'tree' && (
          <div className={styles.treeView}>
            <MonacoEditor
              value={JSON.stringify(results.changes, null, 2)}
              readOnly
              language="json"
              height="400px"
            />
          </div>
        )}

        {viewMode === 'patch' && (
          <div className={styles.patchView}>
            <MonacoEditor
              value={JSON.stringify(results.patch, null, 2)}
              readOnly
              language="json"
              height="400px"
            />
          </div>
        )}
      </div>
    </div>
  );
}
