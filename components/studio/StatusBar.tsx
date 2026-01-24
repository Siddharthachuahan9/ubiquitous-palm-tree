'use client';

import styles from './StatusBar.module.css';

export function StatusBar() {
  // These will be connected to actual state later
  const fileSize = '0 KB';
  const cursorPosition = 'Ln 1, Col 1';
  const validationStatus = 'Ready';
  const processingTime = '';

  return (
    <div className={styles.statusBar}>
      <div className={styles.left}>
        <span className={styles.item}>
          <span className={styles.icon}>📄</span>
          <span>{fileSize}</span>
        </span>
        <span className={styles.separator}>|</span>
        <span className={styles.item}>{cursorPosition}</span>
        <span className={styles.separator}>|</span>
        <span className={styles.item}>
          <span className={styles.statusIndicator} data-status="ready"></span>
          <span>{validationStatus}</span>
        </span>
      </div>

      <div className={styles.right}>
        {processingTime && (
          <>
            <span className={styles.item}>
              <span className={styles.icon}>⚡</span>
              <span>{processingTime}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
