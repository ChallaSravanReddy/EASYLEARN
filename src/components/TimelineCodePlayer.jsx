import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Pause, Square, UndoDot, RotateCcw, Upload, FileJson, Video as VideoIcon, FileAudio, Maximize, X, Files, Search, GitBranch, PlaySquare, Settings, ChevronRight, ChevronDown, FilePlus, FolderPlus } from 'lucide-react';
import Draggable from 'react-draggable';
import OutputPanel from './OutputPanel';
import { useParams, useNavigate } from 'react-router-dom';


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

  // Engine Setup State
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoadingDB, setIsLoadingDB] = useState(!!lessonId);
  const [timelineData, setTimelineData] = useState([]);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaType, setMediaType] = useState('video'); // 'video' or 'audio'
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  
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
              className={`flex items-center gap-1.5 py-1 cursor-pointer text-[13px] ${activeTab === f.id || selectedFolderId === f.id ? 'bg-[#37373d] text-white' : 'text-[#cccccc] hover:bg-[#2a2d2e]'}`}
              style={{ paddingLeft: `${depth * 12 + 24}px` }}
            >
              {f.isFolder ? <ChevronRight className={`w-4 h-4 transition-transform ${f.isOpen ? 'rotate-90' : ''}`} /> : <div className="w-4 h-4 ml-1" />}
              <span className={f.isFolder ? 'font-semibold text-slate-200' : ''}>{f.name}</span>
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

  // ─── Fetch From Firestore if lessonId exists ──────────────────────────────
  useEffect(() => {
    if (lessonId) {
      setIsLoadingDB(false);
      alert("Database removed. Cannot fetch lessons.");
    }
  }, [lessonId, navigate]);

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
        } catch (err) {
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
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration);
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
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">Interactive Engine Setup</h1>
            <p className="text-slate-500 dark:text-slate-400">Upload your media and timeline JSON to start the synchronized code player locally.</p>
          </div>

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

          <div className="flex flex-col gap-4">
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
            <button onClick={loadDemo} className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-700 dark:text-white font-bold rounded-xl transition-all">
              Load Demo Lesson
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Engine Full Screen Render ─────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[100] bg-[#1e1e1e] w-screen h-screen overflow-hidden flex flex-col font-sans text-[#cccccc]">
      
      {/* VS Code Top Bar */}
      <div className="h-8 bg-[#323233] border-b border-[#252526] flex items-center justify-between px-3 select-none shrink-0 z-50">
        <div className="flex items-center gap-4 text-[13px]">
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="cursor-pointer hover:text-white">File</span>
          <span className="cursor-pointer hover:text-white">Edit</span>
          <span className="cursor-pointer hover:text-white">Selection</span>
          <span className="cursor-pointer hover:text-white">View</span>
          <span className="cursor-pointer hover:text-white">Go</span>
          <span className="cursor-pointer hover:text-white">Run</span>
          <span className="cursor-pointer hover:text-white">...</span>
        </div>
        <div className="flex items-center bg-[#1e1e1e] border border-[#3c3c3c] rounded px-4 py-0.5 text-xs w-[400px] justify-center text-slate-400 font-medium">
          EASYLEARN ENGINE PRO - {files.find(f => f.id === activeTab)?.name || 'Welcome'}
        </div>
        <div className="flex items-center gap-4">
          {isUserEditing && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded animate-pulse">
              EDITING
            </span>
          )}
          <button onClick={() => setShowVideo(!showVideo)} className="text-[12px] text-slate-400 hover:text-white flex items-center gap-1">
             {mediaType === 'video' ? <VideoIcon className="w-3.5 h-3.5" /> : <FileAudio className="w-3.5 h-3.5" />} Toggle Media
          </button>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* VS Code Activity Bar */}
        <div className="w-12 bg-[#333333] flex flex-col items-center py-3 gap-6 shrink-0 border-r border-[#252526]">
          <Files className="w-6 h-6 text-white cursor-pointer" />
          <Search className="w-6 h-6 text-slate-500 hover:text-white cursor-pointer" />
          <GitBranch className="w-6 h-6 text-slate-500 hover:text-white cursor-pointer" />
          <PlaySquare className="w-6 h-6 text-slate-500 hover:text-white cursor-pointer" />
          <div className="mt-auto mb-2">
            <Settings className="w-6 h-6 text-slate-500 hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* VS Code Side Bar (Explorer) */}
        <div className="w-60 bg-[#252526] flex flex-col shrink-0 border-r border-[#1e1e1e] select-none" onClick={() => setSelectedFolderId(null)}>
          <div className="h-9 px-4 flex items-center text-[11px] uppercase tracking-wider font-semibold text-slate-300">
            Explorer
          </div>
          <div className="px-2 py-1 flex items-center justify-between group cursor-pointer hover:bg-[#2a2d2e]" onClick={(e) => { e.stopPropagation(); setSelectedFolderId(null); }}>
            <div className="flex items-center gap-1 text-[11px] font-bold text-white uppercase tracking-wider">
              <ChevronDown className="w-4 h-4" /> EASYLEARN
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <FilePlus className="w-4 h-4 text-slate-300 hover:text-white" onClick={addFile} title="New File" />
              <FolderPlus className="w-4 h-4 text-slate-300 hover:text-white" onClick={addFolder} title="New Folder" />
            </div>
          </div>
          <div className="flex flex-col mt-1 overflow-y-auto no-scrollbar pb-10">
            {renderTree(null)}
          </div>
        </div>

        {/* VS Code Main Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] relative">
          
          {/* Editor Tabs */}
          <div className="h-9 flex bg-[#252526] overflow-x-auto no-scrollbar border-b border-[#1e1e1e]">
            {openTabs.map(tabId => {
              const f = files.find(x => x.id === tabId);
              if (!f) return null;
              return (
                <div 
                  key={tabId}
                  onClick={() => {
                    handleUserActivity();
                    setActiveTab(tabId);
                  }}
                  className={`flex items-center px-4 min-w-[120px] max-w-[200px] border-t cursor-pointer gap-2 ${activeTab === tabId ? 'bg-[#1e1e1e] border-[#007acc] text-white' : 'bg-[#2d2d2d] border-transparent text-slate-400 hover:bg-[#2b2b2b]'}`}
                >
                  <span className={`text-[12px] font-mono ${f.language === 'javascript' ? 'text-yellow-400' : f.language === 'css' ? 'text-blue-400' : 'text-slate-300'}`}>
                    {f.language === 'javascript' ? 'JS' : f.language === 'css' ? '#' : '{}'}
                  </span> 
                  <span className="truncate">{f.name}</span>
                  <X className="w-3.5 h-3.5 ml-auto hover:bg-[#444] rounded-md shrink-0" onClick={(e) => closeTab(e, tabId)} />
                </div>
              );
            })}
          </div>

          {/* Breadcrumbs */}
          <div className="h-6 flex items-center px-4 text-[12px] text-slate-400 bg-[#1e1e1e] shadow-sm shadow-black/20 z-10">
            EASYLEARN 
            {getBreadcrumbs(activeTab).map(crumb => (
              <React.Fragment key={crumb}>
                <ChevronRight className="w-3.5 h-3.5 mx-1" /> {crumb}
              </React.Fragment>
            ))}
          </div>

          {/* Editor Container */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              width="100%"
              language={activeLanguage}
              theme="vs-dark"
              value={activeTab === '1' ? currentCode : (files.find(f => f.id === activeTab)?.content || '')}
              options={{
                fontSize: 15,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: true, scale: 0.75 },
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
              }}
              onChange={(val) => handleEditorChange(val)}
            />

        {/* Draggable Media Overlay (Picture-in-Picture style) */}
        {showVideo && mediaUrl && (
          <Draggable nodeRef={videoDragRef} bounds="parent" defaultPosition={{ x: window.innerWidth - 420, y: 24 }}>
            <div ref={videoDragRef} className="absolute z-40 rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 bg-black cursor-move w-[380px] group backdrop-blur-md">
              <div className="h-6 bg-gradient-to-r from-slate-900 to-black flex items-center justify-between px-3">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{mediaType}</span>
                <X className="w-3 h-3 text-slate-400 hover:text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowVideo(false); }} />
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
                  <FileAudio className="w-8 h-8 text-indigo-500 mb-2" />
                  <audio
                    ref={mediaRef}
                    src={mediaUrl}
                    className="hidden"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleMediaEnded}
                  />
                  <span className="text-xs text-slate-400">Audio Playing</span>
                </div>
              )}
            </div>
          </Draggable>
        )}

        {/* Draggable Terminal Panel */}
        <Draggable nodeRef={nodeRef} defaultPosition={{ x: window.innerWidth - 480, y: window.innerHeight - 380 }}>
          <div ref={nodeRef} className="fixed top-0 left-0 z-[1000] w-[450px] shadow-2xl shadow-black/80 rounded-xl overflow-hidden border border-[#30363d] bg-[#0d1117] flex flex-col">
            <div className="h-9 bg-[#161b22] flex items-center justify-between px-4 cursor-move border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="ml-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">bash — output</span>
              </div>
            </div>
            <div className="h-60 overflow-hidden">
              <OutputPanel outputCode={generateOutputHTML(files, currentCode)} />
            </div>
          </div>
        </Draggable>
          </div>
        </div>
      </div>

      {/* Bottom Robust Control Bar */}
      <div className="h-16 bg-[#252526] border-t border-[#1e1e1e] shrink-0 flex items-center px-6 gap-6 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.2)]">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full bg-[#007acc] hover:bg-[#005999] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-[#007acc]/30"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
          </button>
          <button
            onClick={stopPlayback}
            className="w-8 h-8 rounded-full bg-[#333] hover:bg-[#444] text-slate-300 flex items-center justify-center transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 flex items-center gap-4">
          <span className="text-xs font-mono text-slate-400 w-10 text-right">{formatTime(currentTime)}</span>
          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSliderChange}
              className="w-full h-1.5 rounded-full appearance-none bg-[#333] cursor-pointer outline-none relative z-10"
              style={{
                background: `linear-gradient(to right, #007acc ${(currentTime / (duration || 100)) * 100}%, #333 ${(currentTime / (duration || 100)) * 100}%)`
              }}
            />
            {/* Custom slider thumb logic via injected styles */}
            <style>{`
              input[type=range]::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #fff; cursor: pointer; border: 2px solid #007acc; box-shadow: 0 0 10px rgba(0,122,204,0.5); transition: transform 0.1s; }
              input[type=range]:hover::-webkit-slider-thumb { transform: scale(1.2); }
            `}</style>
          </div>
          <span className="text-xs font-mono text-slate-400 w-10">{formatTime(duration)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isUserEditing && (
            <button
              onClick={resumeTimelineCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#007acc]/10 hover:bg-[#007acc]/20 text-[#007acc] border border-[#007acc]/30 rounded text-[11px] font-bold transition-colors uppercase tracking-wider"
            >
              <UndoDot className="w-3.5 h-3.5" /> Sync
            </button>
          )}
          <button className="p-1.5 text-slate-400 hover:text-white transition-colors rounded hover:bg-[#333]" onClick={() => document.documentElement.requestFullscreen().catch(()=>{})}>
            <Maximize className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* VS Code Status Bar */}
      <div className="h-[22px] bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] shrink-0 select-none">
        <div className="flex items-center gap-4">
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded flex items-center gap-1"><GitBranch className="w-3.5 h-3.5" /> main*</span>
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> 0 
            <UndoDot className="w-3 h-3 ml-1" /> 0
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded">Ln 1, Col 1</span>
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded">Spaces: 2</span>
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded">UTF-8</span>
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded uppercase">{activeLanguage}</span>
        </div>
      </div>

    </div>
  );
}