import { Differ } from 'json-diff-kit';
import type { DiffResult, DiffChange, JSONPatchOperation } from '@/types/studio';
import { mapPathsToLines, findLineForPath, extractPathFromChange } from '@/lib/utils/pathToLine';

// Performance thresholds
const MAX_CHANGES_LIMIT = 10000; // Maximum changes to track before stopping (reduced for better perf)
const LARGE_FILE_THRESHOLD = 100 * 1024; // 100KB - use fast diff (lowered from 500KB)
const VERY_LARGE_FILE_THRESHOLD = 500 * 1024; // 500KB - minimal processing

/**
 * Fast diff implementation for large files
 * Uses simple object comparison instead of LCS algorithm
 * Optimized for deeply nested structures like package-lock.json
 */
function computeFastDiff(objA: any, objB: any): { changes: DiffChange[]; additions: number; deletions: number; modifications: number } {
  const changes: DiffChange[] = [];
  let additions = 0;
  let deletions = 0;
  let modifications = 0;
  let operationCount = 0;
  const MAX_OPERATIONS = 100000; // Limit total operations to prevent freeze

  // Cache for expensive JSON.stringify comparisons
  const stringifyCache = new WeakMap<object, string>();

  function safeStringify(obj: any): string {
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }
    let cached = stringifyCache.get(obj);
    if (!cached) {
      cached = JSON.stringify(obj);
      stringifyCache.set(obj, cached);
    }
    return cached;
  }

  function compare(a: any, b: any, path: string, lineA: number, lineB: number, depth: number): void {
    operationCount++;
    // Early exit if we've hit any limit
    if (changes.length >= MAX_CHANGES_LIMIT || operationCount >= MAX_OPERATIONS || depth > 50) {
      return;
    }

    if (a === b) return;

    // Type mismatch
    if (typeof a !== typeof b || (a === null) !== (b === null)) {
      modifications++;
      changes.push({ type: 'modify', path, oldValue: a, newValue: b, lineA, lineB });
      return;
    }

    // Arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      const maxLen = Math.max(a.length, b.length);
      for (let i = 0; i < maxLen && changes.length < MAX_CHANGES_LIMIT && operationCount < MAX_OPERATIONS; i++) {
        const itemPath = `${path}[${i}]`;
        if (i >= a.length) {
          additions++;
          changes.push({ type: 'add', path: itemPath, newValue: b[i], lineA: 0, lineB: lineB + i });
        } else if (i >= b.length) {
          deletions++;
          changes.push({ type: 'remove', path: itemPath, oldValue: a[i], lineA: lineA + i, lineB: 0 });
        } else if (safeStringify(a[i]) !== safeStringify(b[i])) {
          // For nested objects/arrays, recurse
          if (typeof a[i] === 'object' && a[i] !== null && typeof b[i] === 'object' && b[i] !== null) {
            compare(a[i], b[i], itemPath, lineA + i, lineB + i, depth + 1);
          } else {
            modifications++;
            changes.push({ type: 'modify', path: itemPath, oldValue: a[i], newValue: b[i], lineA: lineA + i, lineB: lineB + i });
          }
        }
      }
      return;
    }

    // Objects
    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      const allKeys = new Set([...keysA, ...keysB]);

      // For very large objects at root level, limit key processing
      if (allKeys.size > 1000 && depth < 2) {
        // Just report the object as modified without deep comparison
        modifications++;
        changes.push({ type: 'modify', path, oldValue: `[Object with ${keysA.length} keys]`, newValue: `[Object with ${keysB.length} keys]`, lineA, lineB });
        return;
      }

      let keyIndex = 0;
      for (const key of allKeys) {
        if (changes.length >= MAX_CHANGES_LIMIT || operationCount >= MAX_OPERATIONS) break;
        const keyPath = path === '$' ? `$.${key}` : `${path}.${key}`;
        if (!(key in a)) {
          additions++;
          changes.push({ type: 'add', path: keyPath, newValue: b[key], lineA: 0, lineB: lineB + keyIndex });
        } else if (!(key in b)) {
          deletions++;
          changes.push({ type: 'remove', path: keyPath, oldValue: a[key], lineA: lineA + keyIndex, lineB: 0 });
        } else if (safeStringify(a[key]) !== safeStringify(b[key])) {
          if (typeof a[key] === 'object' && a[key] !== null && typeof b[key] === 'object' && b[key] !== null) {
            compare(a[key], b[key], keyPath, lineA + keyIndex, lineB + keyIndex, depth + 1);
          } else {
            modifications++;
            changes.push({ type: 'modify', path: keyPath, oldValue: a[key], newValue: b[key], lineA: lineA + keyIndex, lineB: lineB + keyIndex });
          }
        }
        keyIndex++;
      }
      return;
    }

    // Primitives
    if (a !== b) {
      modifications++;
      changes.push({ type: 'modify', path, oldValue: a, newValue: b, lineA, lineB });
    }
  }

  compare(objA, objB, '$', 0, 0, 0);
  return { changes, additions, deletions, modifications };
}

/**
 * Compute diff between two JSON strings with enhanced line number tracking
 *
 * Performance optimizations for large files:
 * - Uses fast custom diff for files > 500KB (avoids slow LCS algorithm)
 * - Limits total changes tracked to prevent memory issues
 * - Skips path-to-line mapping for files > 500KB
 */
/**
 * Count total keys/items in an object (shallow + one level deep)
 */
function countComplexity(obj: any): number {
  if (obj === null || typeof obj !== 'object') return 1;

  let count = 0;
  if (Array.isArray(obj)) {
    count = obj.length;
    // Sample first few items for complexity
    for (let i = 0; i < Math.min(5, obj.length); i++) {
      if (typeof obj[i] === 'object' && obj[i] !== null) {
        count += Object.keys(obj[i]).length;
      }
    }
  } else {
    const keys = Object.keys(obj);
    count = keys.length;
    // Check first level depth
    for (const key of keys.slice(0, 10)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count += Object.keys(obj[key]).length;
      }
    }
  }
  return count;
}

export function computeDiff(jsonA: string, jsonB: string): DiffResult {
  try {
    // Check total input size
    const totalSize = jsonA.length + jsonB.length;
    const isLargeFile = totalSize > LARGE_FILE_THRESHOLD;
    const isVeryLargeFile = totalSize > VERY_LARGE_FILE_THRESHOLD;

    // Parse JSON strings
    const objA = JSON.parse(jsonA);
    const objB = JSON.parse(jsonB);

    // Check object complexity (number of keys) - package-lock.json has thousands
    const complexityA = countComplexity(objA);
    const complexityB = countComplexity(objB);
    const isComplex = complexityA > 500 || complexityB > 500;

    // For large files OR complex objects, use our fast diff instead of json-diff-kit
    if (isLargeFile || isComplex) {
      const result = computeFastDiff(objA, objB);

      // Generate JSON Patch
      const patch = generateJSONPatch(result.changes);

      return {
        additions: result.additions,
        deletions: result.deletions,
        modifications: result.modifications,
        moves: 0,
        changes: result.changes,
        patch,
      };
    }

    // For smaller files, use json-diff-kit with full features
    // Create path-to-line mappings for both JSONs
    const pathMapA = mapPathsToLines(jsonA);
    const pathMapB = mapPathsToLines(jsonB);

    // Create differ instance with configuration
    const differ = new Differ({
      detectCircular: true,
      maxDepth: 100,
      arrayDiffMethod: 'lcs', // Use LCS only for smaller files
      showModifications: true,
      recursiveEqual: true,
    });

    // Compute diff - returns tuple: [leftSideChanges[], rightSideChanges[]]
    const [leftChanges, rightChanges] = differ.diff(objA, objB);

    // Process diff results
    const changes: DiffChange[] = [];
    let additions = 0;
    let deletions = 0;
    let modifications = 0;
    let moves = 0;
    let limitReached = false;

    // Track paths we've seen to avoid duplicates
    const seenPaths = new Set<string>();

    // Helper to check if we've hit the limit
    const checkLimit = () => {
      if (changes.length >= MAX_CHANGES_LIMIT) {
        limitReached = true;
        return true;
      }
      return false;
    };

    // Process left-side changes (deletions/modifications in A)
    for (const change of leftChanges) {
      if (checkLimit()) break;

      const path = extractPathFromChange(change);
      const changeKey = `${change.type}-${path}`;

      // Skip if we've already processed this path
      if (seenPaths.has(changeKey)) continue;
      seenPaths.add(changeKey);

      const lineA = findLineForPath(pathMapA, path) ?? 0;
      const lineB = findLineForPath(pathMapB, path) ?? 0;

      if (change.type === 'remove') {
        deletions++;
        changes.push({
          type: 'remove',
          path,
          oldValue: change.text,
          lineA,
          lineB,
        });
      } else if (change.type === 'modify') {
        // Handle on right side
      }
    }

    // Process right-side changes (additions/modifications in B)
    for (const change of rightChanges) {
      if (checkLimit()) break;

      const path = extractPathFromChange(change);
      const changeKey = `${change.type}-${path}`;

      // Skip if we've already processed this path
      if (seenPaths.has(changeKey)) continue;
      seenPaths.add(changeKey);

      const lineA = findLineForPath(pathMapA, path) ?? 0;
      const lineB = findLineForPath(pathMapB, path) ?? 0;

      if (change.type === 'add') {
        additions++;
        changes.push({
          type: 'add',
          path,
          newValue: change.text,
          lineA,
          lineB,
        });
      } else if (change.type === 'modify') {
        modifications++;
        // Find corresponding left change for old value
        const leftChange = leftChanges.find((lc: any) => {
          const lPath = extractPathFromChange(lc);
          return lPath === path && lc.type === 'modify';
        });

        changes.push({
          type: 'modify',
          path,
          oldValue: leftChange?.text ?? change.text,
          newValue: change.text,
          lineA,
          lineB,
        });
      }
    }

    // Generate JSON Patch (RFC 6902)
    const patch = generateJSONPatch(changes);

    return {
      additions,
      deletions,
      modifications,
      moves,
      changes,
      patch,
    };
  } catch (error) {
    throw new Error(`Diff computation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate RFC 6902 JSON Patch from diff changes
 */
function generateJSONPatch(changes: DiffChange[]): JSONPatchOperation[] {
  const patch: JSONPatchOperation[] = [];

  changes.forEach((change) => {
    const path = formatPath(change.path);

    switch (change.type) {
      case 'add':
        patch.push({
          op: 'add',
          path,
          value: change.newValue,
        });
        break;

      case 'remove':
        patch.push({
          op: 'remove',
          path,
        });
        break;

      case 'modify':
        patch.push({
          op: 'replace',
          path,
          value: change.newValue,
        });
        break;

      case 'move':
        patch.push({
          op: 'move',
          from: formatPath(change.oldValue),
          path: formatPath(change.newValue),
        });
        break;
    }
  });

  return patch;
}

/**
 * Format path for JSON Patch (ensure it starts with /)
 */
function formatPath(path: string | any): string {
  if (typeof path !== 'string') {
    return '/';
  }

  if (path.startsWith('$.')) {
    // Convert JSONPath format to JSON Pointer format
    return '/' + path.slice(2).replace(/\./g, '/').replace(/\[(\d+)\]/g, '/$1');
  }

  if (!path.startsWith('/')) {
    return '/' + path.replace(/\./g, '/');
  }

  return path;
}

/**
 * Get human-readable summary of changes
 */
export function getDiffSummary(result: DiffResult): string {
  const parts: string[] = [];

  if (result.additions > 0) {
    parts.push(`${result.additions} addition${result.additions !== 1 ? 's' : ''}`);
  }

  if (result.deletions > 0) {
    parts.push(`${result.deletions} deletion${result.deletions !== 1 ? 's' : ''}`);
  }

  if (result.modifications > 0) {
    parts.push(`${result.modifications} modification${result.modifications !== 1 ? 's' : ''}`);
  }

  if (result.moves > 0) {
    parts.push(`${result.moves} move${result.moves !== 1 ? 's' : ''}`);
  }

  if (parts.length === 0) {
    return 'No changes';
  }

  return parts.join(', ');
}
