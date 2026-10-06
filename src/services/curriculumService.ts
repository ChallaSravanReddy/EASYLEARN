import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { CourseRecord, RecordedClass, scrimDatabase } from './scrimDatabase';

export interface LearningTrack {
  id: string;
  title: string;
  slug: string;
  description: string;
  tagline: string;
  thumbnail_url?: string;
  banner_url?: string;
  badge_text: string;
  color_gradient: string;
  estimated_hours: number;
  total_scrims: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  is_pro: boolean;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  lessons?: RecordedClass[];
  created_at: string;
  updated_at: string;
}

export interface LearningTrackWithCourses extends LearningTrack {
  courses: (CourseRecord & { module_number?: number })[];
}

const SEED_TRACKS: LearningTrack[] = [
  {
    id: 'track-frontend-career',
    title: 'The Frontend Developer Career Path',
    slug: 'the-frontend-developer-career-path',
    description: 'The definitive career path to become a job-ready Frontend Developer. Learn HTML, CSS, JavaScript, React, UI/UX design, and interview skills with hundreds of interactive code scrims.',
    tagline: '70+ hours of interactive scrims with live code editor synchronization',
    badge_text: 'Career Path',
    color_gradient: 'from-blue-600 via-indigo-600 to-violet-700',
    estimated_hours: 75,
    total_scrims: 140,
    difficulty: 'Beginner',
    is_pro: false,
    is_published: true,
    order_index: 1,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'track-fullstack-ai',
    title: 'Fullstack AI & Modern Web Engineer',
    slug: 'fullstack-ai-engineer',
    description: 'Learn to integrate Large Language Models, vectorize embeddings, build interactive React & Node applications, and deploy production fullstack systems.',
    tagline: 'Build next-generation AI agents and intelligent applications',
    badge_text: 'Trending',
    color_gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    estimated_hours: 45,
    total_scrims: 80,
    difficulty: 'Intermediate',
    is_pro: true,
    is_published: true,
    order_index: 2,
    created_at: '2026-10-02T00:00:00Z',
    updated_at: '2026-10-02T00:00:00Z',
  },
  {
    id: 'track-javascript-deep-dive',
    title: 'JavaScript Mastery & Data Structures',
    slug: 'javascript-mastery',
    description: 'Deep dive into the JavaScript engine, event loop, memory management, closures, prototypes, asynchronous patterns, and algorithmic problem solving.',
    tagline: 'Master the fundamentals and advanced internals of JavaScript',
    badge_text: 'Popular',
    color_gradient: 'from-amber-500 via-orange-600 to-rose-600',
    estimated_hours: 35,
    total_scrims: 65,
    difficulty: 'Beginner',
    is_pro: false,
    is_published: true,
    order_index: 3,
    created_at: '2026-10-03T00:00:00Z',
    updated_at: '2026-10-03T00:00:00Z',
  },
];

const LOCAL_TRACKS_KEY = 'easylearn_curriculum_tracks';
const LOCAL_MODULES_KEY = 'easylearn_curriculum_modules';

function getLocalTracks(): LearningTrack[] {
  try {
    const raw = localStorage.getItem(LOCAL_TRACKS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_TRACKS_KEY, JSON.stringify(SEED_TRACKS));
      return SEED_TRACKS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_TRACKS;
  }
}

function getLocalModules(): CourseModule[] {
  try {
    const raw = localStorage.getItem(LOCAL_MODULES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const curriculumService = {
  /**
   * Retrieves all available Learning Tracks / Career Paths.
   */
  async getTracks(): Promise<LearningTrack[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('learning_tracks')
          .select('*')
          .order('order_index', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as LearningTrack[];
        }
      } catch (_) {}
    }

    return getLocalTracks();
  },

  /**
   * Retrieves a Learning Track by slug along with its attached courses.
   */
  async getTrackBySlug(slug: string): Promise<LearningTrackWithCourses | null> {
    const tracks = await this.getTracks();
    const track = tracks.find((t) => t.slug === slug);
    if (!track) return null;

    const allCourses = await scrimDatabase.getAllCourses();

    return {
      ...track,
      courses: allCourses.map((c, i) => ({ ...c, module_number: i + 1 })),
    };
  },

  /**
   * Retrieves modules/chapters for a specific course, populated with lessons.
   */
  async getCourseModules(courseId: string): Promise<CourseModule[]> {
    let modules: CourseModule[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('course_modules')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });

        if (!error && data && data.length > 0) {
          modules = data as CourseModule[];
        }
      } catch (_) {}
    }

    if (modules.length === 0) {
      modules = getLocalModules().filter((m) => m.course_id === courseId);
    }

    // Default modules if none exist yet
    if (modules.length === 0) {
      modules = [
        {
          id: `mod-${courseId}-1`,
          course_id: courseId,
          title: 'Module 1: Foundations & Core Concepts',
          description: 'Master the basics through hands-on interactive coding scrims.',
          order_index: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `mod-${courseId}-2`,
          course_id: courseId,
          title: 'Module 2: Advanced Topics & Real-World Projects',
          description: 'Put your skills to the test with guided capstone challenges.',
          order_index: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    }

    // Attach lessons to each module
    const allClasses = await scrimDatabase.getClassesByCourse(courseId);
    return modules.map((m, idx) => {
      const sliceSize = Math.ceil(allClasses.length / modules.length);
      const start = idx * sliceSize;
      const lessons = allClasses.slice(start, start + sliceSize);
      return {
        ...m,
        lessons: lessons.length > 0 ? lessons : allClasses,
      };
    });
  },

  /**
   * Adds or registers a new learning track (career path).
   */
  async createTrack(trackData: Omit<LearningTrack, 'id' | 'created_at' | 'updated_at'>): Promise<LearningTrack> {
    const id = `track-${Date.now()}`;
    const now = new Date().toISOString();
    const newTrack: LearningTrack = {
      ...trackData,
      id,
      created_at: now,
      updated_at: now,
    };

    const current = getLocalTracks();
    current.push(newTrack);
    localStorage.setItem(LOCAL_TRACKS_KEY, JSON.stringify(current));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('learning_tracks').insert([newTrack]);
      } catch (_) {}
    }

    return newTrack;
  },

  /**
   * Adds a new module (chapter) to a course.
   */
  async createModule(courseId: string, title: string, description = ''): Promise<CourseModule> {
    const id = `mod-${Date.now()}`;
    const now = new Date().toISOString();
    const newModule: CourseModule = {
      id,
      course_id: courseId,
      title,
      description,
      order_index: getLocalModules().filter((m) => m.course_id === courseId).length + 1,
      created_at: now,
      updated_at: now,
    };

    const current = getLocalModules();
    current.push(newModule);
    localStorage.setItem(LOCAL_MODULES_KEY, JSON.stringify(current));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('course_modules').insert([newModule]);
      } catch (_) {}
    }

    return newModule;
  },
};
