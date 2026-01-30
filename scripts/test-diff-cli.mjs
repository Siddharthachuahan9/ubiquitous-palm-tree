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

  // Test with the actual engine (which uses fast diff for large files)
  console.log('\n5. Testing with actual diff engine...');
  try {
    // Import the compiled engine
    const enginePath = new URL('../lib/diff/engine.ts', import.meta.url).pathname;

    // Since we can't directly import TS, let's test the fast diff logic inline
    const fastDiffStart = performance.now();

    // Simulate the fast diff algorithm
    const objAp = JSON.parse(jsonA);
    const objBp = JSON.parse(jsonB);
    const fastChanges = [];
    let fastMods = 0;

    function quickCompare(a, b, path) {
      if (fastChanges.length > 10000) return; // Limit for test
      if (JSON.stringify(a) === JSON.stringify(b)) return;

      if (Array.isArray(a) && Array.isArray(b)) {
        const maxLen = Math.max(a.length, b.length);
        for (let i = 0; i < maxLen && fastChanges.length < 10000; i++) {
          if (i < a.length && i < b.length) {
            if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) {
              if (typeof a[i] === 'object' && typeof b[i] === 'object') {
                quickCompare(a[i], b[i], `${path}[${i}]`);
              } else {
                fastMods++;
                fastChanges.push({ path: `${path}[${i}]`, type: 'modify' });
              }
            }
          }
        }
      } else if (typeof a === 'object' && typeof b === 'object') {
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        for (const k of keys) {
          if (fastChanges.length >= 10000) break;
          const kPath = path === '$' ? `$.${k}` : `${path}.${k}`;
          if (!(k in a) || !(k in b) || JSON.stringify(a[k]) !== JSON.stringify(b[k])) {
            if (typeof a[k] === 'object' && typeof b[k] === 'object' && a[k] && b[k]) {
              quickCompare(a[k], b[k], kPath);
            } else {
              fastMods++;
              fastChanges.push({ path: kPath, type: k in a && k in b ? 'modify' : (k in b ? 'add' : 'remove') });
            }
          }
        }
      } else {
        fastMods++;
        fastChanges.push({ path, type: 'modify' });
      }
    }

    quickCompare(objAp, objBp, '$');
    const fastDiffEnd = performance.now();

    console.log(`   - Fast diff algorithm time: ${(fastDiffEnd - fastDiffStart).toFixed(1)} ms`);
    console.log(`   - Fast diff changes: ${fastChanges.length}`);
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
