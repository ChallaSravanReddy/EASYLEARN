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
  X,
  Lock,
  ArrowLeft,
  ArrowRight,
  Star,
  Puzzle,
  User,
  MoreVertical,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Globe,
  Volume2,
  VolumeX,
  ExternalLink,
  Columns2,
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
  debounceMs = 120,
  onConsoleMessage,
  onError,
  showConsoleDrawer = false,
  defaultConsoleOpen = false,
  title = 'localhost:3000',
  isFloating = false,
  defaultPosition = { right: 16, top: 12 },
  defaultSize = { width: 360, height: 270 },
  onClose,
  onDock,
  initialUrl = 'http://localhost:3000/',
}: CodePreviewIframeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const debounceTimerRef = useRef<any>(null);
  const consoleBottomRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef<number>(0);
  const urlInputRef = useRef<HTMLInputElement | null>(null);

  // Floating Window & Resizing State
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: defaultPosition.x ?? 0,
    y: defaultPosition.y ?? defaultPosition.top ?? 12,
  });
  const [hasUserDragged, setHasUserDragged] = useState<boolean>(false);
  const [size, setSize] = useState<{ width: number; height: number }>(defaultSize);

  useEffect(() => {
    if (defaultSize?.width && defaultSize?.height) {
      setSize(defaultSize);
    }
  }, [defaultSize?.width, defaultSize?.height]);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number } | null>(null);
  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    startWidth: number;
    startHeight: number;
    direction: 'e' | 's' | 'se';
  } | null>(null);

  // Compilation & Execution State
  const [bundledHtml, setBundledHtml] = useState<string>('');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileDurationMs, setCompileDurationMs] = useState<number | null>(null);
  const [currentError, setCurrentError] = useState<SandboxError | null>(null);

  // Browser Navigation & Omnibox State
  const [historyStack, setHistoryStack] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const currentUrl = historyStack[historyIndex] || initialUrl;
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [urlInputValue, setUrlInputValue] = useState<string>(currentUrl);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isCopiedUrl, setIsCopiedUrl] = useState<boolean>(false);
  const [showBrowserMenu, setShowBrowserMenu] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Console Drawer State
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(defaultConsoleOpen);
  const [consoleFilter, setConsoleFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');
  const [consoleSearch, setConsoleSearch] = useState<string>('');
  const [autoScrollConsole, setAutoScrollConsole] = useState<boolean>(true);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Sync address bar text when URL changes
  useEffect(() => {
    setUrlInputValue(currentUrl);
  }, [currentUrl]);

  // Initialize Web Worker for client-side sandboxing
  useEffect(() => {
    try {
      const worker = new Worker(new URL('../utils/bundler.worker.ts', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = (event: MessageEvent) => {
        const { id, success, html, error, durationMs } = event.data || {};
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
        console.warn('[CodePreviewIframe] Web Worker error, falling back to main thread bundler:', err);
      };

      workerRef.current = worker;
    } catch (e) {
      console.warn('[CodePreviewIframe] Web Worker init failed, using main thread fallback:', e);
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
   * Main compilation trigger
   */
  const triggerCompilation = useCallback(
    (filesToCompile: Record<string, string>, targetEntry?: string) => {
      setIsCompiling(true);
      const reqId = ++requestIdRef.current;

      if (workerRef.current) {
        workerRef.current.postMessage({
          id: reqId,
          files: filesToCompile,
          entryFile: targetEntry,
        });
      } else {
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

  // Trigger compilation whenever files or entryFile change
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

  // Intercept postMessage events from the isolated iframe
  useEffect(() => {
    const handleSandboxMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      const { type, level, args, error, timestamp } = event.data;

      if (type === 'SANDBOX_CONSOLE') {
        const newMsg: ConsoleMessage = {
          id: Math.random().toString(36).substring(2, 9),
          level: level || 'log',
          args: Array.isArray(args) ? args : [String(args)],
          timestamp: timestamp || Date.now(),
        };
        setConsoleMessages((prev) => [...prev.slice(-300), newMsg]);
        if (onConsoleMessage) onConsoleMessage(newMsg);
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

  // Auto-scroll console
  useEffect(() => {
    if (autoScrollConsole && consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleMessages, autoScrollConsole]);

  const reloadIframe = () => {
    setConsoleMessages([]);
    triggerCompilation(files, entryFile);
  };

  // History stack navigation
  const handleGoBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      reloadIframe();
    }
  };

  const handleGoForward = () => {
    if (historyIndex < historyStack.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      reloadIframe();
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let nextUrl = urlInputValue.trim();
    if (!nextUrl) return;
    if (!nextUrl.startsWith('http://') && !nextUrl.startsWith('https://')) {
      nextUrl = 'http://' + nextUrl;
    }
    const nextStack = [...historyStack.slice(0, historyIndex + 1), nextUrl];
    setHistoryStack(nextStack);
    setHistoryIndex(nextStack.length - 1);
    setIsEditingUrl(false);
    reloadIframe();
  };

  const handleStartEditUrl = () => {
    setIsEditingUrl(true);
    setUrlInputValue(currentUrl);
    setTimeout(() => {
      if (urlInputRef.current) {
        urlInputRef.current.focus();
        urlInputRef.current.select();
      }
    }, 10);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setIsCopiedUrl(true);
    setTimeout(() => setIsCopiedUrl(false), 1500);
  };

  const toggleBookmark = () => {
    setIsBookmarked((prev) => !prev);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsMinimized(true);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  // Parse domain and path for clean Omnibox presentation
  const { parsedDomain, parsedPath } = useMemo(() => {
    try {
      const urlObj = new URL(currentUrl);
      return {
        parsedDomain: urlObj.host || 'localhost:3000',
        parsedPath: urlObj.pathname === '/' ? '' : urlObj.pathname + urlObj.search + urlObj.hash,
      };
    } catch {
      return {
        parsedDomain: 'localhost:3000',
        parsedPath: '',
      };
    }
  }, [currentUrl]);

  // Dragging logic (only empty space in tab bar triggers drag)
  const handleTabMouseDown = (e: React.MouseEvent) => {
    if (!isFloating || isMaximized) return;
    const target = e.target as HTMLElement;
    // Strictly ignore clicks on tabs, buttons, inputs, or marked elements
    if (
      target.closest('[data-no-drag="true"]') ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT'
    ) {
      return;
    }

    let startX = position.x;
    let startY = position.y;
    if (!hasUserDragged && containerRef.current) {
      startX = containerRef.current.offsetLeft;
      startY = containerRef.current.offsetTop;
      setPosition({ x: startX, y: startY });
      setHasUserDragged(true);
    }

    e.preventDefault();
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: startX,
      posY: startY,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;
      setPosition({
        x: Math.max(0, dragStartRef.current.posX + deltaX),
        y: Math.max(0, dragStartRef.current.posY + deltaY),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Window resizing logic
  const handleResizeMouseDown = (direction: 'e' | 's' | 'se', e: React.MouseEvent) => {
    if (!isFloating || isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
      direction,
    };
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;
      const { mouseX, mouseY, startWidth, startHeight, direction } = resizeStartRef.current;
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction === 'e' || direction === 'se') {
        newWidth = Math.max(280, startWidth + deltaX);
        newHeight = Math.round((newWidth * 3) / 4);
      } else if (direction === 's') {
        newHeight = Math.max(210, startHeight + deltaY);
        newWidth = Math.round((newHeight * 4) / 3);
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Console counts
  const errorCount = useMemo(
    () => consoleMessages.filter((m) => m.level === 'error').length,
    [consoleMessages]
  );
  const warnCount = useMemo(
    () => consoleMessages.filter((m) => m.level === 'warn').length,
    [consoleMessages]
  );

  const filteredMessages = useMemo(() => {
    return consoleMessages.filter((msg) => {
      if (consoleFilter !== 'all' && msg.level !== consoleFilter) return false;
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

  // Determine if window is compact (< 400px)
  const isCompact = (isFloating ? size.width : 360) < 400;

  // Determine floating wrapper styles (4:3 ratio)
  const floatingStyle: React.CSSProperties = isFloating
    ? isMaximized
      ? {
          position: 'absolute',
          top: 12,
          right: 16,
          width: 480,
          height: 360,
          zIndex: 35,
        }
      : hasUserDragged
      ? {
          position: 'absolute',
          top: position.y,
          left: position.x,
          width: size.width,
          height: isMinimized ? 'auto' : size.height,
          zIndex: 35,
        }
      : {
          position: 'absolute',
          top: defaultPosition.top ?? defaultPosition.y ?? 12,
          right:
            defaultPosition.right !== undefined
              ? defaultPosition.right
              : defaultPosition.x === undefined
              ? 16
              : undefined,
          left: defaultPosition.x !== undefined ? defaultPosition.x : undefined,
          width: size.width,
          height: isMinimized ? 'auto' : size.height,
          zIndex: 35,
        }
    : {};

  return (
    <div
      ref={containerRef}
      style={floatingStyle}
      className={`flex flex-col bg-[#141622] text-slate-100 border border-slate-700/70 rounded-xl overflow-hidden shadow-2xl select-none relative ${
        isFloating ? 'transition-shadow' : 'h-full w-full'
      } ${className}`}
    >
      {/* ── 1. REALISTIC BROWSER TOP TAB BAR (macOS / Chrome Style) ── */}
      <div
        onMouseDown={handleTabMouseDown}
        className={`h-10 bg-[#0f1019] border-b border-slate-800/80 px-3 flex items-center gap-2 select-none shrink-0 relative ${
          isFloating && !isMaximized ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
      >
        {/* macOS Traffic Light Window Controls */}
        <div className="flex items-center gap-2 pr-2" data-no-drag="true">
          <button
            onClick={handleClose}
            className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:brightness-110 active:brightness-90 transition-all flex items-center justify-center group cursor-pointer"
            title="Close window"
          >
            <X className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            onClick={handleMinimize}
            className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:brightness-110 active:brightness-90 transition-all flex items-center justify-center group cursor-pointer"
            title={isMinimized ? 'Restore window' : 'Minimize window'}
          >
            <Minus className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            onClick={handleMaximize}
            className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:brightness-110 active:brightness-90 transition-all flex items-center justify-center group cursor-pointer"
            title={isMaximized ? 'Restore down' : 'Maximize window'}
          >
            {isMaximized ? (
              <Minimize2 className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
            ) : (
              <Maximize2 className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        </div>

        {/* Active Browser Tab with Curvature & Realistic Contrast */}
        <div
          data-no-drag="true"
          className="h-8 bg-[#1e202e] border-t border-x border-slate-700/60 rounded-t-lg px-2.5 flex items-center gap-1.5 text-xs font-medium text-slate-100 max-w-[170px] min-w-0 flex-1 shadow-sm relative top-[1px]"
        >
          {/* Favicon */}
          {isCompiling ? (
            <RotateCw className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
          ) : (
            <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          )}

          {/* Document / Page Title */}
          <span className="truncate text-[11px] font-normal text-slate-200 min-w-0 flex-1">
            {title || parsedDomain}
          </span>

          {/* Audio Indicator */}
          {!isCompact && (
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="p-0.5 rounded text-slate-400 hover:text-blue-400 transition-colors shrink-0"
              title={isAudioMuted ? 'Unmute tab audio' : 'Mute tab audio'}
            >
              {isAudioMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
          )}

          {/* Close Tab Icon */}
          <button
            onClick={handleClose}
            className="p-0.5 rounded-full hover:bg-slate-700/70 text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
            title="Close tab"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* New Tab '+' Button */}
        <button
          onClick={reloadIframe}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="New tab"
          data-no-drag="true"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Draggable empty space (tab bar header) */}
        <div className="flex-1 h-full" />
      </div>

      {/* When minimized, only show the top tab bar */}
      {!isMinimized && (
        <>
          {/* ── 2. OMNIBOX / NAVIGATION TOOLBAR ── */}
          <div className="h-10 bg-[#1e202e] border-b border-slate-800 px-3 flex items-center gap-2 shrink-0 select-none z-10">
            {/* Navigation Controls: Back, Forward, Reload */}
            <div className="flex items-center gap-1 text-slate-300" data-no-drag="true">
              <button
                onClick={handleGoBack}
                disabled={historyIndex <= 0}
                className="p-1.5 rounded-full hover:bg-slate-700/60 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                title="Click to go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleGoForward}
                disabled={historyIndex >= historyStack.length - 1}
                className="p-1.5 rounded-full hover:bg-slate-700/60 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                title="Click to go forward"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={reloadIframe}
                className="p-1.5 rounded-full hover:bg-slate-700/60 text-slate-300 transition-colors cursor-pointer"
                title="Reload this page"
              >
                <RotateCw
                  className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin text-blue-400' : ''}`}
                />
              </button>
            </div>

            {/* Address Bar (Omnibox): Centered rounded pill */}
            <div
              className="flex-1 max-w-xl mx-auto bg-[#12131e] hover:bg-[#151624] focus-within:bg-[#0f1019] border border-slate-700/60 focus-within:border-blue-500/70 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-full px-3 py-1 flex items-center gap-2 text-xs transition-all shadow-inner group"
              data-no-drag="true"
            >
              {/* Padlock Icon: Localhost / HTTPS Indicator */}
              <div
                className="flex items-center text-emerald-400 shrink-0"
                title="Connection is secure (Localhost)"
              >
                <Lock className="w-3.5 h-3.5" />
              </div>

              {/* URL Display / Interactive Input */}
              {isEditingUrl ? (
                <form onSubmit={handleUrlSubmit} className="flex-1 min-w-0">
                  <input
                    ref={urlInputRef}
                    type="text"
                    value={urlInputValue}
                    onChange={(e) => setUrlInputValue(e.target.value)}
                    onBlur={() => setIsEditingUrl(false)}
                    className="w-full bg-transparent text-slate-100 text-xs focus:outline-none font-mono"
                    autoFocus
                  />
                </form>
              ) : (
                <div
                  onClick={handleStartEditUrl}
                  className="flex-1 min-w-0 cursor-text flex items-center font-mono text-xs overflow-hidden"
                  title="Click to edit URL"
                >
                  <span className="text-slate-500 text-[11px] mr-0.5">http://</span>
                  <span className="font-semibold text-slate-100">{parsedDomain}</span>
                  <span className="text-slate-400 truncate">{parsedPath}</span>
                </div>
              )}

              {/* Right actions inside Omnibox */}
              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                {!isCompact && (
                  <button
                    onClick={toggleBookmark}
                    className="p-0.5 hover:text-amber-400 transition-colors cursor-pointer"
                    title="Bookmark this tab"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isBookmarked ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                      }`}
                    />
                  </button>
                )}
                <button
                  onClick={handleCopyUrl}
                  className="p-0.5 hover:text-white transition-colors cursor-pointer"
                  title="Copy URL"
                >
                  {isCopiedUrl ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Icons on Far Right */}
            <div className="flex items-center gap-1 pr-1 relative" data-no-drag="true">
              {/* Extensions Placeholder */}
              {!isCompact && (
                <button
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors cursor-pointer"
                  title="Extensions"
                >
                  <Puzzle className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Profile Avatar */}
              {!isCompact && (
                <div
                  className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-1 ring-white/20 cursor-pointer"
                  title="Active Profile"
                >
                  <User className="w-3 h-3" />
                </div>
              )}

              {/* Three-dots Menu */}
              <button
                onClick={() => setShowBrowserMenu(!showBrowserMenu)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors cursor-pointer"
                title="Browser options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Browser Dropdown Menu */}
              {showBrowserMenu && (
                <div className="absolute right-0 top-8 mt-1 w-48 bg-[#1e202e] border border-slate-700 rounded-lg shadow-2xl py-1 text-xs text-slate-200 z-50">
                  <button
                    onClick={() => {
                      reloadIframe();
                      setShowBrowserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
                  >
                    <span>Reload Page</span>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+R</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsConsoleOpen(!isConsoleOpen);
                      setShowBrowserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
                  >
                    <span>Developer Console</span>
                    <span className="text-[10px] text-slate-400 font-mono">F12</span>
                  </button>
                  {onDock && (
                    <button
                      onClick={() => {
                        onDock();
                        setShowBrowserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
                    >
                      <span>Dock to Side</span>
                      <Columns2 className="w-3 h-3 text-slate-400" />
                    </button>
                  )}
                  <div className="border-t border-slate-700/60 my-1" />
                  <button
                    onClick={() => {
                      window.open('about:blank', '_blank');
                      setShowBrowserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── 3. CLEAN FULL-BLEED IFRAME CONTAINER ── */}
          <div className="flex-1 relative bg-white overflow-hidden min-h-0">
            {/*
              CRITICAL: When dragging or resizing, the transparent overlay covers the entire
              frame to prevent the iframe from intercepting mousemove / mouseup events.
            */}
            {(isDragging || isResizing) && (
              <div className="absolute inset-0 z-50 bg-transparent cursor-grabbing select-none" />
            )}

            <iframe
              ref={iframeRef}
              title={title || parsedDomain}
              sandbox="allow-scripts allow-modals"
              srcDoc={bundledHtml}
              className={`w-full h-full border-0 bg-white ${
                isDragging || isResizing ? 'pointer-events-none' : ''
              }`}
            />

            {/* Error Overlay Toast (Aw, Snap! Style) */}
            {currentError && (
              <div className="absolute top-4 inset-x-4 max-w-xl mx-auto z-40 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="bg-rose-950/95 backdrop-blur-md border border-rose-500/50 text-rose-100 rounded-xl p-4 shadow-2xl flex flex-col gap-2">
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
                      className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-900/60 transition-colors cursor-pointer"
                      title="Dismiss error"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <pre className="text-xs font-mono text-rose-100 bg-rose-900/40 p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap border border-rose-800/40 leading-relaxed max-h-32">
                    {currentError.message}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* ── 4. CHROME DEVTOOLS CONSOLE DRAWER (Optional / Toggled) ── */}
          {(showConsoleDrawer || isConsoleOpen) && (
            <div
              className={`border-t border-slate-800 bg-[#0c0d14] flex flex-col transition-all duration-200 z-20 shrink-0 ${
                isConsoleOpen ? 'h-44' : 'h-8'
              }`}
            >
              {/* DevTools Header Bar */}
              <div
                className="h-8 bg-[#12131d] px-3 flex items-center justify-between cursor-pointer select-none text-xs text-slate-300 border-b border-slate-800"
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-white text-[11px]">Console</span>

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
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConsoleMessages([]);
                    }}
                    className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
                    title="Clear console"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <button className="text-slate-400">
                    {isConsoleOpen ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Console Logs Body */}
              {isConsoleOpen && (
                <div className="flex-1 p-2 overflow-y-auto font-mono text-[11px] space-y-1 bg-[#090a10]">
                  {filteredMessages.length === 0 ? (
                    <div className="text-slate-500 italic p-2 text-center text-xs">
                      No console output
                    </div>
                  ) : (
                    filteredMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2 p-1 rounded hover:bg-slate-800/40 group ${
                          msg.level === 'error'
                            ? 'text-rose-400 bg-rose-950/20'
                            : msg.level === 'warn'
                            ? 'text-amber-400 bg-amber-950/20'
                            : 'text-slate-300'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                        <div className="flex-1 whitespace-pre-wrap break-all">
                          {msg.args.join(' ')}
                        </div>
                        <button
                          onClick={() => copyLogText(msg)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-700 text-slate-400 transition-opacity"
                          title="Copy message"
                        >
                          {copiedLogId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ))
                  )}
                  <div ref={consoleBottomRef} />
                </div>
              )}
            </div>
          )}

          {/* ── 5. WINDOW RESIZE HANDLES (For floating mode) ── */}
          {isFloating && !isMaximized && (
            <>
              {/* Right edge */}
              <div
                onMouseDown={(e) => handleResizeMouseDown('e', e)}
                className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-blue-500/20 z-40"
              />
              {/* Bottom edge */}
              <div
                onMouseDown={(e) => handleResizeMouseDown('s', e)}
                className="absolute bottom-0 left-0 h-2 w-full cursor-ns-resize hover:bg-blue-500/20 z-40"
              />
              {/* Bottom-right corner */}
              <div
                onMouseDown={(e) => handleResizeMouseDown('se', e)}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-blue-500/40 z-40 flex items-end justify-end p-0.5"
              >
                <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-slate-500 rounded-br-sm" />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
