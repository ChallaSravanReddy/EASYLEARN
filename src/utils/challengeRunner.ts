import type { ScrimChallenge } from '../types/scrim';

export interface ChallengeValidationResult {
  passed: boolean;
  message: string;
  error?: string;
  hint?: string;
  logs: string[];
}

/**
 * Web Audio API synthesized celebratory chime:
 * Plays a vibrant, euphoric 4-note major chord arpeggio with crystalline bell harmonics.
 */
export function playCelebrationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Bright C Major chime)
    const startTime = ctx.currentTime + 0.05;

    notes.forEach((freq, idx) => {
      const noteTime = startTime + idx * 0.08;

      // Primary sine oscillator (pure bell fundamental)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, noteTime);

      // Secondary triangle oscillator (warm sparkle harmonic overtone)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, noteTime);

      // Envelope configuration
      gain1.gain.setValueAtTime(0.001, noteTime);
      gain1.gain.exponentialRampToValueAtTime(0.25, noteTime + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.8);

      gain2.gain.setValueAtTime(0.001, noteTime);
      gain2.gain.exponentialRampToValueAtTime(0.08, noteTime + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.4);

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(ctx.destination);
      gain2.connect(ctx.destination);

      osc1.start(noteTime);
      osc2.start(noteTime);

      osc1.stop(noteTime + 0.85);
      osc2.stop(noteTime + 0.85);
    });

    // Clean up AudioContext after sound finishes
    setTimeout(() => {
      if (ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
    }, 1500);
  } catch (e) {
    console.warn('[challengeRunner] Web Audio chime could not play:', e);
  }
}

/**
 * Gentle failure sound feedback (soft low tone)
 */
export function playFailureBuzz(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.26);

    setTimeout(() => {
      if (ctx.state !== 'closed') ctx.close().catch(() => {});
    }, 500);
  } catch (e) {}
}

/**
 * Runs student's edited code inside an isolated sandbox iframe alongside
 * Jest-like test assertions and expected output checks.
 */
export function runChallengeValidation(
  files: Record<string, string>,
  challenge: ScrimChallenge
): Promise<ChallengeValidationResult> {
  return new Promise((resolve) => {
    const htmlContent = files['index.html'] || '<!DOCTYPE html><html><body></body></html>';
    const cssContent = files['styles.css'] || files['style.css'] || '';
    const jsContent = files['script.js'] || files['index.js'] || files['app.js'] || '';
    const testCode = challenge.testCode || '';
    const expectedOutput = challenge.expectedOutput;

    const testChannelId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Build the isolated sandbox HTML bundle
    const sandboxDoc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>${cssContent}</style>
</head>
<body>
  ${htmlContent.replace(/<!DOCTYPE html>|<html[^>]*>|<\/html>|<head[^>]*>[\s\S]*?<\/head>|<body[^>]*>|<\/body>/gi, '')}
  <script>
    (function() {
      const logs = [];
      const origLog = console.log;
      const origError = console.error;
      const origWarn = console.warn;

      console.log = function(...args) {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        origLog.apply(console, args);
      };
      console.error = function(...args) {
        logs.push('[Error] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        origError.apply(console, args);
      };
      console.warn = function(...args) {
        logs.push('[Warn] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        origWarn.apply(console, args);
      };

      // Lightweight Jest-like assertion matchers
      function expect(actual) {
        return {
          toBe: function(expected) {
            if (actual !== expected) {
              throw new Error('Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual));
            }
          },
          toEqual: function(expected) {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
              throw new Error('Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual));
            }
          },
          toContain: function(expected) {
            if (!actual || !String(actual).includes(String(expected))) {
              throw new Error('Expected output to contain ' + JSON.stringify(expected));
            }
          },
          toBeTruthy: function() {
            if (!actual) throw new Error('Expected value to be truthy, but received ' + String(actual));
          },
          toBeFalsy: function() {
            if (actual) throw new Error('Expected value to be falsy, but received ' + String(actual));
          },
          toBeGreaterThan: function(n) {
            if (!(actual > n)) throw new Error('Expected ' + actual + ' to be greater than ' + n);
          },
          toBeLessThan: function(n) {
            if (!(actual < n)) throw new Error('Expected ' + actual + ' to be less than ' + n);
          },
          toHaveLength: function(l) {
            if (!actual || actual.length !== l) throw new Error('Expected length ' + l + ' but got ' + (actual ? actual.length : 0));
          }
        };
      }

      function assert(condition, message) {
        if (!condition) throw new Error(message || 'Assertion condition failed');
      }

      // Execute student code then evaluate testCode
      try {
        ${jsContent}

        // Run automated assertions if specified
        ${testCode ? `
        try {
          ${testCode}
        } catch (testErr) {
          window.parent.postMessage({
            type: 'CHALLENGE_TEST_RESULT',
            channelId: '${testChannelId}',
            passed: false,
            error: testErr.message || String(testErr),
            logs: logs
          }, '*');
          return;
        }
        ` : ''}

        window.parent.postMessage({
          type: 'CHALLENGE_TEST_RESULT',
          channelId: '${testChannelId}',
          passed: true,
          logs: logs
        }, '*');
      } catch (runtimeErr) {
        window.parent.postMessage({
          type: 'CHALLENGE_TEST_RESULT',
          channelId: '${testChannelId}',
          passed: false,
          error: 'Runtime Error: ' + (runtimeErr.message || String(runtimeErr)),
          logs: logs
        }, '*');
      }
    })();
  </script>
</body>
</html>
    `;

    // Create an invisible sandbox iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.setAttribute('sandbox', 'allow-scripts');

    let timeoutId: any = null;

    const messageHandler = (e: MessageEvent) => {
      if (e.data && e.data.type === 'CHALLENGE_TEST_RESULT' && e.data.channelId === testChannelId) {
        cleanup();
        const logs = e.data.logs || [];

        // If expectedOutput is declared, verify it
        if (expectedOutput) {
          const joinedLogs = logs.join('\n');
          const hasExpected = joinedLogs.includes(expectedOutput);
          if (!hasExpected && e.data.passed) {
            resolve({
              passed: false,
              message: 'Tests completed but expected output was not produced.',
              error: `Output must include "${expectedOutput}". Received: "${joinedLogs}"`,
              hint: challenge.hint,
              logs,
            });
            return;
          }
        }

        if (e.data.passed) {
          resolve({
            passed: true,
            message: 'All test assertions passed successfully! Great work!',
            logs,
          });
        } else {
          resolve({
            passed: false,
            message: 'Challenge validation failed.',
            error: e.data.error || 'Test assertions failed.',
            hint: challenge.hint,
            logs,
          });
        }
      }
    };

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('message', messageHandler);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    window.addEventListener('message', messageHandler);

    // Safety timeout: 3000ms max to prevent frozen infinite loops
    timeoutId = setTimeout(() => {
      cleanup();
      resolve({
        passed: false,
        message: 'Validation timed out.',
        error: 'Execution timed out after 3000ms. Check for infinite loops or blocking code.',
        hint: challenge.hint,
        logs: [],
      });
    }, 3000);

    document.body.appendChild(iframe);
    iframe.srcdoc = sandboxDoc;
  });
}
