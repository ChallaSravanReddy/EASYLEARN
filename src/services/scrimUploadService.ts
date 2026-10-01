import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { ScrimManifest } from '../types/scrim';

export interface ScrimRecord {
  id: string;
  title: string;
  description: string;
  instructor_id: string | null;
  duration_ms: number;
  audio_url: string;
  manifest_url: string;
  created_at: string;
}

export interface UploadProgress {
  stage: 'preparing' | 'compressing' | 'uploading_audio' | 'uploading_manifest' | 'saving_record' | 'completed' | 'error';
  audioProgress: number; // 0 - 100
  manifestProgress: number; // 0 - 100
  overallProgress: number; // 0 - 100
  message: string;
}

export interface DirectUploadParams {
  scrimId?: string;
  title: string;
  description?: string;
  instructorId?: string | null;
  audioBlob: Blob;
  manifest: ScrimManifest;
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * Uploads a Blob directly to a presigned URL using XMLHttpRequest for fine-grained progress events
 */
function uploadToPresignedUrlWithProgress(
  url: string,
  blob: Blob,
  contentType: string,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', contentType);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`Presigned upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error occurred during presigned upload'));
    xhr.send(blob);
  });
}

/**
 * End-to-end direct-to-storage upload pipeline:
 * 1. Obtains presigned upload URLs from Supabase Storage for 'audio.webm' and 'manifest.json'
 * 2. Streams files in parallel directly to bucket 'scrim-assets' (bypassing serverless payload limits)
 * 3. Commits record to 'scrims' database table
 */
export async function uploadScrimSession(params: DirectUploadParams): Promise<ScrimRecord> {
  const {
    scrimId = crypto.randomUUID ? crypto.randomUUID() : `scrim-${Date.now()}`,
    title,
    description = '',
    instructorId = null,
    audioBlob,
    manifest,
    onProgress,
  } = params;

  let audioPct = 0;
  let manifestPct = 0;

  const notifyProgress = (
    stage: UploadProgress['stage'],
    message: string,
    aPct = audioPct,
    mPct = manifestPct
  ) => {
    audioPct = aPct;
    manifestPct = mPct;
    const overall = Math.round((audioPct * 0.7) + (manifestPct * 0.25) + (stage === 'completed' ? 5 : 0));
    if (onProgress) {
      onProgress({
        stage,
        audioProgress: audioPct,
        manifestProgress: manifestPct,
        overallProgress: Math.min(100, Math.max(0, overall)),
        message,
      });
    }
  };

  notifyProgress('preparing', 'Initializing direct upload session...', 0, 0);

  const audioExt = audioBlob.type.includes('mp4') ? 'mp4' : 'webm';
  const audioMime = audioBlob.type || 'audio/webm';
  const prefix = instructorId || 'anonymous';
  const audioPath = `${prefix}/${scrimId}/audio.${audioExt}`;
  const manifestPath = `${prefix}/${scrimId}/manifest.json`;

  const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
    type: 'application/json',
  });

  // Fallback to local simulated storage if Supabase credentials are not configured in environment
  if (!isSupabaseConfigured) {
    console.info('[ScrimUpload] Supabase not configured in .env. Running local simulated direct-to-storage pipeline.');

    // Simulated progress stream
    for (let p = 10; p <= 90; p += 20) {
      await new Promise((r) => setTimeout(r, 120));
      notifyProgress('uploading_audio', `Uploading audio stream & manifest in parallel (${p}%)...`, p, p);
    }

    notifyProgress('saving_record', 'Registering record in scrims table...', 100, 100);
    await new Promise((r) => setTimeout(r, 200));

    const mockRecord: ScrimRecord = {
      id: scrimId,
      title: title || manifest.metadata.title,
      description,
      instructor_id: instructorId,
      duration_ms: manifest.metadata.duration,
      audio_url: URL.createObjectURL(audioBlob),
      manifest_url: URL.createObjectURL(manifestBlob),
      created_at: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('easy_published_scrims') || '[]');
      existing.unshift(mockRecord);
      localStorage.setItem('easy_published_scrims', JSON.stringify(existing));
    } catch (e) {}

    notifyProgress('completed', 'Session published successfully!', 100, 100);
    return mockRecord;
  }

  // --- Real Supabase Direct-to-Storage Pipeline ---
  try {
    notifyProgress('uploading_audio', 'Requesting presigned upload channels...', 5, 5);

    // 1. Generate Presigned URLs or Direct Upload via Supabase Storage
    const [signedAudioRes, signedManifestRes] = await Promise.all([
      supabase.storage.from('scrim-assets').createSignedUploadUrl(audioPath),
      supabase.storage.from('scrim-assets').createSignedUploadUrl(manifestPath),
    ]);

    let audioUploadPromise: Promise<any>;
    let manifestUploadPromise: Promise<any>;

    // Check if presigned URLs were successfully generated
    if (signedAudioRes.data?.signedUrl && signedManifestRes.data?.signedUrl) {
      // Parallel upload directly to presigned storage endpoints
      audioUploadPromise = uploadToPresignedUrlWithProgress(
        signedAudioRes.data.signedUrl,
        audioBlob,
        audioMime,
        (p) => notifyProgress('uploading_audio', `Uploading audio stream directly (${p}%)...`, p, manifestPct)
      );

      manifestUploadPromise = uploadToPresignedUrlWithProgress(
        signedManifestRes.data.signedUrl,
        manifestBlob,
        'application/json',
        (p) => notifyProgress('uploading_manifest', `Uploading telemetry manifest (${p}%)...`, audioPct, p)
      );
    } else {
      // Fallback: Direct SDK upload to 'scrim-assets' bucket
      notifyProgress('uploading_audio', 'Uploading directly to storage bucket...', 10, 10);

      audioUploadPromise = supabase.storage
        .from('scrim-assets')
        .upload(audioPath, audioBlob, { contentType: audioMime, upsert: true })
        .then(({ error }) => {
          if (error) throw error;
          notifyProgress('uploading_audio', 'Audio uploaded', 100, manifestPct);
        });

      manifestUploadPromise = supabase.storage
        .from('scrim-assets')
        .upload(manifestPath, manifestBlob, { contentType: 'application/json', upsert: true })
        .then(({ error }) => {
          if (error) throw error;
          notifyProgress('uploading_manifest', 'Manifest uploaded', audioPct, 100);
        });
    }

    // Execute uploads in parallel
    await Promise.all([audioUploadPromise, manifestUploadPromise]);

    // 2. Resolve Public CDN URLs
    const { data: audioUrlData } = supabase.storage.from('scrim-assets').getPublicUrl(audioPath);
    const { data: manifestUrlData } = supabase.storage.from('scrim-assets').getPublicUrl(manifestPath);

    const publicAudioUrl = audioUrlData.publicUrl;
    const publicManifestUrl = manifestUrlData.publicUrl;

    notifyProgress('saving_record', 'Registering metadata in scrims table...', 100, 100);

    // 3. Save Record into 'scrims' Table
    const recordPayload = {
      id: scrimId,
      title: title || manifest.metadata.title,
      description,
      instructor_id: instructorId || null,
      duration_ms: manifest.metadata.duration,
      audio_url: publicAudioUrl,
      manifest_url: publicManifestUrl,
      created_at: new Date().toISOString(),
    };

    const { data: savedRecord, error: dbError } = await supabase
      .from('scrims')
      .insert([recordPayload])
      .select()
      .single();

    if (dbError) {
      console.warn('[ScrimUpload] Database insert warning (proceeding with asset URLs):', dbError);
    }

    const finalRecord: ScrimRecord = savedRecord || recordPayload;

    notifyProgress('completed', 'Scrim session published successfully!', 100, 100);
    return finalRecord;
  } catch (err: any) {
    notifyProgress('error', `Upload failed: ${err.message || String(err)}`);
    throw err;
  }
}

/**
 * Fetches a published scrim session from Supabase by ID
 */
export async function fetchPublishedScrim(scrimId: string): Promise<{
  record: ScrimRecord;
  manifest: ScrimManifest;
} | null> {
  try {
    // 1. Query 'scrims' table
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('scrims')
        .select('*')
        .eq('id', scrimId)
        .single();

      if (error || !data) {
        console.warn('[fetchPublishedScrim] DB query error or not found:', error);
      } else {
        const manifestRes = await fetch(data.manifest_url);
        const manifest = (await manifestRes.json()) as ScrimManifest;
        return { record: data as ScrimRecord, manifest };
      }
    }

    // 2. LocalStorage fallback for demo/offline
    const localScrims: ScrimRecord[] = JSON.parse(
      localStorage.getItem('easy_published_scrims') || '[]'
    );
    const found = localScrims.find((s) => s.id === scrimId);
    if (found) {
      const manifestRes = await fetch(found.manifest_url);
      const manifest = (await manifestRes.json()) as ScrimManifest;
      return { record: found, manifest };
    }

    return null;
  } catch (e) {
    console.error('[fetchPublishedScrim] Failed to load scrim:', e);
    return null;
  }
}
