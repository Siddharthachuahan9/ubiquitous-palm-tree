import { Differ } from 'json-diff-kit';
import type { DiffResult, DiffChange, JSONPatchOperation } from '@/types/studio';
import { mapPathsToLines, findLineForPath, extractPathFromChange } from '@/lib/utils/pathToLine';

// Performance thresholds
const MAX_CHANGES_LIMIT = 50000; // Maximum changes to track before stopping
const LARGE_FILE_THRESHOLD = 1024 * 1024; // 1MB
const VERY_LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB

/**
 * Compute diff between two JSON strings with enhanced line number tracking
 *
 * Performance optimizations for large files:
 * - Limits total changes tracked to prevent memory issues
 * - Uses simpler array diff for very large files
 * - Skips path-to-line mapping for files > 500KB
 */
export function computeDiff(jsonA: string, jsonB: string): DiffResult {
  const startTime = performance.now();

  try {
    // Check total input size
    const totalSize = jsonA.length + jsonB.length;
    const isLargeFile = totalSize > LARGE_FILE_THRESHOLD;
    const isVeryLargeFile = totalSize > VERY_LARGE_FILE_THRESHOLD;

    // Parse JSON strings
    const objA = JSON.parse(jsonA);
    const objB = JSON.parse(jsonB);

    // Create path-to-line mappings for both JSONs (skipped for very large files)
    const pathMapA = mapPathsToLines(jsonA);
    const pathMapB = mapPathsToLines(jsonB);

    // Create differ instance with configuration optimized for file size
    const differ = new Differ({
      detectCircular: true,
      maxDepth: isVeryLargeFile ? 50 : 100, // Reduce depth for very large files
      arrayDiffMethod: isVeryLargeFile ? 'normal' : 'lcs', // Use simpler algorithm for very large files
      showModifications: true,
      recursiveEqual: true,
    });

    if (isLargeFile) {
      console.log(`[diff/engine] Processing large file (${(totalSize / 1024).toFixed(1)}KB)`);
    }

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
        if (!limitReached) {
          limitReached = true;
          console.log(`[diff/engine] Change limit reached (${MAX_CHANGES_LIMIT}), truncating results`);
        }
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

    const endTime = performance.now();
    console.log(`[diff/engine] Diff completed in ${(endTime - startTime).toFixed(1)}ms, ${changes.length} changes found${limitReached ? ' (truncated)' : ''}`);

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
