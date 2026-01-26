/**
 * Network Guard Utility
 * Prevents accidental network calls in development mode
 * Enforces local-only processing for privacy
 */

interface NetworkGuardConfig {
  enabled: boolean;
  throwOnViolation: boolean;
  logViolations: boolean;
}

const config: NetworkGuardConfig = {
  enabled: process.env.NODE_ENV === 'development',
  throwOnViolation: true,
  logViolations: true,
};

class NetworkViolationError extends Error {
  constructor(method: string, url: string) {
    super(`[PRIVACY VIOLATION] Attempted network call: ${method} ${url}`);
    this.name = 'NetworkViolationError';
  }
}

// Store original methods
const originalFetch = window.fetch;
const originalXMLHttpRequest = window.XMLHttpRequest;

/**
 * Whitelist of allowed network calls (for framework/library needs)
 */
const allowedPatterns = [
  /^\/_next\//, // Next.js internals
  /^\/static\//, // Static assets
  /^\/fonts\//, // Font files
  /^\/api\/health$/, // Health check endpoint only
  /^https:\/\/fonts\./, // Font CDNs
];

function isAllowedUrl(url: string): boolean {
  return allowedPatterns.some((pattern) => pattern.test(url));
}

/**
 * Initialize network guard
 * Wraps fetch and XMLHttpRequest to prevent unauthorized calls
 */
export function initNetworkGuard(): void {
  if (!config.enabled) return;

  // Guard fetch
  window.fetch = function guardedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    if (!isAllowedUrl(url)) {
      const error = new NetworkViolationError('fetch', url);

      if (config.logViolations) {
        console.error(error.message);
        console.trace('Network call stack trace:');
      }

      if (config.throwOnViolation) {
        throw error;
      }
    }

    return originalFetch(input, init);
  } as typeof fetch;

  // Guard XMLHttpRequest
  const OriginalXHR = originalXMLHttpRequest;
  window.XMLHttpRequest = class GuardedXMLHttpRequest extends OriginalXHR {
    open(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null): void {
      const urlString = typeof url === 'string' ? url : url.href;

      if (!isAllowedUrl(urlString)) {
        const error = new NetworkViolationError(method, urlString);

        if (config.logViolations) {
          console.error(error.message);
          console.trace('Network call stack trace:');
        }

        if (config.throwOnViolation) {
          throw error;
        }
      }

      // Call parent with proper signature
      if (username !== undefined && password !== undefined) {
        super.open(method, url as string, async ?? true, username, password);
      } else if (username !== undefined) {
        super.open(method, url as string, async ?? true, username);
      } else if (async !== undefined) {
        super.open(method, url as string, async);
      } else {
        super.open(method, url as string);
      }
    }
  } as any;

  console.log('[Network Guard] Initialized - All network calls are monitored');
}

/**
 * Check if network guard is active
 */
export function isNetworkGuardActive(): boolean {
  return config.enabled;
}

/**
 * Disable network guard (for production)
 */
export function disableNetworkGuard(): void {
  window.fetch = originalFetch;
  window.XMLHttpRequest = originalXMLHttpRequest;
  config.enabled = false;
}
