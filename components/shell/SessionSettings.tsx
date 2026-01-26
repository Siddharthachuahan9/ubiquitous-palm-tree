'use client';

import { useSessionStore } from '@/lib/sessionStore';
import styles from './SessionSettings.module.css';

export function SessionSettings() {
  const { sessionEnabled, enableSession, disableSession, history, clearHistory } =
    useSessionStore();

  const handleToggleSession = () => {
    if (sessionEnabled) {
      if (
        confirm(
          'This will clear all saved sessions and history. Your current work will not be saved. Continue?'
        )
      ) {
        disableSession();
      }
    } else {
      enableSession();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Session Storage</h3>
        <button
          className={sessionEnabled ? styles.toggleOn : styles.toggleOff}
          onClick={handleToggleSession}
          aria-label={sessionEnabled ? 'Disable session storage' : 'Enable session storage'}
        >
          <span className={styles.toggleTrack}>
            <span className={styles.toggleThumb}></span>
          </span>
        </button>
      </div>

      {sessionEnabled ? (
        <div className={styles.content}>
          <div className={styles.infoBox}>
            <span className={styles.infoIcon}>💾</span>
            <div>
              <p className={styles.infoText}>
                Session storage enabled. Your tool states and history are saved in your browser.
              </p>
              <p className={styles.infoSubtext}>
                Data stays on your device only. No server storage.
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{history.length}</span>
                <span className={styles.statLabel}>History entries</span>
              </div>
              <button className={styles.clearButton} onClick={clearHistory}>
                Clear History
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.warningBox}>
            <span className={styles.warningIcon}>⚠️</span>
            <div>
              <p className={styles.warningText}>Session storage is disabled</p>
              <p className={styles.warningSubtext}>
                Your work will not be saved. Enable to persist tool states across browser sessions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
