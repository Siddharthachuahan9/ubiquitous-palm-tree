'use client';

import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { OnMount, OnChange, BeforeMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { registerDarkIndustrialTheme } from '@/lib/monaco-theme';
import { loader } from '@monaco-editor/react';

// Configure Monaco to use CDN workers
if (typeof window !== 'undefined') {
  loader.config({
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
    }
  });
}

// Dynamic import with SSR disabled
const Editor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div style={loadingStyle}>
        Loading editor...
      </div>
    )
  }
);

// Threshold for switching to textarea (characters)
// Lowered to 30KB to avoid Monaco freezing on deeply nested JSON
const LARGE_FILE_THRESHOLD = 30000; // 30KB

const loadingStyle: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#1a1a1e',
  color: '#88889a',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '13px',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  background: '#1a1a1e',
  color: '#c9c9d8',
  border: 'none',
  outline: 'none',
  resize: 'none',
  fontFamily: 'JetBrains Mono, Consolas, monospace',
  fontSize: '13px',
  lineHeight: '1.6',
  padding: '12px',
  boxSizing: 'border-box',
};

const infoBarStyle: React.CSSProperties = {
  background: '#2a2a2e',
  color: '#88889a',
  padding: '4px 12px',
  fontSize: '11px',
  borderBottom: '1px solid #3a3a3e',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
  placeholder?: string;
  editorRef?: React.MutableRefObject<editor.IStandaloneCodeEditor | null>;
}

export function MonacoEditor({
  value,
  onChange,
  language = 'json',
  readOnly = false,
  height = '100%',
  placeholder,
  editorRef: externalEditorRef,
}: MonacoEditorProps) {
  // ALL HOOKS MUST BE AT THE TOP - before any conditional returns
  const internalEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const editorRef = externalEditorRef || internalEditorRef;
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const lastValueRef = useRef<string>(value);
  const isInternalChange = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [useTextarea, setUseTextarea] = useState(value.length > LARGE_FILE_THRESHOLD);

  // Check if content becomes large
  useEffect(() => {
    const shouldUseTextarea = value.length > LARGE_FILE_THRESHOLD;
    if (shouldUseTextarea !== useTextarea) {
      setUseTextarea(shouldUseTextarea);
    }
  }, [value.length, useTextarea]);

  // Handle textarea changes
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);

  // Switch to Monaco editor manually
  const switchToMonaco = useCallback(() => {
    setUseTextarea(false);
  }, []);

  // Handle external value changes (format, clear, etc.)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !mounted || useTextarea) return;

    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    if (value === lastValueRef.current) return;

    lastValueRef.current = value;
    requestAnimationFrame(() => {
      if (editor && editor.getModel()) {
        editor.setValue(value);
      }
    });
  }, [value, mounted, editorRef, useTextarea]);

  // Before mount - configure Monaco globally
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: false,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: false,
    });
  }, []);

  // On mount
  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    lastValueRef.current = value;
    setMounted(true);

    registerDarkIndustrialTheme(monaco);
    monaco.editor.setTheme('dark-industrial');

    if (!value && placeholder) {
      editor.setValue(placeholder);
    }

    // Check content size on paste
    editor.onDidPaste(() => {
      const model = editor.getModel();
      if (model) {
        const newValue = model.getValue();
        if (newValue.length > LARGE_FILE_THRESHOLD) {
          setUseTextarea(true);
        }
      }
    });
  }, [editorRef, value, placeholder]);

  // Handle changes
  const handleChange: OnChange = useCallback((newValue) => {
    if (!onChange) return;

    const val = newValue || '';
    lastValueRef.current = val;
    isInternalChange.current = true;

    if (val.length > LARGE_FILE_THRESHOLD) {
      setUseTextarea(true);
    }

    onChange(val);
  }, [onChange]);

  // Intercept paste at DOM level BEFORE Monaco processes it
  const handlePasteCapture = useCallback((e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData?.getData('text') || '';

    if (pastedText.length > LARGE_FILE_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();

      if (onChange) {
        onChange(pastedText);
      }
      setUseTextarea(true);
    }
  }, [onChange]);

  // Memoize options
  const editorOptions = useMemo((): editor.IStandaloneEditorConstructionOptions => ({
    readOnly,
    automaticLayout: true,
    formatOnPaste: false,
    formatOnType: false,
    autoClosingBrackets: 'never',
    autoClosingQuotes: 'never',
    autoSurround: 'never',
    autoIndent: 'none',
    minimap: { enabled: false },
    fontFamily: 'JetBrains Mono, Consolas, monospace',
    fontSize: 13,
    fontLigatures: false,
    lineHeight: 1.6,
    lineNumbers: 'on',
    lineNumbersMinChars: 3,
    glyphMargin: false,
    folding: false,
    scrollBeyondLastLine: false,
    smoothScrolling: false,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      verticalScrollbarSize: 12,
      horizontalScrollbarSize: 12,
      useShadows: false,
    },
    wordWrap: 'on',
    wrappingStrategy: 'simple',
    renderLineHighlight: 'none',
    renderWhitespace: 'none',
    renderControlCharacters: false,
    guides: { indentation: false },
    renderValidationDecorations: 'off',
    cursorBlinking: 'solid',
    cursorSmoothCaretAnimation: 'off',
    cursorStyle: 'line',
    matchBrackets: 'never',
    bracketPairColorization: { enabled: false },
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    acceptSuggestionOnEnter: 'off',
    tabCompletion: 'off',
    wordBasedSuggestions: 'off',
    parameterHints: { enabled: false },
    hover: { enabled: false },
    links: false,
    colorDecorators: false,
    maxTokenizationLineLength: 500,
    stopRenderingLineAfter: 1000,
    largeFileOptimizations: true,
    selectionClipboard: false,
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: false,
    accessibilitySupport: 'off',
    'semanticHighlighting.enabled': false,
    stickyScroll: { enabled: false },
  }), [readOnly]);

  // RENDER - conditional rendering AFTER all hooks
  if (useTextarea) {
    const lineCount = value.split('\n').length;
    const sizeKB = (value.length / 1024).toFixed(1);

    return (
      <div style={{ height, display: 'flex', flexDirection: 'column' }}>
        <div style={infoBarStyle}>
          <span>Large file mode ({lineCount.toLocaleString()} lines, {sizeKB} KB)</span>
          <button
            onClick={switchToMonaco}
            style={{
              background: '#3a3a3e',
              border: 'none',
              color: '#c9c9d8',
              padding: '2px 8px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            Switch to Monaco (may be slow)
          </button>
        </div>
        <textarea
          style={textareaStyle}
          value={value}
          onChange={handleTextareaChange}
          placeholder={placeholder}
          readOnly={readOnly}
          spellCheck={false}
        />
      </div>
    );
  }

  return (
    <div
      style={{ height, width: '100%' }}
      onPasteCapture={handlePasteCapture}
    >
      <Editor
        height="100%"
        language={language}
        defaultValue={value}
        onChange={handleChange}
        beforeMount={handleBeforeMount}
        onMount={handleEditorDidMount}
        theme="dark-industrial"
        options={editorOptions}
        loading={<div style={loadingStyle}>Loading editor...</div>}
      />
    </div>
  );
}
