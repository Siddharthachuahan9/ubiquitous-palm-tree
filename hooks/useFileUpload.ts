import { useCallback } from 'react';

interface UseFileUploadOptions {
  onFileLoad: (content: string) => void;
  onError?: (error: string) => void;
  maxSize?: number; // in bytes
}

export function useFileUpload({ onFileLoad, onError, maxSize = 10_000_000 }: UseFileUploadOptions) {
  const handleFileSelect = useCallback(
    async (file: File) => {
      try {
        // Validate file type
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
          throw new Error('Please upload a JSON file');
        }

        // Validate file size
        if (file.size > maxSize) {
          const maxSizeMB = (maxSize / 1_000_000).toFixed(1);
          throw new Error(`File too large. Maximum size is ${maxSizeMB}MB`);
        }

        // Read file
        const text = await file.text();

        // Validate JSON
        try {
          JSON.parse(text);
        } catch (parseError) {
          throw new Error(`Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Parse failed'}`);
        }

        // Success
        onFileLoad(text);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load file';
        if (onError) {
          onError(message);
        } else {
          console.error('File upload error:', message);
        }
      }
    },
    [onFileLoad, onError, maxSize]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      // Reset input value so the same file can be uploaded again
      event.target.value = '';
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return {
    handleFileSelect,
    handleInputChange,
    handleDrop,
    handleDragOver,
  };
}
