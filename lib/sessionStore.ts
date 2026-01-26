/**
 * Session Store - Local storage for tool states
 * Privacy-first: All data stays in browser's localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryEntry {
  id: string;
  tool: string;
  timestamp: Date;
  action: string;
  preview?: string;
}

export interface SessionState {
  // Session management
  sessionEnabled: boolean;
  enableSession: () => void;
  disableSession: () => void;

  // History tracking
  history: HistoryEntry[];
  addHistoryEntry: (tool: string, action: string, preview?: string) => void;
  clearHistory: () => void;
  getRecentHistory: (limit?: number) => HistoryEntry[];

  // Tool states (optional persistence)
  savedStates: Record<string, any>;
  saveToolState: (tool: string, state: any) => void;
  loadToolState: (tool: string) => any;
  clearToolState: (tool: string) => void;
  clearAllStates: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Session management
      sessionEnabled: false,
      enableSession: () => set({ sessionEnabled: true }),
      disableSession: () => {
        set({
          sessionEnabled: false,
          history: [],
          savedStates: {},
        });
      },

      // History tracking
      history: [],
      addHistoryEntry: (tool: string, action: string, preview?: string) => {
        const entry: HistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tool,
          action,
          preview: preview?.substring(0, 100), // Truncate preview
          timestamp: new Date(),
        };

        set((state) => ({
          history: [entry, ...state.history].slice(0, 100), // Keep last 100
        }));
      },

      clearHistory: () => set({ history: [] }),

      getRecentHistory: (limit = 10) => {
        return get().history.slice(0, limit);
      },

      // Tool states
      savedStates: {},

      saveToolState: (tool: string, state: any) => {
        set((prev) => ({
          savedStates: {
            ...prev.savedStates,
            [tool]: state,
          },
        }));
      },

      loadToolState: (tool: string) => {
        return get().savedStates[tool] || null;
      },

      clearToolState: (tool: string) => {
        set((prev) => {
          const newStates = { ...prev.savedStates };
          delete newStates[tool];
          return { savedStates: newStates };
        });
      },

      clearAllStates: () => set({ savedStates: {} }),
    }),
    {
      name: 'json0-session',
      // Only persist if session is enabled
      partialize: (state) =>
        state.sessionEnabled
          ? {
              sessionEnabled: state.sessionEnabled,
              history: state.history,
              savedStates: state.savedStates,
            }
          : { sessionEnabled: false, history: [], savedStates: {} },
    }
  )
);
