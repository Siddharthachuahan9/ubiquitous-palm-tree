'use client';

import { useState } from 'react';
import { pingHost, PingResult } from '@/lib/utils/networkCheck';
import { formatTime } from '@/lib/utils/formatters';
import styles from './PingTool.module.css';

export function PingTool() {
  const [host, setHost] = useState('');
  const [interval, setInterval] = useState(1000);
  const [results, setResults] = useState<PingResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [stopFunction, setStopFunction] = useState<(() => void) | null>(null);

  const handleSinglePing = async () => {
    if (!host.trim()) {
      return;
    }

    const result = await pingHost(host.trim(), { timeout: 5000 });
    setResults((prev) => [result, ...prev].slice(0, 100)); // Keep last 100 results
  };

  const handleStartContinuous = () => {
    if (!host.trim()) {
      return;
    }

    setIsRunning(true);
    setResults([]);

    let active = true;

    const ping = async () => {
      if (!active) return;

      const result = await pingHost(host.trim(), { timeout: 5000 });
      setResults((prev) => [result, ...prev].slice(0, 100));

      if (active) {
        setTimeout(ping, interval);
      }
    };

    ping();

    const stop = () => {
      active = false;
      setIsRunning(false);
    };

    setStopFunction(() => stop);
  };

  const handleStop = () => {
    if (stopFunction) {
      stopFunction();
      setStopFunction(null);
    }
    setIsRunning(false);
  };

  const handleClear = () => {
    handleStop();
    setResults([]);
    setHost('');
  };

  const getStats = () => {
    if (results.length === 0) {
      return { success: 0, failure: 0, timeout: 0, avgTime: 0 };
    }

    const success = results.filter((r) => r.status === 'success').length;
    const failure = results.filter((r) => r.status === 'failure').length;
    const timeout = results.filter((r) => r.status === 'timeout').length;

    const successTimes = results
      .filter((r) => r.status === 'success' && r.responseTime !== null)
      .map((r) => r.responseTime!);

    const avgTime =
      successTimes.length > 0
        ? Math.round(successTimes.reduce((a, b) => a + b, 0) / successTimes.length)
        : 0;

    return { success, failure, timeout, avgTime };
  };

  const stats = getStats();

  return (
    <div className={styles.container}>
      {/* Input Panel */}
      <div className={styles.inputPanel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Ping Tool</h2>
          <p className={styles.subtitle}>
            Test network reachability via HTTPS (browser-safe)
          </p>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="host-input" className={styles.label}>
            Host or URL
          </label>
          <input
            id="host-input"
            type="text"
            className={styles.input}
            placeholder="Enter hostname or URL (e.g., google.com or https://api.example.com)"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            disabled={isRunning}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="interval-input" className={styles.label}>
            Interval (ms)
          </label>
          <input
            id="interval-input"
            type="number"
            className={styles.input}
            min="500"
            max="10000"
            step="100"
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            disabled={isRunning}
          />
        </div>

        <div className={styles.actions}>
          {!isRunning ? (
            <>
              <button className={styles.primaryButton} onClick={handleSinglePing}>
                Single Ping
              </button>
              <button className={styles.primaryButton} onClick={handleStartContinuous}>
                Start Continuous
              </button>
              <button className={styles.secondaryButton} onClick={handleClear}>
                Clear
              </button>
            </>
          ) : (
            <button className={styles.stopButton} onClick={handleStop}>
              Stop Pinging
            </button>
          )}
        </div>

        {/* Stats */}
        {results.length > 0 && (
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.success}</span>
              <span className={styles.statLabel}>Success</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.failure}</span>
              <span className={styles.statLabel}>Failure</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.timeout}</span>
              <span className={styles.statLabel}>Timeout</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.avgTime}ms</span>
              <span className={styles.statLabel}>Avg Time</span>
            </div>
          </div>
        )}
      </div>

      {/* Results Panel */}
      <div className={styles.resultsPanel}>
        {results.length > 0 ? (
          <div className={styles.results}>
            <div className={styles.resultHeader}>
              <h3 className={styles.resultTitle}>
                Ping Log ({results.length} {results.length === 1 ? 'result' : 'results'})
              </h3>
              {isRunning && <span className={styles.runningBadge}>Running...</span>}
            </div>

            <div className={styles.logContainer}>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`${styles.logEntry} ${styles[`log${result.status}`]}`}
                >
                  <span className={styles.logTime}>{formatTime(result.timestamp)}</span>
                  <span className={styles.logHost}>{result.host}</span>
                  <span className={styles.logStatus}>
                    {result.status === 'success' && '✓'}
                    {result.status === 'failure' && '✗'}
                    {result.status === 'timeout' && '⏱'}
                  </span>
                  <span className={styles.logResponse}>
                    {result.responseTime !== null ? `${result.responseTime}ms` : '-'}
                  </span>
                  {result.error && <span className={styles.logError}>{result.error}</span>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📡</span>
            <p className={styles.emptyTitle}>Ready to ping</p>
            <p className={styles.emptyText}>
              Enter a hostname or URL and click Single Ping to test, or Start Continuous to
              monitor over time.
            </p>
            <div className={styles.examples}>
              <p className={styles.examplesTitle}>Try these examples:</p>
              <button className={styles.exampleButton} onClick={() => setHost('google.com')}>
                google.com
              </button>
              <button className={styles.exampleButton} onClick={() => setHost('github.com')}>
                github.com
              </button>
              <button
                className={styles.exampleButton}
                onClick={() => setHost('api.github.com')}
              >
                api.github.com
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
