'use client';

import styles from './JSONPathResults.module.css';
import type { JSONPathResult } from '@/types/studio';
import { MonacoEditor } from './MonacoEditor';

interface JSONPathResultsProps {
  results: JSONPathResult[];
}

export function JSONPathResults({ results }: JSONPathResultsProps) {
  if (results.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🔍</span>
        <p>No matches found</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.count}>{results.length} match{results.length !== 1 ? 'es' : ''} found</span>
      </div>

      <div className={styles.resultsList}>
        {results.map((result, index) => (
          <div key={index} className={styles.result}>
            <div className={styles.resultHeader}>
              <span className={styles.resultIndex}>#{index + 1}</span>
              <span className={styles.resultType}>{result.type}</span>
            </div>
            <div className={styles.resultPath}>{result.path}</div>
            <div className={styles.resultValue}>
              <MonacoEditor
                value={JSON.stringify(result.value, null, 2)}
                readOnly
                language="json"
                height="auto"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
