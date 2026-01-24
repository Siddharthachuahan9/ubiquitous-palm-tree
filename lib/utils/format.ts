/**
 * Format JSON string with proper indentation
 */
export function formatJSON(json: string, indent: number = 2): string {
  try {
    const obj = JSON.parse(json);
    return JSON.stringify(obj, null, indent);
  } catch (error) {
    throw new Error(`Cannot format invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Minify JSON string (remove all whitespace)
 */
export function minifyJSON(json: string): string {
  try {
    const obj = JSON.parse(json);
    return JSON.stringify(obj);
  } catch (error) {
    throw new Error(`Cannot minify invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Sort JSON object keys alphabetically (recursive)
 */
export function sortJSONKeys(json: string): string {
  try {
    const obj = JSON.parse(json);
    const sorted = sortObjectKeys(obj);
    return JSON.stringify(sorted, null, 2);
  } catch (error) {
    throw new Error(`Cannot sort invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function sortObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  const sorted: any = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = sortObjectKeys(obj[key]);
    });

  return sorted;
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format milliseconds to human-readable time
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Get cursor position info for Monaco editor
 */
export function formatCursorPosition(line: number, column: number): string {
  return `Ln ${line}, Col ${column}`;
}
