'use client';

import { useEffect } from 'react';
import { useStudioStore } from '@/lib/store';
import styles from './Toast.module.css';

function ToastIcon({ type }: { type: string }) {
  const p = {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'error':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'success':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'warning':
      return (
        <svg {...p}>
          <path d="m10.29 3.86-8.6 14.9A2 2 0 0 0 3.43 22h17.14a2 2 0 0 0 1.74-3.14l-8.6-14.9a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
}

export function Toast() {
  const { toastMessage, toastType, clearToast } = useStudioStore();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(clearToast, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  return (
    <div className={`${styles.toast} ${styles[toastType || 'info']}`}>
      <span className={styles.icon}>
        <ToastIcon type={toastType || 'info'} />
      </span>
      <span className={styles.message}>{toastMessage}</span>
      <button className={styles.close} onClick={clearToast} aria-label="Close notification">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
