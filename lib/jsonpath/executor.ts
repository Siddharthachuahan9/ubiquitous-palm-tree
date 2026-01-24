import { JSONPath } from 'jsonpath-plus';
import type { JSONPathResult } from '@/types/studio';

/**
 * Execute a JSONPath query against JSON data
 */
export function executeJSONPath(query: string, json: string): JSONPathResult[] {
  try {
    // Parse JSON string
    const obj = JSON.parse(json);

    // Validate query
    if (!query || query.trim() === '') {
      throw new Error('JSONPath query cannot be empty');
    }

    // Execute JSONPath query
    const results = JSONPath({
      path: query,
      json: obj,
      resultType: 'all', // Returns both path and value
      preventEval: true, // Security: disable script expressions
      wrap: true, // Always return array
    });

    // Transform results to our format
    return results.map((result: any) => ({
      path: result.path || result.pointer || '',
      value: result.value,
      type: getValueType(result.value),
      pointer: result.pointer || result.path || '',
    }));
  } catch (error) {
    if (error instanceof Error) {
      // Provide more helpful error messages
      if (error.message.includes('Unexpected')) {
        throw new Error(`Invalid JSONPath syntax: ${error.message}`);
      }
      if (error.message.includes('JSON')) {
        throw new Error(`Invalid JSON: ${error.message}`);
      }
      throw new Error(`JSONPath execution failed: ${error.message}`);
    }
    throw new Error('JSONPath execution failed: Unknown error');
  }
}

/**
 * Get detailed type information for a value
 */
function getValueType(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return `array[${value.length}]`;
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    return `object{${keys.length}}`;
  }
  if (typeof value === 'string') return `string(${value.length})`;
  return typeof value;
}

/**
 * Validate JSONPath query syntax
 */
export function validateJSONPathQuery(query: string): { valid: boolean; error?: string } {
  try {
    if (!query || query.trim() === '') {
      return { valid: false, error: 'Query cannot be empty' };
    }

    // Basic validation - check if it starts with $
    if (!query.trim().startsWith('$')) {
      return { valid: false, error: 'JSONPath query must start with $' };
    }

    // Try to execute against empty object to validate syntax
    JSONPath({
      path: query,
      json: {},
      preventEval: true,
    });

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid query',
    };
  }
}

/**
 * Get common JSONPath query examples
 */
export function getJSONPathExamples(): Array<{ label: string; query: string; description: string }> {
  return [
    {
      label: 'All properties',
      query: '$.*',
      description: 'Select all top-level properties',
    },
    {
      label: 'Array elements',
      query: '$.users[*]',
      description: 'Select all elements in the users array',
    },
    {
      label: 'Nested property',
      query: '$.users[*].name',
      description: 'Select name property from all users',
    },
    {
      label: 'Array index',
      query: '$.users[0]',
      description: 'Select first user',
    },
    {
      label: 'Array slice',
      query: '$.users[0:3]',
      description: 'Select first 3 users',
    },
    {
      label: 'Filter by value',
      query: '$.users[?(@.age > 25)]',
      description: 'Select users older than 25',
    },
    {
      label: 'Filter by property',
      query: '$.users[?(@.active)]',
      description: 'Select users with active property',
    },
    {
      label: 'Recursive descent',
      query: '$..email',
      description: 'Find all email properties at any level',
    },
    {
      label: 'Multiple properties',
      query: '$.users[*][\'name\',\'email\']',
      description: 'Select name and email from all users',
    },
    {
      label: 'Last element',
      query: '$.users[-1]',
      description: 'Select last user',
    },
  ];
}

/**
 * Format JSONPath result for display
 */
export function formatResultValue(value: any, maxLength: number = 100): string {
  try {
    const jsonString = JSON.stringify(value, null, 2);
    if (jsonString.length > maxLength) {
      return jsonString.substring(0, maxLength) + '...';
    }
    return jsonString;
  } catch {
    return String(value);
  }
}
