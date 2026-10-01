import { useState, useRef, useEffect, useCallback } from 'react';
import type {
  ScrimManifest,
  ScrimEvent,
  KeyframeSnapshot,
  ContentChangeEvent,
  CursorPositionEvent,
  CursorSelectionEvent,
  PointerEventTelemetry,
  FileSwitchEvent,
} from '../types/scrim';

export interface VirtualPointerState {
  x: number;
  y: number;
  relX?: number;
  relY?: number;
  visible: boolean;
  lastUpdated: number;
}

export interface UseScrimPlayerOptions {
  manifest?: ScrimManifest | null;
  audioElement?: HTMLAudioElement | null;
  audioSrc?: string;
  onActiveFileChange?: (fileId: string) => void;
  onCodeChange?: (files: Record<string, string>, activeFile: string) => void;
  onBranchRequired?: (options: {
    revert: () => void;
    keepChanges: () => void;
    cancel: () => void;
  }) => void;
}

export function useScrimPlayer(options: UseScrimPlayerOptions = {}) {
  const {
    manifest: initialManifest,
    audioElement: initialAudioElement,
    audioSrc: initialAudioSrc,
    onActiveFileChange,
    onCodeChange,
    onBranchRequired,
  } = options;

  // Active Manifest & Audio Source
  const [manifest, setManifest] = useState<ScrimManifest | null>(initialManifest ?? null);
  const [audioUrl, setAudioUrl] = useState<string>(initialAudioSrc || '');

  // Core Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);
  const [durationMs, setDurationMs] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Editor and Files State
  const [activeFile, setActiveFile] = useState<string>('');
  const [files, setFiles] = useState<Record<string, string>>({});
  const [virtualPointer, setVirtualPointer] = useState<VirtualPointerState | null>(null);

  // Edit-on-Pause & State Branching State
  const [isStudentModified, setIsStudentModified] = useState<boolean>(false);
  const [isForked, setIsForked] = useState<boolean>(false);
  const [showBranchModal, setShowBranchModal] = useState<boolean>(false);

  // References for zero-latency rAF animation & O(1) seeking
  const manifestRef = useRef<ScrimManifest | null>(manifest);
  manifestRef.current = manifest;

  const audioRef = useRef<HTMLAudioElement | null>(initialAudioElement ?? null);
  const rAfIdRef = useRef<number | null>(null);
  const nextEventIndexRef = useRef<number>(0);
  const filesRef = useRef<Record<string, string>>({});
  const activeFileRef = useRef<string>('');

  // Monaco Editor Reference
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const isProgrammaticEditRef = useRef<boolean>(false);

  // Edit-on-pause baseline tracking
  const baselineCodeOnPauseRef = useRef<Record<string, string>>({});
  const isStudentModifiedRef = useRef<boolean>(false);
  isStudentModifiedRef.current = isStudentModified;
  const isForkedRef = useRef<boolean>(false);
  isForkedRef.current = isForked;

  /**
   * Binds the HTML5 <audio> element reference
   */
  const bindAudio = useCallback((element: HTMLAudioElement | null) => {
    audioRef.current = element;
    if (element) {
      element.playbackRate = playbackSpeed;
      element.volume = isMuted ? 0 : volume;
      if (audioUrl && element.src !== audioUrl) {
        element.src = audioUrl;
        element.load();
      }
    }
  }, [playbackSpeed, volume, isMuted, audioUrl]);

  /**
   * Initialize or update manifest state
   */
  const loadManifest = useCallback((newManifest: ScrimManifest, newAudioUrl?: string) => {
    setManifest(newManifest);
    manifestRef.current = newManifest;

    const targetAudioUrl = newAudioUrl || '';
    if (targetAudioUrl) {
      setAudioUrl(targetAudioUrl);
      if (audioRef.current) {
        if (audioRef.current.src !== targetAudioUrl) {
          audioRef.current.src = targetAudioUrl;
        }
        audioRef.current.currentTime = 0;
        audioRef.current.load();
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }

    const initFiles = JSON.parse(JSON.stringify(newManifest.initialState.files));
    const initActive = newManifest.initialState.activeFile;

    filesRef.current = initFiles;
    activeFileRef.current = initActive;
    baselineCodeOnPauseRef.current = JSON.parse(JSON.stringify(initFiles));

    setFiles(initFiles);
    setActiveFile(initActive);
    setDurationMs(newManifest.metadata.duration);
    setCurrentTimeMs(0);
    setVirtualPointer(null);
    nextEventIndexRef.current = 0;
    setIsStudentModified(false);
    setIsForked(false);
    setShowBranchModal(false);

    if (editorRef.current && initFiles[initActive] !== undefined) {
      isProgrammaticEditRef.current = true;
      editorRef.current.setValue(initFiles[initActive]);
      isProgrammaticEditRef.current = false;
    }

    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  // Update when initialManifest or initialAudioSrc changes from props
  useEffect(() => {
    if (initialManifest) {
      loadManifest(initialManifest, initialAudioSrc);
    }
  }, [initialManifest, initialAudioSrc, loadManifest]);

  /**
   * Binds Monaco editor instance & global monaco API
   */
  const bindEditor = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Detect user edits while paused
    editor.onDidChangeModelContent(() => {
      if (isProgrammaticEditRef.current) return;

      const currentVal = editor.getValue();
      const currentActive = activeFileRef.current;
      filesRef.current[currentActive] = currentVal;

      // Compare current code against baseline captured at pause
      const baseline = baselineCodeOnPauseRef.current;
      const hasModification = Object.keys(filesRef.current).some(
        (key) => filesRef.current[key] !== (baseline[key] ?? '')
      );

      setIsStudentModified(hasModification);
      setFiles({ ...filesRef.current });

      if (onCodeChange) {
        onCodeChange(filesRef.current, currentActive);
      }
    });
  }, [onCodeChange]);

  /**
   * Applies an individual delta event to the editor and in-memory files
   */
  const applyEvent = useCallback((event: ScrimEvent) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    switch (event.type) {
      case 'content': {
        // If student forked the session, do not clobber student's custom edits
        if (isForkedRef.current) {
          return;
        }

        const targetFile = event.fileId;
        const currentCode = filesRef.current[targetFile] || '';

        // If target file is currently active and editor is mounted, apply delta via Monaco executeEdits
        if (editor && monaco && activeFileRef.current === targetFile) {
          isProgrammaticEditRef.current = true;
          const range = new monaco.Range(
            event.range.startLineNumber,
            event.range.startColumn,
            event.range.endLineNumber,
            event.range.endColumn
          );

          editor.executeEdits('scrim-player', [
            {
              range,
              text: event.text,
              forceMoveMarkers: true,
            },
          ]);

          filesRef.current[targetFile] = editor.getValue();
          isProgrammaticEditRef.current = false;
        } else {
          // Off-screen delta: apply string splicing in memory
          const lines = currentCode.split('\n');
          const startL = event.range.startLineNumber - 1;
          const startC = event.range.startColumn - 1;
          const endL = event.range.endLineNumber - 1;
          const endC = event.range.endColumn - 1;

          if (lines[startL] !== undefined) {
            const before = (lines[startL] || '').slice(0, startC);
            const after = (lines[endL] || '').slice(endC);
            const newText = before + event.text + after;
            lines.splice(startL, endL - startL + 1, newText);
            filesRef.current[targetFile] = lines.join('\n');
          }
        }
        break;
      }

      case 'cursor': {
        if (editor && activeFileRef.current === event.fileId) {
          editor.setPosition({
            lineNumber: event.position.lineNumber,
            column: event.position.column,
          });
          editor.revealPositionInCenterIfOutsideViewport({
            lineNumber: event.position.lineNumber,
            column: event.position.column,
          });
        }
        break;
      }

      case 'selection': {
        if (editor && monaco && activeFileRef.current === event.fileId) {
          const range = new monaco.Range(
            event.selection.selectionStartLineNumber,
            event.selection.selectionStartColumn,
            event.selection.positionLineNumber,
            event.selection.positionColumn
          );
          editor.setSelection(range);
          editor.revealRangeInCenterIfOutsideViewport(range);
        }
        break;
      }

      case 'pointer': {
        setVirtualPointer({
          x: event.x,
          y: event.y,
          relX: event.relX,
          relY: event.relY,
          visible: true,
          lastUpdated: performance.now(),
        });
        break;
      }

      case 'file_switch': {
        const newFile = event.fileId;
        activeFileRef.current = newFile;
        setActiveFile(newFile);
        if (editor && filesRef.current[newFile] !== undefined) {
          isProgrammaticEditRef.current = true;
          editor.setValue(filesRef.current[newFile]);
          isProgrammaticEditRef.current = false;
        }
        if (onActiveFileChange) {
          onActiveFileChange(newFile);
        }
        break;
      }
    }
  }, [onActiveFileChange]);

  /**
   * Keyframe-Assisted Scrubbing / Seeking (O(1)):
   * 1. Finds the latest keyframe where keyframe.t <= targetTimeMs
   * 2. Resets Monaco editor buffer with keyframe.files snapshot in one operation (editor.setValue())
   * 3. Fast-forwards and applies only the deltas between keyframe.t and targetTimeMs
   * 4. Updates event pointer index nextEventIndexRef (avoids quadratic O(N^2) iterations)
   */
  const seekTo = useCallback(
    (targetTimeMs: number) => {
      const curManifest = manifestRef.current;
      if (!curManifest) return;

      const clampedTarget = Math.max(0, Math.min(targetTimeMs, curManifest.metadata.duration));
      const editor = editorRef.current;

      // a) Find latest keyframe with keyframe.t <= clampedTarget
      const keyframes = curManifest.keyframes;
      let targetKeyframe: KeyframeSnapshot | null = null;

      for (let i = keyframes.length - 1; i >= 0; i--) {
        if (keyframes[i].t <= clampedTarget) {
          targetKeyframe = keyframes[i];
          break;
        }
      }

      // Default to initial state if no keyframe found before clampedTarget
      const baseFiles = targetKeyframe
        ? JSON.parse(JSON.stringify(targetKeyframe.files))
        : JSON.parse(JSON.stringify(curManifest.initialState.files));

      const baseActive = targetKeyframe ? targetKeyframe.activeFile : curManifest.initialState.activeFile;
      const keyframeTime = targetKeyframe ? targetKeyframe.t : 0;

      // b) Reset Monaco editor buffer with keyframe file snapshot in one operation
      filesRef.current = baseFiles;
      activeFileRef.current = baseActive;
      setFiles(baseFiles);
      setActiveFile(baseActive);

      if (editor && baseFiles[baseActive] !== undefined) {
        isProgrammaticEditRef.current = true;
        editor.setValue(baseFiles[baseActive]);
        isProgrammaticEditRef.current = false;
      }

      // c) Fast-forward and apply only the deltas between keyframeTime and clampedTarget
      const events = curManifest.events;
      let idx = 0;

      // Fast jump: locate first event after keyframeTime
      while (idx < events.length && events[idx].t < keyframeTime) {
        idx++;
      }

      // Apply deltas up to clampedTarget
      while (idx < events.length && events[idx].t <= clampedTarget) {
        applyEvent(events[idx]);
        idx++;
      }

      nextEventIndexRef.current = idx;
      setCurrentTimeMs(clampedTarget);

      // Update virtual pointer position to the latest pointer telemetry event at or before target
      let latestPointer: PointerEventTelemetry | null = null;
      for (let pIdx = Math.min(idx - 1, events.length - 1); pIdx >= 0; pIdx--) {
        if (events[pIdx] && events[pIdx].t <= clampedTarget && events[pIdx].type === 'pointer') {
          latestPointer = events[pIdx] as PointerEventTelemetry;
          break;
        }
      }
      if (latestPointer) {
        setVirtualPointer({
          x: latestPointer.x,
          y: latestPointer.y,
          relX: latestPointer.relX,
          relY: latestPointer.relY,
          visible: clampedTarget - latestPointer.t <= 2500,
          lastUpdated: performance.now(),
        });
      } else {
        setVirtualPointer(null);
      }

      // Reset student modified flag on seek & snapshot new baseline
      setIsStudentModified(false);
      setShowBranchModal(false);
      baselineCodeOnPauseRef.current = JSON.parse(JSON.stringify(filesRef.current));

      // Synchronize audio element currentTime if not already at target
      const audio = audioRef.current;
      if (audio) {
        const audioTargetSec = clampedTarget / 1000;
        if (Math.abs(audio.currentTime - audioTargetSec) > 0.05) {
          audio.currentTime = audioTargetSec;
        }
      }

      if (onCodeChange) {
        onCodeChange(filesRef.current, activeFileRef.current);
      }
    },
    [applyEvent, onCodeChange]
  );

  /**
   * AUDIO-DRIVEN MASTER CLOCK:
   * HTML5 <audio> element's currentTime is the single source of truth.
   * Driven exclusively by requestAnimationFrame; NEVER uses setInterval.
   */
  const startRafLoop = useCallback(() => {
    if (rAfIdRef.current) cancelAnimationFrame(rAfIdRef.current);

    const tick = () => {
      const audio = audioRef.current;
      const curManifest = manifestRef.current;

      if (!audio || !curManifest || audio.paused || audio.ended) {
        setIsPlaying(false);
        return;
      }

      // 1. Single source of truth: audio.currentTime converted to ms
      const audioTimeMs = audio.currentTime * 1000;
      setCurrentTimeMs(audioTimeMs);

      // Boundary check: enforce stopping exactly at manifest duration
      if (curManifest.metadata.duration > 0 && audioTimeMs >= curManifest.metadata.duration) {
        audio.pause();
        audio.currentTime = curManifest.metadata.duration / 1000;
        setCurrentTimeMs(curManifest.metadata.duration);
        setIsPlaying(false);
        return;
      }

      // 2. Dispatch events up to audioTimeMs using linear index pointer
      const events = curManifest.events;
      let idx = nextEventIndexRef.current;

      // If user scrubbed externally in audio controls or large time jump occurred, resync via seekTo
      if (idx > 0 && idx < events.length && events[idx - 1].t > audioTimeMs + 400) {
        seekTo(audioTimeMs);
        rAfIdRef.current = requestAnimationFrame(tick);
        return;
      }

      while (idx < events.length && events[idx].t <= audioTimeMs) {
        applyEvent(events[idx]);
        idx++;
      }
      nextEventIndexRef.current = idx;

      // Fade out virtual pointer if idle for more than 1500ms
      setVirtualPointer((prev) => {
        if (prev && prev.visible && performance.now() - prev.lastUpdated > 1500) {
          return { ...prev, visible: false };
        }
        return prev;
      });

      rAfIdRef.current = requestAnimationFrame(tick);
    };

    rAfIdRef.current = requestAnimationFrame(tick);
  }, [applyEvent, seekTo]);

  const stopRafLoop = useCallback(() => {
    if (rAfIdRef.current) {
      cancelAnimationFrame(rAfIdRef.current);
      rAfIdRef.current = null;
    }
  }, []);

  /**
   * Pause action: captures baseline code for Edit-on-Pause detection
   */
  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
    }
    stopRafLoop();
    setIsPlaying(false);

    // Save baseline snapshot of current code to track student modifications
    baselineCodeOnPauseRef.current = JSON.parse(JSON.stringify(filesRef.current));
  }, [stopRafLoop]);

  /**
   * Play action with State Branching (Edit-on-Pause) detection
   */
  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Detect if student modified the code while paused
    if (isStudentModifiedRef.current && !isForkedRef.current) {
      // Trigger state branching modal
      setShowBranchModal(true);
      if (onBranchRequired) {
        onBranchRequired({
          revert: () => revertAndPlay(),
          keepChanges: () => keepChangesAndPlay(),
          cancel: () => setShowBranchModal(false),
        });
      }
      return;
    }

    // Direct resume
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        startRafLoop();
      })
      .catch((err) => {
        console.warn('[useScrimPlayer] Audio playback was blocked or failed:', err);
      });
  }, [onBranchRequired, startRafLoop]);

  /**
   * Branch resolution: Revert student modifications back to instructor's code at currentTime
   */
  const revertAndPlay = useCallback(() => {
    setShowBranchModal(false);
    setIsStudentModified(false);
    setIsForked(false);

    // Revert code to instructor's state at current audio timestamp
    const audio = audioRef.current;
    const currentAudioMs = audio ? audio.currentTime * 1000 : currentTimeMs;
    seekTo(currentAudioMs);

    // Resume playback
    if (audio) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          startRafLoop();
        })
        .catch(console.warn);
    }
  }, [currentTimeMs, seekTo, startRafLoop]);

  /**
   * Branch resolution: Keep student modifications and fork timeline
   */
  const keepChangesAndPlay = useCallback(() => {
    setShowBranchModal(false);
    setIsStudentModified(false);
    setIsForked(true);

    // Continue playback with student's modified code in editor
    const audio = audioRef.current;
    if (audio) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          startRafLoop();
        })
        .catch(console.warn);
    }
  }, [startRafLoop]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  /**
   * Sets playback rate (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
   */
  const changePlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  /**
   * Volume controls
   */
  const changeVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    setIsMuted(clamped === 0);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) {
        audioRef.current.volume = volume || 1;
      }
    } else {
      setIsMuted(true);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
  }, [isMuted, volume]);

  /**
   * Switch active file tab manually
   */
  const selectFile = useCallback((fileName: string) => {
    activeFileRef.current = fileName;
    setActiveFile(fileName);
    if (editorRef.current && filesRef.current[fileName] !== undefined) {
      isProgrammaticEditRef.current = true;
      editorRef.current.setValue(filesRef.current[fileName]);
      isProgrammaticEditRef.current = false;
    }
  }, []);

  /**
   * Direct student code update (e.g. from editor or external component)
   */
  const updateFileCode = useCallback((fileName: string, newCode: string) => {
    filesRef.current[fileName] = newCode;
    setFiles({ ...filesRef.current });

    const baseline = baselineCodeOnPauseRef.current;
    const hasDiff = Object.keys(filesRef.current).some(
      (key) => filesRef.current[key] !== (baseline[key] ?? '')
    );
    setIsStudentModified(hasDiff);

    if (activeFileRef.current === fileName && editorRef.current) {
      if (editorRef.current.getValue() !== newCode) {
        isProgrammaticEditRef.current = true;
        editorRef.current.setValue(newCode);
        isProgrammaticEditRef.current = false;
      }
    }
  }, []);

  /**
   * Manual Revert: restore code to instructor's state at current audio timestamp
   */
  const revertToInstructor = useCallback(() => {
    const audio = audioRef.current;
    const curMs = audio ? audio.currentTime * 1000 : currentTimeMs;
    seekTo(curMs);
    setIsForked(false);
    setIsStudentModified(false);
  }, [currentTimeMs, seekTo]);

  /**
   * Add student custom file
   */
  const addNewFile = useCallback((fileName: string, initialContent = '') => {
    if (!fileName || filesRef.current[fileName] !== undefined) return false;
    filesRef.current[fileName] = initialContent;
    setFiles({ ...filesRef.current });
    selectFile(fileName);
    setIsStudentModified(true);
    return true;
  }, [selectFile]);

  /**
   * Delete student file
   */
  const deleteFile = useCallback((fileName: string) => {
    if (!filesRef.current[fileName]) return false;
    const remaining = { ...filesRef.current };
    delete remaining[fileName];
    filesRef.current = remaining;
    setFiles(remaining);

    if (activeFileRef.current === fileName) {
      const firstKey = Object.keys(remaining)[0] || '';
      selectFile(firstKey);
    }
    setIsStudentModified(true);
    return true;
  }, [selectFile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRafLoop();
    };
  }, [stopRafLoop]);

  return {
    // Playback state
    isPlaying,
    currentTimeMs,
    durationMs,
    playbackSpeed,
    volume,
    isMuted,
    audioUrl,

    // File & Editor state
    files,
    activeFile,
    virtualPointer,

    // State branching & edit-on-pause
    isStudentModified,
    isForked,
    showBranchModal,

    // Actions & Methods
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
    cancelBranchModal: () => setShowBranchModal(false),
  };
}
