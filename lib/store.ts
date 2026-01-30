import { create } from 'zustand';
import type {
  StudioState,
  DiffResult,
  JSONPathResult,
  ValidationResult,
} from '@/types/studio';

// Debug logging
const DEBUG = true;
const log = (msg: string, data?: any) => {
  if (DEBUG) {
    const timestamp = performance.now().toFixed(2);
    console.log(`[Store ${timestamp}ms] ${msg}`, data !== undefined ? data : '');
  }
};

export const useStudioStore = create<StudioState>((set, get) => ({
  // Mode state
  mode: 'diff',
  setMode: (mode) => set({ mode }),

  // JSON content
  jsonA: '',
  jsonB: '',
  jsonSource: '',
  setJsonA: (value) => {
    log('setJsonA called', { length: value.length });
    // Batch all updates into a single set() call to prevent multiple re-renders
    const state = get();
    const totalSize = value.length + state.jsonB.length + state.jsonSource.length;
    log('setJsonA - calling set()');
    set({ jsonA: value, error: null, fileSize: totalSize });
    log('setJsonA - set() complete');
  },
  setJsonB: (value) => {
    log('setJsonB called', { length: value.length });
    const state = get();
    const totalSize = state.jsonA.length + value.length + state.jsonSource.length;
    log('setJsonB - calling set()');
    set({ jsonB: value, error: null, fileSize: totalSize });
    log('setJsonB - set() complete');
  },
  setJsonSource: (value) => {
    log('setJsonSource called', { length: value.length });
    const state = get();
    const totalSize = state.jsonA.length + state.jsonB.length + value.length;
    log('setJsonSource - calling set()');
    set({ jsonSource: value, error: null, fileSize: totalSize });
    log('setJsonSource - set() complete');
  },

  // JSONPath query
  jsonpathQuery: '',
  setJsonpathQuery: (query) => set({ jsonpathQuery: query }),
  jsonpathOutputPaths: false,
  setJsonpathOutputPaths: (outputPaths) => set({ jsonpathOutputPaths: outputPaths }),

  // Results
  diffResults: null,
  jsonpathResults: null,
  validationResults: null,

  // UI state
  processing: false,
  error: null,
  fileSize: 0,
  processingTime: null,

  // Actions
  executeDiff: async () => {
    const state = get();

    if (!state.jsonA || !state.jsonB) {
      set({ error: 'Please provide both JSON inputs' });
      return;
    }

    set({ processing: true, error: null, processingTime: null });
    const startTime = performance.now();

    try {
      // Dynamically import to avoid SSR issues
      const { computeDiff } = await import('@/lib/diff/engine');
      const results = computeDiff(state.jsonA, state.jsonB);

      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);

      set({
        diffResults: results,
        processing: false,
        processingTime,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to compute diff',
        processing: false,
      });
    }
  },

  executeJsonPath: async () => {
    const state = get();

    if (!state.jsonSource) {
      set({ error: 'Please provide JSON source' });
      return;
    }

    if (!state.jsonpathQuery) {
      set({ error: 'Please provide a JSONPath query' });
      return;
    }

    set({ processing: true, error: null, processingTime: null });
    const startTime = performance.now();

    try {
      const { executeJSONPath } = await import('@/lib/jsonpath/executor');
      const results = executeJSONPath(
        state.jsonpathQuery,
        state.jsonSource,
        state.jsonpathOutputPaths || false
      );

      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);

      set({
        jsonpathResults: results,
        processing: false,
        processingTime,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to execute JSONPath query',
        processing: false,
      });
    }
  },

  executeValidation: async () => {
    const state = get();

    if (!state.jsonSource) {
      set({ error: 'Please provide JSON to validate' });
      return;
    }

    set({ processing: true, error: null, processingTime: null });
    const startTime = performance.now();

    try {
      const { validateJSON } = await import('@/lib/validation/validator');
      const results = validateJSON(state.jsonSource);

      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);

      set({
        validationResults: results,
        processing: false,
        processingTime,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Validation failed',
        processing: false,
      });
    }
  },

  clearAll: () => set({
    jsonA: '',
    jsonB: '',
    jsonSource: '',
    jsonpathQuery: '',
    diffResults: null,
    jsonpathResults: null,
    validationResults: null,
    error: null,
    fileSize: 0,
    processingTime: null,
  }),

  clearError: () => set({ error: null }),

  // Toast notifications
  toastMessage: null,
  toastType: null,
  showToast: (message, type) => set({ toastMessage: message, toastType: type }),
  clearToast: () => set({ toastMessage: null, toastType: null }),
}));
