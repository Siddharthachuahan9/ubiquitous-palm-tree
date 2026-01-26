'use client';

import styles from './PrivacyModal.module.css';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Privacy First</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close privacy modal"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.iconContainer}>
              <span className={styles.icon}>🔒</span>
            </div>
            <h3 className={styles.sectionTitle}>Your Data Never Leaves Your Device</h3>
            <p className={styles.text}>
              All processing happens locally in your browser. No JSON data, IP addresses, tokens,
              or any user content is ever transmitted to our servers or any third party.
            </p>
          </div>

          <div className={styles.section}>
            <div className={styles.iconContainer}>
              <span className={styles.icon}>🚫</span>
            </div>
            <h3 className={styles.sectionTitle}>No Tracking or Analytics</h3>
            <p className={styles.text}>
              We don&apos;t use cookies for tracking, session recording, or analytics. Your activity
              is completely private.
            </p>
          </div>

          <div className={styles.section}>
            <div className={styles.iconContainer}>
              <span className={styles.icon}>💾</span>
            </div>
            <h3 className={styles.sectionTitle}>No Server Storage</h3>
            <p className={styles.text}>
              Nothing is stored on our servers. If you choose to save data, it stays in your
              browser&apos;s local storage on your device only.
            </p>
          </div>

          <div className={styles.section}>
            <div className={styles.iconContainer}>
              <span className={styles.icon}>✈️</span>
            </div>
            <h3 className={styles.sectionTitle}>Works Offline</h3>
            <p className={styles.text}>
              After the initial page load, all tools function offline. Turn on airplane mode and
              keep working - no internet required.
            </p>
          </div>

          <div className={styles.section}>
            <div className={styles.iconContainer}>
              <span className={styles.icon}>🔍</span>
            </div>
            <h3 className={styles.sectionTitle}>Verify It Yourself</h3>
            <p className={styles.text}>
              Open your browser&apos;s DevTools Network tab and watch - you&apos;ll see zero network
              requests when using our tools. Our code is open and auditable.
            </p>
          </div>

          <div className={styles.banner}>
            <strong>Safe for Production Data</strong>
            <p className={styles.bannerText}>
              Feel confident pasting sensitive production data, credentials, API keys, or tokens.
              Everything stays on your device.
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.primaryButton} onClick={onClose}>
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
