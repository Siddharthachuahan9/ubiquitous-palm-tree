// Type definitions for JSON Exploration Studio

export type Mode = 'diff' | 'jsonpath' | 'validate';

export type DiffMode = 'visual' | 'tree' | 'patch';

// Diff result types
export interface DiffResult {
  additions: number;
  deletions: number;
  modifications: number;
  moves: number;
  changes: DiffChange[];
  patch: JSONPatchOperation[];
}

export interface DiffChange {
  type: 'add' | 'remove' | 'modify' | 'move';
  path: string;
  oldValue?: any;
  newValue?: any;
}

export interface JSONPatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: any;
  from?: string;
}

// JSONPath result types
export interface JSONPathResult {
  path: string;
  value: any;
  type: string;
  pointer: string;
}

// Validation types
export interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  fileSize: number;
  depth: number;
  nodeCount: number;
}

// Store state interface
export interface StudioState {
  // Mode state
  mode: Mode;
  setMode: (mode: Mode) => void;

  // JSON content
  jsonA: string;
  jsonB: string;
  jsonSource: string;
  setJsonA: (value: string) => void;
  setJsonB: (value: string) => void;
  setJsonSource: (value: string) => void;

  // JSONPath query
  jsonpathQuery: string;
  setJsonpathQuery: (query: string) => void;

  // Results
  diffResults: DiffResult | null;
  jsonpathResults: JSONPathResult[] | null;
  validationResults: ValidationResult | null;

  // UI state
  processing: boolean;
  error: string | null;
  fileSize: number;
  processingTime: number | null;

  // Actions
  executeDiff: () => void;
  executeJsonPath: () => void;
  executeValidation: () => void;
  clearAll: () => void;
  clearError: () => void;
}
