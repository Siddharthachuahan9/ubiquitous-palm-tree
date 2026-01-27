/**
 * UUID Generator Utility
 * Generate various UUID versions using Web Crypto API
 * All processing happens locally - no network calls
 */

export type UUIDVersion = 'v4' | 'v1-like' | 'nil';

export interface UUIDResult {
  version: UUIDVersion;
  uuid: string;
  timestamp: Date;
}

/**
 * Generate UUID v4 (random)
 * Uses crypto.randomUUID() when available, falls back to manual generation
 */
export function generateUUIDv4(): string {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate UUID v1-like (timestamp-based)
 * Note: This is a simplified version, not a true RFC 4122 UUID v1
 */
export function generateUUIDv1Like(): string {
  const timestamp = Date.now();
  const clockSeq = crypto.getRandomValues(new Uint16Array(1))[0] & 0x3fff;
  const node = Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const timeLow = (timestamp & 0xffffffff).toString(16).padStart(8, '0');
  const timeMid = ((timestamp >> 32) & 0xffff).toString(16).padStart(4, '0');
  const timeHigh = (((timestamp >> 48) & 0x0fff) | 0x1000).toString(16).padStart(4, '0');
  const clockSeqHigh = ((clockSeq >> 8) | 0x80).toString(16).padStart(2, '0');
  const clockSeqLow = (clockSeq & 0xff).toString(16).padStart(2, '0');

  return `${timeLow}-${timeMid}-${timeHigh}-${clockSeqHigh}${clockSeqLow}-${node}`;
}

/**
 * Generate nil UUID (all zeros)
 */
export function generateNilUUID(): string {
  return '00000000-0000-0000-0000-000000000000';
}

/**
 * Generate UUID by version
 */
export function generateUUID(version: UUIDVersion = 'v4'): UUIDResult {
  let uuid: string;

  switch (version) {
    case 'v4':
      uuid = generateUUIDv4();
      break;
    case 'v1-like':
      uuid = generateUUIDv1Like();
      break;
    case 'nil':
      uuid = generateNilUUID();
      break;
    default:
      uuid = generateUUIDv4();
  }

  return {
    version,
    uuid,
    timestamp: new Date(),
  };
}

/**
 * Generate multiple UUIDs
 */
export function generateBulkUUIDs(count: number, version: UUIDVersion = 'v4'): UUIDResult[] {
  const results: UUIDResult[] = [];

  for (let i = 0; i < Math.min(count, 1000); i++) {
    results.push(generateUUID(version));
  }

  return results;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const nilUUIDRegex = /^0{8}-0{4}-0{4}-0{4}-0{12}$/;

  return uuidRegex.test(uuid) || nilUUIDRegex.test(uuid);
}

/**
 * Format UUID (uppercase, lowercase, no-dashes)
 */
export function formatUUID(uuid: string, format: 'upper' | 'lower' | 'nodash'): string {
  switch (format) {
    case 'upper':
      return uuid.toUpperCase();
    case 'lower':
      return uuid.toLowerCase();
    case 'nodash':
      return uuid.replace(/-/g, '');
    default:
      return uuid;
  }
}

/**
 * Parse UUID version from string
 */
export function parseUUIDVersion(uuid: string): number | null {
  if (!isValidUUID(uuid)) return null;

  const versionChar = uuid.charAt(14);
  const version = parseInt(versionChar, 10);

  return isNaN(version) ? null : version;
}

/**
 * Get UUID info
 */
export function getUUIDInfo(version: UUIDVersion): {
  name: string;
  description: string;
  useCase: string;
} {
  const info = {
    v4: {
      name: 'UUID v4',
      description: 'Random UUID generated using cryptographically strong random values',
      useCase: 'General purpose, most common, unique identifiers',
    },
    'v1-like': {
      name: 'UUID v1-like',
      description: 'Timestamp-based UUID (simplified implementation)',
      useCase: 'When temporal ordering is important',
    },
    nil: {
      name: 'Nil UUID',
      description: 'Special UUID with all zeros',
      useCase: 'Placeholder or null value representation',
    },
  };

  return info[version];
}
