'use client';

import { useState } from 'react';
import styles from './CopyButton.module.css';

interface CopyButtonProps {
  text: string;
  label?: string;
  successLabel?: string;
  variant?: 'default' | 'small' | 'icon';
  className?: string;
}

export function CopyButton({
  text,
  label = '📋 Copy',
  successLabel = '✓ Copied!',
  variant = 'default',
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const buttonClass = `${styles.copyButton} ${styles[variant]} ${className || ''}`;

  return (
    <button
      className={buttonClass}
      onClick={handleCopy}
      title={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
    >
      {copied ? successLabel : label}
    </button>
  );
}
