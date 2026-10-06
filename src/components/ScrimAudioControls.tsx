import React, { useState, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Clock,
  Zap,
} from 'lucide-react';

export interface ScrimAudioControlsProps {
  isPlaying: boolean;
  currentTimeMs: number;
  durationMs: number;
  playbackRate?: number;
  volume?: number;
  isMuted?: boolean;
  keyframes?: Array<{ timestamp: number; label?: string }>;
  onTogglePlay: () => void;
  onSeek: (targetMs: number) => void;
  onChangePlaybackRate?: (rate: number) => void;
  onChangeVolume?: (vol: number) => void;
  onToggleMute?: () => void;
  onRestart?: () => void;
  showFloatingPlay?: boolean;
  className?: string;
}

/**
 * Format milliseconds into standard mm:ss.s clock representation
 */
export function formatTimeWithTenths(ms: number): string {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((safeMs % 1000) / 100);
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${tenths}`;
}

/**
 * ScrimAudioControls: Master audio player control bar, scrubber timeline,
 * keyframe diamond markers, speed multiplier, volume slider, and hero play/pause action button.
 */
export default function ScrimAudioControls({
  isPlaying,
  currentTimeMs,
  durationMs,
  playbackRate = 1,
  volume = 1,
  isMuted = false,
  keyframes = [],
  onTogglePlay,
  onSeek,
  onChangePlaybackRate,
  onChangeVolume,
  onToggleMute,
  onRestart,
  showFloatingPlay = true,
  className = '',
}: ScrimAudioControlsProps) {
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number>(0);
  const timelineTrackRef = useRef<HTMLDivElement | null>(null);

  const safeDuration = Math.max(100, durationMs);
  const progressPercent = Math.min(100, Math.max(0, (currentTimeMs / safeDuration) * 100));

  // Compute seek position from pointer event
  const calculateSeekMs = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!timelineTrackRef.current) return 0;
      const rect = timelineTrackRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const ratio = rect.width > 0 ? clickX / rect.width : 0;
      return Math.round(ratio * safeDuration);
    },
    [safeDuration]
  );

  const handleTrackMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    const targetMs = calculateSeekMs(e);
    onSeek(targetMs);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const ms = calculateSeekMs(moveEvent);
      onSeek(ms);
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTrackMouseMove = (e: React.MouseEvent) => {
    if (!timelineTrackRef.current) return;
    const rect = timelineTrackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = rect.width > 0 ? x / rect.width : 0;
    setHoverPos(x);
    setHoverTime(Math.round(ratio * safeDuration));
  };

  const handleTrackMouseLeave = () => {
    setHoverTime(null);
  };

  const speedOptions = [0.75, 1, 1.25, 1.5, 2];

  return (
    <div className={`relative flex flex-col font-sans select-none ${className}`}>
      {/* ── Large Floating Center Action Button (when paused) ── */}
      {showFloatingPlay && !isPlaying && (
        <div
          onClick={onTogglePlay}
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
        >
          <button
            type="button"
            className="pointer-events-auto group p-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-2xl shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-sm cursor-pointer"
            title="Play Interactive Class"
          >
            <Play className="w-10 h-10 fill-white ml-1 group-hover:scale-105 transition-transform" />
          </button>
        </div>
      )}

      {/* ── Bottom Control Bar ── */}
      <div className="bg-[#0b0f19]/95 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2.5 flex flex-col gap-2 shadow-2xl">
        {/* Scrubber Timeline Track */}
        <div
          ref={timelineTrackRef}
          onMouseDown={handleTrackMouseDown}
          onMouseMove={handleTrackMouseMove}
          onMouseLeave={handleTrackMouseLeave}
          className="relative w-full h-3 flex items-center cursor-pointer group py-2"
        >
          {/* Background Rail */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden transition-all group-hover:h-2">
            {/* Progress Fill */}
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Scrubber Thumb */}
          <div
            className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md border-2 border-blue-500 top-1/2 -translate-y-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />

          {/* Keyframe Checkpoint Diamonds */}
          {keyframes.map((kf, i) => {
            const kfPos = Math.min(100, Math.max(0, (kf.timestamp / safeDuration) * 100));
            return (
              <div
                key={i}
                title={kf.label || `Keyframe at ${formatTimeWithTenths(kf.timestamp)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(kf.timestamp);
                }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-amber-400 rotate-45 border border-amber-200 shadow-sm cursor-pointer hover:scale-150 transition-transform z-10"
                style={{ left: `${kfPos}%` }}
              />
            );
          })}

          {/* Hover Timestamp Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none"
              style={{ left: `${hoverPos}px` }}
            >
              {formatTimeWithTenths(hoverTime)}
            </div>
          )}
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between text-slate-300">
          {/* Left Actions: Play/Pause, Restart, Timestamps */}
          <div className="flex items-center gap-3">
            {/* Primary Action Button */}
            <button
              type="button"
              onClick={onTogglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            {/* Restart Button */}
            {onRestart && (
              <button
                type="button"
                onClick={onRestart}
                title="Restart from beginning"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Time Indicator */}
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-white font-bold">{formatTimeWithTenths(currentTimeMs)}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{formatTimeWithTenths(durationMs)}</span>
            </div>
          </div>

          {/* Right Actions: Speed Multiplier, Volume, Clock Telemetry */}
          <div className="flex items-center gap-4">
            {/* Speed Multiplier Chips */}
            {onChangePlaybackRate && (
              <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-0.5">
                {speedOptions.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => onChangePlaybackRate(rate)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                      playbackRate === rate
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}

            {/* Volume & Mute Controls */}
            {onToggleMute && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onToggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                {onChangeVolume && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  />
                )}
              </div>
            )}

            {/* Telemetry Clock Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Clock: {Math.round(currentTimeMs)}ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
