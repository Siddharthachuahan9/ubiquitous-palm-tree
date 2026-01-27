/**
 * Hash Generator Utility
 * Generate various hash types using Web Crypto API
 * All processing happens locally - no network calls
 */

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export interface HashResult {
  algorithm: HashAlgorithm;
  hash: string;
  input: string;
  inputSize: number;
  timestamp: Date;
}

/**
 * Generate hash using Web Crypto API
 */
export async function generateHash(
  input: string,
  algorithm: HashAlgorithm = 'SHA-256'
): Promise<HashResult> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return {
    algorithm,
    hash: hashHex,
    input,
    inputSize: input.length,
    timestamp: new Date(),
  };
}

/**
 * Generate all hash types at once
 */
export async function generateAllHashes(input: string): Promise<HashResult[]> {
  const algorithms: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

  const promises = algorithms.map((algorithm) => generateHash(input, algorithm));

  return Promise.all(promises);
}

/**
 * Compare hash with expected value (constant-time comparison)
 */
export function compareHashes(hash1: string, hash2: string): boolean {
  if (hash1.length !== hash2.length) return false;

  let result = 0;
  for (let i = 0; i < hash1.length; i++) {
    result |= hash1.charCodeAt(i) ^ hash2.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Format hash with uppercase and optional spacing
 */
export function formatHash(hash: string, uppercase = false, spacing = false): string {
  let formatted = uppercase ? hash.toUpperCase() : hash.toLowerCase();

  if (spacing) {
    // Add space every 8 characters for readability
    formatted = formatted.match(/.{1,8}/g)?.join(' ') || formatted;
  }

  return formatted;
}

/**
 * Get hash algorithm info
 */
export function getHashInfo(algorithm: HashAlgorithm): {
  name: string;
  bits: number;
  bytes: number;
  hexLength: number;
  description: string;
} {
  const info = {
    'SHA-1': {
      name: 'SHA-1',
      bits: 160,
      bytes: 20,
      hexLength: 40,
      description: 'Legacy algorithm, not recommended for security-critical applications',
    },
    'SHA-256': {
      name: 'SHA-256',
      bits: 256,
      bytes: 32,
      hexLength: 64,
      description: 'Widely used, good balance of security and performance',
    },
    'SHA-384': {
      name: 'SHA-384',
      bits: 384,
      bytes: 48,
      hexLength: 96,
      description: 'Part of SHA-2 family, truncated SHA-512',
    },
    'SHA-512': {
      name: 'SHA-512',
      bits: 512,
      bytes: 64,
      hexLength: 128,
      description: 'Maximum security, slower than SHA-256',
    },
  };

  return info[algorithm];
}
