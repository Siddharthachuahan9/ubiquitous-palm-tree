import { Differ } from 'json-diff-kit';
import type { DiffResult, DiffChange, JSONPatchOperation } from '@/types/studio';

/**
 * Compute diff between two JSON strings
 */
export function computeDiff(jsonA: string, jsonB: string): DiffResult {
  try {
    // Parse JSON strings
    const objA = JSON.parse(jsonA);
    const objB = JSON.parse(jsonB);

    // Create differ instance with configuration
    const differ = new Differ({
      detectCircular: true,
      maxDepth: 100,
      arrayDiffMethod: 'lcs', // Longest common subsequence for arrays
      showModifications: true,
      recursiveEqual: true,
    });

    // Compute diff
    const diff = differ.diff(objA, objB);

    // Process diff results
    const changes: DiffChange[] = [];
    let additions = 0;
    let deletions = 0;
    let modifications = 0;
    let moves = 0;

    // Extract changes from diff result
    if (Array.isArray(diff)) {
      diff.forEach((change: any) => {
        const changeType = change.type || change.op;

        if (changeType === 'add' || changeType === 'added') {
          additions++;
          changes.push({
            type: 'add',
            path: change.path || change.key || '',
            newValue: change.value || change.rhs,
          });
        } else if (changeType === 'remove' || changeType === 'removed') {
          deletions++;
          changes.push({
            type: 'remove',
            path: change.path || change.key || '',
            oldValue: change.value || change.lhs,
          });
        } else if (changeType === 'modify' || changeType === 'modified' || changeType === 'replace') {
          modifications++;
          changes.push({
            type: 'modify',
            path: change.path || change.key || '',
            oldValue: change.oldValue || change.lhs,
            newValue: change.newValue || change.rhs,
          });
        } else if (changeType === 'move') {
          moves++;
          changes.push({
            type: 'move',
            path: change.path || change.key || '',
            oldValue: change.from,
            newValue: change.to,
          });
        }
      });
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
