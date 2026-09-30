import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Pause, Save, Upload, Video as VideoIcon, CheckCircle2, ChevronLeft, Mic, StopCircle, Download, FileJson, Files, Search, GitBranch, PlaySquare, Settings, ChevronRight, ChevronDown, FilePlus, FolderPlus, X, FileAudio } from 'lucide-react';
import Draggable from 'react-draggable';

const INITIAL_FILES = [
  { id: '1', name: 'main.js', language: 'javascript', isFolder: false, parentId: null, content: '// Welcome to Instructor Studio!\n' },
  { id: '2', name: 'styles.css', language: 'css', isFolder: false, parentId: null, content: 'body {\n  background: #0d1117;\n  color: white;\n}' }
];

export default function TimelineEditor() {
  const [courseTitle, setCourseTitle] = useState('My Masterclass');
  const [lessonTitle, setLessonTitle] = useState('Introduction to Variables');
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [timelineData, setTimelineData] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [showVideo, setShowVideo] = useState(true);

  // VS Code State
  const [files, setFiles] = useState(INITIAL_FILES);
  const [openTabs, setOpenTabs] = useState(['1']);
  const [activeTab, setActiveTab] = useState('1'); // ID of active file
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [newItemPrompt, setNewItemPrompt] = useState(null); // { type: 'file' | 'folder', parentId: null }
  const [newItemName, setNewItemName] = useState('');

  // Refs
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const playbackVideoRef = useRef(null);
  const videoDragRef = useRef(null); // Video Draggable

  const activeLanguage = files.find(f => f.id === activeTab)?.language || 'javascript';

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  // ─── FILE SYSTEM HELPERS ──────────────────────────────────────────────────

  const captureSnapshot = (newFiles, newActiveTab) => {
    if (isRecording && startTimeRef.current) {
      const time = (Date.now() - startTimeRef.current) / 1000;
      setTimelineData(prev => [...prev, { 
        time, 
        files: JSON.parse(JSON.stringify(newFiles)), // deep copy
        activeTab: newActiveTab 
      }]);
    }
  };

  const handleCreateSubmit = () => {
    if (newItemName.trim()) {
      let updatedFiles = [...files];
      let newActive = activeTab;

      if (newItemPrompt.type === 'file') {
        const ext = newItemName.split('.').pop();
        const langMap = { js: 'javascript', py: 'python', html: 'html', css: 'css', java: 'java', cpp: 'cpp', c: 'c', go: 'go', rs: 'rust', ts: 'typescript' };
        const newId = Date.now().toString();
        
        updatedFiles.push({ id: newId, name: newItemName, language: langMap[ext] || 'plaintext', isFolder: false, parentId: newItemPrompt.parentId, content: '' });
        setOpenTabs(prev => [...prev, newId]);
        newActive = newId;
        setActiveTab(newId);
      } else {
        updatedFiles.push({ id: Date.now().toString(), name: newItemName, language: '', isFolder: true, isOpen: true, parentId: newItemPrompt.parentId });
      }
      setFiles(updatedFiles);
      captureSnapshot(updatedFiles, newActive);
    }
    setNewItemPrompt(null);
    setNewItemName('');
  };

  const addFile = (e) => { e?.stopPropagation(); setNewItemPrompt({ type: 'file', parentId: selectedFolderId }); setNewItemName(''); };
  const addFolder = (e) => { e?.stopPropagation(); setNewItemPrompt({ type: 'folder', parentId: selectedFolderId }); setNewItemName(''); };

  const closeTab = (e, tabId) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t !== tabId);
    setOpenTabs(newTabs);
    let newActive = activeTab;
    if (activeTab === tabId) {
      newActive = newTabs.length > 0 ? newTabs[newTabs.length - 1] : null;
      setActiveTab(newActive);
    }
    captureSnapshot(files, newActive); // active tab changed
  };

  const getBreadcrumbs = (fileId) => {
    const crumbs = [];
    let current = files.find(f => f.id === fileId);
    if (!current) return ['Welcome'];
    while (current) {
      crumbs.unshift(current.name);
      current = files.find(f => f.id === current.parentId);
    }
    return crumbs;
  };

  const renderTree = (parentId, depth = 0) => {
    return (
      <React.Fragment key={`tree-${parentId}`}>
        {files.filter(f => f.parentId === parentId).map(f => (
          <React.Fragment key={f.id}>
            <div 
              onClick={(e) => {
                 e.stopPropagation();
                 if (f.isFolder) {
                   const updated = files.map(x => x.id === f.id ? { ...x, isOpen: !x.isOpen } : x);
                   setFiles(updated);
                   setSelectedFolderId(f.id);
                   captureSnapshot(updated, activeTab);
                 } else {
                   setOpenTabs(prev => prev.includes(f.id) ? prev : [...prev, f.id]);
                   setActiveTab(f.id);
                   setSelectedFolderId(f.parentId);
                   captureSnapshot(files, f.id);
                 }
              }}
              className={`flex items-center gap-1.5 py-1 cursor-pointer text-[13px] ${activeTab === f.id || selectedFolderId === f.id ? 'bg-[#37373d] text-white' : 'text-[#cccccc] hover:bg-[#2a2d2e]'}`}
              style={{ paddingLeft: `${depth * 12 + 24}px` }}
            >
              {f.isFolder ? <ChevronRight className={`w-4 h-4 transition-transform ${f.isOpen ? 'rotate-90' : ''}`} /> : <div className="w-4 h-4 ml-1" />}
              <span className={f.isFolder ? 'font-semibold text-slate-200' : ''}>{f.name}</span>
            </div>
            {f.isFolder && f.isOpen && renderTree(f.id, depth + 1)}
          </React.Fragment>
        ))}
        {newItemPrompt && newItemPrompt.parentId === parentId && (
          <div className="flex items-center gap-1.5 py-1 px-6 text-[13px] bg-[#37373d]" style={{ paddingLeft: `${depth * 12 + 24}px` }}>
            {newItemPrompt.type === 'folder' ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <div className="w-4 h-4 ml-1" />}
            <input
              autoFocus
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateSubmit(); if (e.key === 'Escape') setNewItemPrompt(null); }}
              onBlur={handleCreateSubmit}
              className="bg-[#1e1e1e] border border-[#007acc] text-white outline-none w-full px-1 py-0.5 text-[12px]"
            />
          </div>
        )}
      </React.Fragment>
    );
  };

  // ─── RECORDING LOGIC ────────────────────────────────────────────────────────

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); // Audio only for now
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      // Reset Timeline
      setTimelineData([{ time: 0, files: JSON.parse(JSON.stringify(files)), activeTab }]);

      // Start timer
      startTimeRef.current = Date.now();
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((Date.now() - startTimeRef.current) / 1000);
      }, 100);

      mediaRecorder.start();
      setIsRecording(true);
      setMediaUrl(''); // Clear previous recording
      setShowVideo(false);

    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
      setShowVideo(true); // Show preview popup
    }
  };

  const handleEditorChange = (value) => {
    if (!activeTab) return;
    
    // Create new files array with updated content
    const updatedFiles = files.map(f => f.id === activeTab ? { ...f, content: value || '' } : f);
    setFiles(updatedFiles);
    
    // Capture snapshot
    captureSnapshot(updatedFiles, activeTab);
  };

  // ─── PLAYBACK & EXPORT LOGIC ────────────────────────────────────────────────

  const togglePlayback = () => {
    if (!playbackVideoRef.current) return;
    if (isPlaying) playbackVideoRef.current.pause();
    else playbackVideoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handlePlaybackTimeUpdate = () => {
    if (!playbackVideoRef.current) return;
    const time = playbackVideoRef.current.currentTime;
    setPlaybackTime(time);

    // Sync file state to playback time
    const snapshot = [...timelineData].reverse().find(s => s.time <= time);
    if (snapshot) {
      setFiles(snapshot.files);
      setActiveTab(snapshot.activeTab);
      // Ensure the active tab is open during playback
      if (snapshot.activeTab && !openTabs.includes(snapshot.activeTab)) {
        setOpenTabs(prev => [...prev, snapshot.activeTab]);
      }
    }
  };

  const downloadMedia = () => {
    if (!mediaUrl) return;
    const a = document.createElement('a');
    a.href = mediaUrl;
    a.download = `${lessonTitle.replace(/\s+/g, '_')}_media.webm`;
    a.click();
  };

  const downloadJSON = () => {
    if (timelineData.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(timelineData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${lessonTitle.replace(/\s+/g, '_')}_timeline.json`;
    a.click();
  };

  const formatTime = (timeInSeconds) => {
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ─── UI RENDER ──────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[100] bg-[#1e1e1e] w-screen h-screen overflow-hidden flex flex-col font-sans text-[#cccccc]">
      
      {/* VS Code Top Bar - Custom for Instructor */}
      <div className="h-10 bg-[#323233] border-b border-[#252526] flex items-center justify-between px-4 select-none shrink-0 z-50">
        <div className="flex items-center gap-4 text-[13px]">
          <button onClick={() => window.history.back()} className="text-slate-400 hover:text-white mr-2"><ChevronLeft className="w-5 h-5" /></button>
          <div className="flex flex-col">
            <input 
              value={lessonTitle}
              onChange={e => setLessonTitle(e.target.value)}
              className="font-bold text-white leading-tight bg-transparent border-b border-transparent hover:border-slate-500 focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Central Recording Controls */}
        <div className="flex items-center gap-4">
          {!isRecording ? (
            <button 
              onClick={startRecording}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-5 py-1.5 rounded-full font-bold text-[13px] transition-all"
            >
              <Mic className="w-4 h-4" /> Start Recording
            </button>
          ) : (
            <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/30 pl-4 pr-1 py-1 rounded-full">
              <div className="flex items-center gap-2 text-red-500 font-mono font-bold animate-pulse text-[13px]">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                {formatTime(recordingTime)}
              </div>
              <button 
                onClick={stopRecording}
                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full font-bold text-[13px] transition-all"
              >
                <StopCircle className="w-4 h-4" /> Stop
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowVideo(!showVideo)} className="text-[12px] text-slate-400 hover:text-white flex items-center gap-1 bg-[#1e1e1e] px-2 py-1 rounded border border-[#3c3c3c]">
             <FileAudio className="w-3.5 h-3.5" /> Toggle Preview
          </button>
          <button onClick={downloadJSON} disabled={timelineData.length <= 1} className="text-[12px] disabled:opacity-50 text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
             <FileJson className="w-3.5 h-3.5" /> {timelineData.length} Frames
          </button>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* VS Code Activity Bar */}
        <div className="w-12 bg-[#333333] flex flex-col items-center py-3 gap-6 shrink-0 border-r border-[#252526]">
          <Files className="w-6 h-6 text-white cursor-pointer" />
          <Search className="w-6 h-6 text-slate-500 hover:text-white cursor-pointer" />
          <GitBranch className="w-6 h-6 text-slate-500 hover:text-white cursor-pointer" />
          <div className="mt-auto mb-2">
            <Settings className="w-6 h-6 text-slate-500 hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* VS Code Side Bar (Explorer) */}
        <div className="w-60 bg-[#252526] flex flex-col shrink-0 border-r border-[#1e1e1e] select-none" onClick={() => setSelectedFolderId(null)}>
          <div className="h-9 px-4 flex items-center text-[11px] uppercase tracking-wider font-semibold text-slate-300">
            Explorer
          </div>
          <div className="px-2 py-1 flex items-center justify-between group cursor-pointer hover:bg-[#2a2d2e]" onClick={(e) => { e.stopPropagation(); setSelectedFolderId(null); }}>
            <div className="flex items-center gap-1 text-[11px] font-bold text-white uppercase tracking-wider">
              <ChevronDown className="w-4 h-4" /> EASYLEARN
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <FilePlus className="w-4 h-4 text-slate-300 hover:text-white" onClick={addFile} title="New File" />
              <FolderPlus className="w-4 h-4 text-slate-300 hover:text-white" onClick={addFolder} title="New Folder" />
            </div>
          </div>
          <div className="flex flex-col mt-1 overflow-y-auto no-scrollbar pb-10">
            {renderTree(null)}
          </div>
        </div>

        {/* VS Code Main Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] relative">
          
          {/* Editor Tabs */}
          <div className="h-9 flex bg-[#252526] overflow-x-auto no-scrollbar border-b border-[#1e1e1e]">
            {openTabs.map(tabId => {
              const f = files.find(x => x.id === tabId);
              if (!f) return null;
              return (
                <div 
                  key={tabId}
                  onClick={() => setActiveTab(tabId)}
                  className={`flex items-center px-4 min-w-[120px] max-w-[200px] border-t cursor-pointer gap-2 ${activeTab === tabId ? 'bg-[#1e1e1e] border-[#007acc] text-white' : 'bg-[#2d2d2d] border-transparent text-slate-400 hover:bg-[#2b2b2b]'}`}
                >
                  <span className={`text-[12px] font-mono ${f.language === 'javascript' ? 'text-yellow-400' : f.language === 'css' ? 'text-blue-400' : 'text-slate-300'}`}>
                    {f.language === 'javascript' ? 'JS' : f.language === 'css' ? '#' : '{}'}
                  </span> 
                  <span className="truncate">{f.name}</span>
                  <X className="w-3.5 h-3.5 ml-auto hover:bg-[#444] rounded-md shrink-0" onClick={(e) => closeTab(e, tabId)} />
                </div>
              );
            })}
          </div>

          {/* Breadcrumbs */}
          <div className="h-6 flex items-center px-4 text-[12px] text-slate-400 bg-[#1e1e1e] shadow-sm shadow-black/20 z-10">
            EASYLEARN 
            {getBreadcrumbs(activeTab).map(crumb => (
              <React.Fragment key={crumb}>
                <ChevronRight className="w-3.5 h-3.5 mx-1" /> {crumb}
              </React.Fragment>
            ))}
            {isRecording && <span className="ml-auto text-red-400 text-[10px] uppercase tracking-widest animate-pulse flex items-center gap-1"><Mic className="w-3 h-3"/> Recording Active</span>}
          </div>

          {/* Editor Container */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              width="100%"
              language={activeLanguage}
              theme="vs-dark"
              value={files.find(f => f.id === activeTab)?.content || ''}
              options={{
                fontSize: 15,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: true, scale: 0.75 },
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
                readOnly: isPlaying // Prevent edits during playback review
              }}
              onChange={(val) => handleEditorChange(val)}
            />

            {/* Draggable Media Preview Popup */}
            {showVideo && mediaUrl && (
              <Draggable nodeRef={videoDragRef} bounds="parent" defaultPosition={{ x: window.innerWidth - 650, y: 24 }}>
                <div ref={videoDragRef} className="absolute z-40 rounded-xl overflow-hidden shadow-2xl shadow-black/80 border border-[#30363d] bg-[#0d1117] cursor-move w-[350px] group backdrop-blur-md">
                  <div className="h-8 bg-[#161b22] flex items-center justify-between px-3 border-b border-[#30363d]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><PlaySquare className="w-3.5 h-3.5"/> Playback Review</span>
                    <X className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowVideo(false); }} />
                  </div>
                  <div className="w-full h-24 bg-slate-900 flex items-center justify-center flex-col relative">
                    <FileAudio className="w-8 h-8 text-indigo-500 mb-2" />
                    <audio
                      ref={playbackVideoRef}
                      src={mediaUrl}
                      className="absolute bottom-2 w-11/12 h-8 outline-none opacity-50 hover:opacity-100 transition-opacity"
                      controls
                      onTimeUpdate={handlePlaybackTimeUpdate}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </div>
                  <div className="bg-[#161b22] p-3 flex justify-between gap-2 border-t border-[#30363d]">
                    <button onClick={downloadMedia} className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded flex items-center justify-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Audio
                    </button>
                    <button onClick={downloadJSON} className="flex-1 py-1.5 bg-[#333] hover:bg-[#444] border border-[#555] text-white text-[11px] font-bold rounded flex items-center justify-center gap-1.5">
                      <FileJson className="w-3.5 h-3.5" /> JSON
                    </button>
                  </div>
                </div>
              </Draggable>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
