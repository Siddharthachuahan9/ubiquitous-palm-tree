'use client';

import { useState, useEffect, useRef } from 'react';
import { Tool } from './ToolNavigation';
import styles from './CommandPalette.module.css';

interface Command {
  id: Tool;
  label: string;
  description: string;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: Tool) => void;
  currentTool: Tool;
}

function CommandIcon({ id }: { id: Tool }) {
  const props = {
    width: 15,
    height: 15,
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

const commands: Command[] = [
  {
    id: 'diff',
    label: 'JSON Diff',
    description: 'Compare two JSON documents side-by-side',
    keywords: ['diff', 'compare', 'difference', 'json', 'before', 'after'],
  },
  {
    id: 'jsonpath',
    label: 'JSONPath Query',
    description: 'Query JSON data using JSONPath expressions',
    keywords: ['jsonpath', 'query', 'search', 'filter', 'json', 'xpath'],
  },
  {
    id: 'validate',
    label: 'JSON Validator',
    description: 'Validate JSON syntax and structure',
    keywords: ['validate', 'check', 'verify', 'json', 'syntax', 'lint'],
  },
  {
    id: 'ip',
    label: 'IP Inspector',
    description: 'Classify IPv4 and IPv6 addresses by RFC standards',
    keywords: ['ip', 'ipv4', 'ipv6', 'network', 'address', 'rfc', 'classify'],
  },
  {
    id: 'ping',
    label: 'Ping Tool',
    description: 'Test network reachability via HTTPS',
    keywords: ['ping', 'network', 'test', 'https', 'reachability', 'monitor'],
  },
  {
    id: 'base64',
    label: 'Base64 Tool',
    description: 'Encode and decode Base64 strings with UTF-8 support',
    keywords: ['base64', 'encode', 'decode', 'utf8', 'encoding'],
  },
  {
    id: 'jwt',
    label: 'JWT Decoder',
    description: 'Decode and inspect JWT tokens locally',
    keywords: ['jwt', 'token', 'decode', 'json', 'web', 'auth'],
  },
  {
    id: 'hash',
    label: 'Hash Generator',
    description: 'Generate cryptographic hashes (SHA-1, SHA-256, SHA-384, SHA-512)',
    keywords: ['hash', 'sha', 'crypto', 'checksum', 'digest', 'security'],
  },
  {
    id: 'uuid',
    label: 'UUID Generator',
    description: 'Generate unique identifiers (v4, v1-like, nil)',
    keywords: ['uuid', 'guid', 'unique', 'identifier', 'id', 'generate'],
  },
  {
    id: 'xml-to-json',
    label: 'XML to JSON',
    description: 'Convert XML into JSON locally in your browser',
    keywords: ['xml', 'json', 'convert', 'transform', 'parse', 'parser'],
  },
];

function fuzzyMatch(query: string, text: string): boolean {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  if (textLower.includes(queryLower)) {
    return true;
  }

  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === queryLower.length;
}

function filterCommands(query: string, commands: Command[]): Command[] {
  if (!query.trim()) {
    return commands;
  }

  return commands.filter((command) => {
    if (fuzzyMatch(query, command.label)) return true;
    if (fuzzyMatch(query, command.description)) return true;
    return command.keywords.some((keyword) => fuzzyMatch(query, keyword));
  });
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectTool,
  currentTool,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = filterCommands(query, commands);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        onSelectTool(filteredCommands[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelect = (tool: Tool) => {
    onSelectTool(tool);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.searchIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className={styles.divider} />

        <div className={styles.content}>
          {filteredCommands.length > 0 ? (
            <div className={styles.commandList}>
              <div className={styles.groupLabel}>Tools</div>
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  className={`${styles.commandItem} ${
                    index === selectedIndex ? styles.commandItemSelected : ''
                  } ${command.id === currentTool ? styles.commandItemActive : ''}`}
                  onClick={() => handleSelect(command.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className={styles.commandIcon}>
                    <CommandIcon id={command.id} />
                  </span>
                  <div className={styles.commandContent}>
                    <span className={styles.commandLabel}>{command.label}</span>
                    <span className={styles.commandDescription}>{command.description}</span>
                  </div>
                  {command.id === currentTool && (
                    <span className={styles.currentBadge}>Active</span>
                  )}
                  <kbd className={styles.enterHint}>↵</kbd>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <p className={styles.emptyText}>No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.hint}>
            <kbd className={styles.kbd}>↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className={styles.hint}>
            <kbd className={styles.kbd}>↵</kbd>
            <span>Select</span>
          </div>
          <div className={styles.hint}>
            <kbd className={styles.kbd}>Esc</kbd>
            <span>Dismiss</span>
          </div>
        </div>
      </div>
    </div>
  );
}
