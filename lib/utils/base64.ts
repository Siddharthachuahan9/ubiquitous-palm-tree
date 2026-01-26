/**
 * Base64 Encoder/Decoder Utility
 * Handles UTF-8 encoding/decoding safely
 */

export interface Base64Result {
  output: string;
  inputSize: number;
  outputSize: number;
  encoding: 'UTF-8' | 'ASCII' | 'Binary';
}

/**
 * Encode string to Base64
 * Handles UTF-8 correctly
 */
export function encodeBase64(input: string): Base64Result {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  try {
    // Convert UTF-8 string to percent-encoded string
    const utf8Encoded = encodeURIComponent(input);

    // Convert percent-encoded string to bytes
    const bytes = utf8Encoded.replace(/%([0-9A-F]{2})/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    // Encode to Base64
    const output = btoa(bytes);

    // Determine encoding type
    const hasNonASCII = /[^\x00-\x7F]/.test(input);
    const encoding = hasNonASCII ? 'UTF-8' : 'ASCII';

    return {
      output,
      inputSize: input.length,
      outputSize: output.length,
      encoding
    };
  } catch (e) {
    throw new Error(`Failed to encode to Base64: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

/**
 * Decode Base64 to string
 * Handles UTF-8 correctly
 */
export function decodeBase64(input: string): Base64Result {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Remove whitespace
  const cleaned = input.replace(/\s/g, '');

  // Validate Base64 format
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
    throw new Error('Invalid Base64 format: Contains invalid characters');
  }

  try {
    // Decode from Base64
    const bytes = atob(cleaned);

    // Convert bytes to percent-encoded string
    const percentEncoded = bytes
      .split('')
      .map(c => {
        const code = c.charCodeAt(0);
        return code > 127 || code === 37
          ? '%' + ('0' + code.toString(16)).slice(-2).toUpperCase()
          : c;
      })
      .join('');

    // Decode percent-encoded string to UTF-8
    const output = decodeURIComponent(percentEncoded);

    // Determine encoding type
    const hasNonASCII = /[^\x00-\x7F]/.test(output);
    const encoding = hasNonASCII ? 'UTF-8' : 'ASCII';

    return {
      output,
      inputSize: cleaned.length,
      outputSize: output.length,
      encoding
    };
  } catch (e) {
    if (e instanceof URIError) {
      throw new Error('Invalid UTF-8 sequence in decoded data');
    }
    throw new Error(`Failed to decode Base64: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

/**
 * Check if string is valid Base64
 */
export function isValidBase64(input: string): boolean {
  if (!input || typeof input !== 'string') return false;

  const cleaned = input.replace(/\s/g, '');

  // Check format
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) return false;

  // Check length (must be multiple of 4)
  if (cleaned.length % 4 !== 0) return false;

  try {
    atob(cleaned);
    return true;
  } catch {
    return false;
  }
}

/**
 * Auto-detect if input is Base64 or plain text
 */
export function detectInputType(input: string): 'base64' | 'text' {
  // Remove whitespace for testing
  const cleaned = input.replace(/\s/g, '');

  // If contains non-Base64 characters, it's text
  if (!/^[A-Za-z0-9+/=]*$/.test(cleaned)) {
    return 'text';
  }

  // If length is not multiple of 4 (after removing padding), likely text
  if (cleaned.replace(/=/g, '').length % 4 === 1) {
    return 'text';
  }

  // Try to decode - if successful and result makes sense, it's Base64
  try {
    const decoded = atob(cleaned);
    // If decoded result is mostly printable or valid UTF-8, it's probably Base64
    const printableRatio = decoded.split('').filter(c => {
      const code = c.charCodeAt(0);
      return code >= 32 && code <= 126 || code >= 128;
    }).length / decoded.length;

    return printableRatio > 0.7 ? 'base64' : 'text';
  } catch {
    return 'text';
  }
}
