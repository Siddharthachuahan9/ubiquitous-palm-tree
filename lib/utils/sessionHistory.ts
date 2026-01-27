/**
 * Session History Management for JSONPath
 * Stores the last 5 sessions in localStorage
 */

const STORAGE_KEY = 'jsonpath_session_history';
const MAX_SESSIONS = 5;

export interface JSONPathSession {
  id: string;
  timestamp: number;
  jsonSource: string;
  jsonpathQuery: string;
  outputPaths: boolean;
}

/**
 * Load session history from localStorage
 */
export function loadSessionHistory(): JSONPathSession[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const sessions = JSON.parse(stored) as JSONPathSession[];
    return sessions;
  } catch (error) {
    console.error('Failed to load session history:', error);
    return [];
  }
}

/**
 * Save a new session to history
 */
export function saveSession(
  jsonSource: string,
  jsonpathQuery: string,
  outputPaths: boolean
): void {
  if (typeof window === 'undefined') return;

  // Don't save empty sessions
  if (!jsonSource || !jsonpathQuery) return;

  try {
    const sessions = loadSessionHistory();

    // Create new session
    const newSession: JSONPathSession = {
      id: generateSessionId(),
      timestamp: Date.now(),
      jsonSource,
      jsonpathQuery,
      outputPaths,
    };

    // Add to beginning of array
    sessions.unshift(newSession);

    // Keep only last MAX_SESSIONS
    const trimmed = sessions.slice(0, MAX_SESSIONS);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

/**
 * Clear all session history
 */
export function clearSessionHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear session history:', error);
  }
}

/**
 * Delete a specific session
 */
export function deleteSession(sessionId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const sessions = loadSessionHistory();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format timestamp for display
 */
export function formatSessionTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString();
}
