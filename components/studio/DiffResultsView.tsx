'use client';

import { useState, useCallback, useMemo, useRef, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { diffChars } from 'diff';
import styles from './DiffResultsView.module.css';
import type { DiffResult, DiffMode, DiffChange } from '@/types/studio';
import { MonacoEditor } from './MonacoEditor';
import { useEditorContext } from '@/lib/contexts/EditorContext';
import { useStudioStore } from '@/lib/store';

interface DiffResultsViewProps {
  results: DiffResult;
}

// Threshold for enabling virtualization
const VIRTUALIZATION_THRESHOLD = 100;
// Estimated height per change item for virtualization
const ESTIMATED_ITEM_HEIGHT = 120;

/**
 * Memoized character-level diff component
 * Avoids recomputing diff on every render
 */
const MemoizedValueDiff = memo(function ValueDiff({
  oldValue,
  newValue
}: {
  oldValue: any;
  newValue: any;
}) {
  const diffResult = useMemo(() => {
    if (oldValue === undefined || newValue === undefined) {
      return null;
    }

    const oldStr = typeof oldValue === 'string' ? oldValue : JSON.stringify(oldValue, null, 2);
    const newStr = typeof newValue === 'string' ? newValue : JSON.stringify(newValue, null, 2);

    // Skip character diff for very large values (>10KB) - just show new value
    if (oldStr.length > 10000 || newStr.length > 10000) {
      return null;
    }

    return diffChars(oldStr, newStr);
  }, [oldValue, newValue]);

  if (!diffResult) {
    const value = newValue !== undefined ? newValue : oldValue;
    return <pre>{JSON.stringify(value, null, 2)}</pre>;
  }

  return (
    <pre>
      {diffResult.map((part, i) => (
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
});

/**
 * Simple value display without diff computation
 */
function renderSimpleValue(value: any) {
  return <pre>{JSON.stringify(value, null, 2)}</pre>;
}

/**
 * Format JSON path as breadcrumb - memoized
 */
const MemoizedPathBreadcrumb = memo(function PathBreadcrumb({ path }: { path: string }) {
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
  return <span>{path}</span>;
});

/**
 * Single change item component - memoized for virtualization
 */
const ChangeItem = memo(function ChangeItem({
  change,
  index,
  onChangeClick,
}: {
  change: DiffChange;
  index: number;
  onChangeClick: (change: DiffChange, index: number) => void;
}) {
  return (
    <div
      className={`${styles.change} ${styles[change.type]} ${styles.clickable}`}
      onClick={() => onChangeClick(change, index)}
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
      <div className={styles.changePath}>
        <MemoizedPathBreadcrumb path={change.path} />
      </div>

      {change.type === 'modify' ? (
        <div className={styles.changeValue}>
          <MemoizedValueDiff oldValue={change.oldValue} newValue={change.newValue} />
        </div>
      ) : (
        <>
          {change.oldValue !== undefined && (
            <div className={styles.changeValue}>
              <strong>Old:</strong>
              {renderSimpleValue(change.oldValue)}
            </div>
          )}
          {change.newValue !== undefined && (
            <div className={styles.changeValue}>
              <strong>New:</strong>
              {renderSimpleValue(change.newValue)}
            </div>
          )}
        </>
      )}
    </div>
  );
});

export function DiffResultsView({ results }: DiffResultsViewProps) {
  const [viewMode, setViewMode] = useState<DiffMode>('visual');
  const { navigateToBoth, highlightLine } = useEditorContext();
  const { showToast } = useStudioStore();
  const parentRef = useRef<HTMLDivElement>(null);

  // Determine if we need virtualization (>100 changes)
  const useVirtual = results.changes.length > VIRTUALIZATION_THRESHOLD;

  // Setup virtualizer for large change lists
  const rowVirtualizer = useVirtualizer({
    count: results.changes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ITEM_HEIGHT,
    overscan: 5, // Render 5 extra items above/below viewport
  });

  /**
   * Handle clicking a change entry - navigate both editors to the change location
   */
  const handleChangeClick = useCallback((change: DiffChange, index: number) => {
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

      <div className={styles.content} ref={parentRef}>
        {viewMode === 'visual' && (
          <>
            {results.changes.length === 0 && (
              <div className={styles.noChanges}>
                <span className={styles.noChangesIcon}>✓</span>
                <p>No differences found. JSONs are identical!</p>
              </div>
            )}

            {/* Large change count warning */}
            {results.changes.length > 1000 && (
              <div className={styles.performanceWarning}>
                <span className={styles.warningIcon}>⚡</span>
                <p>
                  {results.changes.length.toLocaleString()} changes detected.
                  Using virtualized rendering for performance.
                </p>
              </div>
            )}

            {/* Virtualized list for large change sets */}
            {useVirtual && results.changes.length > 0 && (
              <div
                className={styles.virtualizedList}
                style={{
                  height: '100%',
                  width: '100%',
                  overflow: 'auto',
                }}
              >
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const change = results.changes[virtualRow.index];
                    return (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                          padding: '0 0 var(--space-3) 0',
                        }}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                      >
                        <ChangeItem
                          change={change}
                          index={virtualRow.index}
                          onChangeClick={handleChangeClick}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Regular list for small change sets */}
            {!useVirtual && results.changes.length > 0 && (
              <div className={styles.changesList}>
                {results.changes.map((change, index) => (
                  <ChangeItem
                    key={index}
                    change={change}
                    index={index}
                    onChangeClick={handleChangeClick}
                  />
                ))}
              </div>
            )}
          </>
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
