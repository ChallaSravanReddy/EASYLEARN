-- ==============================================================================
-- EasyLearn: Comprehensive Scrimba Backend Infrastructure Migration
-- Replicates Scrimba's full architecture:
--   1. Delta Scrim Event & Keyframe Model
--   2. Copy-on-Write (CoW) Scrim Forks & Branching Engine
--   3. Time-Anchored Student Notes & Bookmarks
--   4. Timeline Community Q&A Discussions
--   5. AI Code Explainer Pedagogical Cache
--   6. Telemetry Hotspot Heatmap Engine & Analytics
--   7. Career Tracks & Course Module Hierarchies
--   8. Challenge Submissions & XP Gamification
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- 2. LEARNING TRACKS (Career Paths / Curriculums)
CREATE TABLE IF NOT EXISTS public.learning_tracks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  tagline TEXT DEFAULT '',
  thumbnail_url TEXT,
  banner_url TEXT,
  badge_text TEXT DEFAULT 'Career Path',
  color_gradient TEXT DEFAULT 'from-blue-600 to-indigo-600',
  estimated_hours INTEGER DEFAULT 40,
  total_scrims INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'Beginner', -- 'Beginner' | 'Intermediate' | 'Advanced'
  is_pro BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TRACK COURSES (Many-to-many link between tracks and courses)
CREATE TABLE IF NOT EXISTS public.track_courses (
  track_id TEXT NOT NULL REFERENCES public.learning_tracks(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_number INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 1,
  PRIMARY KEY (track_id, course_id)
);

-- 4. COURSE MODULES (Chapters / Sections inside courses)
CREATE TABLE IF NOT EXISTS public.course_modules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alter recorded_classes to link to modules and store keyframe index
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'recorded_classes' AND column_name = 'module_id'
  ) THEN
    ALTER TABLE public.recorded_classes ADD COLUMN module_id TEXT REFERENCES public.course_modules(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'recorded_classes' AND column_name = 'keyframe_index'
  ) THEN
    ALTER TABLE public.recorded_classes ADD COLUMN keyframe_index JSONB DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'recorded_classes' AND column_name = 'is_free_preview'
  ) THEN
    ALTER TABLE public.recorded_classes ADD COLUMN is_free_preview BOOLEAN DEFAULT true;
  END IF;
END $$;


-- 5. SCRIM FORKS TABLE (Copy-on-Write Student Branches)
CREATE TABLE IF NOT EXISTS public.scrim_forks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  parent_scrim_id TEXT NOT NULL REFERENCES public.recorded_classes(id) ON DELETE CASCADE,
  parent_fork_id TEXT REFERENCES public.scrim_forks(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'Student',
  forked_at_ms BIGINT NOT NULL DEFAULT 0,
  title TEXT NOT NULL DEFAULT 'My Scrim Fork',
  description TEXT DEFAULT '',
  files JSONB NOT NULL DEFAULT '{}'::jsonb,
  active_file TEXT DEFAULT 'index.js',
  share_slug TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 10),
  is_public BOOLEAN DEFAULT true,
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 6. TIME-ANCHORED NOTES & BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.scrim_notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scrim_id TEXT NOT NULL REFERENCES public.recorded_classes(id) ON DELETE CASCADE,
  timestamp_ms BIGINT NOT NULL DEFAULT 0,
  file_path TEXT DEFAULT 'index.js',
  line_number INTEGER DEFAULT 1,
  code_snippet TEXT DEFAULT '',
  note_text TEXT NOT NULL,
  color_tag TEXT DEFAULT 'amber', -- 'amber' | 'sky' | 'emerald' | 'purple' | 'rose'
  is_bookmarked BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 7. TIMELINE COMMUNITY DISCUSSIONS / Q&A TABLE
CREATE TABLE IF NOT EXISTS public.scrim_discussions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  scrim_id TEXT NOT NULL REFERENCES public.recorded_classes(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES public.scrim_discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT DEFAULT 'EasyLearn Student',
  user_avatar TEXT,
  timestamp_ms BIGINT NOT NULL DEFAULT 0,
  file_path TEXT DEFAULT 'index.js',
  line_number INTEGER,
  code_snippet TEXT,
  title TEXT DEFAULT '',
  content TEXT NOT NULL,
  upvotes_count INTEGER DEFAULT 0,
  is_instructor_answered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 8. AI EXPLAINER PEDAGOGICAL CACHE TABLE
CREATE TABLE IF NOT EXISTS public.ai_explainer_cache (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  content_hash TEXT UNIQUE NOT NULL,
  scrim_id TEXT REFERENCES public.recorded_classes(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  code_snippet TEXT NOT NULL,
  explanation JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 9. SCRIM TELEMETRY & PLAYBACK HOTSPOT EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.scrim_telemetry_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scrim_id TEXT NOT NULL REFERENCES public.recorded_classes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'play' | 'pause' | 'seek' | 'edit_code' | 'fork' | 'challenge_pass' | 'complete'
  timestamp_ms BIGINT NOT NULL DEFAULT 0,
  playback_speed NUMERIC(3, 2) DEFAULT 1.0,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 10. CHALLENGE SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL REFERENCES public.class_challenges(id) ON DELETE CASCADE,
  scrim_id TEXT NOT NULL REFERENCES public.recorded_classes(id) ON DELETE CASCADE,
  code_submitted TEXT NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  xp_awarded INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 11. STUDENT PROFILES & GAMIFICATION TABLE
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT 'EasyLearn Explorer',
  handle TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  total_xp INTEGER DEFAULT 150,
  streak_days INTEGER DEFAULT 1,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  pro_status BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 12. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_learning_tracks_slug ON public.learning_tracks(slug);
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON public.course_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_scrim_forks_parent ON public.scrim_forks(parent_scrim_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrim_forks_user ON public.scrim_forks(user_id);
CREATE INDEX IF NOT EXISTS idx_scrim_forks_slug ON public.scrim_forks(share_slug);
CREATE INDEX IF NOT EXISTS idx_scrim_notes_lookup ON public.scrim_notes(scrim_id, user_id, timestamp_ms);
CREATE INDEX IF NOT EXISTS idx_scrim_discussions_lookup ON public.scrim_discussions(scrim_id, timestamp_ms);
CREATE INDEX IF NOT EXISTS idx_scrim_discussions_parent ON public.scrim_discussions(parent_id);
CREATE INDEX IF NOT EXISTS idx_ai_explainer_cache_hash ON public.ai_explainer_cache(content_hash);
CREATE INDEX IF NOT EXISTS idx_scrim_telemetry_lookup ON public.scrim_telemetry_events(scrim_id, timestamp_ms);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_lookup ON public.challenge_submissions(user_id, challenge_id);


-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.learning_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrim_forks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrim_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrim_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_explainer_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrim_telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Tracks & Modules: Public read
DROP POLICY IF EXISTS "Public read learning tracks" ON public.learning_tracks;
CREATE POLICY "Public read learning tracks" ON public.learning_tracks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read track courses" ON public.track_courses;
CREATE POLICY "Public read track courses" ON public.track_courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read course modules" ON public.course_modules;
CREATE POLICY "Public read course modules" ON public.course_modules FOR SELECT USING (true);

-- Scrim Forks: Public read, authenticated create/update
DROP POLICY IF EXISTS "Public read scrim forks" ON public.scrim_forks;
CREATE POLICY "Public read scrim forks" ON public.scrim_forks FOR SELECT USING (is_public = true OR auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Anyone can create scrim fork" ON public.scrim_forks;
CREATE POLICY "Anyone can create scrim fork" ON public.scrim_forks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Owner update scrim fork" ON public.scrim_forks;
CREATE POLICY "Owner update scrim fork" ON public.scrim_forks FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Scrim Notes: Private to user
DROP POLICY IF EXISTS "Users manage own notes" ON public.scrim_notes;
CREATE POLICY "Users manage own notes" ON public.scrim_notes FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Scrim Discussions: Public read, authenticated or guest insert
DROP POLICY IF EXISTS "Public read discussions" ON public.scrim_discussions;
CREATE POLICY "Public read discussions" ON public.scrim_discussions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert discussions" ON public.scrim_discussions;
CREATE POLICY "Insert discussions" ON public.scrim_discussions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Update own discussions" ON public.scrim_discussions;
CREATE POLICY "Update own discussions" ON public.scrim_discussions FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- AI Explainer Cache: Public read & insert
DROP POLICY IF EXISTS "Public read ai explainer cache" ON public.ai_explainer_cache;
CREATE POLICY "Public read ai explainer cache" ON public.ai_explainer_cache FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert ai explainer cache" ON public.ai_explainer_cache;
CREATE POLICY "Insert ai explainer cache" ON public.ai_explainer_cache FOR INSERT WITH CHECK (true);

-- Telemetry Events: Insert permitted, aggregates public
DROP POLICY IF EXISTS "Insert telemetry events" ON public.scrim_telemetry_events;
CREATE POLICY "Insert telemetry events" ON public.scrim_telemetry_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read telemetry" ON public.scrim_telemetry_events;
CREATE POLICY "Public read telemetry" ON public.scrim_telemetry_events FOR SELECT USING (true);

-- Challenge Submissions: Owner manages
DROP POLICY IF EXISTS "Students manage own submissions" ON public.challenge_submissions;
CREATE POLICY "Students manage own submissions" ON public.challenge_submissions FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Student Profiles: Public read, owner update
DROP POLICY IF EXISTS "Public read student profiles" ON public.student_profiles;
CREATE POLICY "Public read student profiles" ON public.student_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.student_profiles;
CREATE POLICY "Users update own profile" ON public.student_profiles FOR ALL USING (auth.uid() = id OR id IS NULL);


-- 14. RPC PROCEDURES & HELPER FUNCTIONS

-- A. Create Scrim Fork Atomically
CREATE OR REPLACE FUNCTION public.create_scrim_fork(
  p_parent_scrim_id TEXT,
  p_timestamp_ms BIGINT,
  p_files JSONB,
  p_title TEXT DEFAULT 'Student Fork',
  p_active_file TEXT DEFAULT 'index.js',
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_fork_id TEXT := 'fork-' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 12);
  v_share_slug TEXT := substring(md5(random()::text) from 1 for 8);
  v_result JSONB;
BEGIN
  INSERT INTO public.scrim_forks (
    id, parent_scrim_id, user_id, forked_at_ms, title, files, active_file, share_slug, created_at, updated_at
  ) VALUES (
    v_fork_id, p_parent_scrim_id, p_user_id, p_timestamp_ms, p_title, p_files, p_active_file, v_share_slug, NOW(), NOW()
  );

  SELECT to_jsonb(f) INTO v_result
  FROM public.scrim_forks f
  WHERE f.id = v_fork_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- B. Scrim Telemetry Heatmap Generator (Aggregates play, pause, seek hotspots into timeline buckets)
CREATE OR REPLACE FUNCTION public.get_scrim_heatmap(
  p_scrim_id TEXT,
  p_bucket_ms BIGINT DEFAULT 5000
)
RETURNS TABLE (
  bucket_index BIGINT,
  start_ms BIGINT,
  end_ms BIGINT,
  interaction_count BIGINT,
  normalized_intensity NUMERIC
) AS $$
DECLARE
  v_max_count BIGINT;
BEGIN
  -- Compute max interactions in any single bucket for normalization
  SELECT COALESCE(MAX(cnt), 1) INTO v_max_count
  FROM (
    SELECT COUNT(*) AS cnt
    FROM public.scrim_telemetry_events
    WHERE scrim_id = p_scrim_id
    GROUP BY (timestamp_ms / p_bucket_ms)
  ) sub;

  RETURN QUERY
  SELECT
    (timestamp_ms / p_bucket_ms) AS bucket_index,
    (timestamp_ms / p_bucket_ms) * p_bucket_ms AS start_ms,
    ((timestamp_ms / p_bucket_ms) + 1) * p_bucket_ms AS end_ms,
    COUNT(*) AS interaction_count,
    ROUND((COUNT(*)::numeric / v_max_count), 2) AS normalized_intensity
  FROM public.scrim_telemetry_events
  WHERE scrim_id = p_scrim_id
  GROUP BY (timestamp_ms / p_bucket_ms)
  ORDER BY bucket_index ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- C. Upvote Discussion Atomically
CREATE OR REPLACE FUNCTION public.upvote_scrim_discussion(p_discussion_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  UPDATE public.scrim_discussions
  SET upvotes_count = upvotes_count + 1
  WHERE id = p_discussion_id
  RETURNING upvotes_count INTO v_new_count;

  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- D. Star Scrim Fork Atomically
CREATE OR REPLACE FUNCTION public.star_scrim_fork(p_fork_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  UPDATE public.scrim_forks
  SET stars_count = stars_count + 1
  WHERE id = p_fork_id
  RETURNING stars_count INTO v_new_count;

  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- 15. SEED CURRICULUM CAREER PATHS & CHAPTER MODULES
-- ==============================================================================

-- A. Career Tracks
INSERT INTO public.learning_tracks (
  id, title, slug, description, tagline, badge_text, color_gradient, estimated_hours, total_scrims, difficulty, is_pro, is_published, order_index
)
VALUES
(
  'track-frontend-career',
  'The Frontend Developer Career Path',
  'the-frontend-developer-career-path',
  'The definitive career path to become a job-ready Frontend Developer. Learn HTML, CSS, JavaScript, React, UI/UX design, and interview skills with hundreds of interactive code scrims.',
  '70+ hours of interactive scrims with live code editor synchronization',
  'Career Path',
  'from-blue-600 via-indigo-600 to-violet-700',
  75,
  140,
  'Beginner',
  false,
  true,
  1
),
(
  'track-fullstack-ai',
  'Fullstack AI & Modern Web Engineer',
  'fullstack-ai-engineer',
  'Learn to integrate Large Language Models, vectorize embeddings, build interactive React & Node applications, and deploy production fullstack systems.',
  'Build next-generation AI agents and intelligent applications',
  'Trending',
  'from-emerald-600 via-teal-600 to-cyan-700',
  45,
  80,
  'Intermediate',
  true,
  true,
  2
),
(
  'track-javascript-deep-dive',
  'JavaScript Mastery & Data Structures',
  'javascript-mastery',
  'Deep dive into the JavaScript engine, event loop, memory management, closures, prototypes, asynchronous patterns, and algorithmic problem solving.',
  'Master the fundamentals and advanced internals of JavaScript',
  'Popular',
  'from-amber-500 via-orange-600 to-rose-600',
  35,
  65,
  'Beginner',
  false,
  true,
  3
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  tagline = EXCLUDED.tagline,
  badge_text = EXCLUDED.badge_text,
  estimated_hours = EXCLUDED.estimated_hours,
  total_scrims = EXCLUDED.total_scrims,
  updated_at = NOW();


-- B. Course Modules (Chapters) for Course JavaScript
INSERT INTO public.course_modules (
  id, course_id, title, description, order_index
)
VALUES
(
  'mod-js-foundations',
  'course-javascript',
  'Module 1: JavaScript Foundations & Syntax',
  'Understand variables, data types, console logging, and string interpolation in live coding scrims.',
  1
),
(
  'mod-js-control-flow',
  'course-javascript',
  'Module 2: Functions, Conditionals & Loops',
  'Master reusable logic with arrow functions, if/else statements, and modern iteration patterns.',
  2
),
(
  'mod-js-dom-events',
  'course-javascript',
  'Module 3: Dynamic DOM Manipulation & Events',
  'Bring web pages to life by listening for clicks, keyboard input, and altering styles and elements.',
  3
),
(
  'mod-js-async-capstone',
  'course-javascript',
  'Module 4: Async JavaScript & Real-World Projects',
  'Fetch external APIs, handle promises, async/await, and assemble complete interactive web applications.',
  4
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Assign recorded classes to modules
UPDATE public.recorded_classes SET module_id = 'mod-js-foundations' WHERE id IN ('class-js-launchpad', 'class-js-intro', 'class-js-variables');
UPDATE public.recorded_classes SET module_id = 'mod-js-control-flow' WHERE id IN ('class-js-functions');
UPDATE public.recorded_classes SET module_id = 'mod-js-dom-events' WHERE id IN ('class-js-dom');
UPDATE public.recorded_classes SET module_id = 'mod-js-async-capstone' WHERE id IN ('class-js-es6', 'class-js-capstone');

-- C. Track Course Associations
INSERT INTO public.track_courses (track_id, course_id, module_number, order_index)
VALUES
  ('track-frontend-career', 'course-javascript', 1, 1),
  ('track-frontend-career', 'course-fullstack', 2, 2),
  ('track-fullstack-ai', 'course-fullstack', 1, 1),
  ('track-fullstack-ai', 'course-python', 2, 2),
  ('track-javascript-deep-dive', 'course-javascript', 1, 1)
ON CONFLICT (track_id, course_id) DO NOTHING;
