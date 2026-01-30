import type { ValidationError, ValidationResult } from '@/types/studio';

/**
 * Validate JSON and provide detailed analysis
 */
export function validateJSON(json: string): ValidationResult {
  const errors: ValidationError[] = [];
  let parsedObject: any = null;

  // Try to parse JSON
  try {
    parsedObject = JSON.parse(json);
  } catch (error) {
    // Extract error details
    const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
    const { line, column } = extractErrorPosition(json, errorMessage);

    errors.push({
      line,
      column,
      message: errorMessage,
      severity: 'error',
    });

    return {
      valid: false,
      errors,
      fileSize: json.length,
      depth: 0,
      nodeCount: 0,
    };
  }

  // Calculate metrics first (lightweight)
  const fileSize = json.length;
  const lineCount = json.split('\n').length;

  // Skip expensive operations for large files (>5000 lines or >500KB)
  const isLargeFile = lineCount > 5000 || fileSize > 500_000;

  // Structural linting - skip for large files (expensive recursive traversal)
  if (!isLargeFile) {
    const lintErrors = performStructuralLinting(parsedObject);
    errors.push(...lintErrors);
  } else {
    errors.push({
      line: 0,
      column: 0,
      message: 'Structural linting skipped for large files to maintain performance.',
      severity: 'info',
    });
  }

  // Calculate depth and node count (skip for very large files)
  const depth = isLargeFile ? 0 : calculateDepth(parsedObject);
  const nodeCount = isLargeFile ? 0 : countNodes(parsedObject);

  // Performance warnings
  if (fileSize > 1_000_000) {
    errors.push({
      line: 0,
      column: 0,
      message: `Large file size (${formatBytes(fileSize)}). Performance optimizations enabled.`,
      severity: 'warning',
    });
  }

  if (!isLargeFile) {
    if (depth > 50) {
      errors.push({
        line: 0,
        column: 0,
        message: `Deep nesting detected (${depth} levels). This may impact performance.`,
        severity: 'warning',
      });
    }

    if (nodeCount > 100_000) {
      errors.push({
        line: 0,
        column: 0,
        message: `Large number of nodes (${nodeCount.toLocaleString()}). Consider splitting the data.`,
        severity: 'warning',
      });
    }
  }

  return {
    valid: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
    fileSize,
    depth,
    nodeCount,
  };
}

/**
 * Extract line and column from JSON parse error
 */
function extractErrorPosition(json: string, errorMessage: string): { line: number; column: number } {
  // Try to extract position from error message
  const positionMatch = errorMessage.match(/position\s+(\d+)/i);
  if (positionMatch) {
    const position = parseInt(positionMatch[1]);
    return getLineColumn(json, position);
  }

  // Try to extract line from error message
  const lineMatch = errorMessage.match(/line\s+(\d+)/i);
  if (lineMatch) {
    return { line: parseInt(lineMatch[1]), column: 0 };
  }

  return { line: 1, column: 1 };
}

/**
 * Convert character position to line and column
 */
function getLineColumn(text: string, position: number): { line: number; column: number } {
  const lines = text.substring(0, position).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

/**
 * Perform structural linting checks
 */
function performStructuralLinting(obj: any, path: string = '$'): ValidationError[] {
  const errors: ValidationError[] = [];

  if (obj === null || typeof obj !== 'object') {
    return errors;
  }

  // Check for duplicate keys (this is caught by JSON.parse, but adding for completeness)
  if (!Array.isArray(obj)) {
    const keys = Object.keys(obj);
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);

    if (duplicates.length > 0) {
      errors.push({
        line: 0,
        column: 0,
        message: `Duplicate keys found at ${path}: ${duplicates.join(', ')}`,
        severity: 'error',
      });
    }

    // Recursively check nested objects
    for (const key of keys) {
      const nestedErrors = performStructuralLinting(obj[key], `${path}.${key}`);
      errors.push(...nestedErrors);
    }
  } else {
    // Check array consistency
    if (obj.length > 0) {
      const types = new Set(obj.map((item) => typeof item));
      if (types.size > 1) {
        errors.push({
          line: 0,
          column: 0,
          message: `Mixed types in array at ${path}: ${Array.from(types).join(', ')}`,
          severity: 'info',
        });
      }
    }

    // Recursively check array elements
    obj.forEach((item, index) => {
      const nestedErrors = performStructuralLinting(item, `${path}[${index}]`);
      errors.push(...nestedErrors);
    });
  }

  return errors;
}

/**
 * Calculate maximum nesting depth
 */
function calculateDepth(obj: any, currentDepth: number = 1): number {
  if (obj === null || typeof obj !== 'object') {
    return currentDepth;
  }

  const values = Array.isArray(obj) ? obj : Object.values(obj);

  if (values.length === 0) {
    return currentDepth;
  }

  const depths = values.map((value) => calculateDepth(value, currentDepth + 1));
  return Math.max(...depths);
}

/**
 * Count total number of nodes
 */
function countNodes(obj: any): number {
  if (obj === null || typeof obj !== 'object') {
    return 1;
  }

  const values = Array.isArray(obj) ? obj : Object.values(obj);
  const childCount = values.reduce((sum, value) => sum + countNodes(value), 0);

  return 1 + childCount;
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
