import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Code2,
  Eye,
  Layers,
  Sparkles,
  Radio,
  FileCode,
  FileText,
  Files,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  GitFork,
  RefreshCw,
  FileJson,
  Upload,
  Download,
  Check,
  ChevronRight,
  ExternalLink,
  Cpu,
  MousePointer,
  HelpCircle,
} from 'lucide-react';
import { useScrimPlayer } from '../hooks/useScrimPlayer';
import { DEMO_SCRIM_MANIFEST, generateSyntheticAudioDataUri } from '../utils/demoScrim';
import type { ScrimManifest } from '../types/scrim';

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((Math.max(0, ms) % 1000) / 100);
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${tenths}`;
}

export default function ScrimPlayerView() {
  // Audio element reference for master clock
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  // Active Scrim Manifest & Audio Source (defaults to rich Demo Scrim)
  const [manifest, setManifest] = useState<ScrimManifest>(DEMO_SCRIM_MANIFEST);
  const [syntheticAudioUrl, setSyntheticAudioUrl] = useState<string>('');
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);
  const [showManifestModal, setShowManifestModal] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [hoverKeyframe, setHoverKeyframe] = useState<number | null>(null);
  const [newFileName, setNewFileName] = useState<string>('');
  const [showNewFileInput, setShowNewFileInput] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Generate synthetic audio for demo scrim if needed
  useEffect(() => {
    const audioUri = generateSyntheticAudioDataUri(25);
    setSyntheticAudioUrl(audioUri);
  }, []);

  // Initialize Scrim Player Engine
  const {
    isPlaying,
    currentTimeMs,
    durationMs,
    playbackSpeed,
    volume,
    isMuted,
    files,
    activeFile,
    virtualPointer,
    isStudentModified,
    isForked,
    showBranchModal,
    play,
    pause,
    togglePlay,
    seekTo,
    bindAudio,
    bindEditor,
    selectFile,
    changePlaybackSpeed,
    changeVolume,
    toggleMute,
    updateFileCode,
    addNewFile,
    deleteFile,
    revertAndPlay,
    keepChangesAndPlay,
    revertToInstructor,
    loadManifest,
    cancelBranchModal,
  } = useScrimPlayer({
    manifest,
    audioSrc: syntheticAudioUrl,
  });

  // Attach audio element reference to hook
  useEffect(() => {
    if (audioElementRef.current) {
      bindAudio(audioElementRef.current);
    }
  }, [bindAudio, syntheticAudioUrl]);

  // Check for custom scrim passed via sessionStorage from Recording Studio
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('easy_scrim_custom');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.scrimManifest) {
          setManifest(parsed.scrimManifest);
          loadManifest(parsed.scrimManifest, parsed.audioUrl || syntheticAudioUrl);
        }
      }
    } catch (err) {
      console.warn('Could not read session scrim:', err);
    }
  }, [loadManifest, syntheticAudioUrl]);

  // Spacebar toggle play/pause listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  // Generate bundle for live sandbox preview iframe
  const previewHtml = useMemo(() => {
    const html = files['index.html'] || '<!-- No index.html -->';
    const css = files['styles.css'] || files['style.css'] || '';
    const js = files['script.js'] || files['index.js'] || files['app.js'] || '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            ${css}
          </style>
        </head>
        <body>
          ${html.replace(/<!DOCTYPE html>|<html[^>]*>|<\/html>|<head[^>]*>[\s\S]*?<\/head>|<body[^>]*>|<\/body>/gi, '')}
          <script>
            try {
              ${js}
            } catch (err) {
              console.error('[Sandbox Error]', err);
            }
          </script>
        </body>
      </html>
    `;
  }, [files]);

  // Compute file language for Monaco Editor
  const getFileLanguage = useCallback((fileName: string) => {
    if (fileName.endsWith('.html')) return 'html';
    if (fileName.endsWith('.css')) return 'css';
    if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return 'javascript';
    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) return 'typescript';
    if (fileName.endsWith('.json')) return 'json';
    return 'plaintext';
  }, []);

  // Compute responsive coordinates for Virtual Pointer
  const pointerPosition = useMemo(() => {
    if (!virtualPointer || !virtualPointer.visible) return null;

    if (editorContainerRef.current && virtualPointer.relX !== undefined && virtualPointer.relY !== undefined) {
      const rect = editorContainerRef.current.getBoundingClientRect();
      const x = Math.max(10, Math.min(rect.width - 20, virtualPointer.relX * rect.width));
      const y = Math.max(10, Math.min(rect.height - 20, virtualPointer.relY * rect.height));
      return { x, y };
    }

    return { x: virtualPointer.x, y: virtualPointer.y };
  }, [virtualPointer]);

  // Scrubber calculation
  const progressPercent = durationMs > 0 ? (currentTimeMs / durationMs) * 100 : 0;

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercent = parseFloat(e.target.value);
    const targetMs = (newPercent / 100) * durationMs;
    seekTo(targetMs);
  };

  // Upload or paste custom Scrim Manifest
  const handleLoadCustomJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.manifest && !parsed.initialState) {
        alert('Invalid Scrim Manifest format. Missing initialState or metadata.');
        return;
      }
      const finalManifest = parsed.scrimManifest || parsed;
      setManifest(finalManifest);
      loadManifest(finalManifest, parsed.audioUrl || syntheticAudioUrl);
      setShowManifestModal(false);
      setJsonInput('');
    } catch (err) {
      alert('Failed to parse JSON: ' + (err as Error).message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const finalManifest = parsed.scrimManifest || parsed;
        setManifest(finalManifest);
        loadManifest(finalManifest, parsed.audioUrl || syntheticAudioUrl);
        setShowManifestModal(false);
      } catch (err) {
        alert('Failed to read Scrim file: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-slate-950 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* ── Hidden HTML5 Audio Element (Driven by Audio Master Clock) ── */}
      <audio
        ref={audioElementRef}
        src={syntheticAudioUrl}
        preload="auto"
        onEnded={() => pause()}
        className="hidden"
      />

      {/* ── Top Bar: Header & Telemetry Status ── */}
      <header className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 select-none z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">
                {manifest.metadata.title}
              </h1>
              {isForked ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <GitFork className="w-3 h-3" /> Forked Session
                </span>
              ) : isStudentModified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertCircle className="w-3 h-3" /> Student Modified
                </span>
              ) : isPlaying ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  Live Replay
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  Paused (Interactive)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-md">
              Instructor: <span className="text-slate-300 font-medium">{manifest.metadata.author || 'Instructor'}</span> • {manifest.metadata.totalEvents} events • {manifest.keyframes.length} keyframes
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* If student has modified or forked, allow one-click reset to instructor code */}
          {(isStudentModified || isForked) && (
            <button
              onClick={revertToInstructor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-all shadow-sm"
              title="Discard custom modifications and restore exact instructor code at current timestamp"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Revert to Instructor
            </button>
          )}

          <button
            onClick={() => setShowManifestModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            title="Load custom Scrim JSON or switch demo"
          >
            <Upload className="w-3.5 h-3.5" />
            Load Scrim
          </button>

          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showLivePreview
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {showLivePreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </header>

      {/* ── Main Workspace: Monaco Editor & Live Preview Pane ── */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left: Code Editor Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] relative">
          {/* File Tabs Header */}
          <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-2 shrink-0 select-none overflow-x-auto">
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {Object.keys(files).map((fileName) => {
                const isActive = activeFile === fileName;
                return (
                  <button
                    key={fileName}
                    onClick={() => selectFile(fileName)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                      isActive
                        ? 'bg-[#1e1e1e] text-indigo-400 border border-indigo-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>{fileName}</span>
                  </button>
                );
              })}

              {/* Add file button */}
              {showNewFileInput ? (
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="filename.ext"
                    className="bg-transparent text-xs text-white focus:outline-none w-24 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newFileName.trim()) {
                        addNewFile(newFileName.trim());
                        setNewFileName('');
                        setShowNewFileInput(false);
                      } else if (e.key === 'Escape') {
                        setShowNewFileInput(false);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (newFileName.trim()) {
                        addNewFile(newFileName.trim());
                        setNewFileName('');
                        setShowNewFileInput(false);
                      }
                    }}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewFileInput(true)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  title="Add new file"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick status pill */}
            <div className="flex items-center gap-2 pr-2 text-[11px] text-slate-400 font-mono">
              {isPlaying ? (
                <span className="text-indigo-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  Audio Master Clock Active
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Edit-on-Pause Ready
                </span>
              )}
            </div>
          </div>

          {/* Monaco Editor Container with Overlay */}
          <div
            ref={editorContainerRef}
            className="flex-1 relative overflow-hidden"
            onClick={() => {
              // Scrimba behavior: Clicking into editor while playing smoothly pauses playback to allow instant editing!
              if (isPlaying) {
                pause();
              }
            }}
          >
            <Editor
              height="100%"
              language={getFileLanguage(activeFile)}
              theme="vs-dark"
              value={files[activeFile] || ''}
              options={{
                fontSize: 14,
                lineNumbers: 'on',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                padding: { top: 12 },
                tabSize: 2,
                renderLineHighlight: 'all',
              }}
              onMount={(editor, monaco) => {
                bindEditor(editor, monaco);
              }}
            />

            {/* ── Virtual Pointer & Simulated Instructor Cursor Overlay ── */}
            {pointerPosition && (
              <div
                className="absolute pointer-events-none z-40 transition-transform duration-75 ease-out will-change-transform"
                style={{
                  top: 0,
                  left: 0,
                  transform: `translate3d(${pointerPosition.x}px, ${pointerPosition.y}px, 0)`,
                  opacity: virtualPointer?.visible ? 1 : 0,
                  transition: 'transform 80ms cubic-bezier(0.2, 0, 0.2, 1), opacity 0.25s ease',
                }}
              >
                {/* Simulated Instructor Cursor SVG */}
                <svg
                  className="w-5 h-5 -rotate-45 drop-shadow-md text-indigo-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="white"
                  strokeWidth="1.5"
                >
                  <path d="M3 3l7 18 3-7 7-3L3 3z" />
                </svg>

                {/* Instructor Tag Pill */}
                <div className="absolute left-4 top-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-600/90 text-white text-[10px] font-bold tracking-wider shadow-lg border border-indigo-400/40 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 animate-ping" />
                  INSTRUCTOR
                </div>
              </div>
            )}

            {/* Subtle banner when playing telling student they can click anytime to edit */}
            {isPlaying && (
              <div className="absolute top-2 right-4 z-30 pointer-events-none opacity-80 transition-opacity">
                <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-slate-300 text-[11px] border border-slate-700/80 shadow-md backdrop-blur">
                  Click code or press Space to pause & edit
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Interactive Sandbox Preview */}
        {showLivePreview && (
          <div className="w-[45%] flex flex-col border-l border-slate-800 bg-slate-900 min-w-[320px]">
            <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-300 font-semibold select-none">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Interactive Sandbox</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal">
                Auto-evaluates in real-time
              </span>
            </div>
            <div className="flex-1 bg-white relative">
              <iframe
                title="Interactive Scrim Sandbox"
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Engine Console: Audio Master Clock Controls & Keyframe Scrubber ── */}
      <footer className="bg-slate-900 border-t border-slate-800/80 px-4 py-3 flex flex-col gap-2 shrink-0 select-none z-20">
        {/* Keyframe-Assisted Timeline Scrubber */}
        <div className="relative flex flex-col gap-1">
          <div className="relative flex items-center h-6 group">
            {/* Background Track */}
            <div className="absolute inset-x-0 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              {/* Progress Fill */}
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Keyframe Snapshot Markers (O(1) Seek Points) */}
            {manifest.keyframes.map((kf, i) => {
              const kfPercent = durationMs > 0 ? (kf.t / durationMs) * 100 : 0;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 shadow-md cursor-pointer hover:scale-150 transition-transform z-10"
                  style={{ left: `${kfPercent}%` }}
                  onMouseEnter={() => setHoverKeyframe(kf.t)}
                  onMouseLeave={() => setHoverKeyframe(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    seekTo(kf.t);
                  }}
                  title={`Keyframe #${i + 1} at ${formatTime(kf.t)} (Instant Snapshot)`}
                />
              );
            })}

            {/* Interactive Range Input */}
            <input
              type="range"
              min={0}
              max={100}
              step={0.05}
              value={progressPercent || 0}
              onChange={handleScrubberChange}
              onMouseDown={() => setIsScrubbing(true)}
              onMouseUp={() => setIsScrubbing(false)}
              className="absolute inset-x-0 w-full h-4 opacity-0 cursor-pointer z-20"
            />

            {/* Keyframe hover tooltip */}
            {hoverKeyframe !== null && (
              <div
                className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-mono border border-slate-700 shadow-lg pointer-events-none z-30"
                style={{
                  left: `${(hoverKeyframe / durationMs) * 100}%`,
                }}
              >
                Keyframe: {formatTime(hoverKeyframe)}
              </div>
            )}
          </div>
        </div>

        {/* Player Transport Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Skip Back 5s */}
            <button
              onClick={() => seekTo(Math.max(0, currentTimeMs - 5000))}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Skip back 5s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Time Display */}
            <div className="font-mono text-xs text-slate-300 tracking-wider">
              <span className="font-bold text-white">{formatTime(currentTimeMs)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span className="text-slate-400">{formatTime(durationMs)}</span>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 ml-2">
              {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => changePlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                    playbackSpeed === spd
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Volume and Telemetry Status */}
          <div className="flex items-center gap-4">
            {/* Volume control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-slate-800 rounded-lg accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Audio-driven master clock indicator */}
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-[11px] font-mono text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>rAF Clock:</span>
              <span className="text-emerald-400 font-semibold">
                {Math.round(currentTimeMs)}ms
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── State Branching (Edit-on-Pause) Modal Dialog ── */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <GitFork className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Code Modified While Paused
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  You altered the code during pause. To resume playback, choose whether to preserve your custom changes or restore the instructor's code stream:
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
              {/* Option A: Revert to Instructor's Code */}
              <button
                onClick={revertAndPlay}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    Revert to instructor's code
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Resets editor buffer to instructor's state at {formatTime(currentTimeMs)} and resumes audio stream.
                  </div>
                </div>
              </button>

              {/* Option B: Keep Changes and Fork */}
              <button
                onClick={keepChangesAndPlay}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <GitFork className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    Keep my changes and fork
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Preserves your custom solution while continuing to play the instructor's voice & pointer.
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={cancelBranchModal}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Stay Paused
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Scrim Loader Modal ── */}
      {showManifestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Load Scrim Manifest</h3>
              </div>
              <button
                onClick={() => setShowManifestModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste a Scrim manifest JSON exported from the Recording Studio, or load a JSON file from disk.
            </p>

            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer border border-slate-700">
                <Upload className="w-4 h-4" />
                <span>Upload JSON file</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  setManifest(DEMO_SCRIM_MANIFEST);
                  loadManifest(DEMO_SCRIM_MANIFEST, syntheticAudioUrl);
                  setShowManifestModal(false);
                }}
                className="px-3 py-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 rounded-lg text-xs font-medium border border-indigo-500/30"
              >
                Reset to Demo Scrim
              </button>
            </div>

            <textarea
              rows={6}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='Paste { "version": "1.0.0", "metadata": { ... }, "keyframes": [...], "events": [...] }'
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowManifestModal(false)}
                className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleLoadCustomJson}
                disabled={!jsonInput.trim()}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
              >
                Apply Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
