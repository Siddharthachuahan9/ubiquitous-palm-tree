'use client';

import { useState } from 'react';
import {
  generateAllHashes,
  formatHash,
  getHashInfo,
  HashResult,
  HashAlgorithm,
} from '@/lib/utils/hashGenerator';
import { ShareButton } from '@/components/common/ShareButton';
import { CopyButton } from '@/components/common/CopyButton';
import styles from './HashGenerator.module.css';

export function HashGenerator() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<HashResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [uppercase, setUppercase] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) {
      return;
    }

    setLoading(true);
    try {
      const hashes = await generateAllHashes(input);
      setResults(hashes);
    } catch (error) {
      console.error('Hash generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
  };

  const handleClear = () => {
    setInput('');
    setResults([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  return (
    <div className={styles.container}>
      {/* Input Panel */}
      <div className={styles.inputPanel}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Hash Generator</h2>
            <p className={styles.subtitle}>
              Generate cryptographic hashes (SHA-1, SHA-256, SHA-384, SHA-512)
            </p>
          </div>
          <div className={styles.headerActions}>
            <ShareButton
              tool="hash"
              data={{ input, results, uppercase }}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="hash-input" className={styles.label}>
            Input Text
          </label>
          <textarea
            id="hash-input"
            className={styles.textarea}
            placeholder="Enter text to hash..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={6}
          />
        </div>

        <div className={styles.options}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
            />
            <span>Uppercase output</span>
          </label>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.primaryButton}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Hashes'}
          </button>
          <button className={styles.secondaryButton} onClick={handleClear}>
            Clear
          </button>
        </div>
      </div>

      {/* Results Panel */}
      <div className={styles.resultsPanel}>
        {results.length > 0 ? (
          <div className={styles.results}>
            <div className={styles.resultHeader}>
              <h3 className={styles.resultTitle}>Hash Results</h3>
              <span className={styles.inputSize}>{input.length} characters</span>
            </div>

            <div className={styles.hashList}>
              {results.map((result) => {
                const info = getHashInfo(result.algorithm);
                const formatted = formatHash(result.hash, uppercase);

                return (
                  <div key={result.algorithm} className={styles.hashItem}>
                    <div className={styles.hashHeader}>
                      <div>
                        <span className={styles.hashAlgorithm}>{result.algorithm}</span>
                        <span className={styles.hashBits}>({info.bits} bits)</span>
                      </div>
                      <button
                        className={styles.copyButton}
                        onClick={() => handleCopy(formatted)}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    </div>

                    <div className={styles.hashValue}>
                      <code>{formatted}</code>
                    </div>

                    <div className={styles.hashInfo}>
                      <span className={styles.hashInfoText}>{info.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.privacyNote}>
              🔒 All hashing happens locally in your browser
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔐</span>
            <p className={styles.emptyTitle}>Ready to hash</p>
            <p className={styles.emptyText}>
              Enter text to generate cryptographic hashes using Web Crypto API
            </p>
            <div className={styles.examples}>
              <p className={styles.examplesTitle}>Try these examples:</p>
              <button
                className={styles.exampleButton}
                onClick={() => setInput('Hello, World!')}
              >
                Hello, World!
              </button>
              <button
                className={styles.exampleButton}
                onClick={() => setInput('json0.dev')}
              >
                json0.dev
              </button>
            </div>
            <p className={styles.privacyText}>
              🔒 Your data never leaves this browser
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
