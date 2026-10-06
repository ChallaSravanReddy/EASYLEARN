import { supabase, isSupabaseConfigured } from '../supabaseClient';

export interface ScrimDiscussionRecord {
  id: string;
  scrim_id: string;
  parent_id?: string | null;
  user_id?: string | null;
  user_name: string;
  user_avatar?: string;
  timestamp_ms: number;
  file_path: string;
  line_number?: number;
  code_snippet?: string;
  title?: string;
  content: string;
  upvotes_count: number;
  is_instructor_answered: boolean;
  replies?: ScrimDiscussionRecord[];
  created_at: string;
  updated_at: string;
}

export interface PostDiscussionInput {
  scrimId: string;
  parentId?: string | null;
  userId?: string | null;
  userName?: string;
  userAvatar?: string;
  timestampMs: number;
  filePath?: string;
  lineNumber?: number;
  codeSnippet?: string;
  title?: string;
  content: string;
}

const LOCAL_DISCUSSIONS_KEY = 'easylearn_scrim_discussions';

// Initial preloaded community discussions for interactive feel
const INITIAL_DEMO_DISCUSSIONS: ScrimDiscussionRecord[] = [
  {
    id: 'disc-1',
    scrim_id: 'class-js-launchpad',
    user_name: 'Sarah Chen',
    user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    timestamp_ms: 6000,
    file_path: 'index.js',
    line_number: 4,
    code_snippet: 'let name = "Guil Hernandez";',
    title: 'Why use let instead of const here?',
    content: 'Because in step 1 of the challenge we reassign this variable to our own name, whereas const would throw a TypeError: Assignment to constant variable.',
    upvotes_count: 14,
    is_instructor_answered: true,
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 'disc-2',
    scrim_id: 'class-js-launchpad',
    user_name: 'Alex Rivera',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    timestamp_ms: 12000,
    file_path: 'index.js',
    line_number: 10,
    code_snippet: 'let temperature = 0.6;',
    title: 'What does temperature actually do in AI models?',
    content: 'Temperature controls the probability distribution when the model chooses the next token. At 0.0 it is deterministic, while 0.8+ is much more varied and expressive.',
    upvotes_count: 9,
    is_instructor_answered: false,
    created_at: '2026-10-02T14:30:00Z',
    updated_at: '2026-10-02T14:30:00Z',
  },
];

function getLocalDiscussions(): ScrimDiscussionRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_DISCUSSIONS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_DISCUSSIONS_KEY, JSON.stringify(INITIAL_DEMO_DISCUSSIONS));
      return INITIAL_DEMO_DISCUSSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_DISCUSSIONS;
  }
}

function saveLocalDiscussions(list: ScrimDiscussionRecord[]) {
  try {
    localStorage.setItem(LOCAL_DISCUSSIONS_KEY, JSON.stringify(list));
  } catch (_) {}
}

export const scrimDiscussionService = {
  /**
   * Retrieves discussions for a scrim, optionally filtered near a timestamp window.
   */
  async getDiscussions(scrimId: string, nearTimestampMs?: number): Promise<ScrimDiscussionRecord[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('scrim_discussions')
          .select('*')
          .eq('scrim_id', scrimId)
          .is('parent_id', null)
          .order('upvotes_count', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as ScrimDiscussionRecord[];
        }
      } catch (_) {}
    }

    const local = getLocalDiscussions().filter(
      (d) => (!d.scrim_id || d.scrim_id === scrimId || scrimId === 'class-js-launchpad') && !d.parent_id
    );

    if (nearTimestampMs !== undefined) {
      // Sort items closest to the active timestamp first
      return [...local].sort((a, b) => {
        const diffA = Math.abs(a.timestamp_ms - nearTimestampMs);
        const diffB = Math.abs(b.timestamp_ms - nearTimestampMs);
        return diffA - diffB;
      });
    }

    return local.sort((a, b) => b.upvotes_count - a.upvotes_count);
  },

  /**
   * Posts a new question or comment anchored to the timeline.
   */
  async postDiscussion(input: PostDiscussionInput): Promise<ScrimDiscussionRecord> {
    const id = `disc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const record: ScrimDiscussionRecord = {
      id,
      scrim_id: input.scrimId,
      parent_id: input.parentId || null,
      user_id: input.userId || null,
      user_name: input.userName || 'Student',
      user_avatar: input.userAvatar,
      timestamp_ms: Math.max(0, Math.round(input.timestampMs)),
      file_path: input.filePath || 'index.js',
      line_number: input.lineNumber,
      code_snippet: input.codeSnippet,
      title: input.title || '',
      content: input.content.trim(),
      upvotes_count: 0,
      is_instructor_answered: false,
      created_at: now,
      updated_at: now,
    };

    const current = getLocalDiscussions();
    current.unshift(record);
    saveLocalDiscussions(current);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('scrim_discussions')
          .insert([record])
          .select()
          .single();

        if (!error && data) {
          return data as ScrimDiscussionRecord;
        }
      } catch (e) {
        console.warn('[scrimDiscussionService] Remote insert note:', e);
      }
    }

    return record;
  },

  /**
   * Upvotes a discussion thread atomically.
   */
  async upvote(discussionId: string): Promise<number> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('upvote_scrim_discussion', {
          p_discussion_id: discussionId,
        });
        if (!error && typeof data === 'number') {
          return data;
        }
      } catch (_) {}
    }

    const current = getLocalDiscussions();
    const target = current.find((d) => d.id === discussionId);
    if (target) {
      target.upvotes_count = (target.upvotes_count || 0) + 1;
      saveLocalDiscussions(current);
      return target.upvotes_count;
    }
    return 1;
  },
};
