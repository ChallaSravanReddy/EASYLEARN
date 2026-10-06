import React, { useState, useRef, useEffect } from 'react';
import {
  FileCode,
  FileText,
  FileJson,
  Files,
  Plus,
  Trash2,
  X,
  Check,
  PanelLeftClose,
  PanelLeft,
  Code2,
  ChevronRight,
  Folder,
  AlertCircle,
} from 'lucide-react';

export interface ScrimFileManagerProps {
  files: Record<string, string>;
  activeFile: string;
  onSelectFile: (fileName: string) => void;
  onCreateFile?: (fileName: string, initialContent?: string) => void;
  onDeleteFile?: (fileName: string) => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isRecording?: boolean;
  readOnly?: boolean;
  showTabs?: boolean;
  showSidebar?: boolean;
  className?: string;
}

/**
 * Returns an appropriate Lucide icon component and color based on file extension
 */
export function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
      return { icon: FileCode, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', label: 'JS' };
    case 'ts':
    case 'tsx':
      return { icon: FileCode, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', label: 'TS' };
    case 'html':
    case 'htm':
      return { icon: Code2, color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', label: 'HTML' };
    case 'css':
    case 'scss':
      return { icon: FileText, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20', label: 'CSS' };
    case 'json':
      return { icon: FileJson, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', label: 'JSON' };
    case 'py':
      return { icon: FileCode, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', label: 'PY' };
    default:
      return { icon: FileText, color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', label: ext?.toUpperCase() || 'FILE' };
  }
}

/**
 * ScrimFileManager: Dedicated component for Scrim project file tree navigation,
 * multi-tab switching, inline file creation, and deletion.
 */
export default function ScrimFileManager({
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  sidebarOpen = true,
  onToggleSidebar,
  isRecording = false,
  readOnly = false,
  showTabs = true,
  showSidebar = true,
  className = '',
}: ScrimFileManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const fileList = Object.keys(files);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleStartCreate = () => {
    if (readOnly) return;
    setIsCreating(true);
    setNewFileName('');
    setErrorMessage('');
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewFileName('');
    setErrorMessage('');
  };

  const handleConfirmCreate = () => {
    const trimmed = newFileName.trim();
    if (!trimmed) {
      setErrorMessage('Filename cannot be empty');
      return;
    }

    // Clean leading slashes
    const sanitized = trimmed.replace(/^[/\\]+/, '');

    if (files[sanitized] !== undefined) {
      setErrorMessage('File already exists');
      return;
    }

    // Default template content based on extension
    let initialContent = '';
    const ext = sanitized.split('.').pop()?.toLowerCase();
    if (ext === 'js' || ext === 'jsx') {
      initialContent = `// ${sanitized}\nconsole.log("${sanitized} loaded");\n`;
    } else if (ext === 'html') {
      initialContent = `<!DOCTYPE html>\n<html>\n<head>\n  <title>${sanitized}</title>\n</head>\n<body>\n  <h1>${sanitized}</h1>\n</body>\n</html>`;
    } else if (ext === 'css') {
      initialContent = `/* ${sanitized} */\n`;
    } else if (ext === 'json') {
      initialContent = '{\n  \n}\n';
    }

    if (onCreateFile) {
      onCreateFile(sanitized, initialContent);
    }
    onSelectFile(sanitized);
    setIsCreating(false);
    setNewFileName('');
    setErrorMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmCreate();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelCreate();
    }
  };

  const handleConfirmDelete = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileList.length <= 1) {
      alert('Cannot delete the last remaining file in the project.');
      return;
    }
    setFileToDelete(fileName);
  };

  const executeDelete = (fileName: string) => {
    if (onDeleteFile) {
      onDeleteFile(fileName);
    }
    setFileToDelete(null);

    // If active file was deleted, switch to another available file
    if (activeFile === fileName) {
      const remaining = fileList.filter((f) => f !== fileName);
      if (remaining.length > 0) {
        onSelectFile(remaining[0]);
      }
    }
  };

  return (
    <div className={`flex flex-col text-slate-300 font-sans select-none ${className}`}>
      {/* ── Top Tab Bar ── */}
      {showTabs && (
        <div className="flex items-center justify-between bg-[#0e131f] border-b border-slate-800/80 px-2 h-10 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 min-w-0">
            {/* Sidebar toggle button */}
            {showSidebar && onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                title={sidebarOpen ? 'Collapse Files Sidebar' : 'Expand Files Sidebar'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mr-1 cursor-pointer"
              >
                {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
              </button>
            )}

            {/* Tabs List */}
            {fileList.map((fileName) => {
              const isActive = fileName === activeFile;
              const { icon: Icon, color } = getFileIcon(fileName);

              return (
                <div
                  key={fileName}
                  onClick={() => onSelectFile(fileName)}
                  className={`
                    group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-mono cursor-pointer transition-all duration-150 border-b-2
                    ${isActive
                      ? 'bg-[#1e1e1e] text-white border-blue-500 font-medium shadow-sm'
                      : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="truncate max-w-[120px]">{fileName}</span>

                  {/* Active dot indicator */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 ml-0.5 animate-pulse" />
                  )}

                  {/* Delete button on hover for non-primary files */}
                  {!readOnly && fileList.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleConfirmDelete(fileName, e)}
                      title={`Delete ${fileName}`}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Add Tab Button */}
          {!readOnly && onCreateFile && (
            <button
              type="button"
              onClick={handleStartCreate}
              title="Add New File"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors ml-2 cursor-pointer flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New File</span>
            </button>
          )}
        </div>
      )}

      {/* ── Optional Sidebar File Explorer Panel ── */}
      {showSidebar && sidebarOpen && (
        <div className="w-60 bg-[#0b0f19] border-r border-slate-800/80 flex flex-col h-full flex-shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <div className="flex items-center gap-1.5">
              <Files className="w-3.5 h-3.5 text-blue-400" />
              <span>Project Files</span>
            </div>
            {!readOnly && onCreateFile && (
              <button
                type="button"
                onClick={handleStartCreate}
                title="Create File"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* New file inline input */}
          {isCreating && (
            <div className="p-2 border-b border-blue-500/30 bg-blue-950/20">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-blue-500/50 rounded px-2 py-1">
                <FileCode className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={newFileName}
                  onChange={(e) => {
                    setNewFileName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="filename.js..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleConfirmCreate}
                  className="p-0.5 text-emerald-400 hover:bg-emerald-500/20 rounded cursor-pointer"
                  title="Create"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelCreate}
                  className="p-0.5 text-slate-400 hover:bg-slate-700/50 rounded cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {errorMessage && (
                <div className="flex items-center gap-1 mt-1 text-[10px] text-rose-400">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Files List */}
          <div className="flex-1 overflow-y-auto py-1 px-1.5 space-y-0.5 no-scrollbar">
            {fileList.map((fileName) => {
              const isActive = fileName === activeFile;
              const { icon: Icon, color, label } = getFileIcon(fileName);

              return (
                <div
                  key={fileName}
                  onClick={() => onSelectFile(fileName)}
                  className={`
                    group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all duration-150
                    ${isActive
                      ? 'bg-blue-600/15 text-blue-300 font-semibold border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border uppercase ${color}`}>
                      {label}
                    </span>
                    <span className="truncate">{fileName}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!readOnly && fileList.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleConfirmDelete(fileName, e)}
                        title={`Delete ${fileName}`}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recording indicator badge if recording studio is active */}
          {isRecording && (
            <div className="p-2 border-t border-slate-800/80 bg-rose-950/20 flex items-center justify-between text-[11px] text-rose-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-semibold">Recording File Tree</span>
              </div>
              <span className="text-[10px] text-rose-400/80 font-mono">Telemetry sync</span>
            </div>
          )}
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#141824] border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Delete File?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg font-mono border border-slate-800">
              {fileToDelete}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeDelete(fileToDelete)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
