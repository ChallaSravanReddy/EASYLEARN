-- ==============================================================================
-- Supabase Schema & Storage Policies for Scrim Recording & Publishing Pipeline
-- ==============================================================================

-- 1. Create the 'scrim-assets' storage bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'scrim-assets',
  'scrim-assets',
  true,
  104857600, -- 100 MB limit
  ARRAY['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg', 'application/json']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg', 'application/json'];

-- 2. Storage Policies for 'scrim-assets'
-- Allow public read access to all scrim audio & manifest files
CREATE POLICY "Public Read Access for Scrim Assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'scrim-assets');

-- Allow authenticated users and anonymous instructors to upload scrim assets
CREATE POLICY "Allow Direct Storage Upload for Scrim Assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'scrim-assets');

-- Allow update of scrim assets by author or anon
CREATE POLICY "Allow Update Scrim Assets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'scrim-assets');

-- 3. Create the 'scrims' database table
CREATE TABLE IF NOT EXISTS public.scrims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  duration_ms BIGINT NOT NULL DEFAULT 0,
  audio_url TEXT NOT NULL,
  manifest_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_scrims_created_at ON public.scrims (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrims_instructor_id ON public.scrims (instructor_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.scrims ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all published scrims
CREATE POLICY "Allow public read access on scrims"
ON public.scrims
FOR SELECT
USING (true);

-- Allow authenticated and anonymous users to insert new scrim records
CREATE POLICY "Allow insert on scrims"
ON public.scrims
FOR INSERT
WITH CHECK (true);

-- Allow instructors to update their own scrims
CREATE POLICY "Allow instructors to update own scrims"
ON public.scrims
FOR UPDATE
USING (auth.uid() = instructor_id OR instructor_id IS NULL);

-- 4. Supabase RPC Function: Generate Presigned Upload Session Paths
-- Returns target asset paths for direct-to-storage upload
CREATE OR REPLACE FUNCTION public.get_scrim_upload_paths(
  p_scrim_id UUID,
  p_audio_ext TEXT DEFAULT 'webm'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_instructor_id TEXT;
  v_audio_path TEXT;
  v_manifest_path TEXT;
BEGIN
  v_instructor_id := COALESCE(auth.uid()::text, 'anonymous');
  v_audio_path := v_instructor_id || '/' || p_scrim_id::text || '/audio.' || p_audio_ext;
  v_manifest_path := v_instructor_id || '/' || p_scrim_id::text || '/manifest.json';

  RETURN jsonb_build_object(
    'scrim_id', p_scrim_id,
    'audio_path', v_audio_path,
    'manifest_path', v_manifest_path,
    'bucket', 'scrim-assets'
  );
END;
$$;
