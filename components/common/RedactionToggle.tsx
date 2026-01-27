'use client';

import { useState } from 'react';
import { detectSensitiveData, countSensitiveData } from '@/lib/utils/redaction';
import styles from './RedactionToggle.module.css';

interface RedactionToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  currentData?: string; // Optional: show count of sensitive items in current view
}

export function RedactionToggle({ enabled, onToggle, currentData }: RedactionToggleProps) {
  const [showInfo, setShowInfo] = useState(false);

  // Count sensitive data in current view if provided
  const sensitiveCount = currentData ? Object.values(countSensitiveData(currentData)).reduce((a, b) => a + b, 0) : 0;
  const hasSensitiveData = currentData ? detectSensitiveData(currentData) : false;

  return (
    <div className={styles.container}>
      <button
        className={`${styles.toggle} ${enabled ? styles.enabled : ''}`}
        onClick={() => onToggle(!enabled)}
        title={enabled ? 'Disable redaction' : 'Enable redaction to hide sensitive data'}
      >
        <span className={styles.icon}>{enabled ? '👁️' : '👁️‍🗨️'}</span>
        <span className={styles.label}>
          {enabled ? 'Hiding sensitive data' : 'Hide sensitive data'}
        </span>
        {hasSensitiveData && sensitiveCount > 0 && (
          <span className={styles.badge}>{sensitiveCount}</span>
        )}
      </button>

      <button
        className={styles.infoButton}
        onClick={() => setShowInfo(!showInfo)}
        title="What gets redacted?"
      >
        ?
      </button>

      {showInfo && (
        <div className={styles.infoPanel}>
          <div className={styles.infoHeader}>
            <h4>What gets redacted:</h4>
            <button className={styles.closeButton} onClick={() => setShowInfo(false)}>
              ✕
            </button>
          </div>
          <ul className={styles.infoList}>
            <li>📧 Email addresses</li>
            <li>🔑 API keys (sk_, pk_, api_key)</li>
            <li>🎫 JWT tokens</li>
            <li>🔐 Bearer tokens</li>
            <li>🆔 UUIDs</li>
            <li>🔢 Long numeric IDs (12+ digits)</li>
            <li>📦 Base64 credentials (32+ chars)</li>
            <li>🌐 IP addresses</li>
            <li>💳 Credit card numbers</li>
          </ul>
          <p className={styles.infoNote}>
            Redaction affects: display output, clipboard copy, and share links
          </p>
        </div>
      )}
    </div>
  );
}
