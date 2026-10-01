import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  MousePointer2,
  HelpCircle,
  Trophy,
  Zap,
  CheckCircle,
  XCircle,
  Lightbulb,
  FastForward,
  Award,
  Loader2,
  X,
} from 'lucide-react';
import { useScrimPlayer } from '../hooks/useScrimPlayer';
import { DEMO_SCRIM_MANIFEST, generateSyntheticAudioDataUri } from '../utils/demoScrim';
import type { ScrimManifest, ScrimChallenge } from '../types/scrim';
import CodePreviewIframe from './CodePreviewIframe';
import { fetchPublishedScrim } from '../services/scrimUploadService';
import {
  runChallengeValidation,
  playCelebrationChime,
  playFailureBuzz,
  ChallengeValidationResult,
} from '../utils/challengeRunner';

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
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string>('');
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);
  const [showManifestModal, setShowManifestModal] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [hoverKeyframe, setHoverKeyframe] = useState<number | null>(null);
  const [newFileName, setNewFileName] = useState<string>('');
  const [showNewFileInput, setShowNewFileInput] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Active audio URL is the recorded voice stream if available, else synthetic tone
  const activeAudioUrl = recordedAudioUrl || syntheticAudioUrl;

  // URL Query search params for cloud published scrims (/player?scrimId=xyz)
  const [searchParams] = useSearchParams();
  const scrimId = searchParams.get('scrimId');

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
    activeChallenge,
    showChallengeModal,
    completedChallengeIds,
    completeChallenge,
    skipChallenge,
    dismissChallengeModal,
    reopenChallengeModal,
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
    audioSrc: activeAudioUrl,
  });

  // Challenge Runner & XP Gamification States
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<ChallengeValidationResult | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [autoResumeCountdown, setAutoResumeCountdown] = useState<number | null>(null);
  const [studentXp, setStudentXp] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('easylearn_student_xp') || '150', 10);
    } catch {
      return 150;
    }
  });

  // Switch to challenge target file if declared
  useEffect(() => {
    if (activeChallenge) {
      setTestResult(null);
      setShowHint(false);
      setAutoResumeCountdown(null);
      if (activeChallenge.targetFile && files[activeChallenge.targetFile] !== undefined) {
        selectFile(activeChallenge.targetFile);
      }
    }
  }, [activeChallenge, files, selectFile]);

  // Auto-resume countdown after passing challenge tests
  useEffect(() => {
    if (autoResumeCountdown === null) return;
    if (autoResumeCountdown <= 0) {
      setAutoResumeCountdown(null);
      completeChallenge(activeChallenge?.id || (activeChallenge ? String(activeChallenge.timestamp) : undefined), true);
      setTestResult(null);
      return;
    }

    const timer = setTimeout(() => {
      setAutoResumeCountdown((c) => (c !== null ? c - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoResumeCountdown, completeChallenge, activeChallenge]);

  // Execute sandboxed assertions for active challenge
  const handleRunTests = async () => {
    if (!activeChallenge) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await runChallengeValidation(files, activeChallenge);
      setTestResult(result);

      if (result.passed) {
        playCelebrationChime();
        const earnedXp = activeChallenge.xpReward || 50;
        setStudentXp((prev) => {
          const next = prev + earnedXp;
          try {
            localStorage.setItem('easylearn_student_xp', String(next));
          } catch {}
          return next;
        });
        setAutoResumeCountdown(4);
      } else {
        playFailureBuzz();
        setAutoResumeCountdown(null);
      }
    } catch (err: any) {
      setTestResult({
        passed: false,
        message: 'Validation execution error',
        error: err.message || String(err),
        hint: activeChallenge.hint,
        logs: [],
      });
      playFailureBuzz();
      setAutoResumeCountdown(null);
    } finally {
      setIsTesting(false);
    }
  };

  // Attach audio element reference to hook
  useEffect(() => {
    if (audioElementRef.current) {
      bindAudio(audioElementRef.current);
    }
  }, [bindAudio, activeAudioUrl]);

  // Check for custom scrim passed via sessionStorage from Recording Studio
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('easy_scrim_custom');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.scrimManifest) {
          const finalAudio = parsed.audioUrl || '';
          setManifest(parsed.scrimManifest);
          if (finalAudio) {
            setRecordedAudioUrl(finalAudio);
          }
          loadManifest(parsed.scrimManifest, finalAudio || syntheticAudioUrl);
        }
      }
    } catch (err) {
      console.warn('Could not read session scrim:', err);
    }
  }, [loadManifest, syntheticAudioUrl]);

  // Load published scrim from Supabase if scrimId parameter is present
  useEffect(() => {
    if (!scrimId) return;

    fetchPublishedScrim(scrimId)
      .then((data) => {
        if (data) {
          setManifest(data.manifest);
          if (data.record.audio_url) {
            setRecordedAudioUrl(data.record.audio_url);
          }
          loadManifest(data.manifest, data.record.audio_url);
        }
      })
      .catch((err) => {
        console.warn('Failed to load published scrim from cloud:', err);
      });
  }, [scrimId, loadManifest]);

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
      if (rect.width > 0 && rect.height > 0) {
        const x = Math.max(0, Math.min(rect.width - 24, virtualPointer.relX * rect.width));
        const y = Math.max(0, Math.min(rect.height - 24, virtualPointer.relY * rect.height));
        return { x, y };
      }
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
      const finalAudio = parsed.audioUrl || '';
      if (finalAudio) {
        setRecordedAudioUrl(finalAudio);
      }
      setManifest(finalManifest);
      loadManifest(finalManifest, finalAudio || syntheticAudioUrl);
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
        const finalAudio = parsed.audioUrl || '';
        if (finalAudio) {
          setRecordedAudioUrl(finalAudio);
        }
        setManifest(finalManifest);
        loadManifest(finalManifest, finalAudio || syntheticAudioUrl);
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
        src={activeAudioUrl}
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
          {/* Gamified XP Tracker */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono">{studentXp} XP</span>
          </div>

          {/* Challenges Indicator */}
          {manifest.challenges && manifest.challenges.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-semibold text-indigo-300">
              <Zap className="w-3 h-3 text-indigo-400" />
              <span>
                {completedChallengeIds.length}/{manifest.challenges.length} Challenges Solved
              </span>
            </div>
          )}

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
                {/* Simulated Instructor Cursor */}
                <MousePointer2 className="w-5 h-5 -rotate-45 drop-shadow-md text-indigo-400 fill-indigo-400" />

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

            {/* ── FLOATING INTERACTIVE CHALLENGE BANNER ── */}
            {activeChallenge && showChallengeModal && (
              <div className="absolute inset-x-4 bottom-4 z-40 max-w-2xl mx-auto bg-slate-900/95 backdrop-blur-xl border-2 border-indigo-500/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border-b border-indigo-500/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
                      <Zap className="w-4 h-4 fill-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-wider uppercase bg-gradient-to-r from-indigo-400 to-violet-300 bg-clip-text text-transparent">
                          Interactive Code Challenge
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-400" />
                          +{activeChallenge.xpReward || 50} XP
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Milestone at {formatTime(activeChallenge.timestamp)} • Scrim paused for student challenge
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={dismissChallengeModal}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Minimize prompt to see code full screen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3.5 text-xs text-slate-200">
                  {/* Goal instructions */}
                  <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Your Objective:
                    </span>
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {activeChallenge.instructions}
                    </p>
                    {activeChallenge.targetFile && (
                      <div className="pt-1 flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Target File:</span>
                        <button
                          onClick={() => selectFile(activeChallenge.targetFile!)}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-mono text-[11px] font-bold cursor-pointer"
                        >
                          <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{activeChallenge.targetFile}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Hint Toggle Drawer */}
                  {activeChallenge.hint && (
                    <div className="space-y-1.5">
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{showHint ? 'Hide Hint' : 'Need a hint?'}</span>
                      </button>
                      {showHint && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs font-mono animate-in fade-in duration-150">
                          {activeChallenge.hint}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Test Validation Results Feedback */}
                  {testResult && (
                    <div
                      className={`p-3.5 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-200 ${
                        testResult.passed
                          ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                          : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {testResult.passed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 space-y-1">
                          <p className="font-bold text-sm flex items-center gap-1.5">
                            {testResult.passed && <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />}
                            <span>{testResult.passed ? 'Awesome job! Challenge Passed!' : 'Challenge tests not passing yet'}</span>
                          </p>
                          <p className="text-xs opacity-90">
                            {testResult.error || testResult.message}
                          </p>
                          {testResult.passed && autoResumeCountdown !== null && (
                            <p className="text-[11px] text-emerald-300 font-mono pt-1">
                              Auto-resuming lesson in {autoResumeCountdown}s...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between px-5 py-3 bg-slate-950/90 border-t border-slate-800">
                  <button
                    onClick={skipChallenge}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title="Skip challenge milestone and continue lesson"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    Skip Challenge
                  </button>

                  <div className="flex items-center gap-2">
                    {testResult?.passed ? (
                      <button
                        onClick={() => {
                          completeChallenge(activeChallenge.id || String(activeChallenge.timestamp), true);
                          setTestResult(null);
                        }}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Continue Lesson
                      </button>
                    ) : (
                      <button
                        onClick={handleRunTests}
                        disabled={isTesting}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                      >
                        {isTesting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Running Tests...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Run Tests
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Minimized Floating Challenge Pill */}
            {activeChallenge && !showChallengeModal && (
              <div className="absolute bottom-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <button
                  onClick={reopenChallengeModal}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/40 border border-indigo-400/40 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-white animate-bounce" />
                  <span>Resume Challenge (+{activeChallenge.xpReward || 50} XP)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Interactive Sandbox Preview */}
        {showLivePreview && (
          <div className="w-[45%] flex flex-col border-l border-slate-800 bg-slate-900 min-w-[320px]">
            <CodePreviewIframe
              files={files}
              entryFile="index.html"
              title="Live Interactive Sandbox"
              showConsoleDrawer={true}
              defaultConsoleOpen={false}
            />
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

            {/* Interactive Challenge Milestone Pins */}
            {(manifest.challenges || []).map((ch, idx) => {
              const chPercent = durationMs > 0 ? (ch.timestamp / durationMs) * 100 : 0;
              const isCompleted = completedChallengeIds.includes(ch.id || String(ch.timestamp));
              return (
                <div
                  key={ch.id || idx}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 border-2 shadow-lg cursor-pointer hover:scale-150 transition-all z-20 flex items-center justify-center ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-300 shadow-emerald-500/40'
                      : 'bg-gradient-to-tr from-amber-500 to-rose-500 border-amber-200 animate-pulse shadow-amber-500/50'
                  }`}
                  style={{ left: `${chPercent}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    seekTo(ch.timestamp);
                  }}
                  title={`Challenge #${idx + 1}: ${ch.instructions} (${isCompleted ? 'Solved' : 'Pending'})`}
                >
                  <span className="-rotate-45 flex items-center justify-center">
                    {isCompleted ? (
                      <Check className="w-2 h-2 text-white stroke-[3]" />
                    ) : (
                      <Zap className="w-2 h-2 text-amber-100 fill-amber-100" />
                    )}
                  </span>
                </div>
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
