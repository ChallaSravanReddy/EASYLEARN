import * as Babel from '@babel/standalone';
import type { BundlerResult, SandboxError } from '../types/codeRunner';

/**
 * Normalizes file paths for virtual file lookup
 */
export function normalizePath(path: string): string {
  let clean = path.replace(/^[./\\]+/, '').replace(/\\/g, '/');
  return clean;
}

/**
 * Resolves a module request against available virtual files
 */
export function resolveVirtualModule(request: string, availableFiles: string[]): string | null {
  const clean = normalizePath(request);
  const candidates = [
    clean,
    `${clean}.jsx`,
    `${clean}.tsx`,
    `${clean}.js`,
    `${clean}.ts`,
    `${clean}.json`,
    `${clean}/index.jsx`,
    `${clean}/index.tsx`,
    `${clean}/index.js`,
    `${clean}/index.ts`,
  ];

  for (const cand of candidates) {
    if (availableFiles.includes(cand)) {
      return cand;
    }
  }

  // Also check without extension if candidate had extension
  const withoutExt = clean.replace(/\.[^/.]+$/, '');
  for (const cand of [withoutExt, `${withoutExt}.jsx`, `${withoutExt}.tsx`, `${withoutExt}.js`, `${withoutExt}.ts`]) {
    if (availableFiles.includes(cand)) {
      return cand;
    }
  }

  return null;
}

/**
 * Auto-detect the most likely entry file from file list
 */
export function detectEntryFile(files: Record<string, string>): string {
  const keys = Object.keys(files);
  const normalizedKeys = keys.map(normalizePath);

  // Preference sequence
  const entryPreferences = [
    'index.html',
    'main.tsx',
    'main.jsx',
    'index.tsx',
    'index.jsx',
    'App.tsx',
    'App.jsx',
    'script.js',
    'index.js',
    'main.js',
  ];

  for (const pref of entryPreferences) {
    const idx = normalizedKeys.indexOf(pref);
    if (idx !== -1) {
      return keys[idx];
    }
  }

  // Fallback to first js/ts/jsx/tsx file
  const firstScript = keys.find((k) => /\.(jsx?|tsx?)$/i.test(k));
  if (firstScript) return firstScript;

  return keys[0] || 'index.html';
}

/**
 * Bundles virtual files in-memory into an executable HTML srcDoc payload
 */
export function bundleVirtualProject(
  files: Record<string, string>,
  customEntry?: string
): BundlerResult {
  const startTime = performance.now();

  try {
    const fileKeys = Object.keys(files);
    if (fileKeys.length === 0) {
      return {
        success: true,
        html: `<!DOCTYPE html><html><body><div style="font-family:sans-serif;padding:2rem;color:#888;">No files provided to preview.</div></body></html>`,
        durationMs: 0,
      };
    }

    const entryFile = customEntry || detectEntryFile(files);
    const normalizedEntry = normalizePath(entryFile);

    // Collect all CSS styles
    const cssCode = Object.entries(files)
      .filter(([name]) => name.endsWith('.css'))
      .map(([, content]) => content)
      .join('\n\n');

    // Separate HTML template if provided
    let htmlShell = files['index.html'] || files['./index.html'];
    if (!htmlShell) {
      htmlShell = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #ffffff;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    #root {
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
    }

    // Filter JavaScript, TypeScript, and JSX/TSX files to compile
    const scriptFiles = Object.entries(files).filter(
      ([name]) => /\.(jsx?|tsx?|json)$/i.test(name) && !name.endsWith('.html')
    );

    const compiledModules: Record<string, string> = {};
    const normalizedFileNames = scriptFiles.map(([name]) => normalizePath(name));

    // Compile each script file with Babel
    for (const [fileName, rawCode] of scriptFiles) {
      const norm = normalizePath(fileName);

      if (fileName.endsWith('.json')) {
        // Wrap JSON as CommonJS module
        try {
          JSON.parse(rawCode); // validate
          compiledModules[norm] = `module.exports = ${rawCode};`;
        } catch (jsonErr: any) {
          return {
            success: false,
            error: {
              type: 'syntax',
              file: fileName,
              message: `JSON Parse Error: ${jsonErr.message}`,
              stack: jsonErr.stack,
            },
            durationMs: performance.now() - startTime,
          };
        }
        continue;
      }

      try {
        const transformed = Babel.transform(rawCode, {
          presets: [
            ['react', { runtime: 'classic' }],
            'typescript',
            ['env', { modules: 'commonjs' }],
          ],
          filename: fileName,
        });

        compiledModules[norm] = transformed.code || '';
      } catch (err: any) {
        // Capture syntax or transform error
        const loc = err.loc || {};
        return {
          success: false,
          error: {
            type: 'syntax',
            file: fileName,
            line: loc.line,
            column: loc.column,
            message: err.message || 'Syntax error during compilation',
            stack: err.stack,
          },
          durationMs: performance.now() - startTime,
        };
      }
    }

    // Build the Virtual Module Registry script
    const modulesJsonMap = JSON.stringify(compiledModules);
    const availableModulesList = JSON.stringify(normalizedFileNames);

    // Injected console and error interception script
    const injectedRuntimeHeader = `
<!-- Interception & Error Boundary Header -->
<script>
(function() {
  // Safe argument serializer to handle DOM elements, Circular objects, Errors, and Functions
  function serialize(arg) {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'function') return '[Function: ' + (arg.name || 'anonymous') + ']';
    if (arg instanceof Error) return arg.name + ': ' + arg.message + (arg.stack ? '\\n' + arg.stack : '');
    if (typeof arg === 'object') {
      try {
        var seen = new WeakSet();
        return JSON.stringify(arg, function(key, val) {
          if (typeof val === 'object' && val !== null) {
            if (seen.has(val)) return '[Circular]';
            seen.add(val);
          }
          if (typeof val === 'function') return '[Function]';
          return val;
        }, 2);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  }

  function sendLog(level, args) {
    try {
      var serialized = Array.prototype.slice.call(args).map(serialize);
      window.parent.postMessage({
        type: 'SANDBOX_CONSOLE',
        level: level,
        args: serialized,
        timestamp: Date.now()
      }, '*');
    } catch (err) {}
  }

  var origLog = console.log;
  var origWarn = console.warn;
  var origError = console.error;
  var origInfo = console.info;

  console.log = function() {
    origLog.apply(console, arguments);
    sendLog('log', arguments);
  };
  console.warn = function() {
    origWarn.apply(console, arguments);
    sendLog('warn', arguments);
  };
  console.error = function() {
    origError.apply(console, arguments);
    sendLog('error', arguments);
  };
  console.info = function() {
    origInfo.apply(console, arguments);
    sendLog('info', arguments);
  };
  console.clear = function() {
    try {
      window.parent.postMessage({ type: 'SANDBOX_CONSOLE_CLEAR' }, '*');
    } catch (e) {}
  };

  // Global uncaught error listener
  window.onerror = function(message, source, lineno, colno, error) {
    try {
      window.parent.postMessage({
        type: 'SANDBOX_ERROR',
        error: {
          type: 'runtime',
          message: String(message),
          line: lineno,
          column: colno,
          stack: error ? error.stack : undefined
        }
      }, '*');
    } catch (e) {}
    return true; // Suppress default browser error dialog
  };

  // Global unhandled promise rejection listener
  window.onunhandledrejection = function(event) {
    try {
      var reason = event.reason;
      window.parent.postMessage({
        type: 'SANDBOX_ERROR',
        error: {
          type: 'unhandled_rejection',
          message: reason ? (reason.message || String(reason)) : 'Unhandled Promise Rejection',
          stack: reason ? reason.stack : undefined
        }
      }, '*');
    } catch (e) {}
  };
})();
</script>

<!-- Preloaded React 18 UMD Dependencies for instant offline/online execution -->
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
`;

    // Virtual Module Loader & Execution Script
    const injectedRuntimeFooter = `
<script>
(function() {
  var modulesCode = ${modulesJsonMap};
  var availableFiles = ${availableModulesList};
  var entryFile = ${JSON.stringify(normalizedEntry)};
  var moduleCache = {};

  function normalize(p) {
    return p.replace(/^[./\\\\]+/, '').replace(/\\\\/g, '/');
  }

  function resolvePath(request) {
    var clean = normalize(request);
    var candidates = [
      clean,
      clean + '.jsx',
      clean + '.tsx',
      clean + '.js',
      clean + '.ts',
      clean + '.json',
      clean + '/index.jsx',
      clean + '/index.tsx',
      clean + '/index.js',
      clean + '/index.ts'
    ];
    for (var i = 0; i < candidates.length; i++) {
      if (modulesCode[candidates[i]] !== undefined) {
        return candidates[i];
      }
    }
    return null;
  }

  function require(id) {
    // External Packages
    if (id === 'react' || id === 'React') {
      return window.React;
    }
    if (id === 'react-dom' || id === 'ReactDOM') {
      return window.ReactDOM;
    }
    if (id === 'react-dom/client') {
      return window.ReactDOM;
    }
    if (id.endsWith('.css')) {
      // CSS is already bundled and injected into <style>
      return {};
    }

    var resolved = resolvePath(id);
    if (!resolved) {
      throw new Error("Cannot find module '" + id + "' in virtual file system");
    }

    if (moduleCache[resolved]) {
      return moduleCache[resolved].exports;
    }

    var mod = { exports: {} };
    moduleCache[resolved] = mod;

    var fnCode = modulesCode[resolved];
    try {
      var factory = new Function('exports', 'require', 'module', fnCode);
      factory(mod.exports, require, mod);
      return mod.exports;
    } catch (execErr) {
      console.error("[Virtual Module Execution Error in '" + resolved + "']", execErr);
      throw execErr;
    }
  }

  // React Error Boundary Wrapper
  var ErrorBoundary = null;
  if (window.React) {
    ErrorBoundary = class extends window.React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      static getDerivedStateFromError(error) {
        return { hasError: true, error: error };
      }
      componentDidCatch(error, errorInfo) {
        window.parent.postMessage({
          type: 'SANDBOX_ERROR',
          error: {
            type: 'runtime',
            message: error.message,
            stack: (error.stack || '') + '\\nComponent Stack:' + (errorInfo.componentStack || '')
          }
        }, '*');
      }
      render() {
        if (this.state.hasError) {
          return window.React.createElement(
            'div',
            {
              style: {
                padding: '20px',
                fontFamily: 'monospace',
                background: '#450a0a',
                color: '#fecaca',
                borderRadius: '8px',
                margin: '20px',
                border: '1px solid #dc2626'
              }
            },
            window.React.createElement('h3', { style: { margin: '0 0 10px 0', color: '#f87171' } }, 'React Component Render Error'),
            window.React.createElement('pre', { style: { margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px' } }, this.state.error?.message)
          );
        }
        return this.props.children;
      }
    };
  }

  // Execute entry point
  window.addEventListener('DOMContentLoaded', function() {
    try {
      var entryResolved = resolvePath(entryFile);
      if (!entryResolved) {
        // If entry is index.html, check if any script should execute
        if (entryFile === 'index.html') {
          var firstJs = availableFiles.find(function(f) { return /\\.(jsx?|tsx?)$/.test(f); });
          if (firstJs) entryResolved = firstJs;
        }
      }

      if (entryResolved) {
        var exported = require(entryResolved);
        var RootComponent = exported && (exported.default || exported.App || exported);

        // If the entry exports a React component and a #root container exists, mount it automatically
        var rootElem = document.getElementById('root');
        if (rootElem && window.ReactDOM && (typeof RootComponent === 'function' || typeof RootComponent === 'object')) {
          var appElement = window.React.createElement(RootComponent);
          var wrappedApp = ErrorBoundary ? window.React.createElement(ErrorBoundary, null, appElement) : appElement;

          if (window.ReactDOM.createRoot) {
            var root = window.ReactDOM.createRoot(rootElem);
            root.render(wrappedApp);
          } else if (window.ReactDOM.render) {
            window.ReactDOM.render(wrappedApp, rootElem);
          }
        }
      }

      // Notify parent that sandbox executed successfully
      window.parent.postMessage({ type: 'SANDBOX_READY', timestamp: Date.now() }, '*');
    } catch (initErr) {
      console.error("[Sandbox Initialization Error]", initErr);
      window.parent.postMessage({
        type: 'SANDBOX_ERROR',
        error: {
          type: 'runtime',
          message: initErr.message,
          stack: initErr.stack
        }
      }, '*');
    }
  });
})();
</script>
`;

    // Inject CSS into <head>
    let finalHtml = htmlShell;
    if (cssCode) {
      const styleTag = `<style id="virtual-bundled-styles">\n${cssCode}\n</style>`;
      if (finalHtml.includes('</head>')) {
        finalHtml = finalHtml.replace('</head>', `${styleTag}\n</head>`);
      } else {
        finalHtml = `${styleTag}\n${finalHtml}`;
      }
    }

    // Inject runtime header right after <head> or at start
    if (finalHtml.includes('<head>')) {
      finalHtml = finalHtml.replace('<head>', `<head>\n${injectedRuntimeHeader}`);
    } else {
      finalHtml = injectedRuntimeHeader + finalHtml;
    }

    // Inject runtime footer before </body> or at end
    if (finalHtml.includes('</body>')) {
      finalHtml = finalHtml.replace('</body>', `${injectedRuntimeFooter}\n</body>`);
    } else {
      finalHtml = finalHtml + injectedRuntimeFooter;
    }

    const durationMs = performance.now() - startTime;
    return {
      success: true,
      html: finalHtml,
      durationMs,
    };
  } catch (globalErr: any) {
    return {
      success: false,
      error: {
        type: 'runtime',
        message: globalErr.message || 'Fatal compilation error',
        stack: globalErr.stack,
      },
      durationMs: performance.now() - startTime,
    };
  }
}
