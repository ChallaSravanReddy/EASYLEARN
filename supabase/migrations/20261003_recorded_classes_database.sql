-- ==============================================================================
-- EasyLearn: Comprehensive Recorded Classes & Scrims Database Schema
-- Provides complete storage for recorded interactive classes, courses, telemetry
-- manifests, audio streams, interactive code challenges, and student progress.
-- Includes full data seeding of all existing curriculum courses and recorded classes.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. STORAGE BUCKET: 'scrim-assets'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'scrim-assets',
  'scrim-assets',
  true,
  104857600, -- 100 MB max audio & telemetry payload
  ARRAY['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg', 'application/json']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg', 'application/json'];

-- Storage Security Policies
DROP POLICY IF EXISTS "Public Read Access for Scrim Assets" ON storage.objects;
CREATE POLICY "Public Read Access for Scrim Assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'scrim-assets');

DROP POLICY IF EXISTS "Allow Upload for Scrim Assets" ON storage.objects;
CREATE POLICY "Allow Upload for Scrim Assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'scrim-assets');

DROP POLICY IF EXISTS "Allow Update Scrim Assets" ON storage.objects;
CREATE POLICY "Allow Update Scrim Assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'scrim-assets');

DROP POLICY IF EXISTS "Allow Delete Scrim Assets" ON storage.objects;
CREATE POLICY "Allow Delete Scrim Assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'scrim-assets');


-- 3. COURSES TABLE (Curriculum groupings)
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  slug TEXT UNIQUE NOT NULL,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  instructor_name TEXT DEFAULT 'EasyLearn Instructor',
  category TEXT DEFAULT 'General',
  difficulty TEXT DEFAULT 'Beginner', -- 'Beginner' | 'Intermediate' | 'Advanced'
  thumbnail_url TEXT,
  total_lessons INTEGER DEFAULT 0,
  rating NUMERIC(3, 1) DEFAULT 4.8,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 4. RECORDED CLASSES TABLE (Primary table carrying all recorded classes & scrims)
CREATE TABLE IF NOT EXISTS public.recorded_classes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  slug TEXT,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  instructor_name TEXT DEFAULT 'Instructor',
  category TEXT DEFAULT 'Web Development',
  difficulty TEXT DEFAULT 'Beginner',
  duration_ms BIGINT NOT NULL DEFAULT 0,
  audio_url TEXT NOT NULL,
  manifest_url TEXT NOT NULL,
  manifest JSONB, -- Full inlined manifest JSON for instant O(1) query
  initial_files JSONB DEFAULT '{}'::jsonb, -- Starting code snapshot
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upgrade existing tables to TEXT id type if previously created as UUID
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'recorded_classes' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.recorded_classes ALTER COLUMN id TYPE TEXT;
    ALTER TABLE public.recorded_classes ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.courses ALTER COLUMN id TYPE TEXT;
    ALTER TABLE public.courses ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  END IF;
END $$;

-- Backwards compatibility: if 'scrims' exists as an actual table, migrate any existing data and replace with view
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scrims'
  ) THEN
    -- Migrate existing records from scrims table into recorded_classes
    INSERT INTO public.recorded_classes (
      id, title, description, instructor_id, instructor_name, duration_ms, audio_url, manifest_url, created_at
    )
    SELECT
      id::text, title, COALESCE(description, ''), instructor_id, 'Instructor', duration_ms, audio_url, manifest_url, created_at
    FROM public.scrims
    ON CONFLICT (id) DO NOTHING;

    -- Drop the old table (and any attached policies/indexes) so the view can be created
    DROP TABLE public.scrims CASCADE;
  END IF;
END $$;

-- Backwards compatibility view: alias 'scrims' to 'recorded_classes'
CREATE OR REPLACE VIEW public.scrims AS
SELECT
  id,
  title,
  description,
  instructor_id,
  duration_ms,
  audio_url,
  manifest_url,
  created_at
FROM public.recorded_classes;


-- 5. CLASS CHALLENGES TABLE (Embedded milestone coding challenges)
CREATE TABLE IF NOT EXISTS public.class_challenges (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  class_id TEXT NOT NULL REFERENCES public.recorded_classes(id) ON DELETE CASCADE,
  timestamp_ms BIGINT NOT NULL,
  instructions TEXT NOT NULL,
  expected_output TEXT,
  test_code TEXT,
  hint TEXT,
  xp_reward INTEGER DEFAULT 50,
  target_file TEXT DEFAULT 'index.html',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 6. STUDENT PROGRESS & ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.student_progress (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES public.recorded_classes(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  last_position_ms BIGINT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  forked_code JSONB, -- Student's custom code modifications when paused
  completed_challenges TEXT[] DEFAULT '{}',
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);


-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_recorded_classes_created_at ON public.recorded_classes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recorded_classes_category ON public.recorded_classes (category);
CREATE INDEX IF NOT EXISTS idx_recorded_classes_instructor ON public.recorded_classes (instructor_id);
CREATE INDEX IF NOT EXISTS idx_recorded_classes_course ON public.recorded_classes (course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_class_challenges_class ON public.class_challenges (class_id, timestamp_ms);
CREATE INDEX IF NOT EXISTS idx_student_progress_lookup ON public.student_progress (student_id, class_id);


-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recorded_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Courses Policies
DROP POLICY IF EXISTS "Public read courses" ON public.courses;
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Instructors manage own courses" ON public.courses;
CREATE POLICY "Instructors manage own courses" ON public.courses FOR ALL USING (auth.uid() = instructor_id OR instructor_id IS NULL);

-- Recorded Classes Policies
DROP POLICY IF EXISTS "Public read recorded classes" ON public.recorded_classes;
CREATE POLICY "Public read recorded classes" ON public.recorded_classes FOR SELECT USING (is_published = true OR auth.uid() = instructor_id OR instructor_id IS NULL);

DROP POLICY IF EXISTS "Anyone can insert recorded class" ON public.recorded_classes;
CREATE POLICY "Anyone can insert recorded class" ON public.recorded_classes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Instructors can update own recorded classes" ON public.recorded_classes;
CREATE POLICY "Instructors can update own recorded classes" ON public.recorded_classes FOR UPDATE USING (auth.uid() = instructor_id OR instructor_id IS NULL);

DROP POLICY IF EXISTS "Instructors can delete own recorded classes" ON public.recorded_classes;
CREATE POLICY "Instructors can delete own recorded classes" ON public.recorded_classes FOR DELETE USING (auth.uid() = instructor_id OR instructor_id IS NULL);

-- Class Challenges Policies
DROP POLICY IF EXISTS "Public read class challenges" ON public.class_challenges;
CREATE POLICY "Public read class challenges" ON public.class_challenges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage class challenges" ON public.class_challenges;
CREATE POLICY "Manage class challenges" ON public.class_challenges FOR ALL USING (true);

-- Student Progress Policies
DROP POLICY IF EXISTS "Students manage own progress" ON public.student_progress;
CREATE POLICY "Students manage own progress" ON public.student_progress FOR ALL USING (auth.uid() = student_id OR student_id IS NULL);


-- 9. HELPER FUNCTIONS & RPC
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_recorded_classes_updated_at ON public.recorded_classes;
CREATE TRIGGER trigger_recorded_classes_updated_at
BEFORE UPDATE ON public.recorded_classes
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RPC: Increment class view count atomically
CREATE OR REPLACE FUNCTION public.increment_class_views(p_class_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.recorded_classes
  SET views_count = views_count + 1
  WHERE id = p_class_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- 10. SEED ALL EXISTING DATA FROM THE CODEBASE INTO THE DATABASE
-- ==============================================================================

-- A. SEED COURSES
INSERT INTO public.courses (
  id, title, description, slug, instructor_name, category, difficulty, rating, total_lessons, thumbnail_url, is_published
)
VALUES
(
  'course-javascript',
  'JavaScript',
  'Master JavaScript from the ground up — variables, ES6+ features, DOM manipulation, and real-world project builds.',
  'javascript',
  'Mark Wilson',
  'JavaScript',
  'Beginner',
  4.9,
  6,
  'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=600&q=80',
  true
),
(
  'course-python',
  'Python Programming',
  'Learn Python — the world''s most versatile language. From simple scripts to data analysis with Pandas and NumPy.',
  'python-programming',
  'Emma Clark',
  'Python',
  'Intermediate',
  4.8,
  6,
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=600&q=80',
  true
),
(
  'course-java',
  'Java Programming',
  'Build robust, scalable Java applications. Perfect for enterprise careers and Android development.',
  'java-programming',
  'Nina Patel',
  'Java',
  'Beginner',
  4.6,
  6,
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
  true
),
(
  'course-c-fundamentals',
  'C Programming Fundamentals',
  'Understand the core of computer science — memory management, pointers, and systems programming in C.',
  'c-programming-fundamentals',
  'James Anderson',
  'C & Systems',
  'Beginner',
  4.5,
  6,
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
  true
),
(
  'course-fullstack',
  'Full Stack Web Development',
  'Become a Full Stack Engineer. Build production-grade apps with MongoDB, Express, React, and Node.js.',
  'full-stack-web-development',
  'Robert Singh',
  'Full Stack',
  'Advanced',
  4.9,
  6,
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  instructor_name = EXCLUDED.instructor_name,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  rating = EXCLUDED.rating,
  total_lessons = EXCLUDED.total_lessons,
  thumbnail_url = EXCLUDED.thumbnail_url,
  updated_at = NOW();


-- B. SEED INTERACTIVE RECORDED CLASSES & MASTERCLASSES
INSERT INTO public.recorded_classes (
  id,
  course_id,
  title,
  description,
  slug,
  instructor_name,
  category,
  difficulty,
  duration_ms,
  audio_url,
  manifest_url,
  initial_files,
  tags,
  views_count,
  likes_count,
  order_index,
  is_published
)
VALUES
(
  'class-js-launchpad',
  'course-javascript',
  'JavaScript Interactive Launchpad',
  'Learn modern ES6+ JavaScript fundamentals with live synchronized Monaco editor telemetry and voice guidance.',
  'javascript-interactive-launchpad',
  'Guil Hernandez',
  'JavaScript',
  'Beginner',
  18000,
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  'https://raw.githubusercontent.com/ChallaSravanReddy/EASYLEARN/main/public/manifests/js-launchpad.json',
  '{"index.js": "import { generateTextAndImage } from \"./utils.js\";\n\n// 1. Change the value of the variable to your name\nlet name = \"Guil Hernandez\";\n\n// 2. Change the value of the variable to your favorite activity\nlet favoriteActivity = \"snacking\";\n\n// 3. Assign the favoritePlace variable your favorite place\nlet favoritePlace = \"coffee shop\";\n\n// 4. Configure the AI by setting a temperature from 0 to 1\nlet temperature = 0.6;\n\ngenerateTextAndImage(name, favoriteActivity, favoritePlace, temperature);\n", "utils.js": "export function generateTextAndImage(name, activity, place, temp) {\n  console.log(`[AI Launchpad]: ${name} at ${place} (temp: ${temp})`);\n  const el = document.getElementById(\"ai-card\");\n  if (el) el.innerHTML = `<h3>${name}</h3><p>Enjoying ${activity} at ${place}</p>`;\n}\n", "index.html": "<!DOCTYPE html>\n<html>\n<head><link rel=\"stylesheet\" href=\"index.css\"></head>\n<body>\n  <div id=\"ai-card\"></div>\n  <script type=\"module\" src=\"index.js\"></script>\n</body>\n</html>", "index.css": "body { background: #0b0f19; color: #f1f5f9; font-family: sans-serif; padding: 2rem; }"}'::jsonb,
  ARRAY['JavaScript', 'Interactive', 'ES6', 'Launchpad'],
  342,
  58,
  1,
  true
),
(
  'class-tailwind-playground',
  'course-fullstack',
  'Tailwind 3 Modern UI Playground',
  'Build responsive glassmorphic interfaces live with Tailwind CSS utility classes and instant browser previews.',
  'tailwind-3-playground',
  'Per Borgen',
  'CSS & Design',
  'Intermediate',
  24000,
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  'https://raw.githubusercontent.com/ChallaSravanReddy/EASYLEARN/main/public/manifests/tailwind-playground.json',
  '{"index.html": "<!DOCTYPE html>\n<html>\n<head>\n  <script src=\"https://cdn.tailwindcss.com\"></script>\n</head>\n<body class=\"bg-slate-900 text-white min-h-screen flex items-center justify-center p-6\">\n  <div class=\"bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl max-w-sm w-full space-y-4\">\n    <h1 class=\"text-xl font-bold\">Tailwind 3 Playground</h1>\n    <p class=\"text-sm text-slate-300\">Live code synchronized Monaco studio preview.</p>\n    <button id=\"btn\" class=\"px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm\">Action</button>\n  </div>\n</body>\n</html>"}'::jsonb,
  ARRAY['Tailwind CSS', 'UI Design', 'HTML', 'Frontend'],
  215,
  42,
  2,
  true
),
(
  'class-html-css-starter',
  'course-fullstack',
  'HTML, CSS & JavaScript Fullstack Base',
  'Master DOM manipulation, event listeners, and CSS card layout patterns in an interactive live browser studio.',
  'html-css-js-base',
  'Abdellah',
  'Frontend',
  'Beginner',
  15000,
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  'https://raw.githubusercontent.com/ChallaSravanReddy/EASYLEARN/main/public/manifests/html-css-starter.json',
  '{"index.html": "<!DOCTYPE html>\n<html>\n<head><link rel=\"stylesheet\" href=\"styles.css\"></head>\n<body>\n  <div class=\"card\">\n    <h1>HTML, CSS & JavaScript</h1>\n    <button id=\"click-btn\">Click Me</button>\n  </div>\n  <script src=\"index.js\"></script>\n</body>\n</html>", "styles.css": "body { background: #0c0d14; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }\n.card { background: #141824; padding: 2rem; border-radius: 1rem; border: 1px solid #334155; text-align: center; }", "index.js": "document.getElementById(\"click-btn\")?.addEventListener(\"click\", () => { alert(\"Hello from HTML/CSS/JS!\"); });"}'::jsonb,
  ARRAY['HTML5', 'CSS3', 'JavaScript', 'DOM'],
  489,
  89,
  1,
  true
),
-- JavaScript Course Curriculum Lessons
(
  'class-js-intro',
  'course-javascript',
  'Introduction to JavaScript',
  'Understand the JS engine, link scripts, and write your first code.',
  'intro-to-javascript',
  'Mark Wilson',
  'JavaScript',
  'Beginner',
  2700000,
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  '',
  '{"index.js": "// Write your first JavaScript code here\nconsole.log(\"Welcome to JavaScript!\");"}'::jsonb,
  ARRAY['JavaScript', 'Basics'],
  128,
  18,
  1,
  true
),
(
  'class-js-variables',
  'course-javascript',
  'Variables & Data Types',
  'Deep dive into let, const, primitives, and reference types.',
  'variables-and-data-types',
  'Mark Wilson',
  'JavaScript',
  'Beginner',
  4500000,
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  '',
  '{"index.js": "let counter = 0;\nconst appName = \"EasyLearn\";\nconsole.log({ counter, appName });"}'::jsonb,
  ARRAY['JavaScript', 'Variables', 'Data Types'],
  94,
  12,
  2,
  true
),
(
  'class-js-functions',
  'course-javascript',
  'Functions and Scope',
  'Arrow functions, closures, lexical scope, higher-order functions.',
  'functions-and-scope',
  'Mark Wilson',
  'JavaScript',
  'Intermediate',
  9000000,
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  '',
  '{"index.js": "const multiply = (a, b) => a * b;\nconsole.log(multiply(6, 7));"}'::jsonb,
  ARRAY['JavaScript', 'Functions', 'Scope'],
  85,
  14,
  3,
  true
),
(
  'class-js-dom',
  'course-javascript',
  'DOM Manipulation',
  'Selectors, event listeners, bubbling, and dynamic UIs.',
  'dom-manipulation',
  'Mark Wilson',
  'JavaScript',
  'Intermediate',
  10800000,
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  '',
  '{"index.html": "<div id=\"app\"></div>", "index.js": "document.getElementById(\"app\").textContent = \"Dynamic DOM Content!\";"}'::jsonb,
  ARRAY['JavaScript', 'DOM', 'Events'],
  110,
  21,
  4,
  true
),
(
  'class-js-es6',
  'course-javascript',
  'Modern ES6+ Features',
  'Destructuring, spread/rest, optional chaining, nullish coalescing.',
  'modern-es6-features',
  'Mark Wilson',
  'JavaScript',
  'Intermediate',
  7200000,
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  '',
  '{"index.js": "const user = { name: \"Alex\", settings: { theme: \"dark\" } };\nconsole.log(user?.settings?.theme ?? \"light\");"}'::jsonb,
  ARRAY['JavaScript', 'ES6', 'Destructuring'],
  97,
  16,
  5,
  true
),
(
  'class-js-capstone',
  'course-javascript',
  'Capstone: Interactive Apps',
  'Build an expense tracker, weather app, and to-do dashboard.',
  'capstone-interactive-apps',
  'Mark Wilson',
  'JavaScript',
  'Advanced',
  18000000,
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  '',
  '{"index.js": "// Interactive Capstone App\nconsole.log(\"Initializing EasyLearn Capstone Application...\");"}'::jsonb,
  ARRAY['JavaScript', 'Capstone', 'Project'],
  142,
  34,
  6,
  true
),
-- Python Programming Lessons
(
  'class-py-basics',
  'course-python',
  'Python Basics',
  'Environment setup, basic syntax, and writing simple scripts.',
  'python-basics',
  'Emma Clark',
  'Python',
  'Beginner',
  3600000,
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  '',
  '{"main.py": "print(\"Hello, Python on EasyLearn!\")"}'::jsonb,
  ARRAY['Python', 'Basics'],
  198,
  45,
  1,
  true
),
(
  'class-py-data-structures',
  'course-python',
  'Data Structures in Python',
  'Lists, dictionaries, sets, and tuples in depth.',
  'python-data-structures',
  'Emma Clark',
  'Python',
  'Intermediate',
  7200000,
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  '',
  '{"main.py": "fruits = [\"apple\", \"banana\", \"cherry\"]\nprint(fruits[0])"}'::jsonb,
  ARRAY['Python', 'Data Structures', 'Lists'],
  156,
  33,
  2,
  true
),
(
  'class-py-numpy-pandas',
  'course-python',
  'NumPy & Pandas for Data Science',
  'Data science libraries for analyzing massive datasets.',
  'python-numpy-pandas',
  'Emma Clark',
  'Python',
  'Advanced',
  18000000,
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  '',
  '{"analysis.py": "import numpy as np\narr = np.array([1, 2, 3, 4, 5])\nprint(arr.mean())"}'::jsonb,
  ARRAY['Python', 'Data Science', 'Pandas', 'NumPy'],
  210,
  52,
  5,
  true
)
ON CONFLICT (id) DO UPDATE SET
  course_id = EXCLUDED.course_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  instructor_name = EXCLUDED.instructor_name,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  duration_ms = EXCLUDED.duration_ms,
  audio_url = EXCLUDED.audio_url,
  initial_files = EXCLUDED.initial_files,
  tags = EXCLUDED.tags,
  views_count = EXCLUDED.views_count,
  likes_count = EXCLUDED.likes_count,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();


-- C. SEED INTERACTIVE CODING CHALLENGES
INSERT INTO public.class_challenges (
  id, class_id, timestamp_ms, instructions, expected_output, target_file, xp_reward
)
VALUES
(
  'chal-js-var',
  'class-js-launchpad',
  6000,
  'Change the variable name to your own name and run the code to update your launchpad profile.',
  'Guil Hernandez',
  'index.js',
  50
),
(
  'chal-js-temp',
  'class-js-launchpad',
  12000,
  'Set the temperature variable to 0.9 to increase AI generation variety.',
  'temperature = 0.9',
  'index.js',
  75
),
(
  'chal-tw-btn',
  'class-tailwind-playground',
  10000,
  'Change the action button background class to bg-emerald-600 hover:bg-emerald-500.',
  'bg-emerald-600',
  'index.html',
  50
),
(
  'chal-html-click',
  'class-html-css-starter',
  8000,
  'Attach an event listener to click-btn that triggers an alert or console message.',
  'alert',
  'index.js',
  60
)
ON CONFLICT (id) DO UPDATE SET
  instructions = EXCLUDED.instructions,
  expected_output = EXCLUDED.expected_output,
  target_file = EXCLUDED.target_file,
  xp_reward = EXCLUDED.xp_reward;
