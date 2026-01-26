'use client';

import { useState } from 'react';
import { classifyIP, IPClassification } from '@/lib/utils/ipClassifier';
import styles from './IPInspector.module.css';

export function IPInspector() {
  const [ipInput, setIpInput] = useState('');
  const [result, setResult] = useState<IPClassification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = () => {
    if (!ipInput.trim()) {
      setError('Please enter an IP address');
      setResult(null);
      return;
    }

    try {
      const classification = classifyIP(ipInput.trim());
      setResult(classification);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to classify IP');
      setResult(null);
    }
  };

  const handleClear = () => {
    setIpInput('');
    setResult(null);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAnalyze();
    }
  };

  return (
    <div className={styles.container}>
      {/* Input Panel */}
      <div className={styles.inputPanel}>
        <div className={styles.header}>
          <h2 className={styles.title}>IP Inspector</h2>
          <p className={styles.subtitle}>
            Classify IPv4 and IPv6 addresses by RFC standards
          </p>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="ip-input" className={styles.label}>
            IP Address
          </label>
          <input
            id="ip-input"
            type="text"
            className={styles.input}
            placeholder="Enter IPv4 or IPv6 address (e.g., 192.168.1.1 or 2001:db8::1)"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={handleAnalyze}>
            Analyze IP
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
      </div>

      {/* Results Panel */}
      <div className={styles.resultsPanel}>
        {result ? (
          <div className={styles.results}>
            <div className={styles.resultHeader}>
              <h3 className={styles.resultTitle}>Classification Results</h3>
              <span className={`${styles.badge} ${styles[`badge${result.type}`]}`}>
                {result.type}
              </span>
            </div>

            <div className={styles.resultGrid}>
              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>IP Address</div>
                <div className={styles.resultValue}>{result.ip}</div>
              </div>

              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>Version</div>
                <div className={styles.resultValue}>IPv{result.version}</div>
              </div>

              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>Type</div>
                <div className={styles.resultValue}>{result.type}</div>
              </div>

              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>Category</div>
                <div className={styles.resultValue}>{result.category}</div>
              </div>

              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>CIDR Range</div>
                <div className={styles.resultValue}>
                  <code>{result.cidr}</code>
                </div>
              </div>
            </div>

            <div className={styles.explanation}>
              <div className={styles.explanationLabel}>Explanation</div>
              <p className={styles.explanationText}>{result.explanation}</p>
            </div>

            {result.warning && (
              <div className={styles.warning}>
                <span className={styles.warningIcon}>⚡</span>
                <span className={styles.warningText}>{result.warning}</span>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🌐</span>
            <p className={styles.emptyTitle}>Enter an IP to analyze</p>
            <p className={styles.emptyText}>
              Supports both IPv4 (e.g., 192.168.1.1) and IPv6 (e.g., 2001:db8::1) addresses
            </p>
            <div className={styles.examples}>
              <p className={styles.examplesTitle}>Try these examples:</p>
              <button
                className={styles.exampleButton}
                onClick={() => setIpInput('192.168.1.1')}
              >
                192.168.1.1
              </button>
              <button
                className={styles.exampleButton}
                onClick={() => setIpInput('8.8.8.8')}
              >
                8.8.8.8
              </button>
              <button
                className={styles.exampleButton}
                onClick={() => setIpInput('2001:db8::1')}
              >
                2001:db8::1
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
