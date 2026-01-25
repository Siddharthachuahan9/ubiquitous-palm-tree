'use client';

import { useEffect } from 'react';
import { useStudioStore } from '@/lib/store';
import styles from './Toast.module.css';

export function Toast() {
  const { toastMessage, toastType, clearToast } = useStudioStore();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(clearToast, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  const icon = {
    error: '⚠️',
    success: '✓',
    info: 'ℹ️',
    warning: '⚡',
  }[toastType || 'info'];

  return (
    <div className={`${styles.toast} ${styles[toastType || 'info']}`}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.message}>{toastMessage}</span>
      <button className={styles.close} onClick={clearToast} aria-label="Close notification">
        ×
      </button>
    </div>
  );
}
