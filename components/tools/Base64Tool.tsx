'use client';

import { useState } from 'react';
import {
  encodeBase64,
  decodeBase64,
  detectInputType,
  Base64Result,
} from '@/lib/utils/base64';
import styles from './Base64Tool.module.css';

type Mode = 'encode' | 'decode' | 'auto';

export function Base64Tool() {
  const [mode, setMode] = useState<Mode>('auto');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Base64Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = () => {
    if (!input.trim()) {
      setError('Please enter text or Base64 data');
      setResult(null);
      return;
    }

    try {
      if (mode === 'encode') {
        const encoded = encodeBase64(input);
        setResult(encoded);
        setError(null);
      } else if (mode === 'decode') {
        const decoded = decodeBase64(input);
        setResult(decoded);
        setError(null);
      } else {
        // Auto mode
        const detectedType = detectInputType(input);
        if (detectedType === 'base64') {
          const decoded = decodeBase64(input);
          setResult(decoded);
          setError(null);
        } else {
          const encoded = encodeBase64(input);
          setResult(encoded);
          setError(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setResult(null);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setError(null);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.output);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleProcess();
    }
  };

  return (
    <div className={styles.container}>
      {/* Input Panel */}
      <div className={styles.inputPanel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Base64 Encoder/Decoder</h2>
          <p className={styles.subtitle}>
            Encode and decode Base64 strings with proper UTF-8 support
          </p>
        </div>

        <div className={styles.modeSelector}>
          <button
            className={mode === 'auto' ? styles.modeActive : styles.modeButton}
            onClick={() => setMode('auto')}
          >
            Auto
          </button>
          <button
            className={mode === 'encode' ? styles.modeActive : styles.modeButton}
            onClick={() => setMode('encode')}
          >
            Encode
          </button>
          <button
            className={mode === 'decode' ? styles.modeActive : styles.modeButton}
            onClick={() => setMode('decode')}
          >
            Decode
          </button>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="base64-input" className={styles.label}>
            Input
          </label>
          <textarea
            id="base64-input"
            className={styles.textarea}
            placeholder={
              mode === 'encode'
                ? 'Enter text to encode...'
                : mode === 'decode'
                ? 'Enter Base64 to decode...'
                : 'Enter text or Base64 (auto-detected)...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={8}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={handleProcess}>
            {mode === 'encode' ? 'Encode' : mode === 'decode' ? 'Decode' : 'Process'}
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
              <h3 className={styles.resultTitle}>Output</h3>
              <button className={styles.copyButton} onClick={handleCopy}>
                📋 Copy
              </button>
            </div>

            <div className={styles.outputBox}>
              <textarea
                className={styles.outputText}
                value={result.output}
                readOnly
                rows={8}
              />
            </div>

            <div className={styles.metadata}>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Input Size:</span>
                <span className={styles.metadataValue}>{result.inputSize} chars</span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Output Size:</span>
                <span className={styles.metadataValue}>{result.outputSize} chars</span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Encoding:</span>
                <span className={styles.metadataValue}>{result.encoding}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔤</span>
            <p className={styles.emptyTitle}>Enter text to process</p>
            <p className={styles.emptyText}>
              Use Auto mode to automatically detect if input is Base64 or plain text
            </p>
            <div className={styles.examples}>
              <p className={styles.examplesTitle}>Try encoding:</p>
              <button
                className={styles.exampleButton}
                onClick={() => {
                  setInput('Hello, World!');
                  setMode('encode');
                }}
              >
                Hello, World!
              </button>
              <button
                className={styles.exampleButton}
                onClick={() => {
                  setInput('json0.dev - json tools, zero hassle');
                  setMode('encode');
                }}
              >
                json0.dev message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
