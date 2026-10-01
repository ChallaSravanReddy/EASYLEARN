import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Mic,
  Square,
  Pause,
  Play,
  Camera,
  Download,
  Files,
  Plus,
  Trash2,
  Activity,
  Sparkles,
  Check,
  RotateCcw,
  Volume2,
  Eye,
  FileJson,
  Music,
  UploadCloud,
  X,
  Search,
  Settings,
  MoreVertical,
  ExternalLink,
  FolderPlus,
  FilePlus,
  PanelLeft,
  Columns2,
  Maximize2,
  Minimize2,
  Terminal as TerminalIcon,
  PlaySquare,
  CheckCircle,
  Copy,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import { useScrimRecorder } from '../hooks/useScrimRecorder';
import type { ScrimManifest, ScrimEvent } from '../types/scrim';
import CodePreviewIframe from './CodePreviewIframe';
import ScrimPublishModal from './ScrimPublishModal';
import ScrimbaFileIcon from './ScrimbaFileIcon';

export interface StudioTemplate {
  key: string;
  name: string;
  author: string;
  badge?: string;
  title: string;
  slug: string;
  files: Record<string, string>;
}

export const TEMPLATE_ORDER = [
  'html-css-js',
  'imba',
  'tailwind3',
  'empty',
  'react',
  'typescript',
  'javascript',
  'python',
];

export const STUDIO_TEMPLATES: Record<string, StudioTemplate> = {
  tailwind3: {
    key: 'tailwind3',
    name: 'Tailwind 3',
    author: 'By Per Borgen',
    title: 'Tailwind 3 Playground',
    slug: 'orange-resonance',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tailwind 3</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0c0d14] text-white min-h-screen flex items-center justify-center p-6 select-none font-sans">
  <div class="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
    <div class="flex items-center justify-between">
      <span class="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">Tailwind 3</span>
      <span class="text-[11px] text-slate-400 font-mono">orange-resonance</span>
    </div>
    <h1 class="text-xl font-bold tracking-tight text-white">Modern Scrimba Studio Component</h1>
    <p class="text-xs text-slate-300 leading-relaxed">
      Edit classes or JS live in Monaco. Changes sync directly to the live browser on port 3000!
    </p>
    <div class="pt-2 flex items-center gap-3">
      <button class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer">
        Run Project
      </button>
      <button class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700 cursor-pointer">
        Docs
      </button>
    </div>
  </div>
  <script src="index.js"></script>
</body>
</html>`,
      'styles.css': `/* Custom Tailwind Directives */\nbody {\n  font-family: system-ui, -apple-system, sans-serif;\n  background: #0c0d14;\n}`,
      'index.js': `// Tailwind 3 interactive script\nconsole.log("Tailwind 3 environment loaded on port 3000");\n`,
    },
  },
  'html-css-js': {
    key: 'html-css-js',
    name: 'HTML, CSS & JavaScript',
    author: 'By Abdellah',
    title: 'HTML, CSS & JavaScript Playground',
    slug: 'rapid-nebula',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML/CSS/JS</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="card">
    <h1>HTML, CSS & JavaScript</h1>
    <p>A fast, browser-ready web playground.</p>
    <button id="click-btn">Click Me</button>
  </div>
  <script src="index.js"></script>
</body>
</html>`,
      'styles.css': `body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0c0d14;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
}
.card {
  background: #141824;
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid #334155;
  text-align: center;
}
button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
}`,
      'index.js': `document.getElementById('click-btn')?.addEventListener('click', () => {\n  alert('Hello from HTML/CSS/JS!');\n});`,
    },
  },
  imba: {
    key: 'imba',
    name: 'Imba Fullstack Base',
    author: 'By Sindre Aarsaether',
    title: 'Imba Fullstack Starter',
    slug: 'amber-horizon',
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<head><title>Imba App</title></head>
<body style="background:#0c0d14; color:#fff; font-family:sans-serif; padding:2rem; text-align:center;">
  <h2>Imba Fullstack Base</h2>
  <p>Lightweight fullstack compiler environment.</p>
</body>
</html>`,
      'app.imba': `# Imba component definition\ntag App\n  <self>\n    <h1> "Hello from Imba!"\n`,
    },
  },
  empty: {
    key: 'empty',
    name: 'Empty project',
    author: 'By Per Borgen',
    title: 'Empty Project',
    slug: 'blank-canvas',
    files: {
      'index.html': `<!DOCTYPE html>\n<html>\n<head><title>Blank Canvas</title></head>\n<body style="background:#0c0d14; color:#fff; padding:2rem; font-family:sans-serif;">\n  <h1>Blank Project</h1>\n  <p>Start typing your code.</p>\n</body>\n</html>`,
      'index.js': `// Empty project\nconsole.log("Empty project initialized.");\n`,
    },
  },
  react: {
    key: 'react',
    name: 'React.js',
    author: 'By Per Borgen',
    title: 'React.js Application',
    slug: 'cyber-pulse',
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>React 18</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body style="background:#0c0d14; color:#fff; margin:0;">
  <div id="root"></div>
  <script type="text/babel" src="App.jsx"></script>
</body>
</html>`,
      'App.jsx': `function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#38bdf8' }}>React 18 Scrimba Studio</h1>
      <p>Stateful count: <strong>{count}</strong></p>
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Increment
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
    },
  },
  typescript: {
    key: 'typescript',
    name: 'TypeScript template',
    author: 'By Rachel Johnson',
    badge: 'TS',
    title: 'TypeScript Template',
    slug: 'blue-velocity',
    files: {
      'index.html': `<!DOCTYPE html>
<html>
<head><title>TypeScript</title></head>
<body style="background:#0c0d14; color:#fff; font-family:monospace; padding:2rem;">
  <h2>TypeScript Workspace</h2>
  <div id="app"></div>
  <script src="main.ts"></script>
</body>
</html>`,
      'main.ts': `interface UserGreeting {\n  name: string;\n  role: string;\n}\n\nconst user: UserGreeting = { name: 'Developer', role: 'Fullstack' };\nconsole.log(\`Loaded: \${user.name} (\${user.role})\`);\n`,
    },
  },
  javascript: {
    key: 'javascript',
    name: 'JavaScript',
    author: 'By Per Borgen',
    title: 'JavaScript Launchpad',
    slug: 'solar-echo',
    files: {
      'index.html': `<!DOCTYPE html>\n<html>\n<head><title>JavaScript</title></head>\n<body style="background:#0c0d14; color:#fff; padding:2rem; font-family:sans-serif;">\n  <h1>JavaScript Playground</h1>\n  <p>Check the console and terminal drawers below.</p>\n  <script src="index.js"></script>\n</body>\n</html>`,
      'index.js': `const numbers = [1, 2, 3, 4, 5];\nconsole.log("Doubled values:", numbers.map(n => n * 2));\n`,
    },
  },
  python: {
    key: 'python',
    name: 'Python',
    author: 'By Per Borgen',
    title: 'Python Quickstart',
    slug: 'emerald-vortex',
    files: {
      'main.py': `# Python interactive script\ndef greet(name):\n    return f"Hello {name}, welcome to EasyLearn Python!"\n\nprint(greet("Engineer"))\n`,
      'index.html': `<!DOCTYPE html>\n<html>\n<head><title>Python Run</title></head>\n<body style="background:#0c0d14; color:#fff; padding:2rem; font-family:monospace;">\n  <h2>Python Script Ready</h2>\n  <p>Run in terminal: <code>python main.py</code></p>\n</body>\n</html>`,
    },
  },
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

export default function RecordingStudio() {
  const navigate = useNavigate();

  // Active template & project files
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('tailwind3');
  const activeTemplate = STUDIO_TEMPLATES[selectedTemplateKey] || STUDIO_TEMPLATES.tailwind3;

  const [files, setFiles] = useState<Record<string, string>>(activeTemplate.files);
  const [activeFile, setActiveFile] = useState<string>('index.html');
  const [projectSlug, setProjectSlug] = useState<string>(activeTemplate.slug);
  const [lessonTitle, setLessonTitle] = useState<string>(activeTemplate.title);

  // Search & Navigation Layout State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showMiniBrowser, setShowMiniBrowser] = useState<boolean>(true);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState<boolean>(true);
  const [activeBottomTab, setActiveBottomTab] = useState<'runner' | 'terminal' | 'console'>('terminal');
  const [showExplainModal, setShowExplainModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // File Management State
  const [showNewFileInput, setShowNewFileInput] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Interactive Terminal State
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    '~/projects/s0ggid5oum',
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const terminalBottomRef = useRef<HTMLDivElement | null>(null);

  // Recording Modal & Results
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [copiedManifest, setCopiedManifest] = useState<boolean>(false);
  const [recordingResult, setRecordingResult] = useState<{
    audioBlob: Blob;
    scrimManifest: ScrimManifest;
    audioUrl: string;
    audioDataUri?: string;
  } | null>(null);

  // Recent events buffer
  const [liveEvents, setLiveEvents] = useState<ScrimEvent[]>([]);

  // Editor container ref for pointer coordinates
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const monacoEditorRef = useRef<any>(null);

  const handleIncomingEvent = useCallback((event: ScrimEvent) => {
    setLiveEvents((prev) => [event, ...prev.slice(0, 49)]);
  }, []);

  const {
    status,
    elapsedTime,
    audioLevel,
    eventCount,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    captureKeyframe,
    bindMonacoEditor,
    switchActiveFile,
    updateFiles,
    recordPointerCoordinates,
  } = useScrimRecorder({
    files,
    activeFile,
    title: lessonTitle,
    keyframeIntervalMs: 30000,
    pointerThrottleMs: 40,
    audioChunkIntervalMs: 1000,
    onEvent: handleIncomingEvent,
  });

  useEffect(() => {
    updateFiles(files);
  }, [files, updateFiles]);

  const handleEditorMount = (editor: any) => {
    monacoEditorRef.current = editor;
    const dom = editorContainerRef.current || (typeof editor.getDomNode === 'function' ? editor.getDomNode() : null);
    bindMonacoEditor(editor, dom);
  };

  const handleEditorChange = (value: string | undefined) => {
    const updated = value ?? '';
    setFiles((prev) => ({
      ...prev,
      [activeFile]: updated,
    }));
  };

  const handleTabChange = (fileName: string) => {
    setActiveFile(fileName);
    switchActiveFile(fileName);
  };

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplateKey(templateKey);
    const tmpl = STUDIO_TEMPLATES[templateKey];
    if (tmpl) {
      setFiles(tmpl.files);
      setProjectSlug(tmpl.slug);
      setLessonTitle(tmpl.title);
      setActiveFile(Object.keys(tmpl.files)[0] || 'index.html');
      setTerminalHistory((prev) => [
        ...prev,
        `> Switch template to: ${tmpl.name} (${tmpl.slug})`,
        '~/projects/s0ggid5oum',
      ]);
    }
  };

  const handleAddFile = () => {
    if (!newFileName.trim()) return;
    const cleanName = newFileName.trim();
    if (files[cleanName]) {
      setErrorMessage(`File "${cleanName}" already exists.`);
      return;
    }
    setFiles((prev) => ({
      ...prev,
      [cleanName]: '',
    }));
    setActiveFile(cleanName);
    switchActiveFile(cleanName);
    setNewFileName('');
    setShowNewFileInput(false);
    setErrorMessage(null);
  };

  const handleDeleteFile = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (Object.keys(files).length <= 1) {
      setErrorMessage('Cannot delete the only file in project.');
      return;
    }
    const nextFiles = { ...files };
    delete nextFiles[fileName];
    setFiles(nextFiles);
    if (activeFile === fileName) {
      const remaining = Object.keys(nextFiles)[0];
      setActiveFile(remaining);
      switchActiveFile(remaining);
    }
  };

  const handleStart = async () => {
    try {
      setErrorMessage(null);
      setRecordingResult(null);
      setLiveEvents([]);
      await startRecording();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start recording. Please grant microphone permissions.');
    }
  };

  const handleStop = async () => {
    try {
      setErrorMessage(null);
      const result = await stopRecording();
      const audioUrl = URL.createObjectURL(result.audioBlob);
      let audioDataUri = '';
      try {
        audioDataUri = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(result.audioBlob);
        });
      } catch (e) {}

      setRecordingResult({
        ...result,
        audioUrl,
        audioDataUri: audioDataUri || audioUrl,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while stopping recording.');
    }
  };

  // Run button execution handler
  const handleRunProject = () => {
    setBottomDrawerOpen(true);
    setActiveBottomTab('terminal');
    setTerminalHistory((prev) => [
      ...prev,
      `> npm run dev`,
      `  Vite v7.3.2 ready in 118 ms`,
      `  ➜  Local:   http://localhost:3000/`,
      `  ➜  Network: use --host to expose`,
      '~/projects/s0ggid5oum',
    ]);
  };

  // Terminal command prompt submit
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const newOutputs: string[] = [`> ${cmd}`];
    if (cmd === 'clear') {
      setTerminalHistory(['~/projects/s0ggid5oum']);
      setTerminalInput('');
      return;
    } else if (cmd === 'ls') {
      newOutputs.push(Object.keys(files).join('    '));
    } else if (cmd === 'npm run dev' || cmd === 'run') {
      newOutputs.push('> vite dev --port 3000');
      newOutputs.push('  Vite dev server running at: http://localhost:3000/');
    } else if (cmd.startsWith('cat ') || cmd.startsWith('node ')) {
      const fileTarget = cmd.split(' ')[1];
      if (files[fileTarget]) {
        newOutputs.push(files[fileTarget].slice(0, 200) + (files[fileTarget].length > 200 ? '...' : ''));
      } else {
        newOutputs.push(`Error: file "${fileTarget}" not found.`);
      }
    } else if (cmd === 'help') {
      newOutputs.push('Available commands: npm run dev, ls, cat <file>, node <file>, status, clear, help');
    } else if (cmd === 'status') {
      newOutputs.push(`Studio: ${status.toUpperCase()} | Active template: ${selectedTemplateKey}`);
    } else {
      newOutputs.push(`bash: ${cmd}: command not found (type 'help' for available commands)`);
    }

    newOutputs.push('~/projects/s0ggid5oum');
    setTerminalHistory((prev) => [...prev, ...newOutputs]);
    setTerminalInput('');

    setTimeout(() => {
      terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const getLanguage = (fileName: string) => {
    if (fileName.endsWith('.html')) return 'html';
    if (fileName.endsWith('.css')) return 'css';
    if (fileName.endsWith('.js')) return 'javascript';
    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) return 'typescript';
    if (fileName.endsWith('.json')) return 'json';
    return 'plaintext';
  };

  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('scrimba-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'f43f5e', fontStyle: 'bold' },
        { token: 'string', foreground: '38bdf8' },
        { token: 'number', foreground: 'a78bfa' },
        { token: 'type', foreground: '34d399' },
        { token: 'function', foreground: 'fbbf24' },
      ],
      colors: {
        'editor.background': '#0c0e15',
        'editor.foreground': '#f8fafc',
        'editorLineNumber.foreground': '#334155',
        'editorLineNumber.activeForeground': '#94a3b8',
        'editor.lineHighlightBackground': '#141824',
        'editorCursor.foreground': '#38bdf8',
        'editor.selectionBackground': '#1d4ed855',
      },
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    const list = TEMPLATE_ORDER.map((k) => STUDIO_TEMPLATES[k]).filter(Boolean);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] bg-[#0c0d14] text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl font-sans select-none relative">
      {/* ── 1. TOP GLOBAL SEARCH / COMMAND BAR (MATCHING SCREENSHOT) ── */}
      <div className="h-11 bg-[#07080e] border-b border-slate-800/80 px-4 flex items-center justify-center shrink-0 z-30 select-none">
        <div className="w-full flex items-center justify-between bg-[#11131c] border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-300 shadow-inner">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-5 h-5 rounded flex items-center justify-center bg-[#181a26] border border-slate-700/50 text-slate-400 shrink-0">
              <Settings className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find a template (by topic, creator, framework and more)..."
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            <div className="w-5 h-5 rounded flex items-center justify-center bg-[#181a26] border border-slate-700/50 text-slate-400">
              <ChevronsUpDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MAIN HORIZONTAL STUDIO WORKSPACE ── */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* ── LEFT TEMPLATES & PROJECTS SIDEBAR (MATCHING SCREENSHOT) ── */}
        {sidebarOpen && (
          <div className="w-56 sm:w-60 bg-[#0a0b12] border-r border-slate-800/80 flex flex-col shrink-0 select-none overflow-y-auto no-scrollbar">
            <div className="p-3 space-y-2">
              {filteredTemplates.map((tmpl) => {
                const isSelected = selectedTemplateKey === tmpl.key;
                return (
                  <div
                    key={tmpl.key}
                    onClick={() => handleTemplateChange(tmpl.key)}
                    className={`group px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#181a24] text-white border-slate-700/70 shadow-md'
                        : 'text-slate-300 hover:bg-[#13151f] hover:text-white border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate text-slate-100">{tmpl.name}</span>
                      {tmpl.badge ? (
                        <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-mono font-bold leading-none">
                          {tmpl.badge}
                        </span>
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-medium">
                      {tmpl.author}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── RIGHT STUDIO CODE & PREVIEW WORKSPACE ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0c0d14] relative">
          {/* ── STUDIO TOP BAR: LOGO, PROJECT TITLE, RECORDING, RUN, EXPLAIN ── */}
          <header className="h-11 bg-[#12141f] border-b border-slate-800/80 px-3 flex items-center justify-between shrink-0 select-none z-20">
            {/* Left: Scrimba //, Avatar, Slug, Ctrl+S */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                  sidebarOpen ? 'text-slate-200 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Toggle Templates sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 font-mono font-bold text-xs select-none">
                //
              </div>

              <span className="text-slate-600 text-xs">/</span>

              {/* Avatar Capsule */}
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white shadow-sm border border-white/20">
                P
              </div>

              <span className="text-slate-600 text-xs">/</span>

              {/* Project Slug & Ctrl+S to save */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={projectSlug}
                  onChange={(e) => setProjectSlug(e.target.value)}
                  className="bg-transparent text-xs font-mono font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-blue-500 focus:outline-none transition-colors px-1 py-0.5 max-w-[140px] sm:max-w-xs truncate"
                  title="Project slug / identifier"
                />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight hidden md:inline">
                  CTRL+S to save
                </span>
              </div>
            </div>

            {/* Right: RUN, EXPLAIN, Layout Toggle, Recording Controls */}
            <div className="flex items-center gap-2">
              {/* RUN Button (Matching Screenshot) */}
              <button
                onClick={handleRunProject}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#13271f] hover:bg-[#1b382d] text-emerald-400 border border-emerald-600/30 text-xs font-bold tracking-wider transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                title="Execute project & reload sandbox"
              >
                <PlaySquare className="w-3.5 h-3.5 fill-emerald-400/20" />
                <span>RUN</span>
              </button>

              {/* EXPLAIN Button */}
              <button
                onClick={() => setShowExplainModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#10243a] hover:bg-[#173250] text-sky-400 border border-sky-500/40 text-[11px] font-bold tracking-wider uppercase transition-all shadow-sm shadow-blue-500/10 hover:scale-105 active:scale-95 cursor-pointer"
                title="Ask AI to explain current code line-by-line"
              >
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>EXPLAIN</span>
              </button>

              {/* Vertical divider */}
              <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5" />

              {/* Mini Browser Layout Toggle (Blue + White dual box icon from screenshot) */}
              <button
                onClick={() => setShowMiniBrowser(!showMiniBrowser)}
                className={`p-1 rounded flex items-center gap-1 transition-all cursor-pointer ${
                  showMiniBrowser
                    ? 'bg-slate-800 ring-1 ring-blue-500/40'
                    : 'hover:bg-slate-800/80 opacity-70 hover:opacity-100'
                }`}
                title="Toggle Live Mini Browser"
              >
                <div className="w-3.5 h-3.5 rounded-[2px] bg-blue-600 shadow-xs" />
                <div className="w-3.5 h-3.5 rounded-[2px] bg-white shadow-xs" />
              </button>

              {/* Recording Action Controls */}
              {status === 'idle' || status === 'stopped' ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95 ml-1"
                >
                  <Mic className="w-3 h-3" /> Record
                </button>
              ) : null}

              {status === 'recording' ? (
                <button
                  onClick={pauseRecording}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer ml-1"
                >
                  <Pause className="w-3 h-3" /> Pause
                </button>
              ) : null}

              {status === 'paused' ? (
                <button
                  onClick={resumeRecording}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer ml-1"
                >
                  <Play className="w-3 h-3" /> Resume
                </button>
              ) : null}

              {status === 'recording' || status === 'paused' ? (
                <>
                  <button
                    onClick={() => captureKeyframe()}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                    title="Snapshot Keyframe"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold text-xs cursor-pointer active:scale-95"
                  >
                    <Square className="w-3 h-3 fill-current" /> Stop
                  </button>
                </>
              ) : null}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* ── FILES BAR & TABS (MATCHING SCREENSHOT) ── */}
          <div className="h-8 bg-[#0e1017] border-b border-slate-800/80 px-3 flex items-center justify-between shrink-0 select-none">
            {/* Left: "FILES", New File, New Folder, Plus */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FILES</span>
              <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                <button
                  onClick={() => setShowNewFileInput(true)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                  title="New File"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowNewFileInput(true)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                  title="New Folder"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowNewFileInput(true)}
                  className="p-1 text-blue-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                  title="Add Tab"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inline Add File Input */}
              {showNewFileInput && (
                <div className="flex items-center gap-1 bg-slate-900 border border-blue-500/50 rounded px-2 py-0.5">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddFile();
                      if (e.key === 'Escape') setShowNewFileInput(false);
                    }}
                    placeholder="filename.ext"
                    autoFocus
                    className="bg-transparent text-xs text-white outline-none w-24 font-mono"
                  />
                  <button onClick={handleAddFile} className="text-emerald-400 hover:text-emerald-300">
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Center / Right: Tab Row with Scrimba Badges & 3-dots Menu */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {Object.keys(files).map((fileName) => {
                const isActive = activeFile === fileName;
                return (
                  <div
                    key={fileName}
                    onClick={() => handleTabChange(fileName)}
                    className={`group flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-medium cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-[#181c2b] text-white border-blue-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
                    }`}
                  >
                    <ScrimbaFileIcon fileName={fileName} className="w-3.5 h-3.5" />
                    <span>{fileName}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" />}
                    {Object.keys(files).length > 1 && (
                      <button
                        onClick={(e) => handleDeleteFile(fileName, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-0.5 ml-1"
                        title="Delete file"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              <button className="p-1 text-slate-500 hover:text-white rounded transition-colors ml-1 cursor-pointer">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── ERROR BANNER ── */}
          {errorMessage && (
            <div className="bg-red-950/90 border-b border-red-800 px-4 py-1.5 flex items-center justify-between text-xs text-red-200 shrink-0">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="p-0.5 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ── CODE EDITOR CONTAINER & FLOATING PREVIEW ── */}
          <div className="flex-1 relative overflow-hidden min-h-0 bg-[#0c0d14]">
            <div
              ref={editorContainerRef}
              onPointerMove={(e) => recordPointerCoordinates(e.clientX, e.clientY)}
              onMouseMove={(e) => recordPointerCoordinates(e.clientX, e.clientY)}
              className="w-full h-full"
            >
              <Editor
                height="100%"
                width="100%"
                language={getLanguage(activeFile)}
                theme="scrimba-dark"
                beforeMount={handleEditorWillMount}
                value={files[activeFile] ?? ''}
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: false },
                  padding: { top: 12 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  renderLineHighlight: 'all',
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>

            {/* ── FLOATING MINI BROWSER / PREVIEW (MATCHING SCREENSHOT) ── */}
            {showMiniBrowser && (
              <div className="absolute top-4 right-4 z-30 w-56 sm:w-64 bg-[#12141f] border border-slate-700/80 rounded-lg overflow-hidden shadow-2xl backdrop-blur-md select-none">
                {/* Header Bar with 3000 / */}
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#161824] border-b border-slate-800 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleRunProject}
                      className="p-0.5 hover:text-white text-slate-400 transition-colors"
                      title="Reload preview"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0e1017] border border-slate-800 text-[10px] font-mono text-slate-300">
                      <span className="text-slate-300 font-semibold">3000</span>
                      <span className="text-slate-500">/</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => setShowMiniBrowser(false)}
                      className="p-0.5 hover:text-white rounded"
                      title="Minimize preview"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Live Preview Container (Light canvas matching screenshot) */}
                <div className="h-60 bg-[#e2e8f0] overflow-hidden relative">
                  <CodePreviewIframe
                    files={files}
                    entryFile="index.html"
                    title="Mini Browser Sandbox"
                    showConsoleDrawer={false}
                    defaultConsoleOpen={false}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── 3. BOTTOM DOCKED TERMINAL & RUNNER DRAWER (MATCHING SCREENSHOT) ── */}
          {bottomDrawerOpen && (
            <div className="h-44 bg-[#0a0b12] border-t border-slate-800/80 flex flex-col shrink-0 select-none z-20">
              {/* Drawer Tabs: Runner ◇, Terminal >_, Console ≡, + */}
              <div className="h-8 bg-[#0e1017] border-b border-slate-800/80 px-3 flex items-center justify-between text-xs select-none">
                <div className="flex items-center gap-4">
                  {/* Runner Tab */}
                  <button
                    onClick={() => setActiveBottomTab('runner')}
                    className={`flex items-center gap-1.5 py-1 text-xs font-medium cursor-pointer transition-colors ${
                      activeBottomTab === 'runner'
                        ? 'text-white border-b-2 border-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>◇</span>
                    <span>Runner</span>
                  </button>

                  {/* Terminal Tab (Active in screenshot with >_) */}
                  <button
                    onClick={() => setActiveBottomTab('terminal')}
                    className={`flex items-center gap-1.5 py-1 text-xs font-medium cursor-pointer transition-colors relative ${
                      activeBottomTab === 'terminal'
                        ? 'text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-mono text-slate-200 font-bold">&gt;_</span>
                    <span>Terminal</span>
                    {activeBottomTab === 'terminal' && (
                      <div className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-white rounded-full" />
                    )}
                  </button>

                  {/* Console Tab */}
                  <button
                    onClick={() => setActiveBottomTab('console')}
                    className={`flex items-center gap-1.5 py-1 text-xs font-medium cursor-pointer transition-colors relative ${
                      activeBottomTab === 'console'
                        ? 'text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>≡</span>
                    <span>Console</span>
                    {activeBottomTab === 'console' && (
                      <div className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-white rounded-full" />
                    )}
                  </button>

                  {/* Add Terminal Tab */}
                  <button
                    onClick={() => {
                      setTerminalHistory((prev) => [...prev, '> Spawned session #2', '~/projects/s0ggid5oum']);
                    }}
                    className="p-0.5 text-slate-500 hover:text-white rounded"
                    title="New terminal session"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-slate-500">
                  <button
                    onClick={() => setBottomDrawerOpen(false)}
                    className="p-1 hover:text-white rounded"
                    title="Minimize drawer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Terminal Body */}
              {activeBottomTab === 'terminal' && (
                <div
                  onClick={() => {
                    const input = document.getElementById('studio-terminal-input');
                    input?.focus();
                  }}
                  className="flex-1 p-3 font-mono text-xs overflow-y-auto no-scrollbar space-y-1 bg-[#07080e] cursor-text"
                >
                  {terminalHistory.map((line, i) => (
                    <div
                      key={i}
                      className={
                        line.startsWith('~/')
                          ? 'text-[#5b95e0] font-medium'
                          : line.startsWith('>')
                          ? 'text-slate-200 font-semibold'
                          : line.includes('Vite') || line.includes('http')
                          ? 'text-emerald-400'
                          : line.includes('Error')
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }
                    >
                      {line}
                    </div>
                  ))}

                  {/* Interactive Command Input Line (clean > █ matching screenshot) */}
                  <form onSubmit={handleTerminalSubmit} className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-slate-400 font-medium">&gt;</span>
                    <input
                      id="studio-terminal-input"
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none"
                      autoComplete="off"
                      spellCheck="false"
                    />
                    <span className="w-2 h-4 bg-white inline-block animate-pulse -ml-1" />
                  </form>
                  <div ref={terminalBottomRef} />
                </div>
              )}

              {/* Runner Body */}
              {activeBottomTab === 'runner' && (
                <div className="flex-1 p-4 font-mono text-xs text-slate-300 bg-[#090a10] flex flex-col justify-center items-center gap-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-bold">Runner Process Active</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Watching {Object.keys(files).length} files in <code>{projectSlug}</code>. Changes automatically compile to the sandbox.
                  </p>
                </div>
              )}

              {/* Console Body */}
              {activeBottomTab === 'console' && (
                <div className="flex-1 p-3 font-mono text-xs text-slate-300 bg-[#090a10] overflow-y-auto no-scrollbar">
                  <div className="text-slate-500">[System] Browser Console Attached. Output from console.log appears here.</div>
                  <div className="text-cyan-400 mt-1">[Preview] Rendering template: {activeTemplate.name}</div>
                  <div className="text-emerald-400">[HMR] Hot module replacement connected.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── AI CODE EXPLAIN MODAL ── */}
      {showExplainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#12141f] border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col gap-4 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    AI Code Explainer
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-bold">
                      Interactive Tutor
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Analyzing {activeFile} in {projectSlug}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExplainModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-blue-300 overflow-x-auto max-h-36">
                <pre>{files[activeFile]?.slice(0, 300) || '// Empty code'}</pre>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Template Overview:
                </h4>
                <p className="text-slate-300">
                  This <strong>{activeTemplate.name}</strong> workspace comes pre-configured with starter markup, styles, and logic. You can use the Terminal below or the floating mini browser to preview and test your application in real-time.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowExplainModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-md shadow-blue-600/30"
              >
                Got it, continue in Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RECORDING COMPLETED MODAL (FINALIZED) ── */}
      {recordingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#12141f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Recording Finalized</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {recordingResult.scrimManifest.keyframes.length} Keyframes •{' '}
                    {recordingResult.scrimManifest.events.length} Events •{' '}
                    {formatDuration(recordingResult.scrimManifest.metadata.duration)} Duration
                  </p>
                </div>
              </div>
              <button onClick={() => setRecordingResult(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-blue-400" /> Audio Stream Playback
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {(recordingResult.audioBlob.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <audio src={recordingResult.audioUrl} controls className="w-full h-10 outline-none" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Publish to Cloud
                </button>
                <button
                  onClick={() => {
                    try {
                      sessionStorage.setItem(
                        'easy_scrim_custom',
                        JSON.stringify({
                          scrimManifest: recordingResult.scrimManifest,
                          audioUrl: recordingResult.audioDataUri || recordingResult.audioUrl,
                        })
                      );
                    } catch (e) {}
                    navigate('/player');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Play in Scrim Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DIRECT-TO-STORAGE CLOUD PUBLISHING MODAL ── */}
      {showPublishModal && recordingResult && (
        <ScrimPublishModal
          audioBlob={recordingResult.audioBlob}
          scrimManifest={recordingResult.scrimManifest}
          onClose={() => setShowPublishModal(false)}
        />
      )}
    </div>
  );
}
