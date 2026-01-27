import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global Redaction Store
 * Manages redaction state across the entire app
 */

interface RedactionState {
  enabled: boolean;
  toggleRedaction: (enabled?: boolean) => void;
  enableRedaction: () => void;
  disableRedaction: () => void;
}

export const useRedactionStore = create<RedactionState>()(
  persist(
    (set) => ({
      enabled: false,

      toggleRedaction: (enabled) =>
        set((state) => ({
          enabled: enabled !== undefined ? enabled : !state.enabled,
        })),

      enableRedaction: () => set({ enabled: true }),

      disableRedaction: () => set({ enabled: false }),
    }),
    {
      name: 'json0-redaction',
    }
  )
);
