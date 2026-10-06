import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  Maximize2,
  Minimize2,
  Columns,
  Radio,
  Sparkles,
  Code2,
  Layers,
  HelpCircle,
} from 'lucide-react';
import ScrimFileManager from './ScrimFileManager';
import ScrimCodeEditor from './ScrimCodeEditor';
import ScrimBrowserPreview from './ScrimBrowserPreview';
import ScrimAudioControls from './ScrimAudioControls';

export interface ScrimContainerProps {
  title?: string;
  files: Record<string, string>;
  activeFile: string;
  onSelectFile: (fileName: string) => void;
  onFileChange?: (fileName: string, content: string) => void;
  onCreateFile?: (fileName: string, initialContent?: string) => void;
  onDeleteFile?: (fileName: string) => void;

  // Audio & Playback props
  isPlaying?: boolean;
  currentTimeMs?: number;
  durationMs?: number;
  playbackRate?: number;
  volume?: number;
  isMuted?: boolean;
  keyframes?: Array<{ timestamp: number; label?: string }>;
  onTogglePlay?: () => void;
  onSeek?: (targetMs: number) => void;
  onChangePlaybackRate?: (rate: number) => void;
  onChangeVolume?: (vol: number) => void;
  onToggleMute?: () => void;
  onRestart?: () => void;

  // State & Flags
  readOnly?: boolean;
  isPaused?: boolean;
  isRecording?: boolean;
  browserAspectRatio?: '4:3' | '16:9' | 'responsive';

  // Navigation & Slots
  onBack?: () => void;
  headerRightSlot?: React.ReactNode;
  overlaySlot?: React.ReactNode;
  className?: string;
}

/**
 * ScrimContainer: The unifying master orchestrator component.
 * Connects the File Manager, Monaco Code Editor, Authentic Web Browser,
 * and Audio Playback Controls in a high-performance responsive multi-pane layout.
 */
export default function ScrimContainer({
  title = 'Interactive Scrim Class',
  files,
  activeFile,
  onSelectFile,
  onFileChange,
  onCreateFile,
  onDeleteFile,

  isPlaying = false,
  currentTimeMs = 0,
  durationMs = 0,
  playbackRate = 1,
  volume = 1,
  isMuted = false,
  keyframes = [],
  onTogglePlay = () => {},
  onSeek = () => {},
  onChangePlaybackRate,
  onChangeVolume,
  onToggleMute,
  onRestart,

  readOnly = false,
  isPaused = false,
  isRecording = false,
  browserAspectRatio = '4:3',

  onBack,
  headerRightSlot,
  overlaySlot,
  className = '',
}: ScrimContainerProps) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col w-full h-screen bg-[#07090e] text-slate-100 overflow-hidden font-sans select-none ${className}`}
    >
      {/* ── Top Header Navigation ── */}
      <header className="h-12 bg-[#0b0f19] border-b border-slate-800 flex items-center justify-between px-4 z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title="Go back"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="font-bold text-sm tracking-tight text-white truncate max-w-xs md:max-w-md">
              {title}
            </h1>
          </div>

          {/* Mode Pill */}
          {isRecording ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>Studio Recording</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Interactive Telemetry</span>
            </div>
          )}
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {headerRightSlot}

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Main Multi-Pane Workspace ── */}
      <div className="relative flex-1 flex w-full min-h-0 overflow-hidden">
        {/* 1. File Handling Component (Sidebar) */}
        <ScrimFileManager
          files={files}
          activeFile={activeFile}
          onSelectFile={onSelectFile}
          onCreateFile={onCreateFile}
          onDeleteFile={onDeleteFile}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isRecording={isRecording}
          readOnly={readOnly}
          showTabs={false}
          showSidebar={true}
        />

        {/* 2. Middle Editor + Browser Preview Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Tabs */}
          <ScrimFileManager
            files={files}
            activeFile={activeFile}
            onSelectFile={onSelectFile}
            onCreateFile={onCreateFile}
            onDeleteFile={onDeleteFile}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isRecording={isRecording}
            readOnly={readOnly}
            showTabs={true}
            showSidebar={false}
          />

          {/* Editor and Browser Split */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
            {/* Code Editor Component */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0 border-r border-slate-800/80">
              <ScrimCodeEditor
                files={files}
                activeFile={activeFile}
                onFileChange={onFileChange}
                readOnly={readOnly}
                isPaused={isPaused}
                isRecording={isRecording}
              />
            </div>

            {/* Web Browser Component */}
            <div className="w-full lg:w-[460px] xl:w-[500px] flex-shrink-0 bg-[#070b13] p-3 flex flex-col items-center justify-center overflow-auto border-t lg:border-t-0 border-slate-800">
              <ScrimBrowserPreview
                files={files}
                activeFile={activeFile}
                aspectRatio={browserAspectRatio}
              />
            </div>
          </div>
        </div>

        {/* Floating Play Button Overlay when Paused */}
        {!isPlaying && durationMs > 0 && onTogglePlay && (
          <div
            onClick={onTogglePlay}
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          >
            <button
              type="button"
              className="pointer-events-auto group p-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-2xl shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-sm cursor-pointer"
              title="Play Interactive Class"
            >
              <Play className="w-8 h-8 fill-white ml-1 group-hover:scale-105 transition-transform" />
            </button>
          </div>
        )}

        {/* Custom Overlays (e.g. Concept Diagram, Challenge Dialogs) */}
        {overlaySlot}
      </div>

      {/* ── Audio & Action Button Component (Bottom Timeline Bar) ── */}
      {durationMs > 0 && (
        <ScrimAudioControls
          isPlaying={isPlaying}
          currentTimeMs={currentTimeMs}
          durationMs={durationMs}
          playbackRate={playbackRate}
          volume={volume}
          isMuted={isMuted}
          keyframes={keyframes}
          onTogglePlay={onTogglePlay}
          onSeek={onSeek}
          onChangePlaybackRate={onChangePlaybackRate}
          onChangeVolume={onChangeVolume}
          onToggleMute={onToggleMute}
          onRestart={onRestart}
          showFloatingPlay={false} // Handled above in main workspace
        />
      )}
    </div>
  );
}
