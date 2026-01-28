'use client';

import { useState, useEffect, useRef } from 'react';
import { Tool } from './ToolNavigation';
import styles from './CommandPalette.module.css';

interface Command {
  id: Tool;
  label: string;
  description: string;
  icon: string;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: Tool) => void;
  currentTool: Tool;
}

const commands: Command[] = [
  {
    id: 'diff',
    label: 'JSON Diff',
    description: 'Compare two JSON documents side-by-side',
    icon: '⚖️',
    keywords: ['diff', 'compare', 'difference', 'json', 'before', 'after'],
  },
  {
    id: 'jsonpath',
    label: 'JSONPath Query',
    description: 'Query JSON data using JSONPath expressions',
    icon: '🔍',
    keywords: ['jsonpath', 'query', 'search', 'filter', 'json', 'xpath'],
  },
  {
    id: 'validate',
    label: 'JSON Validator',
    description: 'Validate JSON syntax and structure',
    icon: '✓',
    keywords: ['validate', 'check', 'verify', 'json', 'syntax', 'lint'],
  },
  {
    id: 'ip',
    label: 'IP Inspector',
    description: 'Classify IPv4 and IPv6 addresses by RFC standards',
    icon: '🌐',
    keywords: ['ip', 'ipv4', 'ipv6', 'network', 'address', 'rfc', 'classify'],
  },
  {
    id: 'ping',
    label: 'Ping Tool',
    description: 'Test network reachability via HTTPS',
    icon: '📡',
    keywords: ['ping', 'network', 'test', 'https', 'reachability', 'monitor'],
  },
  {
    id: 'base64',
    label: 'Base64 Tool',
    description: 'Encode and decode Base64 strings with UTF-8 support',
    icon: '🔤',
    keywords: ['base64', 'encode', 'decode', 'utf8', 'encoding'],
  },
  {
    id: 'jwt',
    label: 'JWT Decoder',
    description: 'Decode and inspect JWT tokens locally',
    icon: '🔐',
    keywords: ['jwt', 'token', 'decode', 'json', 'web', 'auth'],
  },
  {
    id: 'hash',
    label: 'Hash Generator',
    description: 'Generate cryptographic hashes (SHA-1, SHA-256, SHA-384, SHA-512)',
    icon: '🔒',
    keywords: ['hash', 'sha', 'crypto', 'checksum', 'digest', 'security'],
  },
  {
    id: 'uuid',
    label: 'UUID Generator',
    description: 'Generate unique identifiers (v4, v1-like, nil)',
    icon: '🆔',
    keywords: ['uuid', 'guid', 'unique', 'identifier', 'id', 'generate'],
  },
  {
    id: 'xml-to-json',
    label: 'XML to JSON',
    description: 'Convert XML into JSON locally in your browser',
    icon: '🔄',
    keywords: ['xml', 'json', 'convert', 'transform', 'parse', 'parser'],
  },
];

function fuzzyMatch(query: string, text: string): boolean {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Direct substring match
  if (textLower.includes(queryLower)) {
    return true;
  }

  // Fuzzy match - each character of query must appear in order in text
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
    // Check label
    if (fuzzyMatch(query, command.label)) return true;

    // Check description
    if (fuzzyMatch(query, command.description)) return true;

    // Check keywords
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

  // Reset state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Reset selected index when filtered results change
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
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className={styles.content}>
          {filteredCommands.length > 0 ? (
            <div className={styles.commandList}>
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  className={`${styles.commandItem} ${
                    index === selectedIndex ? styles.commandItemSelected : ''
                  } ${command.id === currentTool ? styles.commandItemActive : ''}`}
                  onClick={() => handleSelect(command.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className={styles.commandIcon}>{command.icon}</span>
                  <div className={styles.commandContent}>
                    <div className={styles.commandLabel}>{command.label}</div>
                    <div className={styles.commandDescription}>{command.description}</div>
                  </div>
                  {command.id === currentTool && (
                    <span className={styles.currentBadge}>Current</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🔍</span>
              <p className={styles.emptyText}>No commands found</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.hint}>
            <kbd className={styles.kbd}>↑↓</kbd> Navigate
          </div>
          <div className={styles.hint}>
            <kbd className={styles.kbd}>Enter</kbd> Select
          </div>
          <div className={styles.hint}>
            <kbd className={styles.kbd}>Esc</kbd> Close
          </div>
        </div>
      </div>
    </div>
  );
}
