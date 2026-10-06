/**
 * Telemetry and Scrim Manifest Type Definitions
 * Designed for rich-text telemetry, Monaco editor synchronization, and audio streaming.
 */

export interface IRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface ContentChangeEvent {
  t: number;
  type: 'content';
  fileId: string;
  range: IRange;
  text: string;
  rangeLength?: number;
  rangeOffset?: number;
}

export interface CursorPositionEvent {
  t: number;
  type: 'cursor';
  fileId: string;
  position: {
    lineNumber: number;
    column: number;
  };
}

export interface CursorSelectionEvent {
  t: number;
  type: 'selection';
  fileId: string;
  selection: {
    selectionStartLineNumber: number;
    selectionStartColumn: number;
    positionLineNumber: number;
    positionColumn: number;
  };
}

export interface PointerEventTelemetry {
  t: number;
  type: 'pointer';
  x: number;
  y: number;
  relX?: number; // Normalized (0-1) across editor viewport for responsive replay
  relY?: number;
  fileId?: string;
}

export interface FileSwitchEvent {
  t: number;
  type: 'file_switch';
  fileId: string;
}

export interface FileDeleteEvent {
  t: number;
  type: 'file_delete';
  fileId: string;
}

export interface FileCreateEvent {
  t: number;
  type: 'file_create';
  fileId: string;
  initialContent?: string;
}

export type ScrimEvent =
  | ContentChangeEvent
  | CursorPositionEvent
  | CursorSelectionEvent
  | PointerEventTelemetry
  | FileSwitchEvent
  | FileDeleteEvent
  | FileCreateEvent;

export interface KeyframeSnapshot {
  t: number;
  files: Record<string, string>;
  activeFile: string;
}

export interface ScrimMetadata {
  title: string;
  description?: string;
  author?: string;
  recordedAt: string;
  duration: number; // in milliseconds
  audioMimeType: string;
  initialActiveFile: string;
  totalEvents: number;
  totalKeyframes: number;
}

export interface ScrimChallenge {
  id?: string;
  timestamp: number; // Milestone timestamp in milliseconds where scrim pauses
  instructions: string; // The challenge prompt / goal for the student
  expectedOutput?: string; // Optional expected console or DOM text output
  testCode?: string; // Optional automated JavaScript assertion test suite
  hint?: string; // Helpful progressive hint shown on test failure
  xpReward?: number; // Experience points rewarded on completion (e.g. 50 XP)
  targetFile?: string; // Specific file to test (e.g. 'script.js' or 'index.html')
}

export interface ScrimCaption {
  t: number;
  prefix?: string;
  highlight?: string;
  suffix?: string;
  text?: string;
}

export interface ScrimManifest {
  version: '1.0.0';
  metadata: ScrimMetadata;
  initialState: {
    files: Record<string, string>;
    activeFile: string;
  };
  keyframes: KeyframeSnapshot[];
  events: ScrimEvent[];
  challenges?: ScrimChallenge[];
  captions?: ScrimCaption[];
}

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';

export interface StopRecordingResult {
  audioBlob: Blob;
  scrimManifest: ScrimManifest;
}

export interface UseScrimRecorderOptions {
  files: Record<string, string>;
  activeFile: string;
  title?: string;
  keyframeIntervalMs?: number; // default: 30000 (30 seconds)
  pointerThrottleMs?: number; // default: 40 (40ms max 25fps)
  audioChunkIntervalMs?: number; // default: 1000ms
  onEvent?: (event: ScrimEvent) => void;
  onKeyframe?: (keyframe: KeyframeSnapshot) => void;
}
