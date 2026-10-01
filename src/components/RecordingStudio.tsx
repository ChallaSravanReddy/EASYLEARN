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
  FileCode,
  FileText,
  Files,
  Plus,
  Trash2,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  Code2,
  Eye,
  Sliders,
  Radio,
  FileJson,
  Music,
  UploadCloud,
} from 'lucide-react';
import { useScrimRecorder } from '../hooks/useScrimRecorder';
import type { ScrimManifest, ScrimEvent } from '../types/scrim';
import CodePreviewIframe from './CodePreviewIframe';
import ScrimPublishModal from './ScrimPublishModal';

export const LESSON_TEMPLATES: Record<string, { name: string; title: string; files: Record<string, string> }> = {
  counter: {
    name: 'Interactive Counter',
    title: 'Building an Interactive Counter',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interactive Counter</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="card">
    <div class="badge">EasyLearn Lesson</div>
    <h1 id="title">Interactive Counter</h1>
    <p class="subtitle">Modify HTML, CSS, or JS in Monaco to see live updates.</p>

    <div class="counter-display">
      <span id="count">0</span>
    </div>

    <div class="actions">
      <button id="btn-dec" class="btn btn-secondary">- Decrement</button>
      <button id="btn-reset" class="btn btn-outline">Reset</button>
      <button id="btn-inc" class="btn btn-primary">+ Increment</button>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      'styles.css': `body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  padding: 1rem;
}

.card {
  background: #1e293b;
  padding: 2.25rem;
  border-radius: 1.25rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid #334155;
  text-align: center;
  max-width: 380px;
  width: 100%;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 9999px;
  margin-bottom: 0.75rem;
}

h1 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.825rem;
  margin: 0 0 1.5rem;
}

.counter-display {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.875rem;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

#count {
  font-size: 3rem;
  font-weight: 800;
  color: #38bdf8;
  font-variant-numeric: tabular-nums;
  display: inline-block;
  transition: transform 0.15s ease;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn {
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #6366f1;
  color: white;
}
.btn-primary:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #334155;
  color: #f8fafc;
}
.btn-secondary:hover {
  background: #475569;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: #94a3b8;
  border: 1px solid #334155;
}
.btn-outline:hover {
  background: #1e293b;
  color: white;
}`,
      'script.js': `// Interactive Counter Logic
let count = 0;
const countDisplay = document.getElementById('count');
const incBtn = document.getElementById('btn-inc');
const decBtn = document.getElementById('btn-dec');
const resetBtn = document.getElementById('btn-reset');

function updateDisplay() {
  if (!countDisplay) return;
  countDisplay.textContent = count;
  countDisplay.style.transform = 'scale(1.2)';
  setTimeout(() => {
    countDisplay.style.transform = 'scale(1)';
  }, 100);
  console.log('Current count:', count);
}

incBtn?.addEventListener('click', () => {
  count++;
  updateDisplay();
});

decBtn?.addEventListener('click', () => {
  count--;
  updateDisplay();
});

resetBtn?.addEventListener('click', () => {
  count = 0;
  updateDisplay();
});
`,
    },
  },
  blank: {
    name: 'Blank Canvas',
    title: 'New Web Project',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Project</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div style="text-align: center; padding: 3rem;">
    <h1>Hello, World!</h1>
    <p>Start writing your code in the Monaco editor.</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      'styles.css': `body {
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  margin: 0;
}`,
      'script.js': `console.log('Project initialized!');\n`,
    },
  },
};

const DEFAULT_FILES: Record<string, string> = LESSON_TEMPLATES.counter.files;

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
  const [files, setFiles] = useState<Record<string, string>>(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState<string>('index.html');
  const [lessonTitle, setLessonTitle] = useState<string>('Building an Interactive Counter');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('counter');
  const [newFileName, setNewFileName] = useState<string>('');

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplateKey(templateKey);
    const tmpl = LESSON_TEMPLATES[templateKey];
    if (tmpl) {
      setFiles(tmpl.files);
      setLessonTitle(tmpl.title);
      setActiveFile(Object.keys(tmpl.files)[0] || 'index.html');
    }
  };
  const [showNewFileInput, setShowNewFileInput] = useState<boolean>(false);
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState<boolean>(true);
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<'events' | 'keyframes' | 'preview'>('events');
  const [copiedManifest, setCopiedManifest] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);

  // Result state after stopRecording()
  const [recordingResult, setRecordingResult] = useState<{
    audioBlob: Blob;
    scrimManifest: ScrimManifest;
    audioUrl: string;
  } | null>(null);

  // Recent events buffer for the live HUD (capped at 50)
  const [liveEvents, setLiveEvents] = useState<ScrimEvent[]>([]);

  // Editor container ref for pointer coordinate calculation
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
    keyframeCount,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    captureKeyframe,
    bindMonacoEditor,
    switchActiveFile,
    updateFiles,
  } = useScrimRecorder({
    files,
    activeFile,
    title: lessonTitle,
    keyframeIntervalMs: 30000, // 30-second keyframes
    pointerThrottleMs: 40, // 40ms pointer throttle
    audioChunkIntervalMs: 1000, // 1000ms audio chunks
    onEvent: handleIncomingEvent,
  });

  // Keep hook synced when files change
  useEffect(() => {
    updateFiles(files);
  }, [files, updateFiles]);

  const handleEditorMount = (editor: any) => {
    monacoEditorRef.current = editor;
    bindMonacoEditor(editor, editorContainerRef.current);
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
      setRecordingResult({
        ...result,
        audioUrl,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while stopping recording.');
    }
  };

  const downloadAudio = () => {
    if (!recordingResult) return;
    const a = document.createElement('a');
    a.href = recordingResult.audioUrl;
    const ext = recordingResult.scrimManifest.metadata.audioMimeType.includes('mp4') ? 'mp4' : 'webm';
    a.download = `${lessonTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_audio.${ext}`;
    a.click();
  };

  const downloadManifest = () => {
    if (!recordingResult) return;
    const blob = new Blob([JSON.stringify(recordingResult.scrimManifest, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lessonTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_scrim_manifest.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyManifestToClipboard = () => {
    if (!recordingResult) return;
    navigator.clipboard.writeText(JSON.stringify(recordingResult.scrimManifest, null, 2));
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  // Determine Monaco language from extension
  const getLanguage = (fileName: string) => {
    if (fileName.endsWith('.html')) return 'html';
    if (fileName.endsWith('.css')) return 'css';
    if (fileName.endsWith('.js')) return 'javascript';
    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) return 'typescript';
    if (fileName.endsWith('.json')) return 'json';
    return 'plaintext';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-slate-950 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* ── TOP CONTROL BAR ──────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 z-20 shrink-0">
        {/* Left: Title & Live Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  disabled={status === 'recording' || status === 'paused'}
                  className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors px-1 py-0.5"
                  placeholder="Lesson Title..."
                />
                <select
                  value={selectedTemplateKey}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  disabled={status === 'recording' || status === 'paused'}
                  className="bg-slate-800 text-[11px] text-slate-300 border border-slate-700 rounded-lg px-2 py-0.5 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
                  title="Switch starter template"
                >
                  <option value="counter">Template: Interactive Counter</option>
                  <option value="blank">Template: Blank Canvas</option>
                </select>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Monaco Telemetry & Audio Stream Studio</p>
            </div>
          </div>

          {/* Recording Status Pill */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-full shadow-inner">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status === 'recording'
                  ? 'bg-red-500 animate-ping'
                  : status === 'paused'
                  ? 'bg-amber-400'
                  : 'bg-slate-600'
              }`}
            />
            <span
              className={`text-xs font-mono font-bold tracking-wider uppercase ${
                status === 'recording'
                  ? 'text-red-400'
                  : status === 'paused'
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              {status === 'recording' ? 'LIVE REC' : status === 'paused' ? 'PAUSED' : 'STANDBY'}
            </span>
            <span className="text-xs font-mono font-bold text-white pl-1 border-l border-slate-800">
              {formatDuration(elapsedTime)}
            </span>
          </div>

          {/* Live Audio VU Level Meter */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-full">
            <Volume2 className={`w-3.5 h-3.5 ${audioLevel > 0.05 ? 'text-emerald-400' : 'text-slate-500'}`} />
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden flex items-center p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  audioLevel > 0.7 ? 'bg-red-500' : audioLevel > 0.3 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.max(4, audioLevel * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400">{Math.round(audioLevel * 100)}%</span>
          </div>
        </div>

        {/* Center / Right: Action Controls */}
        <div className="flex items-center gap-2.5">
          {status === 'idle' || status === 'stopped' ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Mic className="w-4 h-4" /> Start Recording
            </button>
          ) : null}

          {status === 'recording' ? (
            <button
              onClick={pauseRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
          ) : null}

          {status === 'paused' ? (
            <button
              onClick={resumeRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4" /> Resume
            </button>
          ) : null}

          {status === 'recording' || status === 'paused' ? (
            <>
              <button
                onClick={() => captureKeyframe()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                title="Capture manual keyframe snapshot"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-400" /> Snapshot
              </button>
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-950/80 text-red-400 hover:text-red-300 font-bold text-xs border border-red-500/30 transition-all active:scale-95 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" /> Stop & Finalize
              </button>
            </>
          ) : null}

          {/* Toggle telemetry panel */}
          <button
            onClick={() => setShowTelemetryDrawer((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showTelemetryDrawer
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Telemetry</span>
            <span className="bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded text-[10px] font-mono">
              {eventCount}
            </span>
          </button>

          {/* Toggle Live Preview */}
          <button
            onClick={() => setShowLivePreview((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showLivePreview
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-red-950/90 border-b border-red-800 px-6 py-2.5 flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="hover:text-white font-bold px-2 py-0.5">
            ✕
          </button>
        </div>
      )}

      {/* ── MAIN STUDIO WORKSPACE ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor & Tabs Container */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900 border-r border-slate-800/80">
          {/* File Tabs */}
          <div className="flex items-center bg-slate-950/90 border-b border-slate-800 px-2 h-10 overflow-x-auto no-scrollbar shrink-0 gap-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase px-2 tracking-wider">
              <Files className="w-3.5 h-3.5" /> Project
            </div>

            {Object.keys(files).map((fileName) => {
              const isActive = activeFile === fileName;
              return (
                <div
                  key={fileName}
                  onClick={() => handleTabChange(fileName)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-slate-900 text-indigo-400 border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border-transparent'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{fileName}</span>
                  {Object.keys(files).length > 1 && (
                    <button
                      onClick={(e) => handleDeleteFile(fileName, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-0.5"
                      title="Delete file"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add File Button / Input */}
            {showNewFileInput ? (
              <div className="flex items-center gap-1 bg-slate-900 border border-indigo-500/50 rounded-lg px-2 py-1">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddFile();
                    if (e.key === 'Escape') setShowNewFileInput(false);
                  }}
                  placeholder="filename.js..."
                  autoFocus
                  className="bg-transparent text-xs text-white outline-none w-24 font-mono"
                />
                <button onClick={handleAddFile} className="text-emerald-400 hover:text-emerald-300">
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewFileInput(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-indigo-400 hover:bg-slate-900/60 rounded-lg transition-colors"
                title="Add new file"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Monaco Editor Workspace */}
          <div ref={editorContainerRef} className="flex-1 relative w-full h-full bg-[#1e1e1e]">
            <Editor
              height="100%"
              width="100%"
              language={getLanguage(activeFile)}
              theme="vs-dark"
              value={files[activeFile] ?? ''}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                minimap: { enabled: true, scale: 0.75 },
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                renderLineHighlight: 'all',
                automaticLayout: true,
                tabSize: 2,
              }}
            />

            {/* Live Telemetry Indicator Overlay on Editor */}
            {status === 'recording' && (
              <div className="absolute bottom-3 right-5 pointer-events-none z-10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/40 shadow-xl">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[11px] font-mono text-red-300 font-semibold">
                  Broadcasting deltas ({eventCount} events)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── LIVE HTML SANDBOX PREVIEW ── */}
        {showLivePreview && (
          <div className="w-80 md:w-96 flex flex-col bg-slate-950 border-r border-slate-800">
            <CodePreviewIframe
              files={files}
              entryFile="index.html"
              title="Live Sandbox"
              showConsoleDrawer={true}
              defaultConsoleOpen={false}
            />
          </div>
        )}

        {/* ── TELEMETRY STREAM & KEYFRAMES DRAWER ─────────────────────────────────── */}
        {showTelemetryDrawer && (
          <div className="w-80 lg:w-96 flex flex-col bg-slate-950 border-l border-slate-800 shadow-2xl">
            {/* Drawer Tabs */}
            <div className="flex items-center justify-between px-3 h-10 bg-slate-900 border-b border-slate-800">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTelemetryTab('events')}
                  className={`text-xs font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTelemetryTab === 'events'
                      ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Events ({eventCount})
                </button>
                <button
                  onClick={() => setActiveTelemetryTab('keyframes')}
                  className={`text-xs font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTelemetryTab === 'keyframes'
                      ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Keyframes ({keyframeCount})
                </button>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Δt 40ms | 30s
              </span>
            </div>

            {/* Telemetry Stream Output */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-2 no-scrollbar">
              {activeTelemetryTab === 'events' && (
                <>
                  {liveEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center">
                      <Activity className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-xs">No telemetry recorded yet.</p>
                      <p className="text-[10px]">Click 'Start Recording' and type in Monaco.</p>
                    </div>
                  ) : (
                    liveEvents.map((evt, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span
                            className={`font-bold uppercase px-1.5 py-0.5 rounded ${
                              evt.type === 'content'
                                ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/50'
                                : evt.type === 'cursor'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                                : evt.type === 'selection'
                                ? 'bg-purple-950 text-purple-400 border border-purple-800/50'
                                : evt.type === 'pointer'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {evt.type}
                          </span>
                          <span>+{Math.round(evt.t)}ms</span>
                        </div>
                        {evt.type === 'content' && (
                          <div className="text-slate-300 break-all text-[11px]">
                            <span className="text-indigo-400 font-bold">[{evt.fileId}]</span> L
                            {evt.range.startLineNumber}:{evt.range.startColumn}:{' '}
                            <span className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">
                              {JSON.stringify(evt.text)}
                            </span>
                          </div>
                        )}
                        {evt.type === 'cursor' && (
                          <div className="text-slate-400 text-[11px]">
                            Ln {evt.position.lineNumber}, Col {evt.position.column}
                          </div>
                        )}
                        {evt.type === 'selection' && (
                          <div className="text-purple-300 text-[11px]">
                            L{evt.selection.selectionStartLineNumber}:{evt.selection.selectionStartColumn} → L
                            {evt.selection.positionLineNumber}:{evt.selection.positionColumn}
                          </div>
                        )}
                        {evt.type === 'pointer' && (
                          <div className="text-amber-300 text-[11px]">
                            x: {evt.x}px, y: {evt.y}px ({Math.round((evt.relX ?? 0) * 100)}%,{' '}
                            {Math.round((evt.relY ?? 0) * 100)}%)
                          </div>
                        )}
                        {evt.type === 'file_switch' && (
                          <div className="text-sky-300 text-[11px]">Active Tab: {evt.fileId}</div>
                        )}
                      </div>
                    ))
                  )}
                </>
              )}

              {activeTelemetryTab === 'keyframes' && (
                <div className="space-y-2">
                  <div className="p-3 bg-indigo-950/40 border border-indigo-800/30 rounded-lg text-indigo-300 text-[11px]">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <Camera className="w-3.5 h-3.5" /> Automatic Keyframes: 30s
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Complete project trees are snapshotted every 30s to allow random-access seeking during Scrim
                      playback.
                    </p>
                  </div>
                  <div className="text-slate-400 text-xs py-2 text-center">
                    {keyframeCount} Keyframes captured so far.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── POST-RECORDING MODAL & SCRIM MANIFEST EXPORTER ────────────────────────── */}
      {recordingResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Recording Captured Successfully</h3>
                  <p className="text-xs text-slate-400">Synchronized audio stream and Monaco telemetry ready.</p>
                </div>
              </div>
              <button
                onClick={() => setRecordingResult(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                  <p className="text-lg font-bold text-indigo-400 font-mono">
                    {formatDuration(recordingResult.scrimManifest.metadata.duration)}
                  </p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Events</p>
                  <p className="text-lg font-bold text-white font-mono">
                    {recordingResult.scrimManifest.metadata.totalEvents}
                  </p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Keyframes</p>
                  <p className="text-lg font-bold text-white font-mono">
                    {recordingResult.scrimManifest.metadata.totalKeyframes}
                  </p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Audio Format</p>
                  <p className="text-xs font-bold text-emerald-400 font-mono truncate mt-1">
                    {recordingResult.scrimManifest.metadata.audioMimeType}
                  </p>
                </div>
              </div>

              {/* Audio Playback Preview */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-indigo-400" /> Audio Stream Playback
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {(recordingResult.audioBlob.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <audio src={recordingResult.audioUrl} controls className="w-full h-10 outline-none" />
              </div>

              {/* JSON Manifest Schema Viewer */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileJson className="w-3.5 h-3.5 text-amber-400" /> Scrim Manifest JSON Schema
                  </span>
                  <button
                    onClick={copyManifestToClipboard}
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    {copiedManifest ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy JSON
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-[11px] font-mono text-slate-300 max-h-56 overflow-y-auto no-scrollbar">
                  {JSON.stringify(recordingResult.scrimManifest, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
              <button
                onClick={() => setRecordingResult(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Close & Continue
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={downloadAudio}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" /> Download Audio
                </button>
                <button
                  onClick={downloadManifest}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" /> Download Manifest (.json)
                </button>
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
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
                          audioUrl: recordingResult.audioUrl,
                        })
                      );
                    } catch (e) {}
                    navigate('/player');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Play in Scrim Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Direct-to-Storage Cloud Publishing Modal ── */}
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
