/**
 * JSON Path to Line Number Mapper
 * Maps JSONPath expressions to line numbers in formatted JSON
 *
 * Performance optimizations for large files:
 * - Early termination for files > 500KB
 * - Max path count limit to prevent memory issues
 * - Iterative traversal to avoid stack overflow
 */

interface LineMapping {
  path: string;
  lineNumber: number;
  column: number;
}

// Performance thresholds
const MAX_FILE_SIZE_FOR_MAPPING = 500 * 1024; // 500KB
const MAX_PATH_COUNT = 10000; // Maximum paths to track

/**
 * Parse JSON and create a map of paths to line numbers
 * This walks through the formatted JSON and tracks line numbers for each path
 *
 * For large files (>500KB), returns an empty map and falls back to line-based matching
 */
export function mapPathsToLines(jsonString: string): Map<string, LineMapping> {
  const pathMap = new Map<string, LineMapping>();

  // Skip path mapping for very large files
  if (jsonString.length > MAX_FILE_SIZE_FOR_MAPPING) {
    console.log(`[pathToLine] Skipping path mapping for large file (${(jsonString.length / 1024).toFixed(1)}KB)`);
    return pathMap;
  }

  try {
    const obj = JSON.parse(jsonString);
    const formatted = JSON.stringify(obj, null, 2);
    const lines = formatted.split('\n');

    // Use iterative approach with a work queue to avoid stack overflow
    const workQueue: Array<{ value: any; path: string; lineOffset: number }> = [];
    let pathCount = 0;

    pathMap.set('$', { path: '$', lineNumber: 0, column: 0 });
    pathCount++;

    function traverse(value: any, path: string, lineOffset: number): number {
      // Check path count limit
      if (pathCount >= MAX_PATH_COUNT) {
        return lineOffset + 1;
      }

      let line = lineOffset;

      if (Array.isArray(value)) {
        line++; // Opening bracket
        for (let index = 0; index < value.length; index++) {
          if (pathCount >= MAX_PATH_COUNT) break;
          const itemPath = `${path}[${index}]`;
          pathMap.set(itemPath, { path: itemPath, lineNumber: line, column: 0 });
          pathCount++;
          line = traverse(value[index], itemPath, line);
        }
        line++; // Closing bracket
      } else if (typeof value === 'object' && value !== null) {
        line++; // Opening brace
        const entries = Object.entries(value);
        for (let i = 0; i < entries.length; i++) {
          if (pathCount >= MAX_PATH_COUNT) break;
          const [key, val] = entries[i];
          const keyPath = path === '$' ? `$.${key}` : `${path}.${key}`;
          pathMap.set(keyPath, { path: keyPath, lineNumber: line, column: 0 });
          pathCount++;
          line = traverse(val, keyPath, line);
        }
        line++; // Closing brace
      } else {
        // Primitive value
        if (pathCount < MAX_PATH_COUNT) {
          pathMap.set(path, { path, lineNumber: line, column: 0 });
          pathCount++;
        }
        line++;
      }

      return line;
    }

    traverse(obj, '$', 0);

    if (pathCount >= MAX_PATH_COUNT) {
      console.log(`[pathToLine] Path limit reached (${MAX_PATH_COUNT}), some paths may not be mapped`);
    }

    return pathMap;
  } catch (error) {
    console.error('Failed to map paths to lines:', error);
    return new Map();
  }
}

/**
 * Find line number for a given JSON path
 * Handles various path formats: JSONPath, JSON Pointer, dot notation
 */
export function findLineForPath(pathMap: Map<string, LineMapping>, path: string): number | null {
  // Try exact match first
  const exact = pathMap.get(path);
  if (exact) return exact.lineNumber;

  // Try normalizing the path
  const normalized = normalizePath(path);
  const match = pathMap.get(normalized);
  if (match) return match.lineNumber;

  // Try finding closest parent path
  const segments = normalized.split('.');
  while (segments.length > 0) {
    const parentPath = segments.join('.');
    const parent = pathMap.get(parentPath);
    if (parent) return parent.lineNumber;
    segments.pop();
  }

  return null;
}

/**
 * Normalize path to JSONPath format
 */
function normalizePath(path: string): string {
  // Already in JSONPath format
  if (path.startsWith('$.')) return path;

  // JSON Pointer format (/foo/bar)
  if (path.startsWith('/')) {
    return '$.' + path.slice(1).replace(/\//g, '.');
  }

  // Line number format ("Line 5")
  if (path.startsWith('Line ')) {
    // Can't convert line number back to path
    return path;
  }

  // Dot notation (foo.bar)
  return '$.' + path;
}

/**
 * Extract path from change text
 * Attempts to parse the actual JSON path from diff output
 */
export function extractPathFromChange(change: any): string {
  // If change has a path property, use it
  if (change.path && !change.path.startsWith('Line ')) {
    return change.path;
  }

  // Try to extract from text
  if (change.text) {
    const text = String(change.text);

    // Look for quoted keys: "key": value
    const keyMatch = text.match(/"([^"]+)":/);
    if (keyMatch) {
      return '$.' + keyMatch[1];
    }

    // Look for array index: [0]
    const indexMatch = text.match(/\[(\d+)\]/);
    if (indexMatch) {
      return '$[' + indexMatch[1] + ']';
    }
  }

  // Fallback to line number if available
  if (change.lineNumber) {
    return `Line ${change.lineNumber}`;
  }

  return '$';
}

/**
 * Calculate column position for a path in JSON
 */
export function calculateColumn(jsonString: string, lineNumber: number): number {
  const lines = jsonString.split('\n');
  if (lineNumber < 0 || lineNumber >= lines.length) return 0;

  const line = lines[lineNumber];
  // Find first non-whitespace character
  const match = line.match(/^\s*/);
  return match ? match[0].length : 0;
}
