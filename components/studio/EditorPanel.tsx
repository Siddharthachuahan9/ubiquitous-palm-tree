'use client';

import { useCallback, useRef } from 'react';
import styles from './EditorPanel.module.css';
import type { Mode } from './StudioShell';
import { MonacoEditor } from './MonacoEditor';
import { useStudioStore } from '@/lib/store';
import { formatJSON } from '@/lib/utils/format';
import { useEditorContext } from '@/lib/contexts/EditorContext';

// Debug logging
const DEBUG = true;
const log = (msg: string, data?: any) => {
  if (DEBUG) {
    const timestamp = performance.now().toFixed(2);
    console.log(`[EditorPanel ${timestamp}ms] ${msg}`, data !== undefined ? data : '');
  }
};

interface EditorPanelProps {
  mode: Mode;
}

export function EditorPanel({ mode }: EditorPanelProps) {
  const renderCount = useRef(0);
  renderCount.current++;
  log('RENDER', { count: renderCount.current, mode });
  const {
    jsonA,
    jsonB,
    jsonSource,
    jsonpathQuery,
    setJsonA,
    setJsonB,
    setJsonSource,
    setJsonpathQuery,
    executeDiff,
    executeJsonPath,
    executeValidation,
    clearAll,
    processing,
  } = useStudioStore();

  // Get editor refs from context (always call hook, use conditionally)
  const editorContext = useEditorContext();

  const handleFormat = useCallback(() => {
    try {
      if (mode === 'diff') {
        if (jsonA) setJsonA(formatJSON(jsonA));
        if (jsonB) setJsonB(formatJSON(jsonB));
      } else {
        if (jsonSource) setJsonSource(formatJSON(jsonSource));
      }
    } catch (error) {
      console.error('Format error:', error);
    }
  }, [mode, jsonA, jsonB, jsonSource, setJsonA, setJsonB, setJsonSource]);

  return (
    <div className={styles.panel}>
      {mode === 'diff' && (
        <div className={styles.diffMode}>
          <div className={styles.editorContainer}>
            <div className={styles.editorHeader}>
              <span className={styles.editorLabel}>Before</span>
            </div>
            <MonacoEditor
              value={jsonA}
              onChange={setJsonA}
              placeholder="Paste your first JSON here, or click Upload"
              editorRef={editorContext?.editorA}
            />
          </div>

          <div className={styles.divider}></div>

          <div className={styles.editorContainer}>
            <div className={styles.editorHeader}>
              <span className={styles.editorLabel}>After</span>
            </div>
            <MonacoEditor
              value={jsonB}
              onChange={setJsonB}
              placeholder="Paste your second JSON here to compare"
              editorRef={editorContext?.editorB}
            />
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
                value={jsonpathQuery}
                onChange={(e) => setJsonpathQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    executeJsonPath();
                  }
                }}
              />
            </div>
          </div>

          <div className={styles.editorContainer}>
            <div className={styles.editorHeader}>
              <span className={styles.editorLabel}>JSON Source</span>
            </div>
            <MonacoEditor
              value={jsonSource}
              onChange={setJsonSource}
              placeholder="Paste your JSON to query"
            />
          </div>
        </div>
      )}

      {mode === 'validate' && (
        <div className={styles.validateMode}>
          <div className={styles.editorContainer}>
            <div className={styles.editorHeader}>
              <span className={styles.editorLabel}>JSON Document</span>
            </div>
            <MonacoEditor
              value={jsonSource}
              onChange={setJsonSource}
              placeholder="Paste JSON to validate"
            />
          </div>
        </div>
      )}

      <div className={styles.actionBar}>
        {mode === 'diff' && (
          <button
            className={styles.primaryButton}
            onClick={executeDiff}
            disabled={processing || !jsonA || !jsonB}
          >
            {processing ? 'Processing...' : 'Compare'}
          </button>
        )}
        {mode === 'jsonpath' && (
          <button
            className={styles.primaryButton}
            onClick={executeJsonPath}
            disabled={processing || !jsonSource || !jsonpathQuery}
          >
            {processing ? 'Finding matches...' : 'Run Query'}
          </button>
        )}
        {mode === 'validate' && (
          <button
            className={styles.primaryButton}
            onClick={executeValidation}
            disabled={processing || !jsonSource}
          >
            {processing ? 'Checking...' : 'Check JSON'}
          </button>
        )}
        <button className={styles.secondaryButton} onClick={handleFormat}>
          Format
        </button>
        <button className={styles.secondaryButton} onClick={clearAll}>
          Clear
        </button>
      </div>
    </div>
  );
}
