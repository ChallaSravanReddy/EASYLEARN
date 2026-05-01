import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Pause, Save, Upload, Video as VideoIcon, CheckCircle2, ChevronLeft, Mic, StopCircle, Download, FileJson } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Make sure Supabase is available if needed later

export default function TimelineEditor() {
  const [courseTitle, setCourseTitle] = useState('My Masterclass');
  const [lessonTitle, setLessonTitle] = useState('Introduction to Variables');
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [timelineData, setTimelineData] = useState([]);
  const [currentCode, setCurrentCode] = useState('// Write your starting code here...\n');
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  // Refs
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const playbackVideoRef = useRef(null);

  // Debounce code changes to avoid massive JSON arrays
  const lastCodeRef = useRef(currentCode);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  // ─── RECORDING LOGIC ────────────────────────────────────────────────────────

  const startRecording = async () => {
    try {
      // Request Audio (and optionally screen)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); // Change to getDisplayMedia for screen
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' }); // or video/webm
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        
        // Stop all tracks to release mic/camera
        stream.getTracks().forEach(track => track.stop());
      };

      // Reset Timeline
      setTimelineData([{ time: 0, code: currentCode }]);
      lastCodeRef.current = currentCode;

      // Start timer
      startTimeRef.current = Date.now();
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((Date.now() - startTimeRef.current) / 1000);
      }, 100);

      mediaRecorder.start();
      setIsRecording(true);
      setMediaUrl(''); // Clear previous recording

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
    }
  };

  const handleEditorChange = (value) => {
    setCurrentCode(value || '');
    
    // Automatically capture code snapshot if recording
    if (isRecording && startTimeRef.current) {
      const time = (Date.now() - startTimeRef.current) / 1000;
      
      // Only record if code actually changed
      if (value !== lastCodeRef.current) {
        setTimelineData(prev => [...prev, { time, code: value || '' }]);
        lastCodeRef.current = value || '';
      }
    }
  };

  // ─── PLAYBACK & EXPORT LOGIC ────────────────────────────────────────────────

  const togglePlayback = () => {
    if (!playbackVideoRef.current) return;
    if (isPlaying) {
      playbackVideoRef.current.pause();
    } else {
      playbackVideoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePlaybackTimeUpdate = () => {
    if (!playbackVideoRef.current) return;
    const time = playbackVideoRef.current.currentTime;
    setPlaybackTime(time);

    // Sync code to playback time
    const snapshot = [...timelineData].reverse().find(s => s.time <= time);
    if (snapshot && snapshot.code !== currentCode) {
      setCurrentCode(snapshot.code);
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
    const ms = Math.floor((timeInSeconds % 1) * 10).toString();
    return `${m}:${s}.${ms}`;
  };

  // ─── UI RENDER ──────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[100] bg-[#1e1e1e] flex flex-col font-sans">
      
      {/* Header */}
      <div className="h-16 bg-[#252526] border-b border-[#333] flex items-center justify-between px-6 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <input 
              value={lessonTitle}
              onChange={e => setLessonTitle(e.target.value)}
              className="text-sm font-bold text-white leading-tight bg-transparent border-b border-transparent hover:border-slate-500 focus:border-indigo-500 outline-none px-1 py-0.5 transition-colors"
            />
            <input 
              value={courseTitle}
              onChange={e => setCourseTitle(e.target.value)}
              className="text-[10px] text-slate-400 bg-transparent outline-none w-full px-1"
            />
          </div>
        </div>
        
        {/* Central Recording Controls */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
          {!isRecording ? (
            <button 
              onClick={startRecording}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-5 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
            >
              <Mic className="w-4 h-4" /> Start Recording Session
            </button>
          ) : (
            <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/30 pl-4 pr-1 py-1 rounded-full">
              <div className="flex items-center gap-2 text-red-500 font-mono font-bold animate-pulse">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                {formatTime(recordingTime)}
              </div>
              <button 
                onClick={stopRecording}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full font-bold text-sm transition-all"
              >
                <StopCircle className="w-4 h-4" /> Stop
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
            {timelineData.length} Keyframes
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="w-2/3 border-r border-[#333] flex flex-col relative">
          <div className="absolute top-0 left-0 w-full h-8 bg-[#2d2d2d] flex items-center px-4 text-xs font-mono text-slate-400 border-b border-[#1e1e1e] z-10">
            main.js
            {isRecording && <span className="ml-auto text-red-400 text-[10px] uppercase tracking-widest animate-pulse">Capturing Keystrokes...</span>}
          </div>
          <Editor
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={currentCode}
            onChange={handleEditorChange}
            options={{ 
              fontSize: 16, 
              minimap: { enabled: false }, 
              padding: { top: 40 },
              readOnly: isPlaying // Prevent editing while playing back preview
            }}
          />
        </div>

        {/* Output & Preview Area */}
        <div className="w-1/3 bg-[#1e1e1e] flex flex-col relative">
          
          {/* Audio/Video Preview */}
          <div className="flex-1 border-b border-[#333] flex flex-col">
            <div className="h-8 bg-[#252526] border-b border-[#1e1e1e] px-4 flex items-center text-xs font-semibold text-slate-300">
              Media Preview
            </div>
            <div className="flex-1 bg-black flex flex-col items-center justify-center relative p-6">
              {!mediaUrl ? (
                <div className="text-center text-slate-500 flex flex-col items-center">
                  <Mic className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">Recording preview will appear here</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <audio 
                    ref={playbackVideoRef} 
                    src={mediaUrl} 
                    className="w-full outline-none" 
                    controls
                    onTimeUpdate={handlePlaybackTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  <p className="text-emerald-400 text-xs mt-4 font-mono font-bold bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                    Recording Complete ({formatTime(playbackVideoRef.current?.duration || 0)})
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Export Controls */}
          <div className="h-auto min-h-[150px] bg-[#252526] p-6 flex flex-col justify-center gap-3">
             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Export Lesson Assets</p>
             <button 
               onClick={downloadMedia} 
               disabled={!mediaUrl}
               className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
             >
                <Download className="w-4 h-4" /> Download Audio Track (.webm)
             </button>
             <button 
               onClick={downloadJSON} 
               disabled={timelineData.length <= 1}
               className="w-full py-2.5 bg-[#333] hover:bg-[#444] disabled:bg-[#222] disabled:text-slate-600 border border-[#555] disabled:border-[#333] disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
             >
                <FileJson className="w-4 h-4" /> Download Timeline (.json)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
