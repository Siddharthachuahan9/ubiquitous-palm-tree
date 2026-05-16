'use client';

import styles from './PrivacyModal.module.css';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  );
}

function WifiOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Privacy Policy</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close privacy modal"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.iconContainer}>
              <ShieldIcon />
            </div>
            <div className={styles.sectionBody}>
              <h3 className={styles.sectionTitle}>Your data never leaves your device</h3>
              <p className={styles.text}>
                All processing happens locally in your browser. No JSON data, IP addresses, tokens,
                or any user content is ever transmitted to our servers or any third party.
              </p>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.iconContainer}>
              <EyeOffIcon />
            </div>
            <div className={styles.sectionBody}>
              <h3 className={styles.sectionTitle}>No tracking or analytics</h3>
              <p className={styles.text}>
                We don&apos;t use cookies for tracking, session recording, or analytics. Your activity
                is completely private.
              </p>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.iconContainer}>
              <ServerIcon />
            </div>
            <div className={styles.sectionBody}>
              <h3 className={styles.sectionTitle}>No server storage</h3>
              <p className={styles.text}>
                Nothing is stored on our servers. If you choose to save data, it stays in your
                browser&apos;s local storage on your device only.
              </p>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.iconContainer}>
              <WifiOffIcon />
            </div>
            <div className={styles.sectionBody}>
              <h3 className={styles.sectionTitle}>Works offline</h3>
              <p className={styles.text}>
                After the initial page load, all tools function offline. Turn on airplane mode and
                keep working — no internet required.
              </p>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.iconContainer}>
              <TerminalIcon />
            </div>
            <div className={styles.sectionBody}>
              <h3 className={styles.sectionTitle}>Verify it yourself</h3>
              <p className={styles.text}>
                Open your browser&apos;s DevTools Network tab and watch — you&apos;ll see zero network
                requests when using our tools.
              </p>
            </div>
          </div>

          <div className={styles.banner}>
            <strong>Safe for production data</strong>
            <p className={styles.bannerText}>
              Feel confident pasting sensitive production data, credentials, API keys, or tokens.
              Everything stays on your device.
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.primaryButton} onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
