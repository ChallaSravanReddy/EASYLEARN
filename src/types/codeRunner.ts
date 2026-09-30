/**
 * Type definitions for zero-backend client-side code runner and iframe sandbox
 */

export interface ConsoleMessage {
  id: string;
  level: 'log' | 'warn' | 'error' | 'info';
  args: string[];
  timestamp: number;
}

export interface SandboxError {
  message: string;
  line?: number;
  column?: number;
  file?: string;
  stack?: string;
  type: 'syntax' | 'runtime' | 'unhandled_rejection';
}

export interface BundlerResult {
  success: boolean;
  html?: string;
  error?: SandboxError;
  durationMs?: number;
}

export interface CodePreviewIframeProps {
  /** Map of filename -> code content (e.g. { 'App.jsx': '...', 'Button.jsx': '...', 'styles.css': '...' }) */
  files: Record<string, string>;
  /** Optional custom entry file (e.g. 'App.jsx' or 'index.html'). Auto-detected if omitted. */
  entryFile?: string;
  /** Optional custom class name for container */
  className?: string;
  /** Whether to auto-recompile and re-run on code changes (default: true) */
  autoRefresh?: boolean;
  /** Key to trigger manual re-run (e.g. when user clicks Run button) */
  refreshKey?: number | string;
  /** Debounce delay in milliseconds before recompiling after code changes (default: 400ms) */
  debounceMs?: number;
  /** Callback fired when console messages arrive */
  onConsoleMessage?: (msg: ConsoleMessage) => void;
  /** Callback fired when an error occurs or is cleared */
  onError?: (err: SandboxError | null) => void;
  /** Show the integrated bottom terminal/console drawer (default: true) */
  showConsoleDrawer?: boolean;
  /** Default console open state (default: true if errors exist, false otherwise) */
  defaultConsoleOpen?: boolean;
  /** Title shown in preview header */
  title?: string;
}
