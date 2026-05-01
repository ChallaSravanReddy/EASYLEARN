import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Pause, Square, UndoDot, RotateCcw, Upload, FileJson, Video as VideoIcon, FileAudio, Maximize, X } from 'lucide-react';
import Draggable from 'react-draggable';
import OutputPanel from './OutputPanel';
import { useParams, useNavigate } from 'react-router-dom';


const DEMO_TIMELINE = [
  { time: 0, code: `// Welcome to JavaScript Basics!\n// Click Play to start the interactive lesson.` },
  { time: 5, code: `console.log("Hello, World!");\n// The output will appear in the draggable console.` },
  { time: 10, code: `let age = 20;\nconsole.log("Age:", age);` },
  { time: 15, code: `var city = "Hyderabad";   // old way\nlet score = 95;           // can be changed\nconst pi = 3.14;          // fixed value` },
];

const generateOutputHTML = (code) => `
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
          ${code}
        } catch (e) {
          console.error("Runtime Error: " + e.message);
        }
    </script>
    </body>
</html>
`;

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
      // If resuming after editing, reset editing flag so sync resumes
      if (isUserEditing) setIsUserEditing(false);
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
    
    if (!isUserEditing) {
      setIsUserEditing(true);
      if (isPlaying && mediaRef.current) {
        mediaRef.current.pause();
        setIsPlaying(false);
      }
    }
    setCurrentCode(value || '');
  };

  const resumeTimelineCode = () => {
    setIsUserEditing(false);
    const snapshot = [...timelineData].reverse().find((s) => s.time <= currentTime);
    if (snapshot) setCurrentCode(snapshot.code);
  };

  const formatTime = (timeInSeconds) => {
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
    <div className="fixed inset-0 z-[100] bg-[#1e1e1e] w-screen h-screen overflow-hidden flex flex-col font-sans">
      
      {/* Top Header / Engine Tools */}
      <div className="h-12 bg-[#252526] border-b border-[#333333] flex items-center justify-between px-4 select-none shrink-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer" onClick={() => window.history.back()} />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="ml-4 text-xs font-semibold text-slate-300 tracking-wider">EASYLEARN ENGINE <span className="text-indigo-400">PRO</span></span>
        </div>
        <div className="flex items-center gap-4">
          {isUserEditing && (
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md animate-pulse">
              EDITING MODE — PAUSED
            </span>
          )}
          <button onClick={() => setShowVideo(!showVideo)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-[#333] px-3 py-1.5 rounded-md transition-colors">
             {mediaType === 'video' ? <VideoIcon className="w-3.5 h-3.5" /> : <FileAudio className="w-3.5 h-3.5" />} Toggle Media
          </button>
        </div>
      </div>

      {/* Main Full-Screen Editor Area */}
      <div className="relative flex-1 w-full h-full">
        <Editor
          height="100%"
          width="100%"
          language="javascript"
          theme="vs-dark"
          value={currentCode}
          options={{
            fontSize: 18,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            padding: { top: 24, bottom: 24 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
          }}
          onChange={handleEditorChange}
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
        <Draggable nodeRef={nodeRef} defaultPosition={{ x: window.innerWidth / 2 - 225, y: window.innerHeight / 2 - 150 }}>
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
              <OutputPanel outputCode={generateOutputHTML(currentCode)} />
            </div>
          </div>
        </Draggable>
      </div>

      {/* Bottom Robust Control Bar */}
      <div className="h-20 bg-[#252526] border-t border-[#333] shrink-0 flex items-center px-6 gap-6 z-50">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayPause}
            className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-indigo-900/50"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
          </button>
          <button
            onClick={stopPlayback}
            className="w-10 h-10 rounded-full bg-[#333] hover:bg-[#444] text-slate-300 flex items-center justify-center transition-colors"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 flex items-center gap-4">
          <span className="text-xs font-mono text-slate-400 w-12 text-right">{formatTime(currentTime)}</span>
          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSliderChange}
              className="w-full h-2 rounded-full appearance-none bg-[#333] cursor-pointer outline-none relative z-10"
              style={{
                background: `linear-gradient(to right, #6366f1 ${(currentTime / (duration || 100)) * 100}%, #333 ${(currentTime / (duration || 100)) * 100}%)`
              }}
            />
            {/* Custom slider thumb logic via injected styles */}
            <style>{`
              input[type=range]::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #fff; cursor: pointer; border: 2px solid #6366f1; box-shadow: 0 0 10px rgba(99,102,241,0.5); transition: transform 0.1s; }
              input[type=range]:hover::-webkit-slider-thumb { transform: scale(1.2); }
            `}</style>
          </div>
          <span className="text-xs font-mono text-slate-400 w-12">{formatTime(duration)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isUserEditing && (
            <button
              onClick={resumeTimelineCode}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition-colors"
            >
              <UndoDot className="w-4 h-4" /> Sync Code
            </button>
          )}
          <button className="p-2 text-slate-400 hover:text-white transition-colors" onClick={() => document.documentElement.requestFullscreen().catch(()=>{})}>
            <Maximize className="w-5 h-5" />
          </button>
        </div>

      </div>

    </div>
  );
}