'use client';

import styles from './ValidationResults.module.css';
import type { ValidationResult } from '@/types/studio';
import { formatBytes } from '@/lib/utils/format';

interface ValidationResultsProps {
  results: ValidationResult;
}

export function ValidationResults({ results }: ValidationResultsProps) {
  const errors = results.errors.filter((e) => e.severity === 'error');
  const warnings = results.errors.filter((e) => e.severity === 'warning');
  const infos = results.errors.filter((e) => e.severity === 'info');

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <div className={styles.status} data-valid={results.valid}>
          {results.valid ? '✓ Valid JSON' : '✗ Invalid JSON'}
        </div>

        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Size</span>
            <span className={styles.metricValue}>{formatBytes(results.fileSize)}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Depth</span>
            <span className={styles.metricValue}>{results.depth}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Nodes</span>
            <span className={styles.metricValue}>{results.nodeCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {results.errors.length > 0 && (
        <div className={styles.issues}>
          {errors.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader} data-severity="error">
                {errors.length} Error{errors.length !== 1 ? 's' : ''}
              </div>
              <div className={styles.issuesList}>
                {errors.map((error, index) => (
                  <div key={index} className={styles.issue} data-severity="error">
                    {error.line > 0 && (
                      <div className={styles.issueLocation}>
                        Line {error.line}, Col {error.column}
                      </div>
                    )}
                    <div className={styles.issueMessage}>{error.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader} data-severity="warning">
                {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
              </div>
              <div className={styles.issuesList}>
                {warnings.map((warning, index) => (
                  <div key={index} className={styles.issue} data-severity="warning">
                    <div className={styles.issueMessage}>{warning.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {infos.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader} data-severity="info">
                {infos.length} Info
              </div>
              <div className={styles.issuesList}>
                {infos.map((info, index) => (
                  <div key={index} className={styles.issue} data-severity="info">
                    <div className={styles.issueMessage}>{info.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
