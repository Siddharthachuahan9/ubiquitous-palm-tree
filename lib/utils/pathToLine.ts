/**
 * JSON Path to Line Number Mapper
 * Maps JSONPath expressions to line numbers in formatted JSON
 */

interface LineMapping {
  path: string;
  lineNumber: number;
  column: number;
}

/**
 * Parse JSON and create a map of paths to line numbers
 * This walks through the formatted JSON and tracks line numbers for each path
 */
export function mapPathsToLines(jsonString: string): Map<string, LineMapping> {
  const pathMap = new Map<string, LineMapping>();

  try {
    const obj = JSON.parse(jsonString);
    const formatted = JSON.stringify(obj, null, 2);
    const lines = formatted.split('\n');

    // Walk through the object and track paths
    const stack: Array<{ path: string; key: string | number }> = [];
    let currentLine = 0;
    let currentPath = '$';

    function traverse(value: any, path: string, lineOffset: number): number {
      let line = lineOffset;

      if (Array.isArray(value)) {
        line++; // Opening bracket
        value.forEach((item, index) => {
          const itemPath = `${path}[${index}]`;
          pathMap.set(itemPath, { path: itemPath, lineNumber: line, column: 0 });
          line = traverse(item, itemPath, line);
        });
        line++; // Closing bracket
      } else if (typeof value === 'object' && value !== null) {
        line++; // Opening brace
        Object.entries(value).forEach(([key, val], index) => {
          const keyPath = path === '$' ? `$.${key}` : `${path}.${key}`;
          pathMap.set(keyPath, { path: keyPath, lineNumber: line, column: 0 });
          line = traverse(val, keyPath, line);
        });
        line++; // Closing brace
      } else {
        // Primitive value
        pathMap.set(path, { path, lineNumber: line, column: 0 });
        line++;
      }

      return line;
    }

    pathMap.set('$', { path: '$', lineNumber: 0, column: 0 });
    traverse(obj, '$', 0);

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
