import { bundleVirtualProject } from './virtualBundler';

/**
 * Dedicated Web Worker for In-Memory Client-Side Bundling.
 * Keeps compilation off the main UI thread to maintain silky-smooth 60fps responsiveness.
 */
self.onmessage = (event: MessageEvent) => {
  const { id, files, entryFile } = event.data || {};

  try {
    const result = bundleVirtualProject(files || {}, entryFile);
    self.postMessage({
      id,
      ...result,
    });
  } catch (err: any) {
    self.postMessage({
      id,
      success: false,
      error: {
        type: 'runtime',
        message: err.message || 'Worker compilation crash',
        stack: err.stack,
      },
    });
  }
};
