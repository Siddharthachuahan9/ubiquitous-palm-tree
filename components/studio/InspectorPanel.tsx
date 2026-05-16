'use client';

import { useState } from 'react';
import styles from './InspectorPanel.module.css';
import type { Mode } from './StudioShell';
import { useStudioStore } from '@/lib/store';
import { DiffResultsView } from './DiffResultsView';
import { JSONPathResults } from './JSONPathResults';
import { ValidationResults } from './ValidationResults';
import { exportJSONPatch, exportDiffHTML, exportDiffMarkdown } from '@/lib/export/exporter';

interface InspectorPanelProps {
  mode: Mode;
}

function EmptyDiff() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
          <path d="M15 3h4a2 2 0 0 0 2 2v14a2 2 0 0 0-2 2h-4" />
          <line x1="12" y1="3" x2="12" y2="21" />
        </svg>
      </div>
      <p className={styles.emptyTitle}>Ready to compare</p>
      <p className={styles.emptyHint}>Paste JSON in both panels, then click Compare</p>
    </div>
  );
}

function EmptyQuery() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <p className={styles.emptyTitle}>Ready to query</p>
      <p className={styles.emptyHint}>Write a JSONPath expression and run it</p>
      <div className={styles.emptyCode}>
        <code>$.users[*].name</code>
      </div>
    </div>
  );
}

function EmptyValidate() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      <p className={styles.emptyTitle}>Ready to validate</p>
      <p className={styles.emptyHint}>Paste JSON and click Check</p>
    </div>
  );
}

export function InspectorPanel({ mode }: InspectorPanelProps) {
  const { diffResults, jsonpathResults, validationResults, jsonA, jsonB } = useStudioStore();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (format: 'patch' | 'html' | 'markdown') => {
    if (!diffResults) return;
    switch (format) {
      case 'patch': exportJSONPatch(diffResults.patch); break;
      case 'html': exportDiffHTML(diffResults, jsonA, jsonB); break;
      case 'markdown': exportDiffMarkdown(diffResults); break;
    }
    setShowExportMenu(false);
  };

  const panelTitle =
    mode === 'diff' ? 'Results' :
    mode === 'jsonpath' ? 'Query Results' :
    'Validation';

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>{panelTitle}</span>
      </div>

      <div className={styles.content}>
        {mode === 'diff' && (diffResults ? <DiffResultsView results={diffResults} /> : <EmptyDiff />)}
        {mode === 'jsonpath' && (jsonpathResults ? <JSONPathResults results={jsonpathResults} /> : <EmptyQuery />)}
        {mode === 'validate' && (validationResults ? <ValidationResults results={validationResults} /> : <EmptyValidate />)}
      </div>

      {mode === 'diff' && diffResults && (
        <div className={styles.footer}>
          <div className={styles.exportWrap}>
            <button className={styles.exportBtn} onClick={() => setShowExportMenu(!showExportMenu)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>
            {showExportMenu && (
              <div className={styles.exportMenu}>
                <button onClick={() => handleExport('patch')}>JSON Patch</button>
                <button onClick={() => handleExport('html')}>HTML Report</button>
                <button onClick={() => handleExport('markdown')}>Markdown</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
