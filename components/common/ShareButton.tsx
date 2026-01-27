'use client';

import { useState } from 'react';
import { generateShareableURL } from '@/lib/utils/shareState';
import { detectSensitiveData } from '@/lib/utils/redaction';
import styles from './ShareButton.module.css';

interface ShareButtonProps {
  tool: string;
  data: any;
  onShare?: () => void;
}

export function ShareButton({ tool, data, onShare }: ShareButtonProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Check for sensitive data
    const hasSensitiveData = detectSensitiveData(JSON.stringify(data));

    if (hasSensitiveData && !showWarning) {
      setShowWarning(true);
      return;
    }

    try {
      const url = generateShareableURL(tool, data);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.();
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleConfirmShare = async () => {
    setShowWarning(false);
    try {
      const url = generateShareableURL(tool, data);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.();
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleCancelShare = () => {
    setShowWarning(false);
  };

  return (
    <>
      <button
        className={styles.shareButton}
        onClick={handleShare}
        title="Share current state via URL"
      >
        {copied ? '✓ Copied!' : '🔗 Share'}
      </button>

      {showWarning && (
        <div className={styles.warningOverlay} onClick={handleCancelShare}>
          <div className={styles.warningModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Sensitive Data Detected</h3>
            </div>

            <div className={styles.warningContent}>
              <p>
                Your input may contain sensitive information like emails, tokens, API keys, or UUIDs.
              </p>
              <p>
                The share link will include this data in the URL. Anyone with the link can see it.
              </p>
              <p className={styles.warningTip}>
                💡 <strong>Tip:</strong> Enable &ldquo;Hide sensitive data&rdquo; before sharing to redact sensitive information.
              </p>
            </div>

            <div className={styles.warningActions}>
              <button className={styles.cancelButton} onClick={handleCancelShare}>
                Cancel
              </button>
              <button className={styles.confirmButton} onClick={handleConfirmShare}>
                Share Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
