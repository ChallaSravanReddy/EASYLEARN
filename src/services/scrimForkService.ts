import { openDB } from 'idb';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

export interface ScrimForkRecord {
  id: string;
  parent_scrim_id: string;
  parent_fork_id?: string | null;
  user_id?: string | null;
  author_name: string;
  forked_at_ms: number;
  title: string;
  description?: string;
  files: Record<string, string>;
  active_file: string;
  share_slug: string;
  is_public: boolean;
  stars_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateForkInput {
  parentScrimId: string;
  parentForkId?: string | null;
  userId?: string | null;
  authorName?: string;
  forkedAtMs: number;
  title?: string;
  description?: string;
  files: Record<string, string>;
  activeFile?: string;
  isPublic?: boolean;
}

const LOCAL_FORKS_KEY = 'easylearn_scrim_forks';

function generateShortSlug(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let slug = '';
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

function getLocalForks(): ScrimForkRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_FORKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalForks(forks: ScrimForkRecord[]) {
  try {
    localStorage.setItem(LOCAL_FORKS_KEY, JSON.stringify(forks));
  } catch (_) {}
}

export const scrimForkService = {
  /**
   * Creates a Copy-on-Write (CoW) student branch of a scrim at the specified timestamp.
   */
  async createFork(input: CreateForkInput): Promise<ScrimForkRecord> {
    const forkId = `fork-${Date.now()}-${generateShortSlug()}`;
    const slug = generateShortSlug();
    const now = new Date().toISOString();

    const record: ScrimForkRecord = {
      id: forkId,
      parent_scrim_id: input.parentScrimId,
      parent_fork_id: input.parentForkId || null,
      user_id: input.userId || null,
      author_name: input.authorName || 'Student',
      forked_at_ms: Math.max(0, Math.round(input.forkedAtMs)),
      title: input.title || `Fork @ ${Math.round(input.forkedAtMs / 1000)}s`,
      description: input.description || '',
      files: { ...input.files },
      active_file: input.activeFile || 'index.js',
      share_slug: slug,
      is_public: input.isPublic ?? true,
      stars_count: 0,
      forks_count: 0,
      created_at: now,
      updated_at: now,
    };

    // 1. Save to local fallback cache
    const current = getLocalForks();
    current.unshift(record);
    saveLocalForks(current);

    // 2. Persist to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const payload = {
          id: record.id,
          parent_scrim_id: record.parent_scrim_id,
          parent_fork_id: record.parent_fork_id,
          user_id: record.user_id,
          author_name: record.author_name,
          forked_at_ms: record.forked_at_ms,
          title: record.title,
          description: record.description,
          files: record.files,
          active_file: record.active_file,
          share_slug: record.share_slug,
          is_public: record.is_public,
          stars_count: record.stars_count,
          forks_count: record.forks_count,
          created_at: record.created_at,
          updated_at: record.updated_at,
        };

        const { data, error } = await supabase.from('scrim_forks').insert([payload]).select().single();
        if (!error && data) {
          return data as ScrimForkRecord;
        }
      } catch (e) {
        console.warn('[scrimForkService] Supabase insert note (cached locally):', e);
      }
    }

    return record;
  },

  /**
   * Retrieves a fork by its unique ID.
   */
  async getForkById(forkId: string): Promise<ScrimForkRecord | null> {
    if (!forkId) return null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('scrim_forks')
          .select('*')
          .eq('id', forkId)
          .single();

        if (!error && data) {
          return data as ScrimForkRecord;
        }
      } catch (_) {}
    }

    const local = getLocalForks().find((f) => f.id === forkId);
    return local || null;
  },

  /**
   * Retrieves a fork by its shareable URL slug.
   */
  async getForkBySlug(slug: string): Promise<ScrimForkRecord | null> {
    if (!slug) return null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('scrim_forks')
          .select('*')
          .eq('share_slug', slug)
          .single();

        if (!error && data) {
          return data as ScrimForkRecord;
        }
      } catch (_) {}
    }

    const local = getLocalForks().find((f) => f.share_slug === slug);
    return local || null;
  },

  /**
   * Lists all forks for a specific parent scrim.
   */
  async getForksForScrim(parentScrimId: string): Promise<ScrimForkRecord[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('scrim_forks')
          .select('*')
          .eq('parent_scrim_id', parentScrimId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as ScrimForkRecord[];
        }
      } catch (_) {}
    }

    return getLocalForks().filter((f) => f.parent_scrim_id === parentScrimId);
  },

  /**
   * Stars a scrim fork atomically.
   */
  async starFork(forkId: string): Promise<number> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('star_scrim_fork', { p_fork_id: forkId });
        if (!error && typeof data === 'number') {
          return data;
        }
      } catch (_) {}
    }

    const forks = getLocalForks();
    const target = forks.find((f) => f.id === forkId);
    if (target) {
      target.stars_count = (target.stars_count || 0) + 1;
      saveLocalForks(forks);
      return target.stars_count;
    }
    return 1;
  },
};
