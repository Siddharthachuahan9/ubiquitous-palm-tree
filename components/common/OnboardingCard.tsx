'use client';

import { useState, useEffect } from 'react';
import styles from './OnboardingCard.module.css';

interface OnboardingCardProps {
  /** Tool name */
  toolName: string;
  /** Brief description of what the tool does */
  description: string;
  /** Optional tips for using the tool */
  tips?: string[];
  /** Storage key for dismissal (defaults to `onboarding-${toolName}`) */
  storageKey?: string;
}

/**
 * OnboardingCard - Welcome card for first-time visitors
 *
 * Features:
 * - Shows on first visit
 * - Dismissible (never shown again)
 * - Privacy promise
 * - Command bar tip
 * - Tool-specific tips
 *
 * Usage:
 * ```tsx
 * <OnboardingCard
 *   toolName="JSON Diff"
 *   description="Compare two JSON objects to find differences"
 *   tips={["Paste your JSON directly", "Use Cmd+K for quick navigation"]}
 * />
 * ```
 */
export function OnboardingCard({
  toolName,
  description,
  tips = [],
  storageKey,
}: OnboardingCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const key = storageKey || `onboarding-${toolName.toLowerCase().replace(/\s+/g, '-')}`;

  useEffect(() => {
    // Check if user has dismissed this onboarding card before
    const dismissed = localStorage.getItem(key);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, [key]);

  const handleDismiss = () => {
    localStorage.setItem(key, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay} onClick={handleDismiss}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={handleDismiss}
          aria-label="Dismiss welcome card"
        >
          ✕
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>Welcome to {toolName}</h2>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Privacy Promise</h3>
          <p className={styles.sectionText}>
            <span className={styles.icon}>🔒</span>
            All processing happens in your browser. No data is sent to servers.
            Works offline (except network tools).
          </p>
        </div>

        {tips.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Tips</h3>
            <ul className={styles.tipsList}>
              {tips.map((tip, index) => (
                <li key={index} className={styles.tip}>
                  <span className={styles.tipIcon}>💡</span>
                  {tip}
                </li>
              ))}
              <li className={styles.tip}>
                <span className={styles.tipIcon}>⌨️</span>
                Press <kbd className={styles.kbd}>Cmd</kbd> + <kbd className={styles.kbd}>K</kbd> to
                open the command bar
              </li>
            </ul>
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={handleDismiss}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
