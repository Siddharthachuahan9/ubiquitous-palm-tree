'use client';

import { useState, useCallback } from 'react';
import styles from './JSONTreeViewer.module.css';

interface JSONTreeViewerProps {
  data: any;
  onPathClick: (path: string) => void;
}

export function JSONTreeViewer({ data, onPathClick }: JSONTreeViewerProps) {
  if (!data || typeof data !== 'object') {
    return (
      <div className={styles.empty}>
        <p>Paste JSON to see tree view</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <TreeNode
        data={data}
        path="$"
        pathSegments={[]}
        onPathClick={onPathClick}
      />
    </div>
  );
}

interface TreeNodeProps {
  data: any;
  path: string;
  pathSegments: (string | number)[];
  onPathClick: (path: string) => void;
  isLast?: boolean;
}

function TreeNode({
  data,
  path,
  pathSegments,
  onPathClick,
  isLast = true,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const jsonPath = buildJSONPath(pathSegments);
      onPathClick(jsonPath);
    },
    [pathSegments, onPathClick]
  );

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
    },
    [isExpanded]
  );

  // Handle null and primitives
  if (data === null) {
    return (
      <div className={styles.node}>
        <button className={styles.nodeButton} onClick={handleClick}>
          <span className={styles.key}>{getKeyFromPath(path)}</span>
          <span className={styles.separator}>:</span>
          <span className={`${styles.value} ${styles.null}`}>null</span>
        </button>
      </div>
    );
  }

  if (typeof data !== 'object') {
    const type = typeof data;
    return (
      <div className={styles.node}>
        <button className={styles.nodeButton} onClick={handleClick}>
          <span className={styles.key}>{getKeyFromPath(path)}</span>
          <span className={styles.separator}>:</span>
          <span className={`${styles.value} ${styles[type]}`}>
            {formatValue(data, type)}
          </span>
        </button>
      </div>
    );
  }

  // Handle arrays and objects
  const isArray = Array.isArray(data);
  const entries = isArray
    ? data.map((item, index) => [index, item] as const)
    : Object.entries(data);
  const isEmpty = entries.length === 0;

  return (
    <div className={styles.node}>
      <div className={styles.nodeHeader}>
        {!isEmpty && (
          <button
            className={styles.expandButton}
            onClick={handleToggle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        <button
          className={styles.nodeButton}
          onClick={handleClick}
          title="Click to populate JSONPath"
        >
          <span className={styles.key}>{getKeyFromPath(path)}</span>
          <span className={styles.separator}>:</span>
          <span className={styles.type}>
            {isArray ? `Array[${data.length}]` : `Object{${entries.length}}`}
          </span>
        </button>
      </div>

      {isExpanded && !isEmpty && (
        <div className={styles.children}>
          {entries.map(([key, value], index) => {
            const childSegments = [...pathSegments, key];
            const childPath = isArray ? `${path}[${key}]` : `${path}.${key}`;

            return (
              <TreeNode
                key={String(key)}
                data={value}
                path={childPath}
                pathSegments={childSegments}
                onPathClick={onPathClick}
                isLast={index === entries.length - 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper functions
function getKeyFromPath(path: string): string {
  if (path === '$') return 'root';
  const match = path.match(/\.([^.[]+)$|\[(\d+)\]$/);
  if (!match) return path;
  return match[1] || `[${match[2]}]`;
}

function formatValue(value: any, type: string): string {
  if (type === 'string') {
    // Truncate long strings
    const str = String(value);
    return str.length > 50 ? `"${str.substring(0, 50)}..."` : `"${str}"`;
  }
  return String(value);
}

function buildJSONPath(segments: (string | number)[]): string {
  if (segments.length === 0) return '$';

  let path = '$';
  for (const segment of segments) {
    if (typeof segment === 'number') {
      // Array index
      path += `[${segment}]`;
    } else {
      // Object key
      const key = String(segment);
      // Check if key needs bracket notation
      if (needsBracketNotation(key)) {
        path += `["${key}"]`;
      } else {
        path += `.${key}`;
      }
    }
  }

  return path;
}

function needsBracketNotation(key: string): boolean {
  // Use bracket notation for:
  // - Keys with spaces
  // - Keys with special characters
  // - Keys that start with numbers
  // - Reserved words
  if (/\s/.test(key)) return true;
  if (/[^a-zA-Z0-9_$]/.test(key)) return true;
  if (/^\d/.test(key)) return true;
  return false;
}
