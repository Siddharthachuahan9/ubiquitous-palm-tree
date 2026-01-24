'use client';

import { useRef } from 'react';
import { DiffEditor, DiffOnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { registerDarkIndustrialTheme } from '@/lib/monaco-theme';

interface MonacoDiffEditorProps {
  original: string;
  modified: string;
  language?: string;
  height?: string;
}

export function MonacoDiffEditor({
  original,
  modified,
  language = 'json',
  height = '100%',
}: MonacoDiffEditorProps) {
  const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);

  const handleDiffEditorDidMount: DiffOnMount = (editor, monaco) => {
    diffEditorRef.current = editor;

    // Register and apply Dark Industrial theme
    registerDarkIndustrialTheme(monaco);
    monaco.editor.setTheme('dark-industrial');

    // Configure JSON language features
    if (language === 'json') {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: false,
        schemas: [],
        enableSchemaRequest: false,
      });
    }
  };

  return (
    <DiffEditor
      height={height}
      language={language}
      original={original}
      modified={modified}
      onMount={handleDiffEditorDidMount}
      theme="dark-industrial"
      options={{
        // Diff-specific options
        renderSideBySide: true,
        enableSplitViewResizing: true,
        renderIndicators: true,
        ignoreTrimWhitespace: false,
        renderOverviewRuler: true,

        // Editor behavior
        readOnly: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,

        // Typography
        fontFamily: 'JetBrains Mono, Consolas, monospace',
        fontSize: 13,
        fontLigatures: true,
        lineHeight: 1.6,

        // Line numbers
        lineNumbers: 'on',
        lineNumbersMinChars: 3,
        glyphMargin: true,
        folding: true,

        // Scrollbar
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          verticalScrollbarSize: 12,
          horizontalScrollbarSize: 12,
        },

        // Rendering
        renderLineHighlight: 'line',
        renderWhitespace: 'selection',

        // Bracket matching
        matchBrackets: 'always',
        bracketPairColorization: {
          enabled: true,
        },
      }}
      loading={
        <div
          style={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1a1e',
            color: '#88889a',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
          }}
        >
          Loading diff editor...
        </div>
      }
    />
  );
}
