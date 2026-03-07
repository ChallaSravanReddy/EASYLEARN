import React, { useState, useEffect, useRef,useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Pause, Square, UndoDot, RotateCcw } from 'lucide-react';
// styling is handled with Tailwind classes; external stylesheet no longer required

import OutputPanel from './OutputPanel';
import Draggable from 'react-draggable';


const codeTimeline = [
        {
            time: 0,
            code: `
        //Welcome to JavaScript Basics!
        `,
        },
        {
            time: 94,
            code: `
        console.log("Hello, World!");
        `,
        },
        {
            time: 142, 
            code: `
        let age = 20;
        console.log(age);
        `,
        },
        {
            time: 155, 
            code: `
        var city = "Hyderabad";   // old
        let score = 95;           // can be changed
        const pi = 3.14;          // fixed
        `,
        },
        {
            time: 180,
            code: `
        let score = 100;
        const pi = 22;
        `,
        },
        {
            time: 195, 
            code: `
        let name = "Abhi";
        console.log(name);
        `,
        },
        {
            time: 206, 
            code: `
        let marks = 85;
        let price = 99.99;
        `,
        },
        {
            time: 215, 
            code: `
        let isStudent = true;
        let isTeacher = false;
        `,
        },
        {
            time: 220, 
            code: `
        let address;
        console.log(address); // undefined
        `,
        },
        {
            time: 225, // 3:45
            code: `
        let nickname = null;
        `,
        },
        {
            time: 242, // 4:02
            code: `
        console.log(myName);
        console.log(myAge);
        console.log(isCoder);
        `,
        },
    ];
// Wraps timeline code inside HTML to capture console.log
    const generateOutputHTML = (code) => `
    <html>
        <head>
        <style>
            body { font-family: monospace; padding: 10px; background: #fff; }
            pre { color: #333; white-space: pre-wrap; }
        </style>
        </head>
        <body>
        <pre id="log"></pre>
        <script>
            const logEl = document.getElementById("log");

            // Override console.log
            console.log = (...args) => {
            logEl.innerHTML += args.join(" ") + "\\n";
            };

            try {
            ${code}
            } catch (e) {
            logEl.innerHTML += "Error: " + e.message + "\\n";
            }
        </script>
        </body>
    </html>
    `;
function TimelineCodePlayer() {
    const [currentTime, setCurrentTime] = useState(0);
    const [currentCode, setCurrentCode] = useState(codeTimeline[0].code);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isUserEditing, setIsUserEditing] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [showStartButton, setShowStartButton] = useState(true);
    const intervalRef = useRef(null);
    const [language] = useState("javascript");
    const nodeRef = useRef(null); // For Draggable
    const [showVideo, setShowVideo] = useState(true);


    // NEW: reference for the video element
    const videoRef = useRef(null);


    // Start the timeline
    const startTimeline = () => {
        setHasStarted(true);
        setShowStartButton(false);
        setIsPlaying(false);
        setCurrentTime(0);
        setCurrentCode(codeTimeline[0].code);
        setIsUserEditing(false);
        
        // Initialize video but don't auto-play
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.pause();
            setShowVideo(true);
        }

        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    // Play/Pause logic
    const togglePlayPause = useCallback(() => {
        if (isPlaying) {
            // Pause both video and timeline
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setIsPlaying(false);
            if (videoRef.current) {
                videoRef.current.pause();
                setShowVideo(false);
            }
        } else {
            // When resuming play, exit editing mode and restore timeline code
            if (isUserEditing) {
                const currentTimeline = codeTimeline.find(
                    (step) => step.time <= currentTime
                );
                if (currentTimeline) {
                    setCurrentCode(currentTimeline.code);
                }
                setIsUserEditing(false);
            }

            setIsPlaying(true);
            
            // Sync video with current time
            if (videoRef.current) {
                videoRef.current.currentTime = currentTime;
                setShowVideo(true);
                videoRef.current.play().catch(e => {
                    console.error("Error playing video:", e);
                    setShowVideo(false);
                });
            }

            // Start timeline updates
            intervalRef.current = setInterval(() => {
                setCurrentTime((prev) => {
                    const newTime = prev + 1;
                    // Sync video time with timeline
                    if (videoRef.current) {
                        videoRef.current.currentTime = newTime;
                    }
                    
                    if (newTime >= codeTimeline[codeTimeline.length - 1].time) {
                        clearInterval(intervalRef.current);
                        setIsPlaying(false);
                        if (videoRef.current) {
                            videoRef.current.pause();
                            setShowVideo(false);
                        }
                        return prev;
                    }
                    return newTime;
                });
            }, 1000);
        }
    }, [isPlaying, isUserEditing, currentTime]);

    const togglePlay = useCallback(() => {
        if (!hasStarted) {
            startTimeline();
            return;
        }

        togglePlayPause();
    }, [hasStarted, togglePlayPause]);

    // Initialize video on mount and cleanup on unmount
    useEffect(() => {
        // Pause video on initial load
        if (videoRef.current) {
            videoRef.current.pause();
        }
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay]);

    // Stop playback
    const stopPlayback = useCallback(() => {
        clearInterval(intervalRef.current);
        setIsPlaying(false);
        setCurrentTime(0);
        setCurrentCode(codeTimeline[0].code);
        setIsUserEditing(false);

        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setShowVideo(false);
        }
    }, []);

    // Resume timeline from current position
    const resumeTimeline = () => {
        if (isUserEditing) {
            setIsUserEditing(false);
            // Find the appropriate code snapshot for current time
            const snapshot = [...codeTimeline]
                .reverse()
                .find((s) => s.time <= currentTime);
            if (snapshot) {
                setCurrentCode(snapshot.code);
            }
        }
    };

    // Handle editor focus
    const handleEditorFocus = useCallback(() => {
        if (isPlaying) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            if (videoRef.current) {
                videoRef.current.pause();
                setShowVideo(false);
            }
        }
        setIsUserEditing(true);
    }, [isPlaying]);

    // Auto-update code and sync video time when currentTime changes
    useEffect(() => {
        if (!isUserEditing && hasStarted) {
            const snapshot = [...codeTimeline]
                .reverse()
                .find((s) => s.time <= currentTime);
                
            if (snapshot) {
                setCurrentCode(snapshot.code);
            }
            
            // Sync video time if it's playing
            if (isPlaying && videoRef.current) {
                videoRef.current.currentTime = currentTime;
            }
        }
    }, [currentTime, isUserEditing, hasStarted, isPlaying]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Calculate max time for the slider
    const maxTime = codeTimeline[codeTimeline.length - 1].time;
    
    // Handle editor changes
    const handleEditorChange = (value) => {
        if (hasStarted && !isUserEditing) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            setIsUserEditing(true);
        }
        setCurrentCode(value || '');
    };
    
    // Handle slider changes
    const handleSliderChange = (e) => {
        const newTime = parseInt(e.target.value, 10);
        setCurrentTime(newTime);
        
        // Find the most recent code snapshot for this time
        const snapshot = [...codeTimeline]
            .reverse()
            .find((s) => s.time <= newTime);
            
        if (snapshot) {
            setCurrentCode(snapshot.code);
        }
        
        // Sync video time
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
        
        // If user was editing and uses slider, exit editing mode
        if (isUserEditing) {
            setIsUserEditing(false);
        }
    };


    // Calculate slider background for progress
    const sliderProgress = (currentTime / maxTime) * 100;
    const sliderStyle = {
        background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${sliderProgress}%, #4b5563 ${sliderProgress}%, #4b5563 100%)`,
    };
        
    return (
        <div className="relative w-full min-h-screen bg-slate-900 text-white">
          {/* custom range thumb styles for consistent appearance */}
          <style>{`input[type=range]::-webkit-slider-thumb { width:14px; height:14px; border-radius:50%; background:#6366f1; cursor:pointer; }
          input[type=range]::-moz-range-thumb { width:14px; height:14px; border-radius:50%; background:#6366f1; cursor:pointer; }`}</style>

            <div className="relative flex flex-col items-center justify-center h-full">
                {/* editor area */}
                <div 
                    onClick={() => {
                        if (isPlaying) {
                            clearInterval(intervalRef.current);
                            setIsPlaying(false);
                            if (videoRef.current) {
                                videoRef.current.pause();
                                videoRef.current.currentTime = 0;
                                setShowVideo(false);
                            }
                        }
                    }}
                    className="w-full h-[80vh]"
                >
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={currentCode}
                        options={{ 
                            fontSize: 16,
                            readOnly: false,
                            minimap: { enabled: false }
                        }}
                        onChange={handleEditorChange}
                        onFocus={handleEditorFocus}
                    />
                </div>
                {/* Video Panel */}
                {showVideo && (
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-black/70 flex items-center justify-center">
                        <video
                            ref={videoRef}
                            src="/javascript-intro.mp4"
                            className="w-full h-full object-contain"
                            autoPlay
                            playsInline
                        />
                    </div>
                )}
                {/* Start Button Overlay */}
                {showStartButton && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <button
                            onClick={startTimeline}
                            className="p-6 bg-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform"
                        >
                            <svg width="0" height="0" className="hidden">
                                {/* placeholder for triangle */}
                            </svg>
                            <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-12 border-b-white" />
                        </button>
                    </div>
                )}

                {/* Controls Overlay */}
                {hasStarted && (
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 w-full max-w-3xl space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={togglePlay}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                        {isPlaying ? 'Pause' : 'Play'}
                                    </button>
                                    <button
                                        onClick={stopPlayback}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition bg-red-600 hover:bg-red-700"
                                    >
                                        <RotateCcw className="w-4 h-4" /> RESET
                                    </button>
                                    {isUserEditing && (
                                        <button
                                            onClick={resumeTimeline}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition bg-green-600 hover:bg-green-700"
                                        >
                                            <UndoDot className="w-4 h-4" /> RESET CODE
                                        </button>
                                    )}
                                </div>
                                <span className="text-xs font-mono bg-black/50 px-2 py-0.5 rounded">
                                    {currentTime}s / {maxTime}s
                                </span>
                            </div>

                            {/* Slider */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-300 w-6">0s</span>
                                <input
                                    type="range"
                                    min="0"
                                    max={maxTime}
                                    value={currentTime}
                                    onChange={handleSliderChange}
                                    className="flex-1 h-2 rounded-lg appearance-none bg-gray-600"
                                    style={sliderStyle}
                                />
                                <span className="text-xs text-slate-300 w-6">{maxTime}s</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Message Overlay - Bottom Right */}
                {hasStarted && (
                    <div className="status-overlay">
                        {isUserEditing && (
                            <div className="status-message status-editing">
                                <p className="status-text">
                                    <span className="status-dot status-dot-orange"></span>
                                    <strong>Editing:</strong> Paused at{' '}
                                    {currentTime}s
                                </p>
                            </div>
                        )}

                        {isPlaying && !isUserEditing && (
                            <div className="status-message status-playing">
                                <p className="status-text">
                                    <span className="status-dot status-dot-blue"></span>
                                    <strong>Playing</strong>
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Output panel with wrapped HTML */}
      <div className="output-panel-container">
        <Draggable nodeRef={nodeRef}>
            <div ref={nodeRef} className="draggable-box">
                <OutputPanel outputCode={generateOutputHTML(currentCode)} />
            </div>
        </Draggable>
      </div>
    </div>  {/* close outer relative container */}
    );
}

export default TimelineCodePlayer;