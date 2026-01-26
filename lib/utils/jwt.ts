/**
 * JWT Decoder Utility
 * Decodes JWT tokens locally without verification
 * NOTE: This does NOT verify signatures - for inspection only
 */

export interface JWTDecoded {
  header: Record<string, any>;
  payload: Record<string, any>;
  signature: string;
  metadata: {
    algorithm?: string;
    issuedAt?: Date | null;
    expiresAt?: Date | null;
    notBefore?: Date | null;
    issuer?: string;
    subject?: string;
    audience?: string | string[];
    isExpired?: boolean;
    timeToExpiry?: string;
  };
  warning: string;
}

/**
 * Decode Base64URL to string
 */
function base64UrlDecode(str: string): string {
  // Replace Base64URL characters with Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Pad with = if necessary
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  try {
    // Decode Base64
    const decoded = atob(base64);

    // Convert to UTF-8
    return decodeURIComponent(
      decoded
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    throw new Error('Invalid Base64URL encoding');
  }
}

/**
 * Format Unix timestamp to human-readable date
 */
function formatTimestamp(timestamp: number): Date | null {
  if (!timestamp || typeof timestamp !== 'number') return null;

  // JWT timestamps are in seconds, JavaScript uses milliseconds
  const date = new Date(timestamp * 1000);

  // Check if valid date
  if (isNaN(date.getTime())) return null;

  return date;
}

/**
 * Calculate time to expiry
 */
function calculateTimeToExpiry(expiresAt: Date | null): string {
  if (!expiresAt) return 'N/A';

  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();

  if (diffMs < 0) {
    const absDiffMs = Math.abs(diffMs);
    const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
    const minutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Expired ${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (hours > 0) {
      return `Expired ${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    return `Expired ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

/**
 * Decode JWT token
 */
export function decodeJWT(token: string): JWTDecoded {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid input: Token must be a non-empty string');
  }

  // Remove whitespace
  token = token.trim();

  // Split token into parts
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid JWT format: Expected 3 parts separated by dots (header.payload.signature)');
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  // Decode header
  let header: Record<string, any>;
  try {
    const headerStr = base64UrlDecode(headerB64);
    header = JSON.parse(headerStr);
  } catch (e) {
    throw new Error('Invalid JWT header: Unable to decode or parse JSON');
  }

  // Decode payload
  let payload: Record<string, any>;
  try {
    const payloadStr = base64UrlDecode(payloadB64);
    payload = JSON.parse(payloadStr);
  } catch (e) {
    throw new Error('Invalid JWT payload: Unable to decode or parse JSON');
  }

  // Extract metadata
  const issuedAt = payload.iat ? formatTimestamp(payload.iat) : null;
  const expiresAt = payload.exp ? formatTimestamp(payload.exp) : null;
  const notBefore = payload.nbf ? formatTimestamp(payload.nbf) : null;

  const isExpired = expiresAt ? new Date() > expiresAt : false;
  const timeToExpiry = calculateTimeToExpiry(expiresAt);

  const metadata = {
    algorithm: header.alg,
    issuedAt,
    expiresAt,
    notBefore,
    issuer: payload.iss,
    subject: payload.sub,
    audience: payload.aud,
    isExpired,
    timeToExpiry
  };

  return {
    header,
    payload,
    signature: signatureB64,
    metadata,
    warning: 'This tool decodes JWTs locally without verifying signatures. Never paste production tokens into online tools. For signature verification, use your backend or a trusted library.'
  };
}

/**
 * Validate JWT structure without full decode
 */
export function isValidJWTStructure(token: string): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.trim().split('.');
  if (parts.length !== 3) return false;

  // Check each part is valid Base64URL
  const base64UrlPattern = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => base64UrlPattern.test(part));
}
