'use client';

import styles from './ToolNavigation.module.css';

export type Tool = 'diff' | 'jsonpath' | 'validate' | 'ip' | 'ping' | 'base64' | 'jwt' | 'hash' | 'uuid' | 'xml-to-json';

interface ToolNavigationProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const tools: Array<{ id: Tool; label: string; icon: string }> = [
  { id: 'diff', label: 'Diff', icon: '⚖️' },
  { id: 'jsonpath', label: 'Query', icon: '🔍' },
  { id: 'validate', label: 'Validate', icon: '✓' },
  { id: 'ip', label: 'IP', icon: '🌐' },
  { id: 'ping', label: 'Ping', icon: '📡' },
  { id: 'base64', label: 'Base64', icon: '🔤' },
  { id: 'jwt', label: 'JWT', icon: '🔐' },
  { id: 'hash', label: 'Hash', icon: '🔒' },
  { id: 'uuid', label: 'UUID', icon: '🆔' },
  { id: 'xml-to-json', label: 'XML→JSON', icon: '🔄' },
];

/**
 * ToolNavigation - Horizontal tool tabs below main header
 *
 * Features:
 * - Single row, left-aligned
 * - Active tool highlighted with underline
 * - Fast tool switching
 * - No wrapping
 */
export function ToolNavigation({ currentTool, onToolChange }: ToolNavigationProps) {
  return (
    <nav className={styles.navigation} aria-label="Tool navigation">
      <div className={styles.toolList}>
        {tools.map((tool) => {
          const isActive = currentTool === tool.id;

          return (
            <button
              key={tool.id}
              className={`${styles.tool} ${isActive ? styles.toolActive : ''}`}
              onClick={() => onToolChange(tool.id)}
              aria-label={`Switch to ${tool.label} tool`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.toolIcon}>{tool.icon}</span>
              <span className={styles.toolLabel}>{tool.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
