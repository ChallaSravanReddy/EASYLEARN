import type { ScrimManifest, ScrimEvent, PointerEventTelemetry } from '../types/scrim';

export interface CompressionStats {
  originalSizeBytes: number;
  compressedSizeBytes: number;
  bytesSaved: number;
  reductionPercentage: number;
  originalEventCount: number;
  compressedEventCount: number;
  strippedPointerCount: number;
}

export interface CompressManifestResult {
  compressedManifest: ScrimManifest;
  stats: CompressionStats;
}

/**
 * Runs an in-memory optimization and compression pass on ScrimManifest:
 * 1. Strips redundant stationary pointer telemetry (if movement distance < 2px).
 * 2. Deduplicates identical consecutive cursor and selection events.
 * 3. Truncates high-precision floating numbers to reduce JSON string footprint.
 */
export function compressScrimManifest(manifest: ScrimManifest): CompressManifestResult {
  const originalJson = JSON.stringify(manifest);
  const originalSizeBytes = new TextEncoder().encode(originalJson).length;
  const originalEvents = manifest.events || [];

  const compressedEvents: ScrimEvent[] = [];
  let strippedPointerCount = 0;
  let lastPointer: PointerEventTelemetry | null = null;
  let skippedPointerInRun: PointerEventTelemetry | null = null;

  for (let i = 0; i < originalEvents.length; i++) {
    const event = originalEvents[i];

    if (event.type === 'pointer') {
      const currentPtr: PointerEventTelemetry = {
        ...event,
        x: Math.round(event.x * 10) / 10,
        y: Math.round(event.y * 10) / 10,
        relX: event.relX !== undefined ? Math.round(event.relX * 10000) / 10000 : undefined,
        relY: event.relY !== undefined ? Math.round(event.relY * 10000) / 10000 : undefined,
      };

      if (!lastPointer) {
        compressedEvents.push(currentPtr);
        lastPointer = currentPtr;
        continue;
      }

      // Calculate Euclidean distance from last committed pointer
      const dist = Math.hypot(currentPtr.x - lastPointer.x, currentPtr.y - lastPointer.y);
      const isStatic = dist < 2.0;

      // Peak ahead to see if next event is also a pointer
      const nextEvent = originalEvents[i + 1];
      const nextIsPointer = nextEvent && nextEvent.type === 'pointer';

      if (isStatic && nextIsPointer) {
        // Point is stationary and movement hasn't resumed yet — omit intermediate jitter
        skippedPointerInRun = currentPtr;
        strippedPointerCount++;
        continue;
      }

      // If we previously skipped stationary points and movement resumes or stops, commit boundary point
      if (skippedPointerInRun && !isStatic) {
        compressedEvents.push(skippedPointerInRun);
        skippedPointerInRun = null;
      }

      compressedEvents.push(currentPtr);
      lastPointer = currentPtr;
    } else {
      // If we had a buffered stationary pointer before a non-pointer event (e.g. typing or file switch), flush it
      if (skippedPointerInRun) {
        compressedEvents.push(skippedPointerInRun);
        skippedPointerInRun = null;
      }

      // Deduplicate consecutive identical selection events
      if (event.type === 'selection' && compressedEvents.length > 0) {
        const prev = compressedEvents[compressedEvents.length - 1];
        if (
          prev.type === 'selection' &&
          prev.fileId === event.fileId &&
          prev.selection.selectionStartLineNumber === event.selection.selectionStartLineNumber &&
          prev.selection.selectionStartColumn === event.selection.selectionStartColumn &&
          prev.selection.positionLineNumber === event.selection.positionLineNumber &&
          prev.selection.positionColumn === event.selection.positionColumn
        ) {
          continue; // Skip duplicate selection
        }
      }

      compressedEvents.push(event);
      lastPointer = null;
    }
  }

  // Flush any trailing skipped pointer
  if (skippedPointerInRun) {
    compressedEvents.push(skippedPointerInRun);
  }

  const compressedManifest: ScrimManifest = {
    ...manifest,
    metadata: {
      ...manifest.metadata,
      totalEvents: compressedEvents.length,
    },
    events: compressedEvents,
  };

  const compressedJson = JSON.stringify(compressedManifest);
  const compressedSizeBytes = new TextEncoder().encode(compressedJson).length;
  const bytesSaved = Math.max(0, originalSizeBytes - compressedSizeBytes);
  const reductionPercentage =
    originalSizeBytes > 0 ? Math.round((bytesSaved / originalSizeBytes) * 1000) / 10 : 0;

  return {
    compressedManifest,
    stats: {
      originalSizeBytes,
      compressedSizeBytes,
      bytesSaved,
      reductionPercentage,
      originalEventCount: originalEvents.length,
      compressedEventCount: compressedEvents.length,
      strippedPointerCount,
    },
  };
}

/**
 * Format bytes to readable human strings (KB, MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
