'use client';

import { useState } from 'react';
import { decodeJWT, JWTDecoded } from '@/lib/utils/jwt';
import { formatJSON } from '@/lib/utils/formatters';
import styles from './JWTDecoder.module.css';

export function JWTDecoder() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<JWTDecoded | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = () => {
    if (!token.trim()) {
      setError('Please enter a JWT token');
      setResult(null);
      return;
    }

    try {
      const decoded = decodeJWT(token.trim());
      setResult(decoded);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode JWT');
      setResult(null);
    }
  };

  const handleClear = () => {
    setToken('');
    setResult(null);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleDecode();
    }
  };

  return (
    <div className={styles.container}>
      {/* Input Panel */}
      <div className={styles.inputPanel}>
        <div className={styles.header}>
          <h2 className={styles.title}>JWT Decoder</h2>
          <p className={styles.subtitle}>
            Decode and inspect JWT tokens locally without verification
          </p>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="jwt-input" className={styles.label}>
            JWT Token
          </label>
          <textarea
            id="jwt-input"
            className={styles.textarea}
            placeholder="Paste JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={6}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={handleDecode}>
            Decode JWT
          </button>
          <button className={styles.secondaryButton} onClick={handleClear}>
            Clear
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        )}

        {result && (
          <div className={styles.warning}>
            <span className={styles.warningIcon}>⚡</span>
            <span className={styles.warningText}>{result.warning}</span>
          </div>
        )}
      </div>

      {/* Results Panel */}
      <div className={styles.resultsPanel}>
        {result ? (
          <div className={styles.results}>
            {/* Metadata */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Metadata</h3>
              <div className={styles.metadataGrid}>
                {result.metadata.algorithm && (
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Algorithm</span>
                    <span className={styles.metadataValue}>{result.metadata.algorithm}</span>
                  </div>
                )}
                {result.metadata.issuedAt && (
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Issued At</span>
                    <span className={styles.metadataValue}>
                      {result.metadata.issuedAt.toLocaleString()}
                    </span>
                  </div>
                )}
                {result.metadata.expiresAt && (
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Expires At</span>
                    <span className={styles.metadataValue}>
                      {result.metadata.expiresAt.toLocaleString()}
                    </span>
                  </div>
                )}
                {result.metadata.isExpired !== undefined && (
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Status</span>
                    <span
                      className={
                        result.metadata.isExpired ? styles.statusExpired : styles.statusValid
                      }
                    >
                      {result.metadata.isExpired ? 'Expired' : 'Valid'}
                    </span>
                  </div>
                )}
                {result.metadata.timeToExpiry && (
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Time to Expiry</span>
                    <span className={styles.metadataValue}>{result.metadata.timeToExpiry}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Header */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Header</h3>
              <pre className={styles.jsonOutput}>{formatJSON(result.header, 2)}</pre>
            </div>

            {/* Payload */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Payload</h3>
              <pre className={styles.jsonOutput}>{formatJSON(result.payload, 2)}</pre>
            </div>

            {/* Signature */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Signature</h3>
              <div className={styles.signatureBox}>
                <code className={styles.signatureText}>{result.signature}</code>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔐</span>
            <p className={styles.emptyTitle}>Enter a JWT to decode</p>
            <p className={styles.emptyText}>
              Paste a JWT token to inspect its header, payload, and metadata. All processing happens locally in your browser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
