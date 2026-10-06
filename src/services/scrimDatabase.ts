import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { ScrimManifest } from '../types/scrim';
import { DEMO_SCRIM_MANIFEST, generateSyntheticAudioDataUri } from '../utils/demoScrim';
import { STUDIO_TEMPLATES } from '../components/RecordingStudio';

export interface CourseRecord {
  id: string;
  title: string;
  description: string;
  slug: string;
  instructor_id?: string | null;
  instructor_name: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail_url?: string;
  total_lessons: number;
  rating: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecordedClass {
  id: string;
  course_id?: string | null;
  title: string;
  description: string;
  slug?: string;
  instructor_id?: string | null;
  instructor_name: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_ms: number;
  audio_url: string;
  manifest_url: string;
  manifest: ScrimManifest;
  initial_files?: Record<string, string>;
  thumbnail_url?: string;
  tags: string[];
  views_count: number;
  likes_count: number;
  order_index?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  audio_blob?: Blob; // Stored in IndexedDB for instant offline playback
}

export interface ClassChallengeRecord {
  id: string;
  class_id: string;
  timestamp_ms: number;
  instructions: string;
  expected_output?: string;
  test_code?: string;
  hint?: string;
  xp_reward: number;
  target_file: string;
  created_at: string;
}

export interface StudentProgressRecord {
  id: string;
  student_id: string;
  class_id: string;
  progress_percent: number;
  last_position_ms: number;
  completed: boolean;
  completed_at?: string;
  forked_code?: Record<string, string>;
  completed_challenges: string[];
  last_accessed_at: string;
}

interface EasyLearnDB extends DBSchema {
  courses: {
    key: string;
    value: CourseRecord;
    indexes: {
      'by-slug': string;
      'by-category': string;
    };
  };
  recorded_classes: {
    key: string;
    value: RecordedClass;
    indexes: {
      'by-created_at': string;
      'by-category': string;
      'by-instructor_id': string;
      'by-course_id': string;
    };
  };
  student_progress: {
    key: string; // composite key: `${student_id}_${class_id}`
    value: StudentProgressRecord;
    indexes: {
      'by-student_id': string;
      'by-class_id': string;
    };
  };
}

const DB_NAME = 'EasyLearnClassesDB';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<EasyLearnDB>> | null = null;

function safeJsonDataUri(obj: any): string {
  try {
    return 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj));
  } catch (_) {
    return 'data:application/json;charset=utf-8,{}';
  }
}

// ==============================================================================
// 1. ALL EXISTING COURSES DATA IN CODE
// ==============================================================================
export const EXISTING_COURSES: CourseRecord[] = [
  {
    id: 'course-javascript',
    title: 'JavaScript',
    description: 'Master JavaScript from the ground up — variables, ES6+ features, DOM manipulation, and real-world project builds.',
    slug: 'javascript',
    instructor_name: 'Mark Wilson',
    category: 'JavaScript',
    difficulty: 'Beginner',
    rating: 4.9,
    total_lessons: 6,
    thumbnail_url: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=600&q=80',
    is_published: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'course-python',
    title: 'Python Programming',
    description: "Learn Python — the world's most versatile language. From simple scripts to data analysis with Pandas and NumPy.",
    slug: 'python-programming',
    instructor_name: 'Emma Clark',
    category: 'Python',
    difficulty: 'Intermediate',
    rating: 4.8,
    total_lessons: 6,
    thumbnail_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=600&q=80',
    is_published: true,
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'course-java',
    title: 'Java Programming',
    description: 'Build robust, scalable Java applications. Perfect for enterprise careers and Android development.',
    slug: 'java-programming',
    instructor_name: 'Nina Patel',
    category: 'Java',
    difficulty: 'Beginner',
    rating: 4.6,
    total_lessons: 6,
    thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    is_published: true,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'course-c-fundamentals',
    title: 'C Programming Fundamentals',
    description: 'Understand the core of computer science — memory management, pointers, and systems programming in C.',
    slug: 'c-programming-fundamentals',
    instructor_name: 'James Anderson',
    category: 'C & Systems',
    difficulty: 'Beginner',
    rating: 4.5,
    total_lessons: 6,
    thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    is_published: true,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'course-fullstack',
    title: 'Full Stack Web Development',
    description: 'Become a Full Stack Engineer. Build production-grade apps with MongoDB, Express, React, and Node.js.',
    slug: 'full-stack-web-development',
    instructor_name: 'Robert Singh',
    category: 'Full Stack',
    difficulty: 'Advanced',
    rating: 4.9,
    total_lessons: 6,
    thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
    is_published: true,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ==============================================================================
// 2. ALL EXISTING RECORDED CLASSES & LESSONS DATA IN CODE
// ==============================================================================
export function getExistingStarterClasses(): RecordedClass[] {
  const syntheticAudio = generateSyntheticAudioDataUri(22);

  return [
    {
      id: 'class-js-launchpad',
      course_id: 'course-javascript',
      title: 'JavaScript Interactive Launchpad',
      description: 'Learn modern ES6+ JavaScript fundamentals with live synchronized Monaco editor telemetry and voice guidance.',
      slug: 'javascript-interactive-launchpad',
      instructor_id: 'inst-guil',
      instructor_name: 'Guil Hernandez',
      category: 'JavaScript',
      difficulty: 'Beginner',
      duration_ms: 18000,
      audio_url: syntheticAudio,
      manifest_url: safeJsonDataUri(DEMO_SCRIM_MANIFEST),
      manifest: DEMO_SCRIM_MANIFEST,
      initial_files: DEMO_SCRIM_MANIFEST.initialState.files,
      thumbnail_url: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=600&q=80',
      tags: ['JavaScript', 'Interactive', 'ES6', 'Launchpad'],
      views_count: 342,
      likes_count: 58,
      order_index: 1,
      is_published: true,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'class-tailwind-playground',
      course_id: 'course-fullstack',
      title: 'Tailwind 3 Modern UI Playground',
      description: 'Build responsive glassmorphic interfaces live with Tailwind CSS utility classes and instant browser previews.',
      slug: 'tailwind-3-playground',
      instructor_id: 'inst-per',
      instructor_name: 'Per Borgen',
      category: 'CSS & Design',
      difficulty: 'Intermediate',
      duration_ms: 24000,
      audio_url: syntheticAudio,
      manifest_url: safeJsonDataUri({
        ...DEMO_SCRIM_MANIFEST,
        metadata: {
          ...DEMO_SCRIM_MANIFEST.metadata,
          title: 'Tailwind 3 Modern UI Playground',
          initialActiveFile: 'index.html',
        },
        initialState: {
          files: STUDIO_TEMPLATES.tailwind3.files,
          activeFile: 'index.html',
        },
      }),
      manifest: {
        ...DEMO_SCRIM_MANIFEST,
        metadata: {
          ...DEMO_SCRIM_MANIFEST.metadata,
          title: 'Tailwind 3 Modern UI Playground',
          initialActiveFile: 'index.html',
        },
        initialState: {
          files: STUDIO_TEMPLATES.tailwind3.files,
          activeFile: 'index.html',
        },
      },
      initial_files: STUDIO_TEMPLATES.tailwind3.files,
      thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
      tags: ['Tailwind CSS', 'UI Design', 'HTML', 'Frontend'],
      views_count: 215,
      likes_count: 42,
      order_index: 2,
      is_published: true,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'class-html-css-starter',
      course_id: 'course-fullstack',
      title: 'HTML, CSS & JavaScript Fullstack Base',
      description: 'Master DOM manipulation, event listeners, and CSS card layout patterns in an interactive live browser studio.',
      slug: 'html-css-js-base',
      instructor_id: 'inst-abdellah',
      instructor_name: 'Abdellah',
      category: 'Frontend',
      difficulty: 'Beginner',
      duration_ms: 15000,
      audio_url: syntheticAudio,
      manifest_url: safeJsonDataUri({
        ...DEMO_SCRIM_MANIFEST,
        metadata: {
          ...DEMO_SCRIM_MANIFEST.metadata,
          title: 'HTML, CSS & JavaScript Fullstack Base',
          initialActiveFile: 'index.html',
        },
        initialState: {
          files: STUDIO_TEMPLATES['html-css-js'].files,
          activeFile: 'index.html',
        },
      }),
      manifest: {
        ...DEMO_SCRIM_MANIFEST,
        metadata: {
          ...DEMO_SCRIM_MANIFEST.metadata,
          title: 'HTML, CSS & JavaScript Fullstack Base',
          initialActiveFile: 'index.html',
        },
        initialState: {
          files: STUDIO_TEMPLATES['html-css-js'].files,
          activeFile: 'index.html',
        },
      },
      initial_files: STUDIO_TEMPLATES['html-css-js'].files,
      thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
      tags: ['HTML5', 'CSS3', 'JavaScript', 'DOM'],
      views_count: 489,
      likes_count: 89,
      order_index: 1,
      is_published: true,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      updated_at: new Date().toISOString(),
    },
    // Curriculum classes from CourseSyllabus
    {
      id: 'class-js-intro',
      course_id: 'course-javascript',
      title: 'Introduction to JavaScript',
      description: 'Understand the JS engine, link scripts, and write your first code.',
      slug: 'intro-to-javascript',
      instructor_name: 'Mark Wilson',
      category: 'JavaScript',
      difficulty: 'Beginner',
      duration_ms: 2700000,
      audio_url: syntheticAudio,
      manifest_url: '',
      manifest: DEMO_SCRIM_MANIFEST,
      initial_files: {
        'index.js': '// Write your first JavaScript code here\nconsole.log("Welcome to JavaScript!");\n',
      },
      tags: ['JavaScript', 'Basics'],
      views_count: 128,
      likes_count: 18,
      order_index: 1,
      is_published: true,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'class-js-variables',
      course_id: 'course-javascript',
      title: 'Variables & Data Types',
      description: 'Deep dive into let, const, primitives, and reference types.',
      slug: 'variables-and-data-types',
      instructor_name: 'Mark Wilson',
      category: 'JavaScript',
      difficulty: 'Beginner',
      duration_ms: 4500000,
      audio_url: syntheticAudio,
      manifest_url: '',
      manifest: DEMO_SCRIM_MANIFEST,
      initial_files: {
        'index.js': 'let counter = 0;\nconst appName = "EasyLearn";\nconsole.log({ counter, appName });\n',
      },
      tags: ['JavaScript', 'Variables', 'Data Types'],
      views_count: 94,
      likes_count: 12,
      order_index: 2,
      is_published: true,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'class-js-functions',
      course_id: 'course-javascript',
      title: 'Functions and Scope',
      description: 'Arrow functions, closures, lexical scope, higher-order functions.',
      slug: 'functions-and-scope',
      instructor_name: 'Mark Wilson',
      category: 'JavaScript',
      difficulty: 'Intermediate',
      duration_ms: 9000000,
      audio_url: syntheticAudio,
      manifest_url: '',
      manifest: DEMO_SCRIM_MANIFEST,
      initial_files: {
        'index.js': 'const multiply = (a, b) => a * b;\nconsole.log(multiply(6, 7));\n',
      },
      tags: ['JavaScript', 'Functions', 'Scope'],
      views_count: 85,
      likes_count: 14,
      order_index: 3,
      is_published: true,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'class-py-basics',
      course_id: 'course-python',
      title: 'Python Basics',
      description: 'Environment setup, basic syntax, and writing simple scripts.',
      slug: 'python-basics',
      instructor_name: 'Emma Clark',
      category: 'Python',
      difficulty: 'Beginner',
      duration_ms: 3600000,
      audio_url: syntheticAudio,
      manifest_url: '',
      manifest: DEMO_SCRIM_MANIFEST,
      initial_files: {
        'main.py': 'print("Hello, Python on EasyLearn!")\n',
      },
      tags: ['Python', 'Basics'],
      views_count: 198,
      likes_count: 45,
      order_index: 1,
      is_published: true,
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

// ==============================================================================
// 3. ALL EXISTING CLASS CHALLENGES IN CODE
// ==============================================================================
export const EXISTING_CHALLENGES: ClassChallengeRecord[] = [
  {
    id: 'chal-js-var',
    class_id: 'class-js-launchpad',
    timestamp_ms: 6000,
    instructions: 'Change the variable name to your own name and run the code to update your launchpad profile.',
    expected_output: 'Guil Hernandez',
    target_file: 'index.js',
    xp_reward: 50,
    created_at: new Date().toISOString(),
  },
  {
    id: 'chal-js-temp',
    class_id: 'class-js-launchpad',
    timestamp_ms: 12000,
    instructions: 'Set the temperature variable to 0.9 to increase AI generation variety.',
    expected_output: 'temperature = 0.9',
    target_file: 'index.js',
    xp_reward: 75,
    created_at: new Date().toISOString(),
  },
  {
    id: 'chal-tw-btn',
    class_id: 'class-tailwind-playground',
    timestamp_ms: 10000,
    instructions: 'Change the action button background class to bg-emerald-600 hover:bg-emerald-500.',
    expected_output: 'bg-emerald-600',
    target_file: 'index.html',
    xp_reward: 50,
    created_at: new Date().toISOString(),
  },
  {
    id: 'chal-html-click',
    class_id: 'class-html-css-starter',
    timestamp_ms: 8000,
    instructions: 'Attach an event listener to click-btn that triggers an alert or console message.',
    expected_output: 'alert',
    target_file: 'index.js',
    xp_reward: 60,
    created_at: new Date().toISOString(),
  },
];

/**
 * Initializes and returns the IndexedDB instance with schema and starter seed data
 */
export function getDatabase(): Promise<IDBPDatabase<EasyLearnDB>> {
  if (!dbPromise) {
    dbPromise = openDB<EasyLearnDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 1. Courses Store
        if (!db.objectStoreNames.contains('courses')) {
          const courseStore = db.createObjectStore('courses', { keyPath: 'id' });
          courseStore.createIndex('by-slug', 'slug');
          courseStore.createIndex('by-category', 'category');
        }

        // 2. Classes Store
        if (!db.objectStoreNames.contains('recorded_classes')) {
          const classStore = db.createObjectStore('recorded_classes', { keyPath: 'id' });
          classStore.createIndex('by-created_at', 'created_at');
          classStore.createIndex('by-category', 'category');
          classStore.createIndex('by-instructor_id', 'instructor_id');
          classStore.createIndex('by-course_id', 'course_id');
        }

        // 3. Student Progress Store
        if (!db.objectStoreNames.contains('student_progress')) {
          const progressStore = db.createObjectStore('student_progress', { keyPath: 'id' });
          progressStore.createIndex('by-student_id', 'student_id');
          progressStore.createIndex('by-class_id', 'class_id');
        }
      },
    }).then(async (db) => {
      // Auto-seed starter recorded classes and courses
      await seedInitialDataIfEmpty(db);
      return db;
    });
  }
  return dbPromise;
}

/**
 * Seeds pre-recorded starter classes and courses into local IndexedDB
 */
async function seedInitialDataIfEmpty(db: IDBPDatabase<EasyLearnDB>) {
  try {
    // 1. Seed Courses
    const courseCount = await db.count('courses');
    if (courseCount === 0) {
      const tx = db.transaction('courses', 'readwrite');
      for (const course of EXISTING_COURSES) {
        await tx.store.put(course);
      }
      await tx.done;
    }

    // 2. Seed Recorded Classes
    const classCount = await db.count('recorded_classes');
    if (classCount === 0) {
      const starterClasses = getExistingStarterClasses();
      const tx = db.transaction('recorded_classes', 'readwrite');
      for (const c of starterClasses) {
        await tx.store.put(c);
      }
      await tx.done;
    }
  } catch (err) {
    console.warn('[scrimDatabase] Seeding initial classes failed:', err);
  }
}

/**
 * Universal Database Service for Recorded Classes, Courses, Challenges & Telemetry Scrims
 */
export const scrimDatabase = {
  /**
   * Automatically pushes all existing courses, recorded classes, and challenges from code to Supabase
   */
  async syncAllExistingDataToDatabase(): Promise<{
    coursesCount: number;
    classesCount: number;
    challengesCount: number;
    syncedToCloud: boolean;
  }> {
    const db = await getDatabase();
    const starterClasses = getExistingStarterClasses();

    // 1. Save all to local IndexedDB
    for (const course of EXISTING_COURSES) {
      await db.put('courses', course).catch(() => {});
    }
    for (const cls of starterClasses) {
      await db.put('recorded_classes', cls).catch(() => {});
    }

    let syncedToCloud = false;

    // 2. Push all to Supabase PostgreSQL if credentials configured
    if (isSupabaseConfigured) {
      try {
        console.info('[scrimDatabase] Pushing all existing codebase data to Supabase PostgreSQL...');

        // Push Courses
        const { error: courseErr } = await supabase
          .from('courses')
          .upsert(
            EXISTING_COURSES.map((c) => ({
              id: c.id,
              title: c.title,
              description: c.description,
              slug: c.slug,
              instructor_name: c.instructor_name,
              category: c.category,
              difficulty: c.difficulty,
              rating: c.rating,
              total_lessons: c.total_lessons,
              thumbnail_url: c.thumbnail_url,
              is_published: true,
              created_at: c.created_at,
              updated_at: c.updated_at,
            })),
            { onConflict: 'id' }
          );

        if (courseErr) {
          console.warn('[scrimDatabase] Supabase course seed warning:', courseErr);
        }

        // Push Recorded Classes
        const { error: classErr } = await supabase
          .from('recorded_classes')
          .upsert(
            starterClasses.map((c) => ({
              id: c.id,
              course_id: c.course_id,
              title: c.title,
              description: c.description,
              slug: c.slug,
              instructor_name: c.instructor_name,
              category: c.category,
              difficulty: c.difficulty,
              duration_ms: c.duration_ms,
              audio_url: c.audio_url,
              manifest_url: c.manifest_url,
              manifest: c.manifest,
              initial_files: c.initial_files,
              tags: c.tags,
              views_count: c.views_count,
              likes_count: c.likes_count,
              order_index: c.order_index || 1,
              is_published: true,
              created_at: c.created_at,
              updated_at: c.updated_at,
            })),
            { onConflict: 'id' }
          );

        if (classErr) {
          console.warn('[scrimDatabase] Supabase classes seed warning:', classErr);
        }

        // Push Challenges
        const { error: chalErr } = await supabase
          .from('class_challenges')
          .upsert(
            EXISTING_CHALLENGES.map((ch) => ({
              id: ch.id,
              class_id: ch.class_id,
              timestamp_ms: ch.timestamp_ms,
              instructions: ch.instructions,
              expected_output: ch.expected_output,
              target_file: ch.target_file,
              xp_reward: ch.xp_reward,
              created_at: ch.created_at,
            })),
            { onConflict: 'id' }
          );

        if (chalErr) {
          console.warn('[scrimDatabase] Supabase challenges seed warning:', chalErr);
        }

        syncedToCloud = !courseErr && !classErr;
        console.info('[scrimDatabase] Successfully pushed all existing data to Supabase!');
      } catch (cloudErr) {
        console.warn('[scrimDatabase] Failed remote sync of existing data:', cloudErr);
      }
    }

    return {
      coursesCount: EXISTING_COURSES.length,
      classesCount: starterClasses.length,
      challengesCount: EXISTING_CHALLENGES.length,
      syncedToCloud,
    };
  },

  /**
   * Fetches all courses from IndexedDB and Supabase
   */
  async getAllCourses(): Promise<CourseRecord[]> {
    const db = await getDatabase();
    const localCourses = await db.getAll('courses');
    const map = new Map<string, CourseRecord>();

    EXISTING_COURSES.forEach((c) => map.set(c.id, c));
    localCourses.forEach((c) => map.set(c.id, c));

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('courses').select('*').order('created_at');
        if (!error && Array.isArray(data)) {
          for (const item of data) {
            map.set(item.id, {
              id: item.id,
              title: item.title,
              description: item.description || '',
              slug: item.slug,
              instructor_id: item.instructor_id,
              instructor_name: item.instructor_name || 'EasyLearn Instructor',
              category: item.category || 'General',
              difficulty: item.difficulty || 'Beginner',
              thumbnail_url: item.thumbnail_url,
              total_lessons: item.total_lessons || 0,
              rating: Number(item.rating) || 4.8,
              is_published: item.is_published ?? true,
              created_at: item.created_at,
              updated_at: item.updated_at,
            });
            await db.put('courses', map.get(item.id)!).catch(() => {});
          }
        }
      } catch (_) {}
    }

    return Array.from(map.values());
  },

  /**
   * Saves or updates a Course in IndexedDB and Supabase
   */
  async saveCourse(course: Partial<CourseRecord> & { title: string }): Promise<CourseRecord> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const id = course.id || `course-${Date.now()}`;
    const slug = course.slug || course.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const record: CourseRecord = {
      id,
      title: course.title,
      description: course.description || '',
      slug,
      instructor_id: course.instructor_id || null,
      instructor_name: course.instructor_name || 'EasyLearn Instructor',
      category: course.category || 'General',
      difficulty: course.difficulty || 'Beginner',
      thumbnail_url: course.thumbnail_url,
      total_lessons: course.total_lessons || 1,
      rating: course.rating || 4.8,
      is_published: course.is_published ?? true,
      created_at: course.created_at || now,
      updated_at: now,
    };

    await db.put('courses', record);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('courses').upsert([record], { onConflict: 'id' });
      } catch (e) {
        console.warn('[scrimDatabase] Cloud course save error:', e);
      }
    }

    return record;
  },

  /**
   * Fetches all recorded classes from IndexedDB and Supabase (merged & deduplicated)
   */
  async getAllClasses(): Promise<RecordedClass[]> {
    const db = await getDatabase();
    const localClasses = await db.getAll('recorded_classes');
    localClasses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const classesMap = new Map<string, RecordedClass>();

    // Add local IndexedDB records
    localClasses.forEach((c) => classesMap.set(c.id, c));

    // Also load legacy LocalStorage published records if any exist
    try {
      const legacy: any[] = JSON.parse(localStorage.getItem('easy_published_scrims') || '[]');
      legacy.forEach((item) => {
        if (!classesMap.has(item.id)) {
          classesMap.set(item.id, {
            id: item.id,
            title: item.title,
            description: item.description || '',
            instructor_id: item.instructor_id,
            instructor_name: 'Instructor',
            category: 'Web Development',
            difficulty: 'Beginner',
            duration_ms: item.duration_ms || 0,
            audio_url: item.audio_url,
            manifest_url: item.manifest_url,
            manifest: DEMO_SCRIM_MANIFEST,
            tags: ['Scrimba', 'Interactive'],
            views_count: 1,
            likes_count: 0,
            is_published: true,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      });
    } catch (_) {}

    // Pull from Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('recorded_classes')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          for (const item of data) {
            const mapped: RecordedClass = {
              id: item.id,
              course_id: item.course_id,
              title: item.title,
              description: item.description || '',
              slug: item.slug,
              instructor_id: item.instructor_id,
              instructor_name: item.instructor_name || 'Instructor',
              category: item.category || 'Web Development',
              difficulty: item.difficulty || 'Beginner',
              duration_ms: Number(item.duration_ms) || 0,
              audio_url: item.audio_url,
              manifest_url: item.manifest_url,
              manifest: item.manifest || DEMO_SCRIM_MANIFEST,
              initial_files: item.initial_files || {},
              thumbnail_url: item.thumbnail_url,
              tags: item.tags || [],
              views_count: item.views_count || 0,
              likes_count: item.likes_count || 0,
              order_index: item.order_index || 0,
              is_published: item.is_published ?? true,
              created_at: item.created_at,
              updated_at: item.updated_at || item.created_at,
            };
            classesMap.set(item.id, mapped);
            await db.put('recorded_classes', mapped).catch(() => {});
          }
        }
      } catch (e) {
        console.warn('[scrimDatabase] Remote Supabase fetch warning:', e);
      }
    }

    return Array.from(classesMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  /**
   * Retrieves a single recorded class by its ID
   */
  async getClassById(id: string): Promise<RecordedClass | null> {
    if (!id) return null;
    const db = await getDatabase();

    // 1. Check local IndexedDB first
    const local = await db.get('recorded_classes', id);
    if (local) return local;

    // 2. Query Supabase if connected
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('recorded_classes')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          let manifest = data.manifest;
          if (!manifest && data.manifest_url) {
            try {
              const res = await fetch(data.manifest_url);
              manifest = await res.json();
            } catch (_) {}
          }

          const resolved: RecordedClass = {
            id: data.id,
            course_id: data.course_id,
            title: data.title,
            description: data.description || '',
            slug: data.slug,
            instructor_id: data.instructor_id,
            instructor_name: data.instructor_name || 'Instructor',
            category: data.category || 'Web Development',
            difficulty: data.difficulty || 'Beginner',
            duration_ms: Number(data.duration_ms) || 0,
            audio_url: data.audio_url,
            manifest_url: data.manifest_url,
            manifest: manifest || DEMO_SCRIM_MANIFEST,
            initial_files: data.initial_files || {},
            thumbnail_url: data.thumbnail_url,
            tags: data.tags || [],
            views_count: data.views_count || 0,
            likes_count: data.likes_count || 0,
            order_index: data.order_index || 0,
            is_published: data.is_published ?? true,
            created_at: data.created_at,
            updated_at: data.updated_at || data.created_at,
          };

          await db.put('recorded_classes', resolved);
          return resolved;
        }
      } catch (e) {
        console.warn('[scrimDatabase] Error fetching class by ID from Supabase:', e);
      }
    }

    return null;
  },

  /**
   * Saves a newly recorded class into IndexedDB and Supabase PostgreSQL.
   * Automatically uploads raw audio Blobs to the Supabase Storage bucket 'scrim-assets'.
   */
  async saveClass(data: {
    id?: string;
    course_id?: string | null;
    title: string;
    description?: string;
    instructor_id?: string | null;
    instructor_name?: string;
    category?: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    duration_ms: number;
    audio_url: string;
    manifest_url: string;
    manifest: ScrimManifest;
    initial_files?: Record<string, string>;
    audio_blob?: Blob;
    thumbnail_url?: string;
    tags?: string[];
    order_index?: number;
  }): Promise<RecordedClass> {
    const db = await getDatabase();
    const classId = data.id || (crypto.randomUUID ? crypto.randomUUID() : `class-${Date.now()}`);
    const now = new Date().toISOString();

    let finalAudioUrl = data.audio_url;
    let finalManifestUrl = data.manifest_url;

    // 1. If Supabase is connected and audio_blob is present, upload to Supabase Storage bucket 'scrim-assets'
    if (isSupabaseConfigured) {
      if (data.audio_blob && (!finalAudioUrl || finalAudioUrl.startsWith('blob:') || finalAudioUrl.startsWith('data:'))) {
        try {
          const audioExt = data.audio_blob.type.includes('mp4') ? 'mp4' : 'webm';
          const audioPath = `recordings/${classId}/audio.${audioExt}`;
          const { error: uploadAudioErr } = await supabase.storage
            .from('scrim-assets')
            .upload(audioPath, data.audio_blob, { contentType: data.audio_blob.type, upsert: true });

          if (!uploadAudioErr) {
            const { data: pubData } = supabase.storage.from('scrim-assets').getPublicUrl(audioPath);
            if (pubData?.publicUrl) finalAudioUrl = pubData.publicUrl;
          }
        } catch (uploadAudioEx) {
          console.warn('[scrimDatabase] Cloud audio upload failed, using local URL:', uploadAudioEx);
        }
      }

      // Upload telemetry manifest JSON to Supabase Storage
      if (data.manifest && (!finalManifestUrl || finalManifestUrl.startsWith('blob:') || finalManifestUrl.startsWith('data:'))) {
        try {
          const manifestBlob = new Blob([JSON.stringify(data.manifest, null, 2)], { type: 'application/json' });
          const manifestPath = `recordings/${classId}/manifest.json`;
          const { error: uploadManifestErr } = await supabase.storage
            .from('scrim-assets')
            .upload(manifestPath, manifestBlob, { contentType: 'application/json', upsert: true });

          if (!uploadManifestErr) {
            const { data: manifestPubData } = supabase.storage.from('scrim-assets').getPublicUrl(manifestPath);
            if (manifestPubData?.publicUrl) finalManifestUrl = manifestPubData.publicUrl;
          }
        } catch (uploadManifestEx) {
          console.warn('[scrimDatabase] Cloud manifest upload failed:', uploadManifestEx);
        }
      }
    }

    const record: RecordedClass = {
      id: classId,
      course_id: data.course_id || null,
      title: data.title,
      description: data.description || '',
      instructor_id: data.instructor_id || null,
      instructor_name: data.instructor_name || 'Instructor',
      category: data.category || 'Web Development',
      difficulty: data.difficulty || 'Beginner',
      duration_ms: data.duration_ms,
      audio_url: finalAudioUrl,
      manifest_url: finalManifestUrl,
      manifest: data.manifest,
      initial_files: data.initial_files || data.manifest.initialState.files,
      audio_blob: data.audio_blob,
      thumbnail_url: data.thumbnail_url,
      tags: data.tags || ['Interactive', 'Scrimba'],
      views_count: 0,
      likes_count: 0,
      order_index: data.order_index || 0,
      is_published: true,
      created_at: now,
      updated_at: now,
    };

    // 2. Commit to IndexedDB for instant local playback & offline availability
    await db.put('recorded_classes', record);

    // 3. Commit to Supabase PostgreSQL table
    if (isSupabaseConfigured) {
      try {
        const payload = {
          id: record.id,
          course_id: record.course_id,
          title: record.title,
          description: record.description,
          instructor_id: record.instructor_id,
          instructor_name: record.instructor_name,
          category: record.category,
          difficulty: record.difficulty,
          duration_ms: record.duration_ms,
          audio_url: record.audio_url,
          manifest_url: record.manifest_url,
          manifest: record.manifest,
          initial_files: record.initial_files,
          tags: record.tags,
          order_index: record.order_index,
          is_published: true,
          created_at: record.created_at,
          updated_at: record.updated_at,
        };

        const { error } = await supabase
          .from('recorded_classes')
          .upsert([payload], { onConflict: 'id' });

        if (error) {
          console.warn('[scrimDatabase] Supabase upsert error (saved locally):', error);
        }
      } catch (err) {
        console.warn('[scrimDatabase] Remote sync error:', err);
      }
    }

    return record;
  },

  /**
   * Deletes a recorded class from both IndexedDB and Supabase
   */
  async deleteClass(id: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      await db.delete('recorded_classes', id);

      if (isSupabaseConfigured) {
        await supabase.from('recorded_classes').delete().eq('id', id);
      }

      return true;
    } catch (e) {
      console.error('[scrimDatabase] Error deleting class:', e);
      return false;
    }
  },

  /**
   * Updates an existing recorded class record
   */
  async updateClass(id: string, updates: Partial<RecordedClass>): Promise<RecordedClass | null> {
    const existing = await this.getClassById(id);
    if (!existing) return null;

    const db = await getDatabase();
    const updated: RecordedClass = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await db.put('recorded_classes', updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('recorded_classes').update(updates).eq('id', id);
      } catch (e) {
        console.warn('[scrimDatabase] Remote update error:', e);
      }
    }

    return updated;
  },

  /**
   * Increment view count for a recorded class
   */
  async recordView(id: string): Promise<void> {
    const item = await this.getClassById(id);
    if (item) {
      await this.updateClass(id, { views_count: (item.views_count || 0) + 1 });
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.rpc('increment_class_views', { p_class_id: id });
      } catch (_) {}
    }
  },

  /**
   * Saves student progress on a recorded class
   */
  async saveProgress(
    studentId: string,
    classId: string,
    progressPercent: number,
    lastPositionMs: number,
    completed = false,
    forkedCode?: Record<string, string>,
    completedChallenges: string[] = []
  ): Promise<StudentProgressRecord> {
    const db = await getDatabase();
    const id = `${studentId}_${classId}`;
    const now = new Date().toISOString();

    const progressRecord: StudentProgressRecord = {
      id,
      student_id: studentId,
      class_id: classId,
      progress_percent: Math.min(100, Math.max(0, Math.round(progressPercent))),
      last_position_ms: lastPositionMs,
      completed,
      completed_at: completed ? now : undefined,
      forked_code: forkedCode,
      completed_challenges: completedChallenges,
      last_accessed_at: now,
    };

    await db.put('student_progress', progressRecord);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('student_progress').upsert(
          [
            {
              student_id: studentId,
              class_id: classId,
              progress_percent: progressRecord.progress_percent,
              last_position_ms: lastPositionMs,
              completed,
              completed_at: progressRecord.completed_at,
              forked_code: forkedCode,
              completed_challenges: completedChallenges,
              last_accessed_at: now,
            },
          ],
          { onConflict: 'student_id,class_id' }
        );
      } catch (_) {}
    }

    return progressRecord;
  },

  /**
   * Retrieves student progress on a class
   */
  async getProgress(studentId: string, classId: string): Promise<StudentProgressRecord | null> {
    const db = await getDatabase();
    const id = `${studentId}_${classId}`;
    const local = await db.get('student_progress', id);
    if (local) return local;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('student_progress')
          .select('*')
          .eq('student_id', studentId)
          .eq('class_id', classId)
          .single();

        if (!error && data) {
          const res: StudentProgressRecord = {
            id,
            student_id: data.student_id,
            class_id: data.class_id,
            progress_percent: data.progress_percent,
            last_position_ms: Number(data.last_position_ms),
            completed: data.completed,
            completed_at: data.completed_at,
            forked_code: data.forked_code,
            completed_challenges: data.completed_challenges || [],
            last_accessed_at: data.last_accessed_at,
          };
          await db.put('student_progress', res);
          return res;
        }
      } catch (_) {}
    }

    return null;
  },
};

// Automatically initiate sync of existing data whenever the service is imported
if (typeof window !== 'undefined') {
  scrimDatabase.syncAllExistingDataToDatabase().catch((e) => {
    console.debug('[scrimDatabase] Initial background sync note:', e);
  });
}
