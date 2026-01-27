'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';
import type { editor } from 'monaco-editor';

interface EditorContextValue {
  editorA: React.MutableRefObject<editor.IStandaloneCodeEditor | null>;
  editorB: React.MutableRefObject<editor.IStandaloneCodeEditor | null>;
  navigateToLine: (editorId: 'A' | 'B', lineNumber: number) => void;
  navigateToBoth: (lineA: number, lineB: number) => void;
  highlightLine: (editorId: 'A' | 'B', lineNumber: number) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

interface EditorProviderProps {
  children: ReactNode;
}

export function EditorProvider({ children }: EditorProviderProps) {
  const editorA = useRef<editor.IStandaloneCodeEditor | null>(null);
  const editorB = useRef<editor.IStandaloneCodeEditor | null>(null);

  /**
   * Navigate to a specific line in an editor
   */
  const navigateToLine = (editorId: 'A' | 'B', lineNumber: number) => {
    const editor = editorId === 'A' ? editorA.current : editorB.current;
    if (!editor) return;

    // Line numbers in Monaco are 1-indexed
    const line = Math.max(1, lineNumber + 1);

    // Reveal the line (scroll to it)
    editor.revealLineInCenter(line);

    // Set cursor position
    editor.setPosition({ lineNumber: line, column: 1 });

    // Focus the editor
    editor.focus();
  };

  /**
   * Navigate both editors simultaneously
   */
  const navigateToBoth = (lineA: number, lineB: number) => {
    // Navigate both editors
    if (editorA.current) {
      const line = Math.max(1, lineA + 1);
      editorA.current.revealLineInCenter(line);
      editorA.current.setPosition({ lineNumber: line, column: 1 });
    }

    if (editorB.current) {
      const line = Math.max(1, lineB + 1);
      editorB.current.revealLineInCenter(line);
      editorB.current.setPosition({ lineNumber: line, column: 1 });
    }

    // Focus the first editor
    editorA.current?.focus();
  };

  /**
   * Temporarily highlight a line with animation
   */
  const highlightLine = (editorId: 'A' | 'B', lineNumber: number) => {
    const editor = editorId === 'A' ? editorA.current : editorB.current;
    if (!editor) return;

    const line = Math.max(1, lineNumber + 1);

    // Add decoration (highlight)
    const decorations = editor.deltaDecorations(
      [],
      [
        {
          range: {
            startLineNumber: line,
            startColumn: 1,
            endLineNumber: line,
            endColumn: 1000,
          },
          options: {
            isWholeLine: true,
            className: 'diff-highlight-line',
            glyphMarginClassName: 'diff-highlight-glyph',
          },
        },
      ]
    );

    // Remove highlight after 1 second
    setTimeout(() => {
      editor.deltaDecorations(decorations, []);
    }, 1000);
  };

  const value: EditorContextValue = {
    editorA,
    editorB,
    navigateToLine,
    navigateToBoth,
    highlightLine,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

/**
 * Hook to access editor context
 */
export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within EditorProvider');
  }
  return context;
}
