/**
 * Redaction Utility
 * Detect and redact sensitive data like emails, tokens, API keys, UUIDs, etc.
 * Privacy-first: All processing happens locally in the browser
 */

/**
 * Regex patterns for detecting sensitive data
 */
const SENSITIVE_PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // UUIDs (v1, v3, v4, v5)
  uuid: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,

  // JWT tokens (xxx.xxx.xxx format)
  jwt: /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,

  // API keys (common formats)
  // Matches: sk_live_xxx, pk_test_xxx, api_key_xxx, etc.
  apiKey: /\b(?:sk|pk|api|key)_[a-z0-9_]{16,}\b/gi,

  // Bearer tokens
  bearerToken: /\bBearer\s+[A-Za-z0-9_-]{20,}\b/gi,

  // Long numeric IDs (12+ digits, common in databases)
  numericId: /\b\d{12,}\b/g,

  // Base64 encoded strings (likely credentials, 32+ chars)
  base64: /\b[A-Za-z0-9+/]{32,}={0,2}\b/g,

  // IP addresses
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,

  // Credit card numbers (basic pattern)
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
};

/**
 * Detect if text contains sensitive data
 */
export function detectSensitiveData(text: string): boolean {
  if (!text) return false;

  for (const pattern of Object.values(SENSITIVE_PATTERNS)) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}

/**
 * Redact sensitive data from text
 */
export function redactSensitiveData(text: string): string {
  if (!text) return text;

  let redacted = text;

  // Redact emails
  redacted = redacted.replace(SENSITIVE_PATTERNS.email, (match) => {
    const [name, domain] = match.split('@');
    return `${name.slice(0, 2)}***@${domain}`;
  });

  // Redact UUIDs
  redacted = redacted.replace(SENSITIVE_PATTERNS.uuid, (match) => {
    return `${match.slice(0, 8)}-****-****-****-************`;
  });

  // Redact JWT tokens
  redacted = redacted.replace(SENSITIVE_PATTERNS.jwt, () => {
    return 'eyJ***.eyJ***.***';
  });

  // Redact API keys
  redacted = redacted.replace(SENSITIVE_PATTERNS.apiKey, (match) => {
    const prefix = match.split('_')[0];
    return `${prefix}_***REDACTED***`;
  });

  // Redact bearer tokens
  redacted = redacted.replace(SENSITIVE_PATTERNS.bearerToken, () => {
    return 'Bearer ***REDACTED***';
  });

  // Redact long numeric IDs
  redacted = redacted.replace(SENSITIVE_PATTERNS.numericId, (match) => {
    return `${match.slice(0, 4)}***${match.slice(-4)}`;
  });

  // Redact base64 (show first/last 8 chars)
  redacted = redacted.replace(SENSITIVE_PATTERNS.base64, (match) => {
    if (match.length < 32) return match;
    return `${match.slice(0, 8)}***${match.slice(-8)}`;
  });

  // Redact IP addresses
  redacted = redacted.replace(SENSITIVE_PATTERNS.ipAddress, (match) => {
    const parts = match.split('.');
    return `${parts[0]}.${parts[1]}.***.***`;
  });

  // Redact credit card numbers
  redacted = redacted.replace(SENSITIVE_PATTERNS.creditCard, (match) => {
    const cleaned = match.replace(/[\s-]/g, '');
    return `****-****-****-${cleaned.slice(-4)}`;
  });

  return redacted;
}

/**
 * Redact sensitive data from JSON object
 * Returns a new object with redacted values
 */
export function redactJSON(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return redactSensitiveData(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactJSON(item));
  }

  if (typeof obj === 'object') {
    const redacted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      redacted[key] = redactJSON(value);
    }
    return redacted;
  }

  return obj;
}

/**
 * Get count of sensitive data occurrences in text
 */
export function countSensitiveData(text: string): { [key: string]: number } {
  if (!text) return {};

  const counts: { [key: string]: number } = {};

  for (const [name, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      counts[name] = matches.length;
    }
  }

  return counts;
}
