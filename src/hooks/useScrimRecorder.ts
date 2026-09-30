import { useState, useRef, useEffect, useCallback } from 'react';
import type {
  UseScrimRecorderOptions,
  RecordingStatus,
  ScrimEvent,
  KeyframeSnapshot,
  ScrimManifest,
  StopRecordingResult,
  ContentChangeEvent,
  CursorPositionEvent,
  CursorSelectionEvent,
  PointerEventTelemetry,
  FileSwitchEvent,
} from '../types/scrim';

interface MonacoEditorInstance {
  onDidChangeModelContent: (listener: (e: any) => void) => { dispose: () => void };
  onDidChangeCursorPosition: (listener: (e: any) => void) => { dispose: () => void };
  onDidChangeCursorSelection: (listener: (e: any) => void) => { dispose: () => void };
  getDomNode: () => HTMLElement | null;
}

/**
 * Detects the best available audio MIME type with fallback sequence
 */
export const getSupportedAudioMimeType = (): string => {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return '';
  }

  const preferredTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav',
  ];

  for (const mime of preferredTypes) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }

  return '';
};

export function useScrimRecorder(options: UseScrimRecorderOptions) {
  const {
    files: initialFiles,
    activeFile: initialActiveFile,
    title = 'Untitled Scrim Recording',
    keyframeIntervalMs = 30000,
    pointerThrottleMs = 40,
    audioChunkIntervalMs = 1000,
    onEvent,
    onKeyframe,
  } = options;

  // Status & Telemetry State
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [eventCount, setEventCount] = useState<number>(0);
  const [keyframeCount, setKeyframeCount] = useState<number>(0);

  // References for live telemetry and audio capture
  const filesRef = useRef<Record<string, string>>({ ...initialFiles });
  const activeFileRef = useRef<string>(initialActiveFile);
  const statusRef = useRef<RecordingStatus>('idle');
  statusRef.current = status;

  // High-Resolution Time Tracking
  const recordingStartTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const totalPausedDurationRef = useRef<number>(0);
  const lastRecordedTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<any>(null);

  // Audio Capture Refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const resolvedMimeTypeRef = useRef<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Telemetry Event Buffer & Keyframes
  const eventsRef = useRef<ScrimEvent[]>([]);
  const keyframesRef = useRef<KeyframeSnapshot[]>([]);
  const keyframeIntervalRef = useRef<any>(null);
  const lastPointerTimeRef = useRef<number>(0);

  // Monaco Disposables
  const monacoDisposablesRef = useRef<Array<{ dispose: () => void }>>([]);
  const editorContainerRef = useRef<HTMLElement | null>(null);
  const pointerCleanupRef = useRef<(() => void) | null>(null);

  // Sync incoming props to refs
  useEffect(() => {
    filesRef.current = { ...options.files };
  }, [options.files]);

  useEffect(() => {
    activeFileRef.current = options.activeFile;
  }, [options.activeFile]);

  /**
   * Computes the high-resolution elapsed time relative to recording start,
   * adjusted for all paused durations.
   */
  const getRelativeTime = useCallback((): number => {
    if (statusRef.current === 'idle') return 0;
    const now = performance.now();
    const currentPause = statusRef.current === 'paused' ? now - (pauseStartTimeRef.current || now) : 0;
    const relTime = now - recordingStartTimeRef.current - totalPausedDurationRef.current - currentPause;
    const safeRel = Math.max(0, Math.round(relTime * 10) / 10);
    lastRecordedTimeRef.current = safeRel;
    return safeRel;
  }, []);

  /**
   * Emits and buffers a telemetry event
   */
  const recordEvent = useCallback(
    (event: ScrimEvent) => {
      if (statusRef.current !== 'recording') return;
      eventsRef.current.push(event);
      setEventCount(eventsRef.current.length);
      if (onEvent) {
        onEvent(event);
      }
    },
    [onEvent]
  );

  /**
   * Captures a full keyframe snapshot of all files and active tab
   */
  const captureKeyframe = useCallback(
    (explicitTime?: number): KeyframeSnapshot => {
      const t = explicitTime !== undefined ? explicitTime : getRelativeTime();
      const snapshot: KeyframeSnapshot = {
        t,
        files: JSON.parse(JSON.stringify(filesRef.current)),
        activeFile: activeFileRef.current,
      };

      keyframesRef.current.push(snapshot);
      setKeyframeCount(keyframesRef.current.length);
      if (onKeyframe) {
        onKeyframe(snapshot);
      }
      return snapshot;
    },
    [getRelativeTime, onKeyframe]
  );

  /**
   * Starts Web Audio API live meter level analysis
   */
  const setupAudioMeter = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(1, average / 128);
        setAudioLevel(Number(normalized.toFixed(3)));

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (e) {
      console.warn('[useScrimRecorder] Could not initialize Web Audio level meter:', e);
    }
  }, []);

  /**
   * Stops audio metering and closes AudioContext
   */
  const teardownAudioMeter = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  /**
   * Binds Monaco editor events to live telemetry collection
   */
  const bindMonacoEditor = useCallback(
    (editor: MonacoEditorInstance, containerElement?: HTMLElement | null) => {
      // Clean up previous listeners
      monacoDisposablesRef.current.forEach((d) => d.dispose());
      monacoDisposablesRef.current = [];
      if (pointerCleanupRef.current) {
        pointerCleanupRef.current();
        pointerCleanupRef.current = null;
      }

      if (!editor) return;

      editorContainerRef.current = containerElement || editor.getDomNode();

      // 1. Text content deltas
      const contentDisposable = editor.onDidChangeModelContent((event) => {
        if (statusRef.current !== 'recording') return;
        const t = getRelativeTime();

        for (const change of event.changes) {
          const item: ContentChangeEvent = {
            t,
            type: 'content',
            fileId: activeFileRef.current,
            range: {
              startLineNumber: change.range.startLineNumber,
              startColumn: change.range.startColumn,
              endLineNumber: change.range.endLineNumber,
              endColumn: change.range.endColumn,
            },
            text: change.text,
            rangeLength: change.rangeLength,
            rangeOffset: change.rangeOffset,
          };
          recordEvent(item);
        }
      });
      monacoDisposablesRef.current.push(contentDisposable);

      // 2. Cursor position changes
      const cursorDisposable = editor.onDidChangeCursorPosition((event) => {
        if (statusRef.current !== 'recording') return;
        const t = getRelativeTime();

        const item: CursorPositionEvent = {
          t,
          type: 'cursor',
          fileId: activeFileRef.current,
          position: {
            lineNumber: event.position.lineNumber,
            column: event.position.column,
          },
        };
        recordEvent(item);
      });
      monacoDisposablesRef.current.push(cursorDisposable);

      // 3. Selection changes
      const selectionDisposable = editor.onDidChangeCursorSelection((event) => {
        if (statusRef.current !== 'recording') return;
        const sel = event.selection;
        if (sel.isEmpty()) return; // Cursor position event covers non-selected movement

        const t = getRelativeTime();
        const item: CursorSelectionEvent = {
          t,
          type: 'selection',
          fileId: activeFileRef.current,
          selection: {
            selectionStartLineNumber: sel.selectionStartLineNumber,
            selectionStartColumn: sel.selectionStartColumn,
            positionLineNumber: sel.positionLineNumber,
            positionColumn: sel.positionColumn,
          },
        };
        recordEvent(item);
      });
      monacoDisposablesRef.current.push(selectionDisposable);

      // 4. Pointer coordinates over editor container (throttled to max 1 event every 40ms)
      const targetDom = editorContainerRef.current;
      if (targetDom) {
        const handlePointerMove = (e: MouseEvent | PointerEvent) => {
          if (statusRef.current !== 'recording') return;

          const now = performance.now();
          if (now - lastPointerTimeRef.current < pointerThrottleMs) {
            return;
          }
          lastPointerTimeRef.current = now;

          const rect = targetDom.getBoundingClientRect();
          const x = Math.round(e.clientX - rect.left);
          const y = Math.round(e.clientY - rect.top);
          const relX = rect.width > 0 ? Number(((e.clientX - rect.left) / rect.width).toFixed(4)) : 0;
          const relY = rect.height > 0 ? Number(((e.clientY - rect.top) / rect.height).toFixed(4)) : 0;

          const item: PointerEventTelemetry = {
            t: getRelativeTime(),
            type: 'pointer',
            x,
            y,
            relX: Math.max(0, Math.min(1, relX)),
            relY: Math.max(0, Math.min(1, relY)),
            fileId: activeFileRef.current,
          };
          recordEvent(item);
        };

        targetDom.addEventListener('pointermove', handlePointerMove, { passive: true });
        pointerCleanupRef.current = () => {
          targetDom.removeEventListener('pointermove', handlePointerMove);
        };
      }
    },
    [getRelativeTime, pointerThrottleMs, recordEvent]
  );

  /**
   * Switches active file tab and records a file_switch telemetry event
   */
  const switchActiveFile = useCallback(
    (fileId: string) => {
      activeFileRef.current = fileId;
      if (statusRef.current === 'recording') {
        const event: FileSwitchEvent = {
          t: getRelativeTime(),
          type: 'file_switch',
          fileId,
        };
        recordEvent(event);
      }
    },
    [getRelativeTime, recordEvent]
  );

  /**
   * Updates file contents from outside (e.g., when files are added or modified)
   */
  const updateFiles = useCallback((updatedFiles: Record<string, string>) => {
    filesRef.current = { ...updatedFiles };
  }, []);

  /**
   * Start Recording Method
   */
  const startRecording = useCallback(async () => {
    if (statusRef.current === 'recording') return;

    // Reset telemetry buffers
    eventsRef.current = [];
    keyframesRef.current = [];
    audioChunksRef.current = [];
    totalPausedDurationRef.current = 0;
    pauseStartTimeRef.current = 0;
    setEventCount(0);
    setKeyframeCount(0);
    setElapsedTime(0);

    // 1. Audio stream acquisition
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
    } catch (err: any) {
      console.error('[useScrimRecorder] Microphone access denied or unavailable:', err);
      throw new Error(`Microphone access failed: ${err.message || 'Permission denied'}`);
    }

    // 2. Select MIME type
    const mimeType = getSupportedAudioMimeType();
    resolvedMimeTypeRef.current = mimeType;

    const recorderOptions: MediaRecorderOptions = {};
    if (mimeType) {
      recorderOptions.mimeType = mimeType;
    }

    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(stream, recorderOptions);
    } catch (e) {
      console.warn('[useScrimRecorder] Preferred MIME failed. Falling back to default MediaRecorder options.', e);
      mediaRecorder = new MediaRecorder(stream);
      resolvedMimeTypeRef.current = mediaRecorder.mimeType || 'audio/webm';
    }

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current = mediaRecorder;

    // 3. Audio Metering Setup
    setupAudioMeter(stream);

    // 4. Start high-resolution timing
    recordingStartTimeRef.current = performance.now();
    statusRef.current = 'recording';
    setStatus('recording');

    // 5. Start MediaRecorder with 1000ms chunks
    mediaRecorder.start(audioChunkIntervalMs);

    // 6. Capture initial keyframe at t = 0
    captureKeyframe(0);

    // 7. Start 30-second keyframe snapshot interval
    if (keyframeIntervalRef.current) clearInterval(keyframeIntervalRef.current);
    keyframeIntervalRef.current = setInterval(() => {
      if (statusRef.current === 'recording') {
        captureKeyframe();
      }
    }, keyframeIntervalMs);

    // 8. Live UI timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      if (statusRef.current === 'recording') {
        setElapsedTime(getRelativeTime());
      }
    }, 100);
  }, [audioChunkIntervalMs, captureKeyframe, getRelativeTime, keyframeIntervalMs, setupAudioMeter]);

  /**
   * Pause Recording Method
   */
  const pauseRecording = useCallback(() => {
    if (statusRef.current !== 'recording') return;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }

    pauseStartTimeRef.current = performance.now();
    statusRef.current = 'paused';
    setStatus('paused');
    setAudioLevel(0);
  }, []);

  /**
   * Resume Recording Method
   */
  const resumeRecording = useCallback(() => {
    if (statusRef.current !== 'paused') return;

    const pauseDuration = performance.now() - pauseStartTimeRef.current;
    totalPausedDurationRef.current += pauseDuration;
    pauseStartTimeRef.current = 0;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }

    statusRef.current = 'recording';
    setStatus('recording');
  }, []);

  /**
   * Stop Recording Method
   * Resolves to { audioBlob: Blob, scrimManifest: ScrimManifest }
   */
  const stopRecording = useCallback((): Promise<StopRecordingResult> => {
    return new Promise((resolve, reject) => {
      if (statusRef.current === 'idle' || statusRef.current === 'stopped') {
        reject(new Error('Recorder is not active.'));
        return;
      }

      const finalDuration = getRelativeTime();

      // Capture final keyframe snapshot
      captureKeyframe(finalDuration);

      // Clean up timers
      if (keyframeIntervalRef.current) {
        clearInterval(keyframeIntervalRef.current);
        keyframeIntervalRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      teardownAudioMeter();

      const recorder = mediaRecorderRef.current;

      const finalize = () => {
        // Stop audio tracks
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }

        const mime = resolvedMimeTypeRef.current || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });

        const manifest: ScrimManifest = {
          version: '1.0.0',
          metadata: {
            title,
            recordedAt: new Date().toISOString(),
            duration: finalDuration,
            audioMimeType: mime,
            initialActiveFile,
            totalEvents: eventsRef.current.length,
            totalKeyframes: keyframesRef.current.length,
          },
          initialState: {
            files: JSON.parse(JSON.stringify(initialFiles)),
            activeFile: initialActiveFile,
          },
          keyframes: [...keyframesRef.current],
          events: [...eventsRef.current],
        };

        statusRef.current = 'stopped';
        setStatus('stopped');
        setElapsedTime(finalDuration);

        resolve({
          audioBlob,
          scrimManifest: manifest,
        });
      };

      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = finalize;
        try {
          recorder.stop();
        } catch (e) {
          finalize();
        }
      } else {
        finalize();
      }
    });
  }, [captureKeyframe, getRelativeTime, initialActiveFile, initialFiles, teardownAudioMeter, title]);

  // Cleanup on hook unmount
  useEffect(() => {
    return () => {
      if (keyframeIntervalRef.current) clearInterval(keyframeIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      monacoDisposablesRef.current.forEach((d) => d.dispose());
      if (pointerCleanupRef.current) pointerCleanupRef.current();
      teardownAudioMeter();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [teardownAudioMeter]);

  return {
    status,
    elapsedTime,
    audioLevel,
    eventCount,
    keyframeCount,
    events: eventsRef.current,
    keyframes: keyframesRef.current,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    captureKeyframe,
    bindMonacoEditor,
    switchActiveFile,
    updateFiles,
    getRelativeTime,
  };
}
