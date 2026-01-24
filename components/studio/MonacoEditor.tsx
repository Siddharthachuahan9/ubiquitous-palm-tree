'use client';

import { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { registerDarkIndustrialTheme } from '@/lib/monaco-theme';

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
  placeholder?: string;
}

export function MonacoEditor({
  value,
  onChange,
  language = 'json',
  readOnly = false,
  height = '100%',
  placeholder,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register and apply Dark Industrial theme
    registerDarkIndustrialTheme(monaco);
    monaco.editor.setTheme('dark-industrial');

    // Show placeholder if empty
    if (!value && placeholder) {
      editor.setValue(placeholder);
      editor.setSelection(new monaco.Selection(1, 1, 1, 1));
    }

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

  const handleChange = (value: string | undefined) => {
    if (onChange) {
      onChange(value || '');
    }
  };

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={handleChange}
      onMount={handleEditorDidMount}
      theme="dark-industrial"
      options={{
        // Editor behavior
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,

        // Typography - JetBrains Mono from Dark Industrial theme
        fontFamily: 'JetBrains Mono, Consolas, monospace',
        fontSize: 13,
        fontLigatures: true,
        lineHeight: 1.6,

        // Line numbers and gutter
        lineNumbers: 'on',
        lineNumbersMinChars: 3,
        glyphMargin: false,
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
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',

        // Bracket matching
        matchBrackets: 'always',
        bracketPairColorization: {
          enabled: true,
        },

        // Suggestions
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false,
        },
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        tabCompletion: 'on',

        // Format on paste/type
        formatOnPaste: true,
        formatOnType: true,

        // Indentation
        tabSize: 2,
        insertSpaces: true,
        detectIndentation: true,
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
          Loading editor...
        </div>
      }
    />
  );
}
