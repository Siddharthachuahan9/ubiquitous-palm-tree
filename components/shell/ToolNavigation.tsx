'use client';

import styles from './ToolNavigation.module.css';

export type Tool = 'diff' | 'jsonpath' | 'validate' | 'ip' | 'ping' | 'base64' | 'jwt' | 'hash' | 'uuid' | 'xml-to-json';

interface ToolNavigationProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
}

function ToolIcon({ id }: { id: Tool }) {
  const props = {
    width: 13,
    height: 13,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (id) {
    case 'diff':
      return (
        <svg {...props}>
          <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
          <path d="M15 3h4a2 2 0 0 0 2 2v14a2 2 0 0 0-2 2h-4" />
          <line x1="12" y1="3" x2="12" y2="21" />
        </svg>
      );
    case 'jsonpath':
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      );
    case 'validate':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'ip':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'ping':
      return (
        <svg {...props}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case 'base64':
      return (
        <svg {...props}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'jwt':
      return (
        <svg {...props}>
          <circle cx="7.5" cy="15.5" r="5.5" />
          <path d="m21 2-9.6 9.6" />
          <path d="m15.5 7.5 3 3L22 7l-3-3" />
        </svg>
      );
    case 'hash':
      return (
        <svg {...props}>
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      );
    case 'uuid':
      return (
        <svg {...props}>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case 'xml-to-json':
      return (
        <svg {...props}>
          <path d="M8 3 4 7l4 4" />
          <path d="M4 7h16" />
          <path d="m16 21 4-4-4-4" />
          <path d="M20 17H4" />
        </svg>
      );
  }
}

const tools: Array<{ id: Tool; label: string }> = [
  { id: 'diff', label: 'Diff' },
  { id: 'jsonpath', label: 'Query' },
  { id: 'validate', label: 'Validate' },
  { id: 'ip', label: 'IP' },
  { id: 'ping', label: 'Ping' },
  { id: 'base64', label: 'Base64' },
  { id: 'jwt', label: 'JWT' },
  { id: 'hash', label: 'Hash' },
  { id: 'uuid', label: 'UUID' },
  { id: 'xml-to-json', label: 'XML' },
];

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
              <span className={styles.toolIcon}>
                <ToolIcon id={tool.id} />
              </span>
              <span className={styles.toolLabel}>{tool.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
