import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Lock,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Minimize2,
  Terminal,
  AlertCircle,
  X,
} from 'lucide-react';

export interface ScrimBrowserPreviewProps {
  files: Record<string, string>;
  activeFile?: string;
  aspectRatio?: '4:3' | '16:9' | 'responsive';
  showConsole?: boolean;
  onToggleConsole?: () => void;
  className?: string;
}

/**
 * Compiles project HTML, CSS, and JS into a bundled executable srcDoc string
 */
export function buildSandboxHtml(files: Record<string, string>): string {
  const htmlContent = files['index.html'] || '<!DOCTYPE html><html><body><div id="root"></div></body></html>';
  const cssContent = files['index.css'] || files['styles.css'] || '';
  const jsContent = files['index.js'] || files['main.js'] || files['script.js'] || '';

  // Intercept console.log and errors for parent telemetry
  const telemetryScript = `
    <script>
      (function() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = function(...args) {
          originalLog.apply(console, args);
          window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'log', args: args.map(a => String(a)) }, '*');
        };

        console.error = function(...args) {
          originalError.apply(console, args);
          window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'error', args: args.map(a => String(a)) }, '*');
        };

        console.warn = function(...args) {
          originalWarn.apply(console, args);
          window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'warn', args: args.map(a => String(a)) }, '*');
        };

        window.onerror = function(message, source, lineno, colno, error) {
          window.parent.postMessage({ type: 'RUNTIME_ERROR', message, lineno, colno }, '*');
          return false;
        };
      })();
    </script>
  `;

  // Inject CSS
  let output = htmlContent;
  if (cssContent && !output.includes(cssContent)) {
    const styleTag = `<style id="easylearn-live-css">\n${cssContent}\n</style>`;
    if (output.includes('</head>')) {
      output = output.replace('</head>', `${styleTag}\n</head>`);
    } else {
      output = `${styleTag}\n${output}`;
    }
  }

  // Inject Telemetry & JS
  const scriptTag = `${telemetryScript}\n<script type="module" id="easylearn-live-js">\n${jsContent}\n</script>`;
  if (output.includes('</body>')) {
    output = output.replace('</body>', `${scriptTag}\n</body>`);
  } else {
    output = `${output}\n${scriptTag}`;
  }

  return output;
}

/**
 * ScrimBrowserPreview: Authentic web browser window component with realistic
 * Chrome/Arc chrome headers, traffic lights, omnibox, and sandboxed live execution.
 */
export default function ScrimBrowserPreview({
  files,
  activeFile,
  aspectRatio = '4:3',
  showConsole = false,
  onToggleConsole,
  className = '',
}: ScrimBrowserPreviewProps) {
  const [key, setKey] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [logs, setLogs] = useState<Array<{ level: string; text: string; time: string }>>([]);
  const [urlPath, setUrlPath] = useState<string>('http://localhost:3000');
  const [isInternalConsoleOpen, setIsInternalConsoleOpen] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Generate bundled srcDoc from files
  const srcDoc = React.useMemo(() => buildSandboxHtml(files), [files]);

  // Listen to iframe console messages
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'CONSOLE_LOG') {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs((prev) => [
          ...prev.slice(-49),
          { level: e.data.level, text: e.data.args.join(' '), time },
        ]);
      } else if (e.data && e.data.type === 'RUNTIME_ERROR') {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs((prev) => [
          ...prev.slice(-49),
          { level: 'error', text: `${e.data.message} (line ${e.data.lineno})`, time },
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleOpenExternal = () => {
    const blob = new Blob([srcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Determine aspect ratio container class
  let ratioClass = 'w-full h-full';
  if (aspectRatio === '4:3') {
    ratioClass = 'aspect-[4/3] max-w-full';
  } else if (aspectRatio === '16:9') {
    ratioClass = 'aspect-video max-w-full';
  }

  const effectiveConsoleOpen = showConsole || isInternalConsoleOpen;

  return (
    <div className={`flex flex-col bg-[#0f172a] rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl font-sans select-none ${ratioClass} ${className}`}>
      {/* ── Realistic Chrome Title / Tab Bar ── */}
      <div className="bg-[#1e293b] px-3 py-1.5 flex items-center justify-between border-b border-slate-700/60 select-none">
        {/* macOS Traffic Light Window Buttons */}
        <div className="flex items-center gap-1.5 w-16">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]/50 cursor-pointer" />
        </div>

        {/* Browser Active Tab Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-t-md bg-[#0f172a] text-slate-200 text-xs font-medium max-w-[200px] truncate border-t border-x border-slate-700/80">
          <Globe className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="truncate">{files['index.html'] ? 'localhost:3000' : 'Preview'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-auto flex-shrink-0" />
        </div>

        {/* Chrome Action Icons */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            onClick={() => setIsInternalConsoleOpen(!isInternalConsoleOpen)}
            title="Toggle Console Log"
            className={`p-1 rounded hover:text-white transition-colors cursor-pointer ${effectiveConsoleOpen ? 'text-amber-400 bg-amber-500/10' : ''}`}
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleOpenExternal}
            title="Open in new window"
            className="p-1 rounded hover:text-white transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Browser Omnibox / URL Navigation Bar ── */}
      <div className="bg-[#141d2e] px-3 py-1.5 flex items-center gap-2 border-b border-slate-800/80">
        <button
          type="button"
          onClick={handleManualRefresh}
          title="Reload Page"
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
        </button>

        {/* Address Bar */}
        <div className="flex-1 flex items-center gap-2 bg-[#0a0f1d] border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono shadow-inner">
          <Lock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <input
            type="text"
            value={urlPath}
            onChange={(e) => setUrlPath(e.target.value)}
            className="w-full bg-transparent text-slate-300 focus:outline-none select-text text-xs"
            placeholder="http://localhost:3000"
          />
        </div>
      </div>

      {/* ── Live Iframe Runtime Sandbox ── */}
      <div className="relative flex-1 w-full bg-white overflow-hidden">
        <iframe
          ref={iframeRef}
          key={key}
          srcDoc={srcDoc}
          title="Scrim Browser Preview"
          sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
          className="w-full h-full border-none"
        />

        {/* ── Bottom Console Logs Drawer ── */}
        {effectiveConsoleOpen && (
          <div className="absolute bottom-0 left-0 right-0 max-h-48 bg-[#090d16]/95 backdrop-blur-md border-t border-slate-700 flex flex-col z-20 text-slate-200 font-mono text-[11px]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#0f172a] border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-300">Console ({logs.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  className="text-[10px] text-slate-400 hover:text-white hover:underline cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsInternalConsoleOpen(false)}
                  className="p-0.5 text-slate-400 hover:text-white rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-36 no-scrollbar">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic">No console logs output yet.</div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 ${
                      log.level === 'error'
                        ? 'text-rose-400 bg-rose-950/20 px-1 py-0.5 rounded'
                        : log.level === 'warn'
                        ? 'text-amber-300'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="text-[9px] text-slate-500 select-none">{log.time}</span>
                    <span className="break-all">{log.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
