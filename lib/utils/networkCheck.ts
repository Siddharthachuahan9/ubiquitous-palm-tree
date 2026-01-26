/**
 * Network Check Utility for Ping Tool
 * Browser-safe network reachability testing via HTTPS
 */

export interface PingResult {
  host: string;
  timestamp: Date;
  status: 'success' | 'failure' | 'timeout';
  responseTime: number | null;
  httpStatus: number | null;
  error?: string;
}

export interface PingOptions {
  timeout?: number; // milliseconds, default 5000
  method?: 'HEAD' | 'GET';
}

/**
 * Test reachability of a host via HTTPS
 * Uses fetch with AbortController for timeout
 */
export async function pingHost(
  host: string,
  options: PingOptions = {}
): Promise<PingResult> {
  const { timeout = 5000, method = 'HEAD' } = options;

  // Validate and normalize URL
  let url: string;
  try {
    url = normalizeURL(host);
  } catch (error) {
    return {
      host,
      timestamp: new Date(),
      status: 'failure',
      responseTime: null,
      httpStatus: null,
      error: error instanceof Error ? error.message : 'Invalid URL',
    };
  }

  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      mode: 'no-cors', // Avoid CORS issues for basic reachability
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    return {
      host,
      timestamp: new Date(),
      status: 'success',
      responseTime,
      httpStatus: response.status || null,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        host,
        timestamp: new Date(),
        status: 'timeout',
        responseTime,
        httpStatus: null,
        error: `Request timed out after ${timeout}ms`,
      };
    }

    return {
      host,
      timestamp: new Date(),
      status: 'failure',
      responseTime,
      httpStatus: null,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Normalize URL with protocol
 */
function normalizeURL(host: string): string {
  // Remove whitespace
  host = host.trim();

  if (!host) {
    throw new Error('Host cannot be empty');
  }

  // If already has protocol, validate and return
  if (host.startsWith('http://') || host.startsWith('https://')) {
    try {
      new URL(host);
      return host;
    } catch {
      throw new Error('Invalid URL format');
    }
  }

  // Add https:// protocol
  const withProtocol = `https://${host}`;

  try {
    new URL(withProtocol);
    return withProtocol;
  } catch {
    throw new Error('Invalid host format');
  }
}

/**
 * Validate if string is a valid hostname or URL
 */
export function isValidHost(host: string): boolean {
  try {
    normalizeURL(host);
    return true;
  } catch {
    return false;
  }
}

/**
 * Batch ping multiple hosts
 */
export async function pingMultipleHosts(
  hosts: string[],
  options: PingOptions = {}
): Promise<PingResult[]> {
  const promises = hosts.map((host) => pingHost(host, options));
  return Promise.all(promises);
}

/**
 * Continuous ping with interval
 */
export function startContinuousPing(
  host: string,
  interval: number,
  onResult: (result: PingResult) => void,
  options: PingOptions = {}
): () => void {
  let active = true;

  async function ping() {
    if (!active) return;

    const result = await pingHost(host, options);
    onResult(result);

    if (active) {
      setTimeout(ping, interval);
    }
  }

  ping();

  // Return stop function
  return () => {
    active = false;
  };
}
