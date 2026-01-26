'use client';

import { useState } from 'react';
import { formatRelativeTime } from '@/lib/utils/formatters';
import styles from './RightSidebar.module.css';

type SidebarTab = 'session' | 'history' | 'tips';

interface Session {
  id: string;
  tool: string;
  timestamp: Date;
  data: any;
}

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
  const [sessions] = useState<Session[]>([]);

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
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📋</span>
              <p className={styles.emptyTitle}>No active session</p>
              <p className={styles.emptyText}>
                Sessions will appear here when you start working
              </p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className={styles.section}>
            {sessions.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🕒</span>
                <p className={styles.emptyTitle}>No history yet</p>
                <p className={styles.emptyText}>
                  Your recent activities will appear here
                </p>
              </div>
            ) : (
              <div className={styles.historyList}>
                {sessions.map((session) => (
                  <div key={session.id} className={styles.historyItem}>
                    <div className={styles.historyTool}>{session.tool}</div>
                    <div className={styles.historyTime}>
                      {formatRelativeTime(session.timestamp)}
                    </div>
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
