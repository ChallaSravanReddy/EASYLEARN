import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Terminal,
  AlertCircle,
  AlertTriangle,
  RotateCw,
  Trash2,
  ChevronUp,
  ChevronDown,
  Search,
  Copy,
  Check,
  Smartphone,
  Tablet,
  Monitor,
  X,
  Bug,
  Info,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import type {
  CodePreviewIframeProps,
  ConsoleMessage,
  SandboxError,
  BundlerResult,
} from '../types/codeRunner';
import { bundleVirtualProject } from '../utils/virtualBundler';

export default function CodePreviewIframe({
  files,
  entryFile,
  className = '',
  autoRefresh = true,
  refreshKey = 0,
  debounceMs = 350,
  onConsoleMessage,
  onError,
  showConsoleDrawer = true,
  defaultConsoleOpen = false,
  title = 'Live Preview',
}: CodePreviewIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const debounceTimerRef = useRef<any>(null);
  const consoleBottomRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef<number>(0);

  // Compilation & Execution State
  const [bundledHtml, setBundledHtml] = useState<string>('');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileDurationMs, setCompileDurationMs] = useState<number | null>(null);
  const [currentError, setCurrentError] = useState<SandboxError | null>(null);

  // Console Drawer State
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(defaultConsoleOpen);
  const [consoleFilter, setConsoleFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');
  const [consoleSearch, setConsoleSearch] = useState<string>('');
  const [autoScrollConsole, setAutoScrollConsole] = useState<boolean>(true);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Viewport mode: desktop (100%), tablet (768px), mobile (375px)
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Initialize Web Worker
  useEffect(() => {
    try {
      const worker = new Worker(new URL('../utils/bundler.worker.ts', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = (event: MessageEvent) => {
        const { id, success, html, error, durationMs } = event.data || {};
        // Ignore stale requests
        if (id !== requestIdRef.current) return;

        setIsCompiling(false);
        setCompileDurationMs(durationMs ? Math.round(durationMs) : null);

        if (success && html) {
          setCurrentError(null);
          setBundledHtml(html);
          if (onError) onError(null);
        } else if (error) {
          setCurrentError(error);
          if (onError) onError(error);
        }
      };

      worker.onerror = (err) => {
        console.warn('[CodePreviewIframe] Web Worker error, falling back to main-thread bundler:', err);
      };

      workerRef.current = worker;
    } catch (e) {
      console.warn('[CodePreviewIframe] Web Worker initialization failed, using main-thread fallback:', e);
      workerRef.current = null;
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [onError]);

  /**
   * Main compilation dispatcher (dispatches to Worker or falls back to main-thread)
   */
  const triggerCompilation = useCallback(
    (filesToCompile: Record<string, string>, targetEntry?: string) => {
      setIsCompiling(true);
      const reqId = ++requestIdRef.current;

      if (workerRef.current) {
        // Run off-thread in Web Worker
        workerRef.current.postMessage({
          id: reqId,
          files: filesToCompile,
          entryFile: targetEntry,
        });
      } else {
        // Main-thread fallback
        try {
          const result: BundlerResult = bundleVirtualProject(filesToCompile, targetEntry);
          if (reqId !== requestIdRef.current) return;

          setIsCompiling(false);
          setCompileDurationMs(result.durationMs ? Math.round(result.durationMs) : null);

          if (result.success && result.html) {
            setCurrentError(null);
            setBundledHtml(result.html);
            if (onError) onError(null);
          } else if (result.error) {
            setCurrentError(result.error);
            if (onError) onError(result.error);
          }
        } catch (e: any) {
          setIsCompiling(false);
          const errObj: SandboxError = {
            type: 'runtime',
            message: e.message || 'Compilation failure',
            stack: e.stack,
          };
          setCurrentError(errObj);
          if (onError) onError(errObj);
        }
      }
    },
    [onError]
  );

  // Trigger compilation whenever files, entryFile, or refreshKey change
  useEffect(() => {
    if (!autoRefresh && refreshKey === 0) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      triggerCompilation(files, entryFile);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [files, entryFile, refreshKey, autoRefresh, debounceMs, triggerCompilation]);

  // Intercept postMessage events from the isolated sandbox iframe
  useEffect(() => {
    const handleSandboxMessage = (event: MessageEvent) => {
      // Security check: Ignore messages from unrecognized sources
      if (!event.data || typeof event.data !== 'object') return;

      const { type, level, args, error, timestamp } = event.data;

      if (type === 'SANDBOX_CONSOLE') {
        const newMsg: ConsoleMessage = {
          id: Math.random().toString(36).substring(2, 9),
          level: level || 'log',
          args: Array.isArray(args) ? args : [String(args)],
          timestamp: timestamp || Date.now(),
        };

        setConsoleMessages((prev) => [...prev.slice(-300), newMsg]); // keep last 300 logs
        if (onConsoleMessage) {
          onConsoleMessage(newMsg);
        }
      } else if (type === 'SANDBOX_CONSOLE_CLEAR') {
        setConsoleMessages([]);
      } else if (type === 'SANDBOX_ERROR') {
        const sandError: SandboxError = {
          type: error?.type || 'runtime',
          message: error?.message || 'Uncaught Sandbox Error',
          line: error?.line,
          column: error?.column,
          stack: error?.stack,
        };
        setCurrentError(sandError);
        if (onError) onError(sandError);
      }
    };

    window.addEventListener('message', handleSandboxMessage);
    return () => window.removeEventListener('message', handleSandboxMessage);
  }, [onConsoleMessage, onError]);

  // Auto-scroll console to bottom when new logs arrive
  useEffect(() => {
    if (autoScrollConsole && consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleMessages, autoScrollConsole]);

  // Compute message counts
  const errorCount = useMemo(
    () => consoleMessages.filter((m) => m.level === 'error').length,
    [consoleMessages]
  );
  const warnCount = useMemo(
    () => consoleMessages.filter((m) => m.level === 'warn').length,
    [consoleMessages]
  );

  // Filtered console messages
  const filteredMessages = useMemo(() => {
    return consoleMessages.filter((msg) => {
      if (consoleFilter !== 'all' && msg.level !== consoleFilter) {
        return false;
      }
      if (consoleSearch.trim()) {
        const q = consoleSearch.toLowerCase();
        return msg.args.some((a) => a.toLowerCase().includes(q));
      }
      return true;
    });
  }, [consoleMessages, consoleFilter, consoleSearch]);

  const copyLogText = (msg: ConsoleMessage) => {
    navigator.clipboard.writeText(msg.args.join(' '));
    setCopiedLogId(msg.id);
    setTimeout(() => setCopiedLogId(null), 1500);
  };

  const reloadIframe = () => {
    setConsoleMessages([]);
    triggerCompilation(files, entryFile);
  };

  // Viewport width styling
  const viewportWidthClass = useMemo(() => {
    switch (viewportMode) {
      case 'mobile':
        return 'max-w-[375px] shadow-2xl border-x border-slate-700/60 my-auto rounded-xl';
      case 'tablet':
        return 'max-w-[768px] shadow-2xl border-x border-slate-700/60 my-auto rounded-xl';
      default:
        return 'w-full';
    }
  }, [viewportMode]);

  return (
    <div
      className={`flex flex-col h-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl overflow-hidden shadow-xl select-none relative ${className}`}
    >
      {/* ── Top Toolbar ── */}
      <div className="h-11 bg-slate-900 border-b border-slate-800/80 px-3 flex items-center justify-between shrink-0 select-none z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{title}</span>
          </div>

          {/* Compilation status */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 ml-2 pl-2 border-l border-slate-800">
            {isCompiling ? (
              <span className="flex items-center gap-1 text-amber-400">
                <RotateCw className="w-3 h-3 animate-spin" /> Compiling...
              </span>
            ) : currentError ? (
              <span className="flex items-center gap-1 text-rose-400 font-semibold">
                <AlertCircle className="w-3 h-3" /> Error
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3 h-3" />
                {compileDurationMs !== null ? `${compileDurationMs}ms` : 'Ready'}
              </span>
            )}
          </div>
        </div>

        {/* Viewport & Controls */}
        <div className="flex items-center gap-1.5">
          {/* Responsive Viewport Buttons */}
          <div className="hidden sm:flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 mr-1">
            <button
              onClick={() => setViewportMode('desktop')}
              className={`p-1 rounded text-xs transition-colors ${
                viewportMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              className={`p-1 rounded text-xs transition-colors ${
                viewportMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`p-1 rounded text-xs transition-colors ${
                viewportMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Re-run button */}
          <button
            onClick={reloadIframe}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            title="Recompile and re-run sandbox"
          >
            <RotateCw className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Run</span>
          </button>
        </div>
      </div>

      {/* ── Main Preview Area (Isolated Sandbox Iframe) ── */}
      <div className="flex-1 relative flex items-center justify-center bg-slate-900/50 overflow-hidden min-h-0">
        {/* Isolated Iframe with strict sandbox attributes */}
        <div className={`h-full transition-all duration-300 relative flex flex-col ${viewportWidthClass}`}>
          <iframe
            ref={iframeRef}
            title={title}
            // SANDBOX SECURITY:
            // - allow-scripts: allows Javascript execution inside iframe
            // - allow-modals: allows alert/prompt inside sandbox
            // - OMITTED allow-same-origin: enforces opaque origin "null" (No cookie/localStorage access!)
            // - OMITTED allow-top-navigation: prevents top-level window redirect
            sandbox="allow-scripts allow-modals"
            srcDoc={bundledHtml}
            className="w-full h-full border-0 bg-white"
          />
        </div>

        {/* ── Floating Error Overlay Toast (Requirement 4) ── */}
        {currentError && (
          <div className="absolute top-4 inset-x-4 max-w-2xl mx-auto z-40 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="bg-rose-950/90 backdrop-blur-md border border-rose-500/50 text-rose-100 rounded-xl p-4 shadow-2xl flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                        {currentError.type === 'syntax' ? 'Syntax Error' : 'Runtime Exception'}
                      </span>
                      {currentError.file && (
                        <span className="px-2 py-0.5 rounded bg-rose-900/80 text-[11px] font-mono text-rose-200 border border-rose-700/60">
                          {currentError.file}
                        </span>
                      )}
                      {currentError.line !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-rose-900/80 text-[11px] font-mono text-rose-200 border border-rose-700/60">
                          Line {currentError.line}
                          {currentError.column !== undefined ? `:${currentError.column}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentError(null)}
                  className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-900/60 transition-colors"
                  title="Dismiss error overlay"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Error Message */}
              <pre className="text-xs font-mono text-rose-100 bg-rose-900/40 p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap border border-rose-800/40 leading-relaxed max-h-36">
                {currentError.message}
              </pre>

              {/* Stack trace if present */}
              {currentError.stack && (
                <details className="text-[11px] text-rose-300/80 font-mono">
                  <summary className="cursor-pointer hover:text-rose-200 select-none">
                    View stack trace
                  </summary>
                  <pre className="mt-1 p-2 bg-slate-950/80 rounded border border-rose-900/50 text-[10px] overflow-x-auto max-h-24">
                    {currentError.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Drawer Terminal/Console UI Component (Requirement 3) ── */}
      {showConsoleDrawer && (
        <div
          className={`border-t border-slate-800 bg-slate-950 flex flex-col transition-all duration-200 z-20 shrink-0 ${
            isConsoleOpen ? 'h-48' : 'h-8'
          }`}
        >
          {/* Console Header Bar */}
          <div
            className="h-8 bg-slate-900 px-3 flex items-center justify-between cursor-pointer select-none text-xs text-slate-300 border-b border-slate-800"
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-white text-[11px]">Console</span>

              {/* Counts */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono ml-1">
                {errorCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                    <X className="w-2.5 h-2.5" /> {errorCount}
                  </span>
                )}
                {warnCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> {warnCount}
                  </span>
                )}
                <span className="text-slate-500">
                  {consoleMessages.length} {consoleMessages.length === 1 ? 'log' : 'logs'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {isConsoleOpen && (
                <>
                  {/* Filter Pills */}
                  <div className="flex items-center bg-slate-800 rounded p-0.5 text-[10px] font-medium mr-1">
                    {(['all', 'log', 'warn', 'error'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setConsoleFilter(filter)}
                        className={`px-2 py-0.5 rounded capitalize transition-colors ${
                          consoleFilter === filter
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  {/* Search box */}
                  <div className="flex items-center bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    <Search className="w-3 h-3 text-slate-500 mr-1" />
                    <input
                      type="text"
                      placeholder="Filter logs..."
                      value={consoleSearch}
                      onChange={(e) => setConsoleSearch(e.target.value)}
                      className="bg-transparent text-[11px] text-white focus:outline-none w-20 sm:w-28 font-mono"
                    />
                  </div>

                  {/* Clear Button */}
                  <button
                    onClick={() => setConsoleMessages([])}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Clear console"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {/* Drawer Toggle */}
              <button
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                className="p-1 rounded text-slate-400 hover:text-white"
                title={isConsoleOpen ? 'Collapse console' : 'Expand console'}
              >
                {isConsoleOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Console Log List Area */}
          {isConsoleOpen && (
            <div className="flex-1 p-2 overflow-y-auto font-mono text-[11px] space-y-1 bg-slate-950/90 select-text">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                  {consoleSearch ? 'No logs matching filter' : 'Console is empty'}
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  let badgeColor = 'text-slate-400 border-slate-800 bg-slate-900';
                  let icon = <span className="text-slate-500">&gt;</span>;

                  if (msg.level === 'warn') {
                    badgeColor = 'text-amber-400 border-amber-500/20 bg-amber-950/20';
                    icon = <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />;
                  } else if (msg.level === 'error') {
                    badgeColor = 'text-rose-400 border-rose-500/20 bg-rose-950/20';
                    icon = <X className="w-3 h-3 text-rose-400 shrink-0" />;
                  } else if (msg.level === 'info') {
                    badgeColor = 'text-sky-400 border-sky-500/20 bg-sky-950/20';
                    icon = <Info className="w-3 h-3 text-sky-400 shrink-0" />;
                  }

                  const timeStr = new Date(msg.timestamp).toLocaleTimeString();

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start justify-between gap-2 p-1.5 rounded border transition-colors group ${badgeColor}`}
                    >
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <div className="mt-0.5">{icon}</div>
                        <div className="flex-1 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed text-slate-200">
                          {msg.args.join(' ')}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <span className="text-[10px] text-slate-500">{timeStr}</span>
                        <button
                          onClick={() => copyLogText(msg)}
                          className="p-1 rounded text-slate-500 hover:text-slate-300"
                          title="Copy log entry"
                        >
                          {copiedLogId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={consoleBottomRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
