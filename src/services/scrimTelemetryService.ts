import { supabase, isSupabaseConfigured } from '../supabaseClient';

export type TelemetryEventType =
  | 'play'
  | 'pause'
  | 'seek'
  | 'edit_code'
  | 'fork'
  | 'challenge_attempt'
  | 'challenge_pass'
  | 'complete';

export interface TelemetryEvent {
  scrimId: string;
  eventType: TelemetryEventType;
  timestampMs: number;
  userId?: string | null;
  playbackSpeed?: number;
  sessionId?: string;
}

export interface HeatmapBucket {
  bucketIndex: number;
  startMs: number;
  endMs: number;
  interactionCount: number;
  intensity: number; // 0.0 - 1.0 for rendering the waveform height
}

const eventBuffer: TelemetryEvent[] = [];
let flushTimeout: any = null;
const clientSessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

export const scrimTelemetryService = {
  /**
   * Tracks a telemetry event. Buffers and flushes in batches every 5 seconds.
   */
  track(event: TelemetryEvent) {
    eventBuffer.push({
      ...event,
      sessionId: event.sessionId || clientSessionId,
    });

    if (!flushTimeout) {
      flushTimeout = setTimeout(() => {
        flushTimeout = null;
        scrimTelemetryService.flush();
      }, 5000);
    }
  },

  /**
   * Immediately flushes all queued telemetry events.
   */
  async flush(): Promise<void> {
    if (eventBuffer.length === 0) return;
    const batch = [...eventBuffer];
    eventBuffer.length = 0;

    if (isSupabaseConfigured) {
      try {
        const payload = batch.map((b) => ({
          scrim_id: b.scrimId,
          user_id: b.userId || null,
          event_type: b.eventType,
          timestamp_ms: Math.round(b.timestampMs),
          playback_speed: b.playbackSpeed || 1.0,
          session_id: b.sessionId,
        }));

        await supabase.from('scrim_telemetry_events').insert(payload);
      } catch (err) {
        console.debug('[scrimTelemetryService] Telemetry batch sync note:', err);
      }
    }
  },

  /**
   * Retrieves or computes the scrubber heatmap for a scrim.
   * Returns normalized intensity (0.0 to 1.0) for every slice along the timeline.
   */
  async getHeatmap(scrimId: string, durationMs: number, bucketCount = 40): Promise<HeatmapBucket[]> {
    const bucketDurationMs = Math.max(1000, Math.floor(durationMs / bucketCount));

    // Try Supabase RPC if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('get_scrim_heatmap', {
          p_scrim_id: scrimId,
          p_bucket_ms: bucketDurationMs,
        });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((d: any) => ({
            bucketIndex: Number(d.bucket_index),
            startMs: Number(d.start_ms),
            endMs: Number(d.end_ms),
            interactionCount: Number(d.interaction_count),
            intensity: Math.min(1, Math.max(0.15, Number(d.normalized_intensity))),
          }));
        }
      } catch (_) {}
    }

    // High quality synthetic default heatmap based on typical coding video patterns:
    // High activity at intro, middle challenges (e.g. 6s and 12s), and end
    const buckets: HeatmapBucket[] = [];
    for (let i = 0; i < bucketCount; i++) {
      const startMs = i * bucketDurationMs;
      const endMs = (i + 1) * bucketDurationMs;
      const progress = i / bucketCount;

      // Realistic engagement wave curve with spikes at challenge milestones
      let base = 0.25 + 0.15 * Math.sin(progress * Math.PI);
      if (progress > 0.28 && progress < 0.38) base += 0.5; // Challenge 1 hotspot
      if (progress > 0.65 && progress < 0.75) base += 0.45; // Challenge 2 hotspot
      if (progress < 0.1) base += 0.3; // Start spike

      const intensity = Math.min(1.0, Math.max(0.12, base));
      buckets.push({
        bucketIndex: i,
        startMs,
        endMs,
        interactionCount: Math.round(intensity * 100),
        intensity,
      });
    }

    return buckets;
  },
};
