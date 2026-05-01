import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

import { Play, Pause, Save, Upload, Video as VideoIcon, CheckCircle2, ChevronLeft, ArrowRight } from 'lucide-react';

export default function TimelineEditor() {
  const [courseTitle, setCourseTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [file, setFile] = useState(null);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaUrl, setMediaUrl] = useState('');
  
  const [timelineData, setTimelineData] = useState([]);
  const [currentCode, setCurrentCode] = useState('// Write your starting code here...');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [step, setStep] = useState(1); // 1: Setup, 2: Record

  const mediaRef = useRef(null);

  const handleFileUpload = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startUpload = () => {
    if (!file || !courseTitle || !lessonTitle) {
      alert("Please fill all fields and select a video.");
      return;
    }

    // Mock upload
    setUploadProgress(100);
    setTimeout(() => {
      setMediaUrl(URL.createObjectURL(file));
      setStep(2);
    }, 1000);
  };

  // --- RECORDING ENGINE ---
  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const captureSnapshot = () => {
    const time = mediaRef.current ? mediaRef.current.currentTime : 0;
    
    // Check if snapshot exists for this exact second, update it, else add new
    setTimelineData((prev) => {
      const existingIndex = prev.findIndex(s => Math.floor(s.time) === Math.floor(time));
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { time, code: currentCode };
        return updated.sort((a, b) => a.time - b.time);
      }
      return [...prev, { time, code: currentCode }].sort((a, b) => a.time - b.time);
    });
  };

  const publishLesson = async () => {
    if (timelineData.length === 0) {
      alert("Please capture at least one snapshot.");
      return;
    }
    
    setIsPublishing(true);
    setTimeout(() => {
      alert("Mock publish successful!");
      window.location.reload();
      setIsPublishing(false);
    }, 1000);
  };

  // --- UI RENDER ---
  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-slate-100 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create New Lesson</h2>
          <p className="text-slate-500 mb-8">Upload media and prepare for timeline recording.</p>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Course Title</label>
              <input type="text" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500" placeholder="e.g. JavaScript Masterclass" />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lesson Title</label>
              <input type="text" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500" placeholder="e.g. Variables and Data Types" />
            </div>

            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
              <input type="file" accept="video/*,audio/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <VideoIcon className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-900 dark:text-white">Select Media File</p>
              <p className="text-xs text-slate-500">{file ? file.name : "MP4, WebM, MP3"}</p>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}

            <button onClick={startUpload} disabled={uploadProgress > 0} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              {uploadProgress > 0 ? `Uploading ${Math.round(uploadProgress)}%` : 'Upload & Continue'} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#1e1e1e] flex flex-col font-sans">
      
      {/* Header */}
      <div className="h-14 bg-[#252526] border-b border-[#333] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">{lessonTitle}</h1>
            <p className="text-[10px] text-slate-400">{courseTitle} — Timeline Recording</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
            {timelineData.length} Snapshots
          </span>
          <button onClick={publishLesson} disabled={isPublishing} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
            {isPublishing ? "Publishing..." : "Publish Lesson"} <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Left */}
        <div className="w-2/3 border-r border-[#333] flex flex-col">
          <Editor
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={currentCode}
            onChange={(val) => setCurrentCode(val || '')}
            options={{ fontSize: 16, minimap: { enabled: false }, padding: { top: 24 } }}
          />
        </div>

        {/* Video Right */}
        <div className="w-1/3 bg-black flex flex-col relative">
          <div className="flex-1 flex items-center justify-center bg-black relative">
             <video 
               ref={mediaRef} 
               src={mediaUrl} 
               className="w-full object-contain" 
               onTimeUpdate={handleTimeUpdate}
               controls={false}
             />
          </div>
          
          <div className="h-24 bg-[#252526] border-t border-[#333] p-4 flex flex-col justify-center gap-3">
             <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300">Time: {currentTime.toFixed(2)}s</span>
                <button onClick={togglePlay} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
             </div>
             <button onClick={captureSnapshot} className="w-full py-2 bg-[#333] hover:bg-[#444] border border-[#555] text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors">
                <Save className="w-4 h-4" /> Capture Snapshot Here
             </button>
          </div>
        </div>
      </div>

      {/* Snapshot Preview Bar */}
      <div className="h-20 bg-[#1e1e1e] border-t border-[#333] p-4 flex gap-3 overflow-x-auto">
         {timelineData.map((s, i) => (
           <div key={i} className="min-w-[120px] bg-[#252526] border border-[#444] rounded-lg p-2 cursor-pointer hover:border-indigo-500" onClick={() => { if(mediaRef.current) mediaRef.current.currentTime = s.time; setCurrentCode(s.code); }}>
             <p className="text-[10px] text-indigo-400 font-bold mb-1">Time: {s.time.toFixed(1)}s</p>
             <p className="text-[10px] text-slate-400 truncate">{s.code}</p>
           </div>
         ))}
      </div>

    </div>
  );
}
