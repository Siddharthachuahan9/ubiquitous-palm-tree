'use client';

import styles from './WorkspacePanel.module.css';

export function WorkspacePanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Workspace</h2>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Session</h3>
          <button className={styles.button}>
            <span>📂</span>
            <span>Upload JSON</span>
          </button>
          <button className={styles.button}>
            <span>🗑️</span>
            <span>Clear All</span>
          </button>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Snapshots</h3>
          <div className={styles.emptyState}>
            <span>No snapshots yet</span>
          </div>
        </section>
      </div>
    </div>
  );
}
