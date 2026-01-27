'use client';

import { useState } from 'react';
import {
  generateBulkUUIDs,
  formatUUID,
  getUUIDInfo,
  UUIDResult,
  UUIDVersion,
} from '@/lib/utils/uuidGenerator';
import styles from './UUIDGenerator.module.css';

export function UUIDGenerator() {
  const [version, setVersion] = useState<UUIDVersion>('v4');
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<UUIDResult[]>([]);
  const [format, setFormat] = useState<'lower' | 'upper' | 'nodash'>('lower');

  const handleGenerate = () => {
    const uuids = generateBulkUUIDs(count, version);
    setResults(uuids);
  };

  const handleCopyAll = () => {
    const allUUIDs = results.map((r) => formatUUID(r.uuid, format)).join('\n');
    navigator.clipboard.writeText(allUUIDs);
  };

  const handleCopy = (uuid: string) => {
    const formatted = formatUUID(uuid, format);
    navigator.clipboard.writeText(formatted);
  };

  const handleClear = () => {
    setResults([]);
  };

  const info = getUUIDInfo(version);

  return (
    <div className={styles.container}>
      {/* Input Panel */}
      <div className={styles.inputPanel}>
        <div className={styles.header}>
          <h2 className={styles.title}>UUID Generator</h2>
          <p className={styles.subtitle}>Generate unique identifiers (v4, v1-like, nil)</p>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Version</label>
          <div className={styles.versionSelector}>
            <button
              className={version === 'v4' ? styles.versionActive : styles.versionButton}
              onClick={() => setVersion('v4')}
            >
              UUID v4
            </button>
            <button
              className={version === 'v1-like' ? styles.versionActive : styles.versionButton}
              onClick={() => setVersion('v1-like')}
            >
              UUID v1-like
            </button>
            <button
              className={version === 'nil' ? styles.versionActive : styles.versionButton}
              onClick={() => setVersion('nil')}
            >
              Nil UUID
            </button>
          </div>
        </div>

        <div className={styles.infoBox}>
          <strong>{info.name}</strong>
          <p className={styles.infoText}>{info.description}</p>
          <p className={styles.infoUseCase}>Use case: {info.useCase}</p>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="count-input" className={styles.label}>
            Count
          </label>
          <input
            id="count-input"
            type="number"
            className={styles.input}
            min="1"
            max="1000"
            value={count}
            onChange={(e) => setCount(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Format</label>
          <select
            className={styles.select}
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
          >
            <option value="lower">Lowercase</option>
            <option value="upper">Uppercase</option>
            <option value="nodash">No dashes</option>
          </select>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={handleGenerate}>
            Generate UUIDs
          </button>
          {results.length > 0 && (
            <>
              <button className={styles.secondaryButton} onClick={handleCopyAll}>
                Copy All
              </button>
              <button className={styles.secondaryButton} onClick={handleClear}>
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Results Panel */}
      <div className={styles.resultsPanel}>
        {results.length > 0 ? (
          <div className={styles.results}>
            <div className={styles.resultHeader}>
              <h3 className={styles.resultTitle}>
                Generated {results.length} {results.length === 1 ? 'UUID' : 'UUIDs'}
              </h3>
            </div>

            <div className={styles.uuidList}>
              {results.map((result, index) => {
                const formatted = formatUUID(result.uuid, format);

                return (
                  <div key={index} className={styles.uuidItem}>
                    <div className={styles.uuidValue}>
                      <code>{formatted}</code>
                    </div>
                    <button
                      className={styles.copyButton}
                      onClick={() => handleCopy(result.uuid)}
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                );
              })}
            </div>

            <div className={styles.privacyNote}>
              🔒 All generation happens locally in your browser
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🆔</span>
            <p className={styles.emptyTitle}>Ready to generate</p>
            <p className={styles.emptyText}>
              Generate cryptographically secure unique identifiers using Web Crypto API
            </p>
            <p className={styles.privacyText}>🔒 Your data never leaves this browser</p>
          </div>
        )}
      </div>
    </div>
  );
}
