'use client';

import { useState, useCallback } from 'react';
import { diffChars } from 'diff';
import styles from './DiffResultsView.module.css';
import type { DiffResult, DiffMode } from '@/types/studio';
import { MonacoEditor } from './MonacoEditor';
import { useEditorContext } from '@/lib/contexts/EditorContext';
import { useStudioStore } from '@/lib/store';

interface DiffResultsViewProps {
  results: DiffResult;
}

/**
 * Render character-level diff for modified values
 */
function renderValueDiff(oldValue: any, newValue: any) {
  if (oldValue === undefined || newValue === undefined) {
    const value = newValue !== undefined ? newValue : oldValue;
    return <pre>{JSON.stringify(value, null, 2)}</pre>;
  }

  const oldStr = typeof oldValue === 'string' ? oldValue : JSON.stringify(oldValue, null, 2);
  const newStr = typeof newValue === 'string' ? newValue : JSON.stringify(newValue, null, 2);

  const diff = diffChars(oldStr, newStr);

  return (
    <pre>
      {diff.map((part, i) => (
        <span
          key={i}
          className={
            part.added ? styles.added :
            part.removed ? styles.removed :
            styles.unchanged
          }
        >
          {part.value}
        </span>
      ))}
    </pre>
  );
}

/**
 * Format JSON path as breadcrumb
 */
function formatPath(path: string) {
  // If it's already a formatted path (starts with $.), format nicely
  if (path.startsWith('$.')) {
    const parts = path.replace(/^\$\./, '').split('.');
    return (
      <div className={styles.pathBreadcrumb}>
        <span className={styles.pathPart}>$</span>
        {parts.map((part, i) => (
          <span key={i}>
            <span className={styles.pathSeparator}>.</span>
            <span className={styles.pathPart}>{part}</span>
          </span>
        ))}
      </div>
    );
  }

  // Otherwise just display as-is
  return <span>{path}</span>;
}

export function DiffResultsView({ results }: DiffResultsViewProps) {
  const [viewMode, setViewMode] = useState<DiffMode>('visual');
  const { navigateToBoth, highlightLine } = useEditorContext();
  const { showToast } = useStudioStore();

  /**
   * Handle clicking a change entry - navigate both editors to the change location
   */
  const handleChangeClick = useCallback((change: any, index: number) => {
    const lineA = change.lineA ?? 0;
    const lineB = change.lineB ?? 0;

    // Navigate both editors to the change location
    navigateToBoth(lineA, lineB);

    // Highlight the lines
    highlightLine('A', lineA);
    highlightLine('B', lineB);

    // Show toast notification
    showToast('Navigated to mismatch', 'info');
  }, [navigateToBoth, highlightLine, showToast]);

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
            {results.changes.length === 0 && (
              <div className={styles.noChanges}>
                <span className={styles.noChangesIcon}>✓</span>
                <p>No differences found. JSONs are identical!</p>
              </div>
            )}
            {results.changes.map((change, index) => (
              <div
                key={index}
                className={`${styles.change} ${styles[change.type]} ${styles.clickable}`}
                onClick={() => handleChangeClick(change, index)}
                title="Click to navigate to this change in editors"
              >
                <div className={styles.changeHeader}>
                  <div className={styles.changeType}>{change.type.toUpperCase()}</div>
                  <div className={styles.changeLocation}>
                    {change.lineA !== undefined && change.lineB !== undefined && (
                      <span className={styles.lineInfo}>
                        Before: Line {change.lineA + 1} • After: Line {change.lineB + 1}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.changePath}>{formatPath(change.path)}</div>

                {change.type === 'modify' ? (
                  <div className={styles.changeValue}>
                    {renderValueDiff(change.oldValue, change.newValue)}
                  </div>
                ) : (
                  <>
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
                  </>
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
