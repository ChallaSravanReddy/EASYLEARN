import type { ScrimManifest } from '../types/scrim';

/**
 * Generates a synthetic base64 WAV tone so the audio master clock can play
 * in demo mode without requiring remote assets.
 */
export function generateSyntheticAudioDataUri(durationSeconds = 25): string {
  if (typeof window === 'undefined') return '';

  const sampleRate = 8000;
  const numSamples = sampleRate * durationSeconds;
  const buffer = new ArrayBuffer(44 + numSamples);
  const view = new DataView(buffer);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + numSamples, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // fmt subchunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // 16 for PCM
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // byte rate (sampleRate * 1 * 8 / 8)
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // 8 bits per sample
  // data subchunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, numSamples, true);

  // Write faint acoustic sine wave audio (subtle background tone)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = 220 + 20 * Math.sin(t * 1.5);
    const sample = Math.round(128 + 15 * Math.sin(2 * Math.PI * freq * t));
    view.setUint8(44 + i, sample);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

export const DEMO_SCRIM_MANIFEST: ScrimManifest = {
  version: '1.0.0',
  metadata: {
    title: 'Building a Dynamic Reactive Counter',
    description: 'Learn how to build interactive reactive widgets with Monaco editor telemetry and audio.',
    author: 'Senior Systems Instructor',
    recordedAt: '2026-10-01T00:00:00.000Z',
    duration: 18000,
    audioMimeType: 'audio/wav',
    initialActiveFile: 'index.html',
    totalEvents: 42,
    totalKeyframes: 3,
  },
  initialState: {
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="counter-box">
    <h2>Counter App</h2>
    <span id="count">0</span>
    <div class="actions">
      <button id="inc">+ Increment</button>
      <button id="dec">- Decrement</button>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      'styles.css': `body {
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}
.counter-box {
  background: #1e293b;
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid #334155;
  text-align: center;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
}
#count {
  font-size: 3rem;
  font-weight: 800;
  color: #6366f1;
  display: block;
  margin: 1rem 0;
}
button {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  margin: 0 0.25rem;
  cursor: pointer;
  transition: transform 0.15s;
}
button:hover {
  transform: scale(1.05);
}`,
      'script.js': `// Interactive Counter Script
let count = 0;
const countEl = document.getElementById('count');
const incBtn = document.getElementById('inc');
const decBtn = document.getElementById('dec');

incBtn.addEventListener('click', () => {
  count++;
  countEl.innerText = count;
});

decBtn.addEventListener('click', () => {
  count--;
  countEl.innerText = count;
});
`,
    },
    activeFile: 'script.js',
  },
  keyframes: [
    {
      t: 0,
      files: {
        'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="counter-box">
    <h2>Counter App</h2>
    <span id="count">0</span>
    <div class="actions">
      <button id="inc">+ Increment</button>
      <button id="dec">- Decrement</button>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
        'styles.css': `body {
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}
.counter-box {
  background: #1e293b;
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid #334155;
  text-align: center;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
}
#count {
  font-size: 3rem;
  font-weight: 800;
  color: #6366f1;
  display: block;
  margin: 1rem 0;
}
button {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  margin: 0 0.25rem;
  cursor: pointer;
  transition: transform 0.15s;
}
button:hover {
  transform: scale(1.05);
}`,
        'script.js': `// Interactive Counter Script
let count = 0;
const countEl = document.getElementById('count');
const incBtn = document.getElementById('inc');
const decBtn = document.getElementById('dec');

incBtn.addEventListener('click', () => {
  count++;
  countEl.innerText = count;
});

decBtn.addEventListener('click', () => {
  count--;
  countEl.innerText = count;
});
`,
      },
      activeFile: 'script.js',
    },
    {
      t: 8000,
      files: {
        'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="counter-box">
    <h2>Counter App</h2>
    <span id="count">0</span>
    <div class="actions">
      <button id="inc">+ Increment</button>
      <button id="dec">- Decrement</button>
      <button id="reset">Reset</button>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
        'styles.css': `body {
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}
.counter-box {
  background: #1e293b;
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid #334155;
  text-align: center;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
}
#count {
  font-size: 3rem;
  font-weight: 800;
  color: #6366f1;
  display: block;
  margin: 1rem 0;
}
button {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  margin: 0 0.25rem;
  cursor: pointer;
  transition: transform 0.15s;
}
button:hover {
  transform: scale(1.05);
}`,
        'script.js': `// Interactive Counter Script
let count = 0;
const countEl = document.getElementById('count');
const incBtn = document.getElementById('inc');
const decBtn = document.getElementById('dec');
const resetBtn = document.getElementById('reset');

incBtn.addEventListener('click', () => {
  count++;
  countEl.innerText = count;
});

decBtn.addEventListener('click', () => {
  count--;
  countEl.innerText = count;
});

resetBtn.addEventListener('click', () => {
  count = 0;
  countEl.innerText = count;
});
`,
      },
      activeFile: 'script.js',
    },
  ],
  events: [
    // Pointer movements at t = 500ms
    { t: 400, type: 'pointer', x: 220, y: 150, relX: 0.35, relY: 0.22, fileId: 'script.js' },
    { t: 600, type: 'pointer', x: 250, y: 180, relX: 0.4, relY: 0.26, fileId: 'script.js' },
    { t: 800, type: 'pointer', x: 300, y: 220, relX: 0.48, relY: 0.32, fileId: 'script.js' },

    // Instructor types reset button listener at t = 2000ms
    {
      t: 2000,
      type: 'content',
      fileId: 'script.js',
      range: { startLineNumber: 6, startColumn: 1, endLineNumber: 6, endColumn: 1 },
      text: 'const resetBtn = document.getElementById(\'reset\');\n',
    },
    { t: 2200, type: 'cursor', fileId: 'script.js', position: { lineNumber: 6, column: 45 } },

    // Pointer sweeps down
    { t: 3000, type: 'pointer', x: 260, y: 350, relX: 0.42, relY: 0.52, fileId: 'script.js' },
    { t: 3500, type: 'pointer', x: 290, y: 400, relX: 0.46, relY: 0.6, fileId: 'script.js' },

    // Instructor adds event listener code
    {
      t: 4500,
      type: 'content',
      fileId: 'script.js',
      range: { startLineNumber: 17, startColumn: 1, endLineNumber: 17, endColumn: 1 },
      text: '\nresetBtn.addEventListener(\'click\', () => {\n  count = 0;\n  countEl.innerText = count;\n});\n',
    },
    { t: 5000, type: 'cursor', fileId: 'script.js', position: { lineNumber: 21, column: 4 } },

    // Switch to index.html to add reset button markup
    { t: 6500, type: 'file_switch', fileId: 'index.html' },
    { t: 6800, type: 'pointer', x: 200, y: 210, relX: 0.32, relY: 0.3, fileId: 'index.html' },
    {
      t: 7200,
      type: 'content',
      fileId: 'index.html',
      range: { startLineNumber: 12, startColumn: 45, endLineNumber: 12, endColumn: 45 },
      text: '\n      <button id="reset">Reset</button>',
    },
    { t: 8000, type: 'cursor', fileId: 'index.html', position: { lineNumber: 13, column: 40 } },

    // Switch back to script.js
    { t: 9500, type: 'file_switch', fileId: 'script.js' },
    { t: 10000, type: 'pointer', x: 320, y: 280, relX: 0.5, relY: 0.4, fileId: 'script.js' },
  ],
  challenges: [
    {
      id: 'challenge-min-clamp',
      timestamp: 6000,
      instructions: 'Clamp the counter so it never drops below 0 when the Decrement button is clicked!',
      hint: 'In script.js, wrap the decrement logic in an if condition: if (count > 0) { count--; countEl.innerText = count; }',
      testCode: `
        const decBtn = document.getElementById('dec');
        const countEl = document.getElementById('count');
        expect(decBtn).toBeTruthy();
        expect(countEl).toBeTruthy();
        // Click decrement when count is 0
        decBtn.click();
        const currentVal = parseInt(countEl.innerText || '0', 10);
        expect(currentVal).toBeGreaterThan(-1);
      `,
      xpReward: 50,
      targetFile: 'script.js',
    },
    {
      id: 'challenge-reset-button',
      timestamp: 12000,
      instructions: 'Add a button with id="reset" that resets the counter back to 0 when clicked!',
      hint: 'Add <button id="reset">Reset</button> in index.html, then in script.js add document.getElementById("reset").addEventListener("click", () => { count = 0; countEl.innerText = count; })',
      testCode: `
        const resetBtn = document.getElementById('reset');
        const incBtn = document.getElementById('inc');
        const countEl = document.getElementById('count');
        expect(resetBtn).toBeTruthy();
        expect(incBtn).toBeTruthy();
        // Increment and test reset
        incBtn.click();
        incBtn.click();
        resetBtn.click();
        expect(parseInt(countEl.innerText || '0', 10)).toBe(0);
      `,
      xpReward: 100,
      targetFile: 'index.html',
    },
  ],
};
