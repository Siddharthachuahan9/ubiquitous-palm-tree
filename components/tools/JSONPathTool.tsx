'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import styles from './JSONPathTool.module.css';
import { useStudioStore } from '@/lib/store';
import { MonacoEditor } from '@/components/studio/MonacoEditor';
import { ShareButton } from '@/components/common/ShareButton';
import { JSONTreeViewer } from './JSONTreeViewer';
import { formatJSON } from '@/lib/utils/format';
import { useDebounce } from '@/hooks/useDebounce';
import {
  loadSessionHistory,
  saveSession,
  clearSessionHistory,
  deleteSession,
  formatSessionTimestamp,
  type JSONPathSession,
} from '@/lib/utils/sessionHistory';

export function JSONPathTool() {
  const {
    jsonSource,
    jsonpathQuery,
    jsonpathResults,
    jsonpathOutputPaths,
    setJsonSource,
    setJsonpathQuery,
    setJsonpathOutputPaths,
    executeJsonPath,
    processing,
    error,
    processingTime,
    showToast,
  } = useStudioStore();

  const [viewMode, setViewMode] = useState<'editor' | 'tree'>('editor');
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<JSONPathSession[]>([]);

  // Load session history on mount
  useEffect(() => {
    setSessions(loadSessionHistory());
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          JSON.parse(content);
          setJsonSource(content);
          showToast('File uploaded successfully', 'success');
        } catch (error) {
          showToast('Invalid JSON file', 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [setJsonSource, showToast]
  );

  // Handle run query
  const handleRunQuery = useCallback(() => {
    if (!jsonSource) {
      showToast('Please provide JSON source', 'error');
      return;
    }
    if (!jsonpathQuery) {
      showToast('Please provide a JSONPath query', 'error');
      return;
    }
    executeJsonPath();
    saveSession(jsonSource, jsonpathQuery, jsonpathOutputPaths);
    setSessions(loadSessionHistory());
  }, [jsonSource, jsonpathQuery, jsonpathOutputPaths, executeJsonPath, showToast]);

  // Handle format
  const handleFormat = useCallback(() => {
    try {
      if (jsonSource) {
        setJsonSource(formatJSON(jsonSource));
        showToast('Formatted', 'success');
      }
    } catch (error) {
      showToast('Invalid JSON', 'error');
    }
  }, [jsonSource, setJsonSource, showToast]);

  // Handle clear
  const handleClear = useCallback(() => {
    setJsonSource('');
    setJsonpathQuery('');
    showToast('Cleared', 'info');
  }, [setJsonSource, setJsonpathQuery, showToast]);

  // Handle copy output
  const handleCopyOutput = useCallback(() => {
    if (!jsonpathResults || jsonpathResults.length === 0) {
      showToast('No results to copy', 'error');
      return;
    }
    const output = JSON.stringify(jsonpathResults.map((r) => r.value), null, 2);
    navigator.clipboard.writeText(output);
    showToast('Copied to clipboard', 'success');
  }, [jsonpathResults, showToast]);

  // Handle tree node click
  const handlePathClick = useCallback(
    (path: string) => {
      setJsonpathQuery(path);
      showToast('Path populated', 'info');
    },
    [setJsonpathQuery, showToast]
  );

  // Handle restore session
  const handleRestoreSession = useCallback(
    (session: JSONPathSession) => {
      setJsonSource(session.jsonSource);
      setJsonpathQuery(session.jsonpathQuery);
      setJsonpathOutputPaths(session.outputPaths);
      setShowHistory(false);
      showToast('Session restored', 'success');
    },
    [setJsonSource, setJsonpathQuery, setJsonpathOutputPaths, showToast]
  );

  // Handle clear history
  const handleClearHistory = useCallback(() => {
    clearSessionHistory();
    setSessions([]);
    setShowHistory(false);
    showToast('History cleared', 'info');
  }, [showToast]);

  // Handle delete session
  const handleDeleteSession = useCallback(
    (sessionId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      deleteSession(sessionId);
      setSessions(loadSessionHistory());
      showToast('Session deleted', 'info');
    },
    [showToast]
  );

  // Debounce JSON source for metrics
  const debouncedJsonSource = useDebounce(jsonSource, 500);

  // Calculate input metrics
  const inputMetrics = useMemo(() => {
    if (!debouncedJsonSource) return null;
    try {
      const parsed = JSON.parse(debouncedJsonSource);
      const size = new Blob([debouncedJsonSource]).size;
      const nodeCount = countNodes(parsed);
      const depth = calculateDepth(parsed);
      return {
        size: (size / 1024).toFixed(2),
        nodeCount,
        depth,
      };
    } catch {
      return null;
    }
  }, [debouncedJsonSource]);

  // Parse JSON for tree view
  const parsedJson = useMemo(() => {
    if (!jsonSource) return null;
    try {
      return JSON.parse(jsonSource);
    } catch {
      return null;
    }
  }, [jsonSource]);

  return (
    <div className={styles.container}>
      {/* Input Panel */}
      <div className={styles.inputPanel}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>JSONPath Query</h2>
            <p className={styles.subtitle}>
              Extract data from JSON documents using JSONPath expressions
            </p>
          </div>
          <div className={styles.headerActions}>
            {/* History Dropdown */}
            <div className={styles.historyContainer}>
              <button
                className={styles.historyButton}
                onClick={() => setShowHistory(!showHistory)}
                title="Session history"
              >
                <span>🕒</span>
                {sessions.length > 0 && (
                  <span className={styles.historyBadge}>{sessions.length}</span>
                )}
              </button>
              {showHistory && (
                <div className={styles.historyDropdown}>
                  <div className={styles.historyHeader}>
                    <span>Recent Sessions</span>
                    {sessions.length > 0 && (
                      <button
                        className={styles.clearHistoryButton}
                        onClick={handleClearHistory}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {sessions.length === 0 ? (
                    <div className={styles.historyEmpty}>No session history yet</div>
                  ) : (
                    <div className={styles.historyList}>
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={styles.historyItem}
                          onClick={() => handleRestoreSession(session)}
                        >
                          <div className={styles.historyItemHeader}>
                            <span className={styles.historyQuery}>
                              {session.jsonpathQuery}
                            </span>
                            <button
                              className={styles.deleteSessionButton}
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              title="Delete session"
                            >
                              ✕
                            </button>
                          </div>
                          <div className={styles.historyTime}>
                            {formatSessionTimestamp(session.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <ShareButton
              tool="jsonpath"
              data={{ jsonSource, query: jsonpathQuery, outputPaths: jsonpathOutputPaths }}
            />
          </div>
        </div>

        {/* Query Input */}
        <div className={styles.inputGroup}>
          <label htmlFor="jsonpath-query" className={styles.label}>
            JSONPath Expression
          </label>
          <input
            id="jsonpath-query"
            type="text"
            className={styles.queryInput}
            placeholder="$.users[?(@.age > 25)].name"
            value={jsonpathQuery}
            onChange={(e) => setJsonpathQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleRunQuery();
              }
            }}
          />
          <div className={styles.queryHint}>
            Examples: <code>$.users[*].name</code>{' '}
            <code>$.items[?(@.price &lt; 100)]</code> <code>$..email</code>
          </div>
        </div>

        {/* Options */}
        <div className={styles.options}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={jsonpathOutputPaths}
              onChange={(e) => setJsonpathOutputPaths(e.target.checked)}
            />
            <span>Output Paths instead of Values</span>
          </label>
        </div>

        {/* JSON Source Input */}
        <div className={styles.inputGroup}>
          <div className={styles.labelRow}>
            <label htmlFor="json-source" className={styles.label}>
              JSON Source
              {inputMetrics && (
                <span className={styles.metrics}>
                  {inputMetrics.size} KB · {inputMetrics.nodeCount} nodes · depth{' '}
                  {inputMetrics.depth}
                </span>
              )}
            </label>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewButton} ${
                  viewMode === 'editor' ? styles.viewActive : ''
                }`}
                onClick={() => setViewMode('editor')}
                title="Editor View"
              >
                📝
              </button>
              <button
                className={`${styles.viewButton} ${
                  viewMode === 'tree' ? styles.viewActive : ''
                }`}
                onClick={() => setViewMode('tree')}
                title="Tree View (click nodes to populate path)"
              >
                🌳
              </button>
            </div>
          </div>
          <div className={styles.editorContainer}>
            {viewMode === 'editor' ? (
              <MonacoEditor
                value={jsonSource}
                onChange={setJsonSource}
                placeholder="Paste your JSON here, or upload a file"
                language="json"
              />
            ) : (
              <div className={styles.treeContainer}>
                <JSONTreeViewer data={parsedJson} onPathClick={handlePathClick} />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <input
            type="file"
            id="file-upload"
            accept=".json,application/json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload" className={styles.secondaryButton}>
            📂 Upload JSON
          </label>
          <button className={styles.secondaryButton} onClick={handleFormat}>
            ✨ Format
          </button>
          <button className={styles.secondaryButton} onClick={handleClear}>
            🗑️ Clear
          </button>
          <button
            className={styles.primaryButton}
            onClick={handleRunQuery}
            disabled={processing || !jsonSource || !jsonpathQuery}
          >
            {processing ? '⏳ Running...' : '▶️ Run Query'}
          </button>
        </div>

        <div className={styles.privacyNotice}>
          <span className={styles.lockIcon}>🔒</span>
          <span>Your data never leaves this browser</span>
        </div>
      </div>

      {/* Results Panel */}
      <div className={styles.resultsPanel}>
        <div className={styles.resultsHeader}>
          <h3 className={styles.resultsTitle}>Query Results</h3>
          {jsonpathResults && jsonpathResults.length > 0 && (
            <div className={styles.resultsActions}>
              <span className={styles.resultCount}>
                {jsonpathResults.length} match{jsonpathResults.length !== 1 ? 'es' : ''}
                {processingTime && <span className={styles.time}>({processingTime}ms)</span>}
              </span>
              <button className={styles.copyButton} onClick={handleCopyOutput}>
                📋 Copy
              </button>
            </div>
          )}
        </div>

        <div className={styles.resultsContent}>
          {error && (
            <div className={styles.error}>
              <span className={styles.errorIcon}>⚠️</span>
              <div>
                <div className={styles.errorTitle}>Query Error</div>
                <div className={styles.errorText}>{error}</div>
              </div>
            </div>
          )}

          {!error && !jsonpathResults && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🔍</span>
              <div className={styles.emptyTitle}>Ready to query</div>
              <div className={styles.emptyText}>
                Write a JSONPath expression and click &ldquo;Run Query&rdquo; to extract data
              </div>
            </div>
          )}

          {!error && jsonpathResults && jsonpathResults.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🔍</span>
              <div className={styles.emptyTitle}>No matches found</div>
              <div className={styles.emptyText}>
                This JSONPath expression didn&apos;t match any data in the JSON
              </div>
            </div>
          )}

          {!error && jsonpathResults && jsonpathResults.length > 0 && (
            <div className={styles.resultsList}>
              {jsonpathResults.map((result, index) => (
                <div key={index} className={styles.result}>
                  <div className={styles.resultMeta}>
                    <span className={styles.resultIndex}>#{index + 1}</span>
                    <span className={styles.resultType}>{result.type}</span>
                    <span className={styles.resultPath}>{result.path}</span>
                  </div>
                  <div className={styles.resultValue}>
                    <pre className={styles.resultCode}>
                      {JSON.stringify(result.value, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function countNodes(obj: any): number {
  let count = 0;
  function traverse(node: any) {
    count++;
    if (typeof node === 'object' && node !== null) {
      Object.values(node).forEach(traverse);
    }
  }
  traverse(obj);
  return count;
}

function calculateDepth(obj: any): number {
  if (typeof obj !== 'object' || obj === null) {
    return 0;
  }
  let maxDepth = 0;
  Object.values(obj).forEach((value) => {
    const depth = calculateDepth(value);
    maxDepth = Math.max(maxDepth, depth);
  });
  return maxDepth + 1;
}
