import { useEffect, useCallback } from 'react';

interface UsePasteHandlerOptions {
  onPaste: (content: string) => void;
  enabled?: boolean;
}

export function usePasteHandler({ onPaste, enabled = true }: UsePasteHandlerOptions) {
  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      if (!enabled) return;

      // Get text from clipboard
      const text = event.clipboardData?.getData('text');
      if (!text) return;

      // Try to parse as JSON
      try {
        JSON.parse(text);
        // Valid JSON - call onPaste
        onPaste(text);
      } catch {
        // Not valid JSON - ignore
        // Could optionally show a message, but we'll be silent for now
      }
    },
    [onPaste, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste, enabled]);

  return { handlePaste };
}
