import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  Pause,
  Square,
  UndoDot,
  RotateCcw,
  Upload,
  FileJson,
  Video as VideoIcon,
  FileAudio,
  Maximize,
  X,
  GitBranch,
  ChevronRight,
  ChevronDown,
  FilePlus,
  FolderPlus,
  Sparkles,
  PanelLeft,
  ArrowLeft,
  Columns,
  Columns2,
  Eye,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import Draggable from 'react-draggable';
import OutputPanel from './OutputPanel';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ScrimbaFileIcon from './ScrimbaFileIcon';

const DEMO_TIMELINE = [
  { time: 0, code: `// Welcome to JavaScript Basics!\n// Click Play to start the interactive lesson.` },
  { time: 5, code: `console.log("Hello, World!");\n// The output will appear in the draggable console.` },
  { time: 10, code: `let age = 20;\nconsole.log("Age:", age);` },
  { time: 15, code: `var city = "Hyderabad";   // old way\nlet score = 95;           // can be changed\nconst pi = 3.14;          // fixed value` },
];

const INITIAL_FILES = [
  { id: '1', name: 'main.js', language: 'javascript', isFolder: false, parentId: null, content: '' },
  { id: '2', name: 'styles.css', language: 'css', isFolder: false, parentId: null, content: 'body {\n  background: #0d1117;\n  color: white;\n}' }
];

const generateOutputHTML = (files, currentJsCode) => {
  const htmlFile = files.find(f => f.name.endsWith('.html'))?.content || '';
  const cssFile = files.find(f => f.name.endsWith('.css'))?.content || '';

  if (htmlFile) {
    let finalHtml = htmlFile;
    if (cssFile) {
      if (finalHtml.includes('</head>')) {
        finalHtml = finalHtml.replace('</head>', `<style>${cssFile}</style></head>`);
      } else {
        finalHtml = `<style>${cssFile}</style>` + finalHtml;
      }
    }
    if (currentJsCode) {
      if (finalHtml.includes('</body>')) {
        finalHtml = finalHtml.replace('</body>', `<script>${currentJsCode}</script></body>`);
      } else {
        finalHtml += `<script>${currentJsCode}</script>`;
      }
    }
    return `
<html>
    <head>
      <style>
        #log-overlay { position: fixed; bottom: 0; left: 0; width: 100%; max-height: 50%; overflow: auto; background: rgba(0,0,0,0.8); color: #0f0; font-family: monospace; z-index: 9999; display: none; padding: 10px; }
        .error { color: #ff7b72; font-weight: bold; }
      </style>
    </head>
    <body>
      ${finalHtml}
      <div id="log-overlay"></div>
      <script>
        const logEl = document.getElementById("log-overlay");
        console.error = (...args) => {
          logEl.style.display = 'block';
          logEl.innerHTML += '<div class="error">' + args.join(" ") + '</div>';
        };
      </script>
    </body>
</html>
    `;
  }

  return `
<html>
    <head>
    <style>
        body { 
          font-family: 'JetBrains Mono', 'Fira Code', monospace; 
          padding: 16px; 
          background: #0d1117; 
          margin: 0; 
          color: #e6edf3;
          line-height: 1.5;
        }
        pre { white-space: pre-wrap; font-size: 13px; margin: 0; }
        .prompt { color: #7ee787; margin-right: 8px; font-weight: bold; }
        .log-entry { margin-bottom: 4px; display: flex; }
        .error { color: #ff7b72; font-weight: bold; }
        .system { color: #8b949e; font-style: italic; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }
    </style>
    </head>
    <body>
    <div id="log">
      <div class="log-entry system">> Terminal initialized... Ready for execution.</div>
    </div>
    <script>
        const logEl = document.getElementById("log");
        const appendLog = (content, className = "") => {
          const div = document.createElement("div");
          div.className = "log-entry " + className;
          div.innerHTML = '<span class="prompt">$</span>' + content;
          logEl.appendChild(div);
          window.scrollTo(0, document.body.scrollHeight);
        };

        console.log = (...args) => appendLog(args.join(" "));
        console.error = (...args) => appendLog(args.join(" "), "error");
        
        try {
          ${currentJsCode}
        } catch (e) {
          console.error("Runtime Error: " + e.message);
        }
    </script>
    </body>
</html>
`;
};

export default function TimelineCodePlayer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  // Engine Setup State
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoadingDB, setIsLoadingDB] = useState(!!lessonId);
  const [timelineData, setTimelineData] = useState([]);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaType, setMediaType] = useState('video'); // 'video' or 'audio'
  const [readOnlyMode] = useState(false);
  
  // Local Upload State
  const [mediaFileName, setMediaFileName] = useState('');
  const [jsonFileName, setJsonFileName] = useState('');

  // Player State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentCode, setCurrentCode] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [showVideo, setShowVideo] = useState(true);

  // VS Code State
  const [files, setFiles] = useState(INITIAL_FILES);
  const [openTabs, setOpenTabs] = useState(['1']);
  const [activeTab, setActiveTab] = useState('1'); // ID of active file
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  
  const [newItemPrompt, setNewItemPrompt] = useState(null); // { type: 'file' | 'folder', parentId: null }
  const [newItemName, setNewItemName] = useState('');

  const activeLanguage = files.find(f => f.id === activeTab)?.language || 'javascript';

  // Scrimba UI Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Scrimba Deep Dark Monaco Theme
  const handleEditorWillMount = (monaco) => {
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

  const handleUserActivity = () => {
    if (!isUserEditing) {
      setIsUserEditing(true);
      if (isPlaying && mediaRef.current) {
        mediaRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleCreateSubmit = () => {
    if (newItemName.trim()) {
      handleUserActivity();
      if (newItemPrompt.type === 'file') {
        const ext = newItemName.split('.').pop();
        const langMap = { js: 'javascript', py: 'python', html: 'html', css: 'css', java: 'java', cpp: 'cpp', c: 'c', go: 'go', rs: 'rust', ts: 'typescript' };
        const newId = Date.now().toString();
        setFiles(prev => [...prev, { id: newId, name: newItemName, language: langMap[ext] || 'plaintext', isFolder: false, parentId: newItemPrompt.parentId, content: '' }]);
        setOpenTabs(prev => [...prev, newId]);
        setActiveTab(newId);
      } else {
        setFiles(prev => [...prev, { id: Date.now().toString(), name: newItemName, language: '', isFolder: true, isOpen: true, parentId: newItemPrompt.parentId }]);
      }
    }
    setNewItemPrompt(null);
    setNewItemName('');
  };

  const addFile = (e) => {
    e?.stopPropagation();
    setNewItemPrompt({ type: 'file', parentId: selectedFolderId });
    setNewItemName('');
  };

  const addFolder = (e) => {
    e?.stopPropagation();
    setNewItemPrompt({ type: 'folder', parentId: selectedFolderId });
    setNewItemName('');
  };

  const closeTab = (e, tabId) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t !== tabId);
    setOpenTabs(newTabs);
    if (activeTab === tabId) {
      setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null);
    }
  };

  const renderTree = (parentId, depth = 0) => {
    return (
      <React.Fragment key={`tree-${parentId}`}>
        {files.filter(f => f.parentId === parentId).map(f => (
          <React.Fragment key={f.id}>
            <div 
              onClick={(e) => {
                 e.stopPropagation();
                 handleUserActivity();
                 if (f.isFolder) {
                   setFiles(prev => prev.map(x => x.id === f.id ? { ...x, isOpen: !x.isOpen } : x));
                   setSelectedFolderId(f.id);
                 } else {
                   setOpenTabs(prev => prev.includes(f.id) ? prev : [...prev, f.id]);
                   setActiveTab(f.id);
                   setSelectedFolderId(f.parentId);
                 }
              }}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer text-xs font-mono transition-colors ${activeTab === f.id || selectedFolderId === f.id ? 'bg-[#181c2b] text-white font-medium border border-slate-700/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
              style={{ paddingLeft: `${depth * 12 + 16}px` }}
            >
              {f.isFolder ? (
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${f.isOpen ? 'rotate-90 text-slate-300' : 'text-slate-500'}`} />
              ) : (
                <ScrimbaFileIcon fileName={f.name} className="w-3.5 h-3.5" />
              )}
              <span className={`truncate ${f.isFolder ? 'font-semibold text-slate-200' : ''}`}>{f.name}</span>
              {activeTab === f.id && !f.isFolder && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-auto" />}
            </div>
            {f.isFolder && f.isOpen && renderTree(f.id, depth + 1)}
          </React.Fragment>
        ))}
        {newItemPrompt && newItemPrompt.parentId === parentId && (
          <div className="flex items-center gap-1.5 py-1 px-6 text-[13px] bg-[#37373d]" style={{ paddingLeft: `${depth * 12 + 24}px` }}>
            {newItemPrompt.type === 'folder' ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <div className="w-4 h-4 ml-1" />}
            <input
              autoFocus
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateSubmit();
                if (e.key === 'Escape') setNewItemPrompt(null);
              }}
              onBlur={handleCreateSubmit}
              className="bg-[#1e1e1e] border border-[#007acc] text-white outline-none w-full px-1 py-0.5 text-[12px]"
            />
          </div>
        )}
      </React.Fragment>
    );
  };

  // Refs
  const mediaRef = useRef(null);
  const nodeRef = useRef(null); // Output Panel Draggable
  const videoDragRef = useRef(null); // Video Draggable

  // ─── Fetch From Firestore if lessonId exists / Auto-load for students ───
  useEffect(() => {
    if (lessonId) {
      setIsLoadingDB(false);
      alert("Database removed. Cannot fetch lessons.");
    }

    // Automatically load the lesson for anyone who is NOT an instructor (including students and unauthenticated users)
    if (userRole !== 'instructor' && !isSetupComplete) {
      setMediaType('video');
      setMediaUrl('/javascript-intro.mp4'); // Fallback to a local path or external URL
      setTimelineData(DEMO_TIMELINE);
      setCurrentCode(DEMO_TIMELINE[0].code);
      setIsSetupComplete(true);
    }
  }, [lessonId, navigate, userRole, isSetupComplete]);

  // ─── Setup Handlers (Local Testing) ───────────────────────────────────────

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFileName(file.name);
      setMediaType(file.type.startsWith('audio') ? 'audio' : 'video');
      setMediaUrl(URL.createObjectURL(file));
    }
  };

  const handleJsonUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setJsonFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].time !== undefined) {
            setTimelineData(parsed.sort((a, b) => a.time - b.time));
          } else {
            alert("Invalid JSON format. Expected array of objects with 'time' and 'code'.");
          }
        } catch {
          alert("Failed to parse JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const loadDemo = () => {
    setMediaType('video');
    setMediaUrl('/javascript-intro.mp4'); // Fallback to a local path or external URL
    setTimelineData(DEMO_TIMELINE);
    setCurrentCode(DEMO_TIMELINE[0].code);
    setIsSetupComplete(true);
  };

  const startEngine = () => {
    if (!mediaUrl || timelineData.length === 0) {
      alert("Please upload both Media and Timeline JSON.");
      return;
    }
    setCurrentCode(timelineData[0].code);
    setIsSetupComplete(true);
  };

  // ─── Engine / Sync Handlers ────────────────────────────────────────────────

  // NATIVE SYNC: This runs constantly as the media plays or is scrubbed!
  const handleTimeUpdate = () => {
    if (!mediaRef.current) return;
    const time = mediaRef.current.currentTime;
    setCurrentTime(time);

    // If user is editing, do NOT auto-update code. 
    if (!isUserEditing) {
      // Find the most recent code snapshot
      const snapshot = [...timelineData].reverse().find((s) => s.time <= time);
      if (snapshot && snapshot.code !== currentCode) {
        setCurrentCode(snapshot.code);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (!mediaRef.current) return;
    const dur = mediaRef.current.duration;
    if (dur === Infinity || isNaN(dur) || dur <= 0) {
      // Workaround for Chromium unindexed WebM media
      mediaRef.current.currentTime = 1e101;
      mediaRef.current.ontimeupdate = function () {
        this.ontimeupdate = null;
        this.currentTime = 0;
        setDuration(this.duration || 0);
      };
    } else {
      setDuration(dur);
    }
  };

  const handleMediaEnded = () => {
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      // If resuming after editing, reset editing flag and file tree so sync resumes
      if (isUserEditing) {
        resumeTimelineCode();
      }
      mediaRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stopPlayback = () => {
    if (mediaRef.current) {
      mediaRef.current.pause();
      mediaRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsUserEditing(false);
    setCurrentTime(0);
    setCurrentCode(timelineData[0]?.code || '');
  };

  const handleSliderChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (mediaRef.current) {
      mediaRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
    setIsUserEditing(false); // Resync on scrub
  };

  const handleEditorChange = (value) => {
    // If in read-only mode, we don't allow modifying logic
    if (readOnlyMode) return;
    
    handleUserActivity();
    
    if (activeTab === '1') {
      setCurrentCode(value || '');
    } else {
      setFiles(prev => prev.map(f => f.id === activeTab ? { ...f, content: value || '' } : f));
    }
  };

  const resumeTimelineCode = () => {
    setIsUserEditing(false);
    
    // Reset file system
    setFiles(INITIAL_FILES);
    setOpenTabs(['1']);
    setActiveTab('1');
    setSelectedFolderId(null);

    const snapshot = [...timelineData].reverse().find((s) => s.time <= currentTime);
    if (snapshot) setCurrentCode(snapshot.code);
  };

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds) || !isFinite(timeInSeconds) || timeInSeconds < 0) {
      return "00:00";
    }
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getBreadcrumbs = (fileId) => {
    const crumbs = [];
    let current = files.find(f => f.id === fileId);
    if (!current) return ['main.js'];
    while (current) {
      crumbs.unshift(current.name);
      current = files.find(f => f.id === current.parentId);
    }
    return crumbs;
  };

  // ─── Setup Screen Render ───────────────────────────────────────────────────

  if (isLoadingDB) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white font-mono animate-pulse">Loading Engine & Assets...</p>
      </div>
    );
  }

  if (!isSetupComplete) {
    return (
      <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0f172a]">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-2xl w-full shadow-2xl shadow-indigo-500/10 border border-slate-200 dark:border-slate-800">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              {userRole === 'instructor' ? 'Interactive Engine Setup' : 'Interactive Lesson'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {userRole === 'instructor' 
                ? 'Upload your media and timeline JSON to start the synchronized code player locally.' 
                : 'Load the interactive lesson to begin your synchronized coding experience.'}
            </p>
          </div>

          {userRole === 'instructor' && (
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {/* Media Upload */}
              <div className="relative group border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/50">
                <input type="file" accept="video/mp4,audio/mp3,audio/wav" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                    <VideoIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Upload Media</p>
                    <p className="text-xs text-slate-500 mt-1">{mediaFileName || "MP4, MP3, WAV"}</p>
                  </div>
                </div>
              </div>

              {/* JSON Upload */}
              <div className="relative group border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/50">
                <input type="file" accept=".json" onChange={handleJsonUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <FileJson className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Upload Timeline</p>
                    <p className="text-xs text-slate-500 mt-1">{jsonFileName || "JSON Format"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {userRole === 'instructor' && (
              <>
                <button
                  onClick={startEngine}
                  disabled={!mediaUrl || timelineData.length === 0}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Launch Local Engine
                </button>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">OR</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>
              </>
            )}
            <button onClick={loadDemo} className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-700 dark:text-white font-bold rounded-xl transition-all">
              Load Demo Lesson
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Scrimba Engine Full Screen Render ─────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[100] bg-[#0c0d14] w-screen h-screen overflow-hidden flex flex-col font-sans text-slate-100 select-none">
      
      {/* ── Scrimba Top Navigation Bar ── */}
      <header className="h-10 bg-[#12141f] border-b border-slate-800/80 px-3 flex items-center justify-between shrink-0 select-none z-20">
        {/* Left: Back, Logo //, Title breadcrumb, Time capsule */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 font-mono font-bold text-xs select-none">
            //
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-semibold tracking-tight truncate max-w-[180px] sm:max-w-xs">
              GitHub JavaScript Launchpad
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: EXPLAIN button, sidebar toggle, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* AI Explain Button */}
          <button
            onClick={() => setShowExplainModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/70 hover:bg-blue-900/80 text-blue-400 border border-blue-500/40 text-[11px] font-bold tracking-wider uppercase transition-all shadow-sm shadow-blue-500/10 hover:scale-105 active:scale-95 cursor-pointer"
            title="Ask AI to explain current code line-by-line"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>EXPLAIN</span>
          </button>

          {/* Files Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              sidebarOpen ? 'text-slate-200 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={sidebarOpen ? 'Hide Files sidebar' : 'Show Files sidebar'}
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Toggle Media PiP */}
          {mediaUrl && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                showVideo ? 'text-blue-400 bg-blue-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Toggle Picture-in-Picture Video"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative bg-[#0c0d14]">
        
        {/* Scrimba Left FILES Sidebar */}
        {sidebarOpen && (
          <div className="w-52 bg-[#0d0f17] flex flex-col shrink-0 border-r border-slate-800/80 select-none" onClick={() => setSelectedFolderId(null)}>
            <div className="h-8 px-3 flex items-center justify-between border-b border-slate-800/60 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
              <span>FILES</span>
              <div className="flex items-center gap-1">
                <FilePlus className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer" onClick={addFile} title="New File" />
                <FolderPlus className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer" onClick={addFolder} title="New Folder" />
              </div>
            </div>
            <div className="flex flex-col p-1.5 overflow-y-auto space-y-0.5">
              {renderTree(null)}
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0c0d14] relative">
          
          {/* File Tab Bar */}
          <div className="h-8 flex items-center bg-[#0e1017] overflow-x-auto no-scrollbar border-b border-slate-800/80 px-2 gap-1 shrink-0">
            {openTabs.map(tabId => {
              const f = files.find(x => x.id === tabId);
              if (!f) return null;
              const isActive = activeTab === tabId;
              return (
                <div 
                  key={tabId}
                  onClick={() => {
                    handleUserActivity();
                    setActiveTab(tabId);
                  }}
                  className={`flex items-center px-3 py-1 rounded-md cursor-pointer gap-2 text-xs font-mono transition-colors ${
                    isActive
                      ? 'bg-[#181c2b] text-white font-medium border border-slate-700/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <ScrimbaFileIcon fileName={f.name} className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{f.name}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  <X className="w-3 h-3 ml-1 text-slate-500 hover:text-white rounded" onClick={(e) => closeTab(e, tabId)} />
                </div>
              );
            })}
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative overflow-hidden" onClick={() => { if (isPlaying) togglePlayPause(); }}>
            <Editor
              height="100%"
              width="100%"
              language={activeLanguage}
              theme="scrimba-dark"
              beforeMount={handleEditorWillMount}
              value={activeTab === '1' ? currentCode : (files.find(f => f.id === activeTab)?.content || '')}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
                tabSize: 2,
              }}
              onChange={(val) => handleEditorChange(val)}
            />

            {/* ── Large Semi-Transparent Center Blue Play Button ── */}
            {!isPlaying && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 transition-all hover:scale-110 active:scale-95 group focus:outline-none cursor-pointer p-4"
                title="Play Lesson"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500/80 hover:bg-blue-500 backdrop-blur-md flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.6)] border border-blue-400/50 transition-all">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white text-white translate-x-0.5" />
                </div>
              </button>
            )}

            {/* Draggable Media Overlay (Picture-in-Picture style) */}
            {showVideo && mediaUrl && (
              <Draggable nodeRef={videoDragRef} bounds="parent" defaultPosition={{ x: window.innerWidth - 380, y: 20 }}>
                <div ref={videoDragRef} className="absolute z-40 rounded-xl overflow-hidden shadow-2xl shadow-black/80 border border-slate-700/70 bg-[#12141f]/95 cursor-move w-[340px] group backdrop-blur-md">
                  <div className="h-7 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-3 select-none text-[11px] text-slate-300">
                    <span className="font-semibold text-slate-200">Instructor Feed</span>
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowVideo(false); }} />
                  </div>
                  {mediaType === 'video' ? (
                    <video
                      ref={mediaRef}
                      src={mediaUrl}
                      className="w-full aspect-video object-cover pointer-events-none"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleMediaEnded}
                    />
                  ) : (
                    <div className="w-full h-24 bg-slate-900 flex items-center justify-center flex-col">
                      <FileAudio className="w-8 h-8 text-blue-500 mb-2" />
                      <audio
                        ref={mediaRef}
                        src={mediaUrl}
                        className="hidden"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={handleMediaEnded}
                      />
                      <span className="text-xs text-slate-400">Audio Stream Active</span>
                    </div>
                  )}
                </div>
              </Draggable>
            )}

            {/* Floating Terminal Preview (Styled like Scrimba's Preview Ctrl+L) */}
            <Draggable nodeRef={nodeRef} defaultPosition={{ x: window.innerWidth - 460, y: window.innerHeight - 340 }}>
              <div ref={nodeRef} className="fixed top-0 left-0 z-[1000] w-[420px] shadow-2xl shadow-black/80 rounded-xl overflow-hidden border border-slate-700/70 bg-[#12141f]/95 backdrop-blur-md flex flex-col">
                <div className="h-7 bg-slate-900/90 flex items-center justify-between px-3 cursor-move border-b border-slate-800 select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">Preview</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
                      Ctrl+L
                    </span>
                  </div>
                </div>
                <div className="h-56 overflow-hidden bg-slate-950">
                  <OutputPanel outputCode={generateOutputHTML(files, currentCode)} />
                </div>
              </div>
            </Draggable>
          </div>
        </div>
      </div>

      {/* ── Bottom Scrimba Control Bar ── */}
      <footer className="bg-[#12141f] border-t border-slate-800/80 px-4 py-2.5 flex flex-col gap-1.5 shrink-0 select-none z-20">
        
        {/* Scrimba Blue Progress Scrubber */}
        <div className="relative flex items-center h-5 group">
          <div className="absolute inset-x-0 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.7)] transition-all duration-75"
              style={{ width: `${isFinite(duration) && duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0}%` }}
            />
          </div>
          <input
            type="range"
            min="0"
            max={isFinite(duration) && duration > 0 ? duration : 100}
            step="0.1"
            value={currentTime}
            onChange={handleSliderChange}
            className="absolute inset-x-0 w-full h-4 opacity-0 cursor-pointer z-20"
          />
        </div>

        {/* Player Transport Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPause}
              className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button
              onClick={stopPlayback}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Stop"
            >
              <Square className="w-3.5 h-3.5" />
            </button>

            {/* Time Display */}
            <div className="font-mono text-xs text-slate-300 tracking-wider">
              <span className="font-bold text-white">{formatTime(currentTime)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span className="text-slate-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Subtitles (CC), Resync and Fullscreen */}
          <div className="flex items-center gap-3">
            {isUserEditing && (
              <button
                onClick={resumeTimelineCode}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                title="Restore instructor timeline code"
              >
                <UndoDot className="w-3.5 h-3.5" /> Re-sync
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-800 cursor-pointer"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* ── AI Code Explain Modal ── */}
      {showExplainModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
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
                    Analyzing code at {formatTime(currentTime)}
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
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-blue-300 overflow-x-auto">
                <pre>{currentCode || '// No code loaded'}</pre>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Lesson Summary:
                </h4>
                <p className="text-slate-300">
                  This interactive lesson synchronizes code in real-time with the audio/video lecture. You can pause playback at any moment by clicking the editor, experiment with custom code, and hit Re-sync when you want to resume following the instructor!
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowExplainModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-md shadow-blue-600/30"
              >
                Got it, resume lesson
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}