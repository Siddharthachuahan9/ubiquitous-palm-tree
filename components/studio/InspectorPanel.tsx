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

export function InspectorPanel({ mode }: InspectorPanelProps) {
  const {
    diffResults,
    jsonpathResults,
    validationResults,
    jsonA,
    jsonB,
  } = useStudioStore();

  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (format: 'patch' | 'html' | 'markdown') => {
    if (!diffResults) return;

    switch (format) {
      case 'patch':
        exportJSONPatch(diffResults.patch);
        break;
      case 'html':
        exportDiffHTML(diffResults, jsonA, jsonB);
        break;
      case 'markdown':
        exportDiffMarkdown(diffResults);
        break;
    }

    setShowExportMenu(false);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {mode === 'diff' && 'Comparison Results'}
          {mode === 'jsonpath' && 'Query Results'}
          {mode === 'validate' && 'Validation Results'}
        </h2>
      </div>

      <div className={styles.content}>
        {mode === 'diff' && (
          <>
            {diffResults ? (
              <DiffResultsView results={diffResults} />
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>◬</span>
                <p className={styles.emptyTitle}>Ready to compare</p>
                <p className={styles.emptyHint}>
                  Paste two JSONs in the Before/After panels, then click Compare
                </p>
              </div>
            )}
          </>
        )}

        {mode === 'jsonpath' && (
          <>
            {jsonpathResults ? (
              <JSONPathResults results={jsonpathResults} />
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🔍</span>
                <p className={styles.emptyTitle}>Ready to query</p>
                <p className={styles.emptyHint}>
                  Write a JSONPath expression and click &quot;Run Query&quot;
                </p>
                <p className={styles.emptyExample}>
                  Example: <code>$.users[?(@.age &gt; 25)].name</code>
                </p>
              </div>
            )}
          </>
        )}

        {mode === 'validate' && (
          <>
            {validationResults ? (
              <ValidationResults results={validationResults} />
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>✓</span>
                <p className={styles.emptyTitle}>Ready to validate</p>
                <p className={styles.emptyHint}>
                  Paste JSON in the panel and click &quot;Check JSON&quot;
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {mode === 'diff' && diffResults && (
        <div className={styles.footer}>
          <div className={styles.exportContainer}>
            <button
              className={styles.exportButton}
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <span>↓</span>
              <span>Export</span>
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
