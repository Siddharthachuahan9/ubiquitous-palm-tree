'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import styles from './JSONPathTool.module.css';
import { useStudioStore } from '@/lib/store';
import { MonacoEditor } from '@/components/studio/MonacoEditor';
import { ShareButton } from '@/components/common/ShareButton';
import { CopyButton } from '@/components/common/CopyButton';
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

  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'tree'>('editor');
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<JSONPathSession[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load session history on mount
  useEffect(() => {
    setSessions(loadSessionHistory());
  }, []);

  // Handle file upload
  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          // Validate JSON
          JSON.parse(content);
          setJsonSource(content);
          showToast('File uploaded successfully', 'success');
        } catch (error) {
          showToast('Invalid JSON file', 'error');
        }
      };
      reader.readAsText(file);

      // Reset input
      e.target.value = '';
    },
    [setJsonSource, showToast]
  );

  // Handle clear
  const handleClear = useCallback(() => {
    setJsonSource('');
    setJsonpathQuery('');
    showToast('Cleared', 'info');
  }, [setJsonSource, setJsonpathQuery, showToast]);

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

    // Save to session history after successful execution
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

  // Handle copy output
  const handleCopyOutput = useCallback(() => {
    if (!jsonpathResults || jsonpathResults.length === 0) {
      showToast('No results to copy', 'error');
      return;
    }

    const output = JSON.stringify(
      jsonpathResults.map((r) => r.value),
      null,
      2
    );
    navigator.clipboard.writeText(output);
    showToast('Copied to clipboard', 'success');
  }, [jsonpathResults, showToast]);

  // Handle tree node click - populate JSONPath query
  const handlePathClick = useCallback(
    (path: string) => {
      setJsonpathQuery(path);
      showToast('Path populated', 'info');
      // Auto-focus on query input (optional)
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

  // Handle clear all sessions
  const handleClearHistory = useCallback(() => {
    clearSessionHistory();
    setSessions([]);
    setShowHistory(false);
    showToast('History cleared', 'info');
  }, [showToast]);

  // Handle delete single session
  const handleDeleteSession = useCallback(
    (sessionId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      deleteSession(sessionId);
      setSessions(loadSessionHistory());
      showToast('Session deleted', 'info');
    },
    [showToast]
  );

  // Draggable resize handle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newPosition = ((e.clientX - rect.left) / rect.width) * 100;

      // Clamp between 20% and 80%
      const clampedPosition = Math.max(20, Math.min(80, newPosition));
      setSplitPosition(clampedPosition);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Auto-scroll to results after execution
  useEffect(() => {
    if (jsonpathResults && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [jsonpathResults]);

  // Debounce JSON source for expensive calculations
  const debouncedJsonSource = useDebounce(jsonSource, 500);

  // Calculate input metrics with debouncing and memoization
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

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Tool Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>JSONPath Query</h1>
          <p className={styles.description}>
            Extract data from JSON documents using JSONPath expressions
          </p>
        </div>
        <div className={styles.headerRight}>
          {/* Session History Dropdown */}
          <div className={styles.historyContainer}>
            <button
              className={styles.actionButton}
              onClick={() => setShowHistory(!showHistory)}
              title="Session history"
            >
              <span>🕒</span>
              <span>History</span>
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
                  <div className={styles.historyEmpty}>
                    No session history yet
                  </div>
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
                        <div className={styles.historyItemFooter}>
                          <span className={styles.historyTime}>
                            {formatSessionTimestamp(session.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button className={styles.actionButton} onClick={handleUpload}>
            <span>📂</span>
            <span>Upload JSON</span>
          </button>
          <button className={styles.actionButton} onClick={handleClear}>
            <span>🗑️</span>
            <span>Clear</span>
          </button>
          <button
            className={`${styles.actionButton} ${styles.primaryButton}`}
            onClick={handleRunQuery}
            disabled={processing || !jsonSource || !jsonpathQuery}
          >
            <span>▶️</span>
            <span>{processing ? 'Running...' : 'Run Query'}</span>
          </button>
          <ShareButton
            tool="jsonpath"
            data={{
              jsonSource,
              query: jsonpathQuery,
              outputPaths: jsonpathOutputPaths,
            }}
          />
          <button
            className={styles.actionButton}
            onClick={handleCopyOutput}
            disabled={!jsonpathResults || jsonpathResults.length === 0}
          >
            <span>📋</span>
            <span>Copy Output</span>
          </button>
        </div>
      </header>

      {/* Main Content - 50/50 Split */}
      <div className={styles.mainContent}>
        {/* Left Panel - Input */}
        <div
          className={styles.leftPanel}
          style={{ width: `${splitPosition}%` }}
        >
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>JSON Source</div>
            {inputMetrics && (
              <div className={styles.metrics}>
                <span className={styles.metric}>
                  {inputMetrics.size} KB
                </span>
                <span className={styles.metric}>
                  {inputMetrics.nodeCount} nodes
                </span>
                <span className={styles.metric}>
                  depth: {inputMetrics.depth}
                </span>
              </div>
            )}
            <div className={styles.panelActions}>
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.viewButton} ${
                    viewMode === 'editor' ? styles.active : ''
                  }`}
                  onClick={() => setViewMode('editor')}
                  title="Editor View"
                >
                  📝
                </button>
                <button
                  className={`${styles.viewButton} ${
                    viewMode === 'tree' ? styles.active : ''
                  }`}
                  onClick={() => setViewMode('tree')}
                  title="Tree View (click to populate path)"
                >
                  🌳
                </button>
              </div>
              <button className={styles.smallButton} onClick={handleFormat}>
                Format
              </button>
            </div>
          </div>

          <div className={styles.querySection}>
            <label className={styles.queryLabel}>JSONPath Expression</label>
            <input
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
            <div className={styles.queryOptions}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={jsonpathOutputPaths}
                  onChange={(e) => setJsonpathOutputPaths(e.target.checked)}
                />
                <span>Output Paths</span>
              </label>
            </div>
          </div>

          <div className={styles.editorContainer}>
            {viewMode === 'editor' ? (
              <MonacoEditor
                value={jsonSource}
                onChange={setJsonSource}
                placeholder="Paste your JSON here, or click Upload JSON"
                language="json"
              />
            ) : (
              <JSONTreeViewer
                data={jsonSource ? (() => {
                  try {
                    return JSON.parse(jsonSource);
                  } catch {
                    return null;
                  }
                })() : null}
                onPathClick={handlePathClick}
              />
            )}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className={styles.resizeHandle}
          onMouseDown={handleMouseDown}
          title="Drag to resize"
        />

        {/* Right Panel - Output */}
        <div
          className={styles.rightPanel}
          style={{ width: `${100 - splitPosition}%` }}
        >
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Query Results</div>
            {jsonpathResults && (
              <div className={styles.resultCount}>
                {jsonpathResults.length} match
                {jsonpathResults.length !== 1 ? 'es' : ''}
                {processingTime && (
                  <span className={styles.time}>({processingTime}ms)</span>
                )}
              </div>
            )}
          </div>

          <div className={styles.resultsContainer} ref={resultsRef}>
            {error && (
              <div className={styles.errorPanel}>
                <div className={styles.errorIcon}>⚠️</div>
                <div className={styles.errorMessage}>{error}</div>
              </div>
            )}

            {!error && !jsonpathResults && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🔍</span>
                <p className={styles.emptyTitle}>Ready to query</p>
                <p className={styles.emptyHint}>
                  Write a JSONPath expression and click &quot;Run Query&quot;
                </p>
                <div className={styles.examples}>
                  <p className={styles.examplesTitle}>Examples:</p>
                  <code>$.users[*].name</code>
                  <code>$.items[?(@.price &lt; 100)]</code>
                  <code>$..email</code>
                </div>
                <p className={styles.privacyNote}>
                  🔒 Your data never leaves this browser
                </p>
              </div>
            )}

            {!error && jsonpathResults && jsonpathResults.length === 0 && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🔍</span>
                <p className={styles.emptyTitle}>No matches found</p>
                <p className={styles.emptyHint}>
                  No matches found for this JSONPath expression
                </p>
              </div>
            )}

            {!error && jsonpathResults && jsonpathResults.length > 0 && (
              <div className={styles.resultsList}>
                {jsonpathResults.map((result, index) => (
                  <div key={index} className={styles.result}>
                    <div className={styles.resultHeader}>
                      <span className={styles.resultIndex}>#{index + 1}</span>
                      <span className={styles.resultType}>{result.type}</span>
                    </div>
                    <div className={styles.resultPath}>{result.path}</div>
                    <div className={styles.resultValue}>
                      <MonacoEditor
                        value={JSON.stringify(result.value, null, 2)}
                        readOnly
                        language="json"
                        height="auto"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Badge */}
      <div className={styles.privacyBadge}>
        <span className={styles.lockIcon}>🔒</span>
        <span>Your data never leaves this browser</span>
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
