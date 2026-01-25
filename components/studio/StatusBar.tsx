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

  // Determine validation status
  let validationStatus = 'Ready';
  let statusType: 'ready' | 'error' | 'warning' | 'processing' = 'ready';

  if (processing) {
    validationStatus = 'Processing...';
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
          <span className={styles.icon}>📄</span>
          <span>{formatBytes(fileSize)}</span>
        </span>
        <span className={styles.separator}>|</span>
        <span className={styles.item}>
          <span className={styles.statusIndicator} data-status={statusType}></span>
          <span>{validationStatus}</span>
        </span>
        {error && (
          <>
            <span className={styles.separator}>|</span>
            <span className={styles.item} style={{ color: 'var(--color-error)' }}>
              {error}
            </span>
          </>
        )}
      </div>

      <div className={styles.right}>
        {processingTime !== null && (
          <span className={styles.item}>
            <span className={styles.icon}>⚡</span>
            <span>{processingTime}ms</span>
          </span>
        )}
        <span className={styles.separator}>|</span>
        <span className={styles.item}>
          <span className={styles.credit}>created by sidheart</span>
        </span>
      </div>
    </div>
  );
}
