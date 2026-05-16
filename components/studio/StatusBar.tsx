'use client';

import styles from './StatusBar.module.css';
import { useStudioStore } from '@/lib/store';
import { formatBytes } from '@/lib/utils/format';

export function StatusBar() {
  const {
    fileSize,
    processing,
    error,
    processingTime,
    diffResults,
    jsonpathResults,
    validationResults,
  } = useStudioStore();

  let validationStatus = 'Ready';
  let statusType: 'ready' | 'error' | 'warning' | 'processing' = 'ready';

  if (processing) {
    validationStatus = 'Processing';
    statusType = 'processing';
  } else if (error) {
    validationStatus = 'Error';
    statusType = 'error';
  } else if (validationResults && !validationResults.valid) {
    validationStatus = 'Invalid JSON';
    statusType = 'error';
  } else if (diffResults) {
    validationStatus = `${diffResults.additions + diffResults.deletions + diffResults.modifications} changes`;
    statusType = 'ready';
  } else if (jsonpathResults) {
    validationStatus = `${jsonpathResults.length} matches`;
    statusType = 'ready';
  } else if (validationResults && validationResults.valid) {
    validationStatus = 'Valid JSON';
    statusType = 'ready';
  }

  return (
    <div className={styles.statusBar}>
      <div className={styles.left}>
        <span className={styles.item}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span>{formatBytes(fileSize)}</span>
        </span>
        <span className={styles.separator} aria-hidden>·</span>
        <span className={styles.item}>
          <span className={styles.statusIndicator} data-status={statusType} />
          <span>{validationStatus}</span>
        </span>
        {error && (
          <>
            <span className={styles.separator} aria-hidden>·</span>
            <span className={styles.item} style={{ color: 'var(--color-error)' }}>
              {error}
            </span>
          </>
        )}
      </div>

      <div className={styles.right}>
        {processingTime !== null && (
          <>
            <span className={styles.item}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>{processingTime}ms</span>
            </span>
            <span className={styles.separator} aria-hidden>·</span>
          </>
        )}
        <span className={styles.item}>
          <span className={styles.credit}>json0.dev</span>
        </span>
      </div>
    </div>
  );
}
