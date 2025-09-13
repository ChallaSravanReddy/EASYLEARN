import React, { useState, useEffect, useRef,useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Pause, Square } from 'lucide-react';
import './timeline-styles.css'; // Import the CSS file
import OutputPanel from './OutputPanel';
import Draggable from 'react-draggable';

const codeTimeline = [
  {
    time: 0,
    code: `// Welcome to the Timeline Code Player!
// Click the play button in the center to start the demo

`,
  },
  {
    time: 2,
    code: `// Step 1: A simple function
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Try calling it
console.log(greet("sir"));
`,
  },
  {
    time: 4,
    code: `// Step 2: Variables and template strings
function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
const timestamp = new Date().toLocaleTimeString();

console.log("Message:", message);
console.log("Timestamp:", timestamp);
`,
  },
  {
    time: 6,
    code: `// Step 3: Objects in JavaScript
function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet("Developer");
const appData = {
  user: "DevUser",
  message: message,
  timestamp: new Date().toISOString(),
  version: "1.0.0"
};

console.log("App Data Object:", appData);
`,
  },
  {
    time: 8,
    code: `// Step 4: Arrays and loops
const fruits = ["🍎 Apple", "🍌 Banana", "🍇 Grapes", "🍍 Pineapple"];

console.log("Fruits list:");
for (let fruit of fruits) {
  console.log("- ", fruit);
}

// Random pick
const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
console.log("Randomly picked fruit:", randomFruit);
`,
  },
  {
    time: 10,
    code: `// Step 5: Putting it all together
function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
const data = {
  message,
  fruits: ["🍎", "🍌", "🍇"],
  luckyNumber: Math.floor(Math.random() * 100)
};

console.log("Final Data:", data);
console.log("Demo completed successfully!");

// Timeline demo finished!
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
    const [language, setLanguage] = useState("javascript");
    const nodeRef = useRef(null); // For Draggable
    const [showVideo, setShowVideo] = useState(true);


    // NEW: reference for the video element
    const videoRef = useRef(null);


    // Start the timeline
    const startTimeline = () => {
        setHasStarted(true);
        setShowStartButton(false);
        setIsPlaying(true);
        setCurrentTime(0);
        setCurrentCode(codeTimeline[0].code);
        setIsUserEditing(false);
        
        // sync video
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            setShowVideo(true);
            videoRef.current.play().catch(e => {
                console.error("Error playing video:", e);
                setShowVideo(false);
            });
        }


        intervalRef.current = setInterval(() => {
            setCurrentTime((prev) => {
                if (prev >= codeTimeline[codeTimeline.length - 1].time) {
                    clearInterval(intervalRef.current);
                    setIsPlaying(false);
                    return prev;
                }
                return prev + 1;
            });
        }, 1000);
    };

    // Play/Pause logic
    const togglePlayPause = () => {
        if (isPlaying) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            if (videoRef.current) {
                videoRef.current.pause();
                setShowVideo(false);
            }
        } else {
            // When resuming play, exit editing mode and restore timeline code
            if (isUserEditing) {
                // Find the current position in the timeline
                const currentTimeline = codeTimeline.find(
                    (step) => step.time <= currentTime
                );
                if (currentTimeline) {
                    setCurrentCode(currentTimeline.code);
                }
                setIsUserEditing(false);
            }

            setIsPlaying(true);
            if (videoRef.current) {
                setShowVideo(true);
                videoRef.current.play().catch(e => {
                    console.error("Error playing video:", e);
                    setShowVideo(false);
                });
            }
            intervalRef.current = setInterval(() => {
                setCurrentTime((prev) => {
                    if (prev >= codeTimeline[codeTimeline.length - 1].time) {
                        clearInterval(intervalRef.current);
                        setIsPlaying(false);
                        if (videoRef.current) {
                            videoRef.current.pause();
                            setShowVideo(false);
                        }
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
    };

    const togglePlay = useCallback(() => {
        if (!hasStarted) {
            startTimeline();
            return;
        }

        togglePlayPause();
    }, [hasStarted, togglePlayPause]);

    // Cleanup interval on unmount
    useEffect(() => {
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
    const stopPlayback = () => {
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
    };

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
    const handleEditorFocus = () => {
        if (isPlaying) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
            setShowVideo(false);
        }
        setIsUserEditing(true);
    };

    // Auto-update code only if user is not editing
    useEffect(() => {
        if (!isUserEditing && hasStarted) {
            const snapshot = [...codeTimeline]
                .reverse()
                .find((s) => s.time <= currentTime);
            if (snapshot) {
                setCurrentCode(snapshot.code);
            }
        }
    }, [currentTime, isUserEditing, hasStarted]);

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
        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${sliderProgress}%, #4b5563 ${sliderProgress}%, #4b5563 100%)`,
    };
        
    return (

        <div className="timeline-container">
            <div className="editor-wrapper">
                <div className="editor-controls">
                    <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)} 
                        className="language-selector"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                    </select>
                </div>
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
                    style={{ height: '100%', width: '100%' }}
                >
                    <Editor
                        height="80vh"
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
                <div className={`video-panel ${showVideo ? 'show' : 'hide'}`}>
                    
                    <video
                        ref={videoRef}
                        src="/demo.mp4"
                        style={{
                            width: '100%',
                            height: 'calc(100% - 40px)',
                            display: 'block',
                            backgroundColor: '#000',
                            objectFit: 'contain'
                        }}
                        controls
                        autoPlay
                        playsInline
                    />
                </div>
                {/* Start Button Overlay - Triangular Play Button in Center */}
                {showStartButton && (
                    <div className="start-overlay">
                        <button
                            onClick={startTimeline}
                            className="start-button"
                        >
                            <div className="triangle-play" />
                        </button>
                    </div>
                )}

                {/* Controls Overlay - Top of Editor */}
                {hasStarted && (
                    <div className="controls-overlay">
                        <div className="controls-panel">
                            <div className="controls-row">
                                <div className="controls-buttons">
                                    <button
                                        onClick={togglePlay}
                                        className="control-button play-button"
                                    >
                                        {isPlaying ? (
                                            <Pause className="icon" />
                                        ) : (
                                            <Play className="icon" />
                                        )}
                                        {isPlaying ? 'Pause' : 'Play'}
                                    </button>

                                    <button
                                        onClick={stopPlayback}
                                        className="control-button stop-button"
                                    >
                                        <Square className="icon" />
                                        Stop
                                    </button>

                                    {isUserEditing && (
                                        <button
                                            onClick={resumeTimeline}
                                            className="control-button resume-button"
                                        >
                                            <Play className="icon" />
                                            Resume
                                        </button>
                                    )}
                                </div>

                                <span className="time-display">
                                    {currentTime}s / {maxTime}s
                                </span>
                            </div>

                            {/* Timeline Slider */}
                            <div className="slider-container">
                                <span className="slider-label">0s</span>
                                <input
                                    type="range"
                                    min="0"
                                    max={maxTime}
                                    value={currentTime}
                                    onChange={handleSliderChange}
                                    className="timeline-slider"
                                    style={sliderStyle}
                                />
                                <span className="slider-label">{maxTime}s</span>
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
        </div>
    );
}

export default TimelineCodePlayer;