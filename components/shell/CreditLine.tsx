'use client';

import styles from './CreditLine.module.css';

interface CreditLineProps {
  onOpenPrivacyModal: () => void;
}

export function CreditLine({ onOpenPrivacyModal }: CreditLineProps) {
  return (
    <div className={styles.container}>
      <span className={styles.credit}>created by sidheart❤️</span>
      <span className={styles.separator}>·</span>
      <button className={styles.privacyLink} onClick={onOpenPrivacyModal}>
        privacy first
      </button>
    </div>
  );
}
