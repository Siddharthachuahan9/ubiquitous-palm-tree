'use client';

import { useState } from 'react';
import styles from './PrivacyBadge.module.css';

interface PrivacyBadgeProps {
  variant?: 'full' | 'compact';
  onOpenModal: () => void;
}

export function PrivacyBadge({ variant = 'full', onOpenModal }: PrivacyBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (variant === 'compact') {
    return (
      <button
        className={styles.compactBadge}
        onClick={onOpenModal}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Privacy information - Runs locally in your browser"
      >
        <span className={styles.lockIcon}>🔒</span>
        {showTooltip && (
          <div className={styles.tooltip}>
            <span className={styles.tooltipText}>Runs locally in your browser</span>
          </div>
        )}
      </button>
    );
  }

  return (
    <button className={styles.badge} onClick={onOpenModal} aria-label="Privacy information">
      <span className={styles.lockIcon}>🔒</span>
      <span className={styles.badgeText}>Runs locally in your browser</span>
    </button>
  );
}
