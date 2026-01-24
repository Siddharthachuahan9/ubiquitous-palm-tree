'use client';

import styles from './EditorPanel.module.css';
import type { Mode } from './StudioShell';

interface EditorPanelProps {
  mode: Mode;
}

export function EditorPanel({ mode }: EditorPanelProps) {
  return (
    <div className={styles.panel}>
      {mode === 'diff' && (
        <div className={styles.diffMode}>
          <div className={styles.editorContainer}>
            <div className={styles.editorHeader}>
              <span className={styles.editorLabel}>JSON A</span>
            </div>
            <div className={styles.editorPlaceholder}>
              <div className={styles.placeholderContent}>
                <span className={styles.placeholderIcon}>←</span>
                <p className={styles.placeholderText}>Paste or upload your first JSON</p>
                <p className={styles.placeholderHint}>Cmd+V to paste</p>
              </div>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.editorContainer}>
            <div className={styles.editorHeader}>
              <span className={styles.editorLabel}>JSON B</span>
            </div>
            <div className={styles.editorPlaceholder}>
              <div className={styles.placeholderContent}>
                <span className={styles.placeholderIcon}>←</span>
                <p className={styles.placeholderText}>Paste or upload your second JSON</p>
                <p className={styles.placeholderHint}>Cmd+V to paste</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'jsonpath' && (
        <div className={styles.jsonpathMode}>
          <div className={styles.querySection}>
            <div className={styles.editorHeader}>
              <span className={styles.editorLabel}>JSONPath Expression</span>
            </div>
            <div className={styles.queryInput}>
              <input
                type="text"
                className={styles.queryField}
                placeholder="$.users[?(@.age > 25)].name"
              />
            </div>
          </div>

          <div className={styles.editorContainer}>
            <div className={styles.editorHeader}>
              <span className={styles.editorLabel}>JSON Source</span>
            </div>
            <div className={styles.editorPlaceholder}>
              <div className={styles.placeholderContent}>
                <span className={styles.placeholderIcon}>⌘</span>
                <p className={styles.placeholderText}>Paste your JSON to query</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'validate' && (
        <div className={styles.validateMode}>
          <div className={styles.editorContainer}>
            <div className={styles.editorHeader}>
              <span className={styles.editorLabel}>JSON Document</span>
            </div>
            <div className={styles.editorPlaceholder}>
              <div className={styles.placeholderContent}>
                <span className={styles.placeholderIcon}>✓</span>
                <p className={styles.placeholderText}>Paste JSON to validate</p>
                <p className={styles.placeholderHint}>Real-time validation & linting</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.actionBar}>
        {mode === 'diff' && (
          <button className={styles.primaryButton}>Compare</button>
        )}
        {mode === 'jsonpath' && (
          <button className={styles.primaryButton}>Execute Query</button>
        )}
        {mode === 'validate' && (
          <button className={styles.primaryButton}>Analyze</button>
        )}
        <button className={styles.secondaryButton}>Format</button>
        <button className={styles.secondaryButton}>Clear</button>
      </div>
    </div>
  );
}
