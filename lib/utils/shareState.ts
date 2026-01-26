/**
 * Share State Utility
 * Generate shareable URLs using hash fragments (no backend required)
 * Privacy-first: State is encoded in URL, not sent to servers
 */

import { compress, decompress } from 'lz-string';

export interface ShareableState {
  tool: string;
  data: any;
  version: string;
}

const CURRENT_VERSION = '1.0';

/**
 * Encode state into URL hash
 */
export function encodeStateToHash(tool: string, data: any): string {
  try {
    const state: ShareableState = {
      tool,
      data,
      version: CURRENT_VERSION,
    };

    const json = JSON.stringify(state);
    const compressed = compress(json);
    const encoded = encodeURIComponent(compressed);

    return `#share=${encoded}`;
  } catch (error) {
    console.error('Failed to encode state:', error);
    throw new Error('Failed to create shareable link');
  }
}

/**
 * Decode state from URL hash
 */
export function decodeStateFromHash(hash: string): ShareableState | null {
  try {
    // Remove '#share=' prefix
    const encoded = hash.replace(/^#share=/, '');
    if (!encoded) return null;

    const decoded = decodeURIComponent(encoded);
    const decompressed = decompress(decoded);
    if (!decompressed) return null;

    const state: ShareableState = JSON.parse(decompressed);

    // Validate version
    if (state.version !== CURRENT_VERSION) {
      console.warn('State version mismatch, attempting to load anyway');
    }

    return state;
  } catch (error) {
    console.error('Failed to decode state:', error);
    return null;
  }
}

/**
 * Generate full shareable URL for current page
 */
export function generateShareableURL(tool: string, data: any): string {
  const hash = encodeStateToHash(tool, data);
  const baseURL = window.location.origin + window.location.pathname;
  return `${baseURL}${hash}`;
}

/**
 * Copy shareable URL to clipboard
 */
export async function copyShareableURL(tool: string, data: any): Promise<boolean> {
  try {
    const url = generateShareableURL(tool, data);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy URL:', error);
    return false;
  }
}

/**
 * Check if current URL has shareable state
 */
export function hasShareableState(): boolean {
  return window.location.hash.startsWith('#share=');
}

/**
 * Load state from current URL
 */
export function loadStateFromURL(): ShareableState | null {
  if (!hasShareableState()) return null;
  return decodeStateFromHash(window.location.hash);
}

/**
 * Clear share state from URL
 */
export function clearShareState(): void {
  if (hasShareableState()) {
    window.history.replaceState(null, '', window.location.pathname);
  }
}
