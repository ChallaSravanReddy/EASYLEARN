import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  PanelLeftClose,
  PanelLeft,
  Columns,
  Columns2,
  Maximize2,
  Minimize2,
  ArrowLeft,
  FilePlus,
  FolderPlus,
  Copy,
  Split,
  Maximize,
} from 'lucide-react';
import { useScrimPlayer } from '../hooks/useScrimPlayer';
import { DEMO_SCRIM_MANIFEST, generateSyntheticAudioDataUri } from '../utils/demoScrim';
import type { ScrimManifest, ScrimChallenge, ScrimCaption } from '../types/scrim';
import CodePreviewIframe from './CodePreviewIframe';
import ScrimbaFileIcon from './ScrimbaFileIcon';
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

function formatSimpleTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function ScrimPlayerView() {
  const navigate = useNavigate();
  const playerRootRef = useRef<HTMLDivElement | null>(null);

  // Audio element reference for master clock
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  // Active Scrim Manifest & Audio Source (defaults to rich Demo Scrim)
  const [manifest, setManifest] = useState<ScrimManifest>(DEMO_SCRIM_MANIFEST);
  const [syntheticAudioUrl, setSyntheticAudioUrl] = useState<string>('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string>('');
  const [showManifestModal, setShowManifestModal] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [hoverKeyframe, setHoverKeyframe] = useState<number | null>(null);
  const [newFileName, setNewFileName] = useState<string>('');
  const [showNewFileInput, setShowNewFileInput] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Scrimba UI Layout state (matching reference screenshot)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [previewMode, setPreviewMode] = useState<'pip' | 'split' | 'hidden'>('pip');
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [showConceptSlide, setShowConceptSlide] = useState<boolean>(true);
  const [showExplainModal, setShowExplainModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRootRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

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

  // Dynamic Synchronized Closed Captions (matching Scrimba screenshot)
  const activeCaption = useMemo(() => {
    if (!manifest.captions || manifest.captions.length === 0) {
      if (currentTimeMs >= 5500 && currentTimeMs < 9500) {
        return { prefix: 'using the keyword', highlight: 'let followed', suffix: 'by the custom' };
      }
      if (currentTimeMs >= 9500 && currentTimeMs < 13000) {
        return { prefix: 'Assign your favorite place to', highlight: 'favoritePlace', suffix: 'variable.' };
      }
      if (currentTimeMs >= 13000) {
        return { prefix: 'Configure the AI by setting', highlight: 'temperature', suffix: 'from 0 to 1.' };
      }
      return { prefix: 'Welcome to the', highlight: 'JavaScript Launchpad', suffix: 'starter tutorial.' };
    }
    const current = [...manifest.captions].reverse().find((c) => currentTimeMs >= c.t);
    return current || manifest.captions[0];
  }, [manifest.captions, currentTimeMs]);

  // Scrimba Deep Dark Monaco Theme
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
    <div
      ref={playerRootRef}
      className="flex flex-col h-screen w-full bg-[#0c0d14] text-slate-100 select-none overflow-hidden font-sans relative"
    >
      {/* ── Hidden HTML5 Audio Element (Driven by Audio Master Clock) ── */}
      <audio
        ref={audioElementRef}
        src={activeAudioUrl}
        preload="auto"
        onEnded={() => pause()}
        className="hidden"
      />

      {/* ── Scrimba Top Navigation Bar ── */}
      <header className="h-10 bg-[#12141f] border-b border-slate-800/80 px-3 flex items-center justify-between shrink-0 select-none z-20">
        {/* Left: Back, Logo //, Title breadcrumb, Time capsule */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 font-mono font-bold text-xs select-none">
            //
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-semibold tracking-tight truncate max-w-[180px] sm:max-w-xs">
              {manifest.metadata.title}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              {formatSimpleTime(currentTimeMs)} / {formatSimpleTime(durationMs)}
            </span>
          </div>
        </div>

        {/* Right: EXPLAIN button, layout switchers, XP & Challenges */}
        <div className="flex items-center gap-2">
          {/* AI Explain Button */}
          <button
            onClick={() => setShowExplainModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/70 hover:bg-blue-900/80 text-blue-400 border border-blue-500/40 text-[11px] font-bold tracking-wider uppercase transition-all shadow-sm shadow-blue-500/10 hover:scale-105 active:scale-95"
            title="Ask AI to explain current code line-by-line"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>EXPLAIN</span>
          </button>

          {/* Files Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1 rounded text-xs transition-colors ${
              sidebarOpen ? 'text-slate-200 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={sidebarOpen ? 'Hide Files sidebar' : 'Show Files sidebar'}
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Layout Mode Toggles */}
          <div className="flex items-center bg-slate-900 rounded-md border border-slate-800 p-0.5">
            <button
              onClick={() => setPreviewMode('hidden')}
              className={`p-1 rounded text-xs transition-colors ${
                previewMode === 'hidden' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Code Only"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewMode('split')}
              className={`p-1 rounded text-xs transition-colors ${
                previewMode === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Split View (Docked)"
            >
              <Columns2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewMode('pip')}
              className={`p-1 rounded text-xs transition-colors ${
                previewMode === 'pip' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Mini Browser (Floating PIP)"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Compact XP Tracker */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span className="font-mono">{studentXp} XP</span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative bg-[#0c0d14]">
        {/* Left: Collapsible Scrimba FILES Sidebar */}
        {sidebarOpen && (
          <div className="w-48 sm:w-52 bg-[#0d0f17] border-r border-slate-800/80 flex flex-col shrink-0 select-none">
            {/* Header */}
            <div className="h-8 px-3 flex items-center justify-between border-b border-slate-800/60 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
              <span>FILES</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowNewFileInput(true)}
                  className="p-1 rounded hover:text-white hover:bg-slate-800"
                  title="New File"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inline new file input */}
            {showNewFileInput && (
              <div className="px-2 py-1 bg-slate-900 border-b border-slate-800 flex items-center gap-1">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="filename.ext"
                  className="bg-transparent text-xs text-white focus:outline-none w-full font-mono"
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
            )}

            {/* File List items with Scrimba badges */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
              {Object.keys(files).map((fileName) => {
                const isActive = activeFile === fileName;
                return (
                  <div
                    key={fileName}
                    onClick={() => selectFile(fileName)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[#181c2b] text-white font-medium shadow-sm border border-slate-700/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <ScrimbaFileIcon fileName={fileName} className="w-3.5 h-3.5" />
                    <span className="truncate flex-1">{fileName}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Center: Code Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0c0d14] relative">
          {/* Active File Tab Bar */}
          <div className="h-8 bg-[#0e1017] border-b border-slate-800/80 px-3 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2">
              <ScrimbaFileIcon fileName={activeFile} className="w-3.5 h-3.5" />
              <span className="text-xs font-mono text-slate-200">{activeFile}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              {isPlaying ? (
                <span className="text-indigo-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Live Sync
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Interactive Editor
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
              theme="scrimba-dark"
              beforeMount={handleEditorWillMount}
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
                <MousePointer2 className="w-5 h-5 -rotate-45 drop-shadow-md text-blue-400 fill-blue-400" />

                {/* Instructor Tag Pill */}
                <div className="absolute left-4 top-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-bold tracking-wider shadow-lg border border-blue-400/40 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-ping" />
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

            {/* ── Large Semi-Transparent Center Blue Play Button (Scrimba Signature) ── */}
            {!isPlaying && (!activeChallenge || !showChallengeModal) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  play();
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 transition-all hover:scale-110 active:scale-95 group focus:outline-none cursor-pointer p-4"
                title="Play Scrim"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500/80 hover:bg-blue-500 backdrop-blur-md flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.6)] border border-blue-400/50 transition-all">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white text-white translate-x-0.5" />
                </div>
              </button>
            )}

            {/* ── Floating Modern Browser Preview (PIP) ── */}
            {previewMode === 'pip' && (
              <CodePreviewIframe
                files={files}
                entryFile="index.html"
                title="localhost:3000"
                showConsoleDrawer={false}
                defaultConsoleOpen={false}
                isFloating={true}
                defaultPosition={{ right: 16, top: 16 }}
                defaultSize={{ width: 360, height: 270 }}
                onClose={() => setPreviewMode('hidden')}
                onDock={() => setPreviewMode('split')}
              />
            )}

            {/* ── Floating Concept Diagram / Notes Card (Bottom-Left, Scrimba Signature) ── */}
            {showConceptSlide && (
              <div className="absolute bottom-6 left-6 z-30 w-52 sm:w-60 bg-[#12141f]/95 border border-slate-700/70 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[10px] text-slate-300 select-none">
                  <span className="font-bold uppercase tracking-wider text-slate-400">Concept Diagram</span>
                  <button
                    onClick={() => setShowConceptSlide(false)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                    title="Hide diagram"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-3 bg-slate-950/70 text-slate-300 space-y-2">
                  <div className="flex items-center justify-center gap-2 py-1">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Zap className="w-4 h-4 fill-emerald-400" />
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug text-center font-mono">
                    AI Pipeline: Text Prompt &rarr; Dynamic State &rarr; Live Visual Output
                  </p>
                </div>
              </div>
            )}

            {/* ── Synchronized Closed Captions Pill (Bottom Center, Scrimba Signature) ── */}
            {showCaptions && activeCaption && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none max-w-lg px-4 animate-in fade-in duration-150">
                <div className="px-5 py-2 rounded-full bg-[#12141f]/95 border border-slate-700/60 shadow-2xl backdrop-blur-md text-slate-300 text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <span>{activeCaption.prefix}</span>
                  <span className="text-white font-bold tracking-normal">{activeCaption.highlight}</span>
                  <span>{activeCaption.suffix}</span>
                </div>
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

        {/* Right: Docked Split View Sandbox Preview (300px width in full size window) */}
        {previewMode === 'split' && (
          <div className="w-[300px] flex flex-col border-l border-slate-800 bg-slate-900 shrink-0">
            <CodePreviewIframe
              files={files}
              entryFile="index.html"
              title="localhost:3000"
              showConsoleDrawer={false}
              defaultConsoleOpen={false}
              isFloating={false}
              onDock={() => setPreviewMode('pip')}
            />
          </div>
        )}
      </div>

      {/* ── Bottom Scrimba Timeline & Master Audio Clock Console ── */}
      <footer className="bg-[#12141f] border-t border-slate-800/80 px-4 py-2.5 flex flex-col gap-1.5 shrink-0 select-none z-20">
        {/* Keyframe-Assisted Timeline Scrubber with Scrimba Electric Blue */}
        <div className="relative flex flex-col gap-1">
          <div className="relative flex items-center h-5 group">
            {/* Background Track */}
            <div className="absolute inset-x-0 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              {/* Scrimba Blue Progress Fill */}
              <div
                className="h-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.7)] transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Keyframe Snapshot Markers (O(1) Seek Points) */}
            {manifest.keyframes.map((kf, i) => {
              const kfPercent = durationMs > 0 ? (kf.t / durationMs) * 100 : 0;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 border border-slate-900 shadow-md cursor-pointer hover:scale-150 transition-transform z-10"
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
                className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px] font-mono border border-slate-700 shadow-lg pointer-events-none z-30"
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
            {/* Scrimba Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Skip Back 5s */}
            <button
              onClick={() => seekTo(Math.max(0, currentTimeMs - 5000))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Skip back 5s"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Time Display */}
            <div className="font-mono text-xs text-slate-300 tracking-wider">
              <span className="font-bold text-white">{formatTime(currentTimeMs)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span className="text-slate-400">{formatTime(durationMs)}</span>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center bg-slate-900 rounded-md p-0.5 border border-slate-800 ml-2">
              {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => changePlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Subtitles (CC), Volume, and Clock Telemetry */}
          <div className="flex items-center gap-3">
            {/* CC Subtitle Toggle */}
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={`px-2 py-0.5 rounded font-mono font-bold text-xs transition-colors cursor-pointer ${
                showCaptions
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
              title={showCaptions ? 'Hide Subtitles' : 'Show Subtitles'}
            >
              CC
            </button>

            {/* Volume control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                className="w-16 h-1 bg-slate-800 rounded-lg accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Audio-driven master clock indicator */}
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-[11px] font-mono text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Clock:</span>
              <span className="text-cyan-400 font-semibold">
                {Math.round(currentTimeMs)}ms
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── AI Code Explain Modal ── */}
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
                    Analyzing {activeFile} at {formatSimpleTime(currentTimeMs)}
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
                <code>let name = &quot;Guil Hernandez&quot;;</code>
                <br />
                <code>let favoriteActivity = &quot;snacking&quot;;</code>
                <br />
                <code>generateTextAndImage(name, favoriteActivity, favoritePlace, temperature);</code>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Explanation & Concepts:
                </h4>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-300">
                  <li>
                    <strong className="text-white font-mono">let</strong>: Declares a block-scoped variable in modern JavaScript that can be reassigned later.
                  </li>
                  <li>
                    <strong className="text-white font-mono">temperature</strong>: Controls AI generation creativity (0.0 means consistent and focused, 1.0 means creative and playful).
                  </li>
                  <li>
                    <strong className="text-white font-mono">generateTextAndImage</strong>: Passes user parameters into an AI text & image generator to render the interactive greeting card!
                  </li>
                </ul>
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
