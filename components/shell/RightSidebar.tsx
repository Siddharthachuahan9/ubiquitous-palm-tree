'use client';

import { useState } from 'react';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { useSessionStore } from '@/lib/sessionStore';
import { useRedactionStore } from '@/lib/redactionStore';
import { SessionSettings } from './SessionSettings';
import { RedactionToggle } from '@/components/common/RedactionToggle';
import styles from './RightSidebar.module.css';

type SidebarTab = 'session' | 'history' | 'tips';

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickTips = [
  {
    title: 'Keyboard Shortcuts',
    tips: [
      'Cmd/Ctrl + K → Open Command Palette',
      'Cmd/Ctrl + / → Toggle Sidebar',
      'Cmd/Ctrl + Enter → Execute/Analyze',
      'Arrow Keys → Navigate command palette',
      'Esc → Close modal/palette',
    ],
  },
  {
    title: 'JSON Tools',
    tips: [
      'Diff: Compare two JSON documents side-by-side',
      'Query: Use JSONPath like $.users[*].name',
      'Validate: Check JSON syntax and structure',
      'All JSON processing happens locally',
    ],
  },
  {
    title: 'Network Tools',
    tips: [
      'IP Inspector: RFC-compliant IPv4/IPv6 classification',
      'Ping: Test reachability via HTTPS (browser-safe)',
      'Works with domains and full URLs',
      'Continuous mode for monitoring',
    ],
  },
  {
    title: 'Encoding Tools',
    tips: [
      'Base64: Auto-detects encode vs decode',
      'JWT: Decode tokens locally (no verification)',
      'UTF-8 safe encoding/decoding',
      'Shows metadata and expiry info',
    ],
  },
  {
    title: 'Privacy First',
    tips: [
      '100% client-side processing',
      'No data sent to any servers',
      'Safe for sensitive information',
      'No tracking or analytics',
    ],
  },
  {
    title: 'Pro Tips',
    tips: [
      'Use Command Palette (Cmd+K) for quick tool switching',
      'Theme toggle in top-right corner',
      'All tools support mobile devices',
      'Try example data to explore features',
    ],
  },
];

export function RightSidebar({ isOpen, onClose }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('tips');
  const { history, sessionEnabled } = useSessionStore();
  const { enabled: redactionEnabled, toggleRedaction } = useRedactionStore();

  if (!isOpen) return null;

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            className={activeTab === 'session' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('session')}
          >
            Session
          </button>
          <button
            className={activeTab === 'history' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button
            className={activeTab === 'tips' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('tips')}
          >
            Tips
          </button>
        </div>

        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'session' && (
          <div className={styles.section}>
            <SessionSettings />

            {/* Redaction Settings */}
            <div className={styles.settingsGroup}>
              <h3 className={styles.settingsTitle}>Privacy Controls</h3>
              <div className={styles.settingsItem}>
                <RedactionToggle enabled={redactionEnabled} onToggle={toggleRedaction} />
              </div>
              <p className={styles.settingsDescription}>
                Automatically hide sensitive data like emails, tokens, API keys, UUIDs, and IPs from display, clipboard, and share links.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className={styles.section}>
            {!sessionEnabled ? (
              <div className={styles.emptyState}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <p className={styles.emptyTitle}>History disabled</p>
                <p className={styles.emptyText}>
                  Enable session storage in the Session tab to track your activity history
                </p>
              </div>
            ) : history.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <p className={styles.emptyTitle}>No history yet</p>
                <p className={styles.emptyText}>
                  Your recent activities will appear here as you use tools
                </p>
              </div>
            ) : (
              <div className={styles.historyList}>
                {history.slice(0, 20).map((entry) => (
                  <div key={entry.id} className={styles.historyItem}>
                    <div className={styles.historyHeader}>
                      <span className={styles.historyTool}>{entry.tool}</span>
                      <span className={styles.historyTime}>
                        {formatRelativeTime(new Date(entry.timestamp))}
                      </span>
                    </div>
                    <div className={styles.historyAction}>{entry.action}</div>
                    {entry.preview && (
                      <div className={styles.historyPreview}>{entry.preview}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tips' && (
          <div className={styles.section}>
            <div className={styles.tipsList}>
              {quickTips.map((category, index) => (
                <div key={index} className={styles.tipCategory}>
                  <h3 className={styles.tipTitle}>{category.title}</h3>
                  <ul className={styles.tipItems}>
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className={styles.tipItem}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
