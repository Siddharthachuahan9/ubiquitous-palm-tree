#!/usr/bin/env node
/**
 * CLI test script for JSON diff performance
 * Usage: node scripts/test-diff-cli.mjs [rows]
 */

import { performance } from 'perf_hooks';

// Generate test JSON with specified number of rows
function generateTestJSON(rows, variant = 'a') {
  const data = [];
  for (let i = 0; i < rows; i++) {
    data.push({
      id: i,
      name: `Item ${i}`,
      value: variant === 'a' ? i * 10 : i * 10 + 1, // Slight difference in variant b
      nested: {
        field1: `nested-${i}`,
        field2: variant === 'a' ? true : (i % 2 === 0), // Some differences
      },
      tags: ['tag1', 'tag2', variant === 'a' ? 'tagA' : 'tagB'],
    });
  }
  return JSON.stringify({ items: data }, null, 2);
}

// Simple diff implementation for CLI testing
function computeDiffSimple(jsonA, jsonB) {
  const objA = JSON.parse(jsonA);
  const objB = JSON.parse(jsonB);

  const changes = [];
  let additions = 0;
  let deletions = 0;
  let modifications = 0;

  function compare(a, b, path = '$') {
    if (a === b) return;

    if (typeof a !== typeof b) {
      modifications++;
      changes.push({ type: 'modify', path, oldValue: a, newValue: b });
      return;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      const maxLen = Math.max(a.length, b.length);
      for (let i = 0; i < maxLen; i++) {
        if (i >= a.length) {
          additions++;
          changes.push({ type: 'add', path: `${path}[${i}]`, newValue: b[i] });
        } else if (i >= b.length) {
          deletions++;
          changes.push({ type: 'remove', path: `${path}[${i}]`, oldValue: a[i] });
        } else {
          compare(a[i], b[i], `${path}[${i}]`);
        }
      }
      return;
    }

    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
      const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
      for (const key of allKeys) {
        const newPath = `${path}.${key}`;
        if (!(key in a)) {
          additions++;
          changes.push({ type: 'add', path: newPath, newValue: b[key] });
        } else if (!(key in b)) {
          deletions++;
          changes.push({ type: 'remove', path: newPath, oldValue: a[key] });
        } else {
          compare(a[key], b[key], newPath);
        }
      }
      return;
    }

    // Primitive values that differ
    if (a !== b) {
      modifications++;
      changes.push({ type: 'modify', path, oldValue: a, newValue: b });
    }
  }

  compare(objA, objB);

  return { additions, deletions, modifications, changes };
}

// Main test function
async function runTest(rows) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing JSON diff with ${rows.toLocaleString()} rows`);
  console.log('='.repeat(60));

  // Generate test data
  console.log('\n1. Generating test JSON...');
  const genStart = performance.now();
  const jsonA = generateTestJSON(rows, 'a');
  const jsonB = generateTestJSON(rows, 'b');
  const genEnd = performance.now();

  console.log(`   - JSON A size: ${(jsonA.length / 1024).toFixed(1)} KB`);
  console.log(`   - JSON B size: ${(jsonB.length / 1024).toFixed(1)} KB`);
  console.log(`   - Generation time: ${(genEnd - genStart).toFixed(1)} ms`);

  // Parse test
  console.log('\n2. Testing JSON parse...');
  const parseStart = performance.now();
  JSON.parse(jsonA);
  JSON.parse(jsonB);
  const parseEnd = performance.now();
  console.log(`   - Parse time: ${(parseEnd - parseStart).toFixed(1)} ms`);

  // Run diff
  console.log('\n3. Running diff computation...');
  const diffStart = performance.now();
  const result = computeDiffSimple(jsonA, jsonB);
  const diffEnd = performance.now();

  console.log(`   - Diff time: ${(diffEnd - diffStart).toFixed(1)} ms`);
  console.log(`   - Additions: ${result.additions}`);
  console.log(`   - Deletions: ${result.deletions}`);
  console.log(`   - Modifications: ${result.modifications}`);
  console.log(`   - Total changes: ${result.changes.length}`);

  // Memory usage
  const memUsage = process.memoryUsage();
  console.log('\n4. Memory usage:');
  console.log(`   - Heap used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   - Heap total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(1)} MB`);

  // Test with json-diff-kit (the actual library used)
  console.log('\n5. Testing with json-diff-kit library...');
  try {
    const { Differ } = await import('json-diff-kit');
    const differ = new Differ({
      detectCircular: true,
      maxDepth: 100,
      arrayDiffMethod: 'lcs',
      showModifications: true,
    });

    const objA = JSON.parse(jsonA);
    const objB = JSON.parse(jsonB);

    const libStart = performance.now();
    const [left, right] = differ.diff(objA, objB);
    const libEnd = performance.now();

    console.log(`   - json-diff-kit time: ${(libEnd - libStart).toFixed(1)} ms`);
    console.log(`   - Left changes: ${left.length}`);
    console.log(`   - Right changes: ${right.length}`);
  } catch (err) {
    console.log(`   - Error: ${err.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Test complete!');
  console.log('='.repeat(60) + '\n');
}

// Get rows from command line argument
const rows = parseInt(process.argv[2]) || 1000;

// Run tests with different sizes
const testSizes = [100, 1000, rows];
if (!testSizes.includes(8000)) testSizes.push(8000);

(async () => {
  for (const size of [...new Set(testSizes)].sort((a, b) => a - b)) {
    await runTest(size);
  }
})();
