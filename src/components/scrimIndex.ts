/**
 * Scrim Architecture Components
 * Modularized production-ready sub-components for the Scrim interactive learning engine.
 */

// 1. File Handling
export { default as ScrimFileManager, getFileIcon } from './ScrimFileManager';
export type { ScrimFileManagerProps } from './ScrimFileManager';

// 2. Code Editor
export { default as ScrimCodeEditor, getMonacoLanguage } from './ScrimCodeEditor';
export type { ScrimCodeEditorProps } from './ScrimCodeEditor';

// 3. Web Browser Preview
export { default as ScrimBrowserPreview, buildSandboxHtml } from './ScrimBrowserPreview';
export type { ScrimBrowserPreviewProps } from './ScrimBrowserPreview';

// 4. Audio & Playback Action Controls
export { default as ScrimAudioControls, formatTimeWithTenths } from './ScrimAudioControls';
export type { ScrimAudioControlsProps } from './ScrimAudioControls';

// 5. Unifying Master Connector
export { default as ScrimContainer } from './ScrimContainer';
export type { ScrimContainerProps } from './ScrimContainer';
