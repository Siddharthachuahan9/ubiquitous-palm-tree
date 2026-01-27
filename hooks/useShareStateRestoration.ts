/**
 * Share State Restoration Hook
 * Handles loading and restoring application state from shareable URLs
 */

import { useEffect, useRef } from 'react';
import { loadStateFromURL, clearShareState } from '@/lib/utils/shareState';
import { useStudioStore } from '@/lib/store';
import type { JSONToolMode } from '@/components/tools/JSONTools';

interface UseShareStateRestorationOptions {
  /** Current tool mode */
  mode: JSONToolMode;
  /** Called after successful state restoration */
  onRestore?: () => void;
}

/**
 * Hook to restore state from shared URL on mount
 * Automatically loads data and runs appropriate computation
 */
export function useShareStateRestoration({ mode, onRestore }: UseShareStateRestorationOptions) {
  const hasRestoredRef = useRef(false);
  const {
    setJsonA,
    setJsonB,
    setJsonSource,
    setJsonpathQuery,
    executeDiff,
    executeJsonPath,
    executeValidation,
    showToast,
  } = useStudioStore();

  useEffect(() => {
    // Only restore once per session
    if (hasRestoredRef.current) return;

    // Check if URL has shareable state
    const state = loadStateFromURL();
    if (!state) return;

    hasRestoredRef.current = true;

    try {
      // Verify tool match
      if (state.tool !== mode) {
        showToast(`This is a ${state.tool} share link, but you're in ${mode} mode`, 'warning');
        return;
      }

      // Restore state based on tool type
      switch (state.tool) {
        case 'diff':
          if (state.data.jsonA && state.data.jsonB) {
            setJsonA(state.data.jsonA);
            setJsonB(state.data.jsonB);

            // Auto-run diff after state is set
            setTimeout(() => {
              executeDiff();
              showToast('Loaded shared diff', 'success');
              onRestore?.();
            }, 100);
          }
          break;

        case 'jsonpath':
          if (state.data.jsonSource && state.data.query) {
            setJsonSource(state.data.jsonSource);
            setJsonpathQuery(state.data.query);

            // Auto-run query after state is set
            setTimeout(() => {
              executeJsonPath();
              showToast('Loaded shared query', 'success');
              onRestore?.();
            }, 100);
          }
          break;

        case 'validate':
          if (state.data.jsonSource) {
            setJsonSource(state.data.jsonSource);

            // Auto-run validation after state is set
            setTimeout(() => {
              executeValidation();
              showToast('Loaded shared validation', 'success');
              onRestore?.();
            }, 100);
          }
          break;

        default:
          showToast('Unknown tool type in share link', 'error');
      }

      // Clear hash from URL after restoration (optional - cleaner URL)
      // Comment out if you want to keep the hash for bookmarking
      // clearShareState();
    } catch (error) {
      console.error('Failed to restore shared state:', error);
      showToast('Failed to load shared state', 'error');
    }
  }, [
    mode,
    setJsonA,
    setJsonB,
    setJsonSource,
    setJsonpathQuery,
    executeDiff,
    executeJsonPath,
    executeValidation,
    showToast,
    onRestore,
  ]);

  return {
    /** Manually clear the share hash from URL */
    clearHash: clearShareState,
  };
}
