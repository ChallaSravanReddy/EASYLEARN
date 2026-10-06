import React, { useRef, useEffect, useCallback } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import {
  Code2,
  CheckCircle2,
  Radio,
  Sparkles,
  Cpu,
  FileCode,
} from 'lucide-react';

export interface ScrimCodeEditorProps {
  files: Record<string, string>;
  activeFile: string;
  onFileChange?: (fileName: string, newContent: string) => void;
  onCursorChange?: (fileName: string, position: { lineNumber: number; column: number }) => void;
  onSelectionChange?: (fileName: string, selection: { startLine: number; startColumn: number; endLine: number; endColumn: number }) => void;
  readOnly?: boolean;
  isPaused?: boolean;
  isRecording?: boolean;
  onEditorReady?: (editor: any, monaco: Monaco) => void;
  theme?: string;
  fontSize?: number;
  className?: string;
}

/**
 * Maps filename extension to Monaco language identifier
 */
export function getMonacoLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
    case 'scss':
      return 'css';
    case 'json':
      return 'json';
    case 'py':
      return 'python';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
}

/**
 * ScrimCodeEditor: Production-ready Monaco Editor component managing native
 * URI models, multi-file switching, undo/redo preservation, and telemetry tracking.
 */
export default function ScrimCodeEditor({
  files,
  activeFile,
  onFileChange,
  onCursorChange,
  onSelectionChange,
  readOnly = false,
  isPaused = false,
  isRecording = false,
  onEditorReady,
  theme = 'vs-dark',
  fontSize = 13.5,
  className = '',
}: ScrimCodeEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const modelsRef = useRef<Map<string, any>>(new Map());
  const viewStatesRef = useRef<Map<string, any>>(new Map());
  const activeFileRef = useRef<string>(activeFile);
  activeFileRef.current = activeFile;

  // Handle Monaco editor mounting
  const handleEditorMount = useCallback((editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom EasyLearn dark theme
    monaco.editor.defineTheme('easylearn-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'identifier', foreground: 'f8f8f2' },
      ],
      colors: {
        'editor.background': '#0e131f',
        'editor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#182032',
        'editorCursor.foreground': '#60a5fa',
        'editorWhitespace.foreground': '#334155',
        'editorIndentGuide.background': '#1e293b',
        'editorIndentGuide.activeBackground': '#3b82f6',
      },
    });
    monaco.editor.setTheme('easylearn-dark');

    // Create models for all starting files
    Object.entries(files).forEach(([fName, content]) => {
      const uri = monaco.Uri.parse(`inmemory://project/${fName}`);
      let model = monaco.editor.getModel(uri);
      if (!model) {
        model = monaco.editor.createModel(content, getMonacoLanguage(fName), uri);
      } else {
        if (model.getValue() !== content) {
          model.setValue(content);
        }
      }
      modelsRef.current.set(fName, model);
    });

    // Set initial active model
    const initialModel = modelsRef.current.get(activeFile);
    if (initialModel) {
      editor.setModel(initialModel);
    }

    // Track Cursor Position changes
    editor.onDidChangeCursorPosition((e: any) => {
      if (onCursorChange) {
        onCursorChange(activeFileRef.current, {
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        });
      }
    });

    // Track Selection changes
    editor.onDidChangeCursorSelection((e: any) => {
      if (onSelectionChange && e.selection) {
        onSelectionChange(activeFileRef.current, {
          startLine: e.selection.startLineNumber,
          startColumn: e.selection.startColumn,
          endLine: e.selection.endLineNumber,
          endColumn: e.selection.endColumn,
        });
      }
    });

    // Track content modifications across models
    editor.onDidChangeModelContent(() => {
      const currentActive = activeFileRef.current;
      const model = editor.getModel();
      if (model && onFileChange) {
        const val = model.getValue();
        onFileChange(currentActive, val);
      }
    });

    if (onEditorReady) {
      onEditorReady(editor, monaco);
    }
  }, [files, activeFile, onFileChange, onCursorChange, onSelectionChange, onEditorReady]);

  // Synchronize files map changes (create new models / dispose deleted models)
  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;

    // 1. Create or update models for new files
    Object.entries(files).forEach(([fName, content]) => {
      const uri = monaco.Uri.parse(`inmemory://project/${fName}`);
      let model = modelsRef.current.get(fName);

      if (!model) {
        model = monaco.editor.getModel(uri);
        if (!model) {
          model = monaco.editor.createModel(content, getMonacoLanguage(fName), uri);
        }
        modelsRef.current.set(fName, model);
      }
    });

    // 2. Dispose deleted models
    const existingFileNames = new Set(Object.keys(files));
    modelsRef.current.forEach((model, fName) => {
      if (!existingFileNames.has(fName)) {
        model.dispose();
        modelsRef.current.delete(fName);
        viewStatesRef.current.delete(fName);
      }
    });
  }, [files]);

  // Switch Active File with viewState preservation
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const currentModel = editor.getModel();
    const prevFile = Array.from(modelsRef.current.entries()).find(
      ([, model]) => model === currentModel
    )?.[0];

    // Save viewState of previous file
    if (prevFile) {
      viewStatesRef.current.set(prevFile, editor.saveViewState());
    }

    // Retrieve or create target model
    let targetModel = modelsRef.current.get(activeFile);
    if (!targetModel) {
      const uri = monaco.Uri.parse(`inmemory://project/${activeFile}`);
      targetModel = monaco.editor.getModel(uri);
      if (!targetModel) {
        targetModel = monaco.editor.createModel(
          files[activeFile] || '',
          getMonacoLanguage(activeFile),
          uri
        );
      }
      modelsRef.current.set(activeFile, targetModel);
    }

    // Switch model imperatively
    if (editor.getModel() !== targetModel) {
      editor.setModel(targetModel);

      // Restore viewState
      const savedState = viewStatesRef.current.get(activeFile);
      if (savedState) {
        editor.restoreViewState(savedState);
      }
      editor.focus();
    }
  }, [activeFile, files]);

  // Update read-only option dynamically
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        readOnly: readOnly && !isPaused && !isRecording,
      });
    }
  }, [readOnly, isPaused, isRecording]);

  const activeLang = getMonacoLanguage(activeFile);

  return (
    <div className={`relative flex flex-col flex-1 h-full min-h-0 bg-[#0e131f] overflow-hidden ${className}`}>
      {/* ── Editor Sub-header Status Indicator ── */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#090d16] border-b border-slate-800/60 text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono text-slate-200 font-semibold">{activeFile}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">({activeLang})</span>
        </div>

        <div className="flex items-center gap-2">
          {isRecording ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Recording Keystrokes</span>
            </div>
          ) : isPaused ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Interactive Edit Mode</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>Synced Telemetry</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Monaco Editor Canvas ── */}
      <div className="flex-1 w-full h-full min-h-0 relative">
        <Editor
          height="100%"
          language={activeLang}
          theme={theme}
          onMount={handleEditorMount}
          options={{
            fontSize,
            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            lineNumbers: 'on',
            lineDecorationsWidth: 10,
            glyphMargin: false,
            folding: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            readOnly: readOnly && !isPaused && !isRecording,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
}
