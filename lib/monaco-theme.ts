import type { editor } from 'monaco-editor';

/**
 * Dark Industrial theme for Monaco Editor
 * Maps CSS variables to Monaco's theme format
 */
export const darkIndustrialTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // Syntax highlighting - using Dark Industrial color palette
    { token: 'string', foreground: '00ff88' },       // --color-success (bright green)
    { token: 'string.key.json', foreground: '00ccff' }, // --color-info (cyan)
    { token: 'number', foreground: '00ccff' },       // --color-info (electric cyan)
    { token: 'keyword', foreground: 'ff0066' },      // --color-error (hot magenta)
    { token: 'comment', foreground: '505058' },      // --color-zinc (muted)
    { token: 'delimiter', foreground: '88889a' },    // --color-silver
    { token: 'delimiter.bracket', foreground: 'c9c9d8' }, // --color-platinum
    { token: 'type', foreground: 'ffaa00' },         // --color-warning (yellow)
    { token: 'variable', foreground: 'c9c9d8' },     // --color-platinum
    { token: 'constant', foreground: '00ccff' },     // --color-info
    { token: 'operator', foreground: '88889a' },     // --color-silver
  ],
  colors: {
    // Editor background and foreground
    'editor.background': '#1a1a1e',                  // --color-shadow
    'editor.foreground': '#c9c9d8',                  // --color-platinum

    // Line highlighting
    'editor.lineHighlightBackground': '#242429',     // --color-steel
    'editor.lineHighlightBorder': '#00000000',       // Transparent

    // Selection
    'editor.selectionBackground': '#2d2d3544',       // --color-iron with opacity
    'editor.selectionHighlightBackground': '#2d2d3522',
    'editor.inactiveSelectionBackground': '#2d2d3533',

    // Cursor
    'editorCursor.foreground': '#00ff88',            // --color-success (match glow)
    'editorCursor.background': '#1a1a1e',

    // Line numbers
    'editorLineNumber.foreground': '#505058',        // --color-zinc
    'editorLineNumber.activeForeground': '#88889a',  // --color-silver

    // Gutter and margin
    'editorGutter.background': '#121214',            // --color-abyss
    'editorGutter.modifiedBackground': '#ffaa00',    // --color-warning
    'editorGutter.addedBackground': '#00ff88',       // --color-success
    'editorGutter.deletedBackground': '#ff0066',     // --color-error

    // Minimap
    'minimap.background': '#121214',                 // --color-abyss
    'minimap.selectionHighlight': '#00ff8833',

    // Scrollbar
    'scrollbar.shadow': '#0a0a0a',                   // --color-void
    'scrollbarSlider.background': '#2d2d35',         // --color-iron
    'scrollbarSlider.hoverBackground': '#505058',    // --color-zinc
    'scrollbarSlider.activeBackground': '#88889a',   // --color-silver

    // Bracket matching
    'editorBracketMatch.background': '#2d2d35',      // --color-iron
    'editorBracketMatch.border': '#00ff88',          // --color-success

    // Indentation guides
    'editorIndentGuide.background': '#2d2d35',       // --color-iron
    'editorIndentGuide.activeBackground': '#505058', // --color-zinc

    // Whitespace
    'editorWhitespace.foreground': '#2d2d35',        // --color-iron

    // Find/Replace widget
    'editorWidget.background': '#242429',            // --color-steel
    'editorWidget.border': '#2d2d35',                // --color-iron
    'editorWidget.resizeBorder': '#00ff88',          // --color-success

    // Suggestions widget
    'editorSuggestWidget.background': '#242429',     // --color-steel
    'editorSuggestWidget.border': '#2d2d35',         // --color-iron
    'editorSuggestWidget.foreground': '#c9c9d8',     // --color-platinum
    'editorSuggestWidget.selectedBackground': '#2d2d35', // --color-iron
    'editorSuggestWidget.highlightForeground': '#00ff88', // --color-success

    // Hover widget
    'editorHoverWidget.background': '#242429',       // --color-steel
    'editorHoverWidget.border': '#2d2d35',           // --color-iron

    // Error and warning markers
    'editorError.foreground': '#ff0066',             // --color-error
    'editorWarning.foreground': '#ffaa00',           // --color-warning
    'editorInfo.foreground': '#00ccff',              // --color-info

    // Diff editor colors
    'diffEditor.insertedTextBackground': '#00ff8822', // --color-diff-add with opacity
    'diffEditor.removedTextBackground': '#ff006622',  // --color-diff-remove with opacity
    'diffEditor.insertedLineBackground': '#00ff8811',
    'diffEditor.removedLineBackground': '#ff006611',
    'diffEditor.border': '#2d2d35',                  // --color-iron
  },
};

/**
 * Register the Dark Industrial theme with Monaco
 */
export function registerDarkIndustrialTheme(monaco: typeof import('monaco-editor')) {
  monaco.editor.defineTheme('dark-industrial', darkIndustrialTheme);
}
