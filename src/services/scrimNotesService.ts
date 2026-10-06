import { supabase, isSupabaseConfigured } from '../supabaseClient';

export interface ScrimNoteRecord {
  id: string;
  user_id?: string | null;
  scrim_id: string;
  timestamp_ms: number;
  file_path: string;
  line_number: number;
  code_snippet?: string;
  note_text: string;
  color_tag: 'amber' | 'sky' | 'emerald' | 'purple' | 'rose';
  is_bookmarked: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaveNoteInput {
  scrimId: string;
  userId?: string | null;
  timestampMs: number;
  filePath?: string;
  lineNumber?: number;
  codeSnippet?: string;
  noteText: string;
  colorTag?: 'amber' | 'sky' | 'emerald' | 'purple' | 'rose';
  isBookmarked?: boolean;
}

const LOCAL_NOTES_KEY = 'easylearn_scrim_notes';

function getLocalNotes(): ScrimNoteRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalNotes(notes: ScrimNoteRecord[]) {
  try {
    localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(notes));
  } catch (_) {}
}

export const scrimNotesService = {
  /**
   * Saves a new time-anchored note or bookmark.
   */
  async saveNote(input: SaveNoteInput): Promise<ScrimNoteRecord> {
    const noteId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const record: ScrimNoteRecord = {
      id: noteId,
      user_id: input.userId || null,
      scrim_id: input.scrimId,
      timestamp_ms: Math.max(0, Math.round(input.timestampMs)),
      file_path: input.filePath || 'index.js',
      line_number: input.lineNumber || 1,
      code_snippet: input.codeSnippet || '',
      note_text: input.noteText.trim(),
      color_tag: input.colorTag || 'amber',
      is_bookmarked: input.isBookmarked ?? true,
      created_at: now,
      updated_at: now,
    };

    // 1. Local fallback
    const list = getLocalNotes();
    list.unshift(record);
    saveLocalNotes(list);

    // 2. Supabase Cloud Sync
    if (isSupabaseConfigured) {
      try {
        const payload = {
          id: record.id,
          user_id: record.user_id,
          scrim_id: record.scrim_id,
          timestamp_ms: record.timestamp_ms,
          file_path: record.file_path,
          line_number: record.line_number,
          code_snippet: record.code_snippet,
          note_text: record.note_text,
          color_tag: record.color_tag,
          is_bookmarked: record.is_bookmarked,
          created_at: record.created_at,
          updated_at: record.updated_at,
        };

        const { data, error } = await supabase.from('scrim_notes').insert([payload]).select().single();
        if (!error && data) {
          return data as ScrimNoteRecord;
        }
      } catch (e) {
        console.warn('[scrimNotesService] Cloud insert note (cached locally):', e);
      }
    }

    return record;
  },

  /**
   * Retrieves all notes for a specific scrim, sorted by timeline timestamp.
   */
  async getNotesForScrim(scrimId: string, userId?: string | null): Promise<ScrimNoteRecord[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('scrim_notes')
          .select('*')
          .eq('scrim_id', scrimId);

        if (userId) {
          query = query.or(`user_id.eq.${userId},user_id.is.null`);
        }

        const { data, error } = await query.order('timestamp_ms', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as ScrimNoteRecord[];
        }
      } catch (_) {}
    }

    return getLocalNotes()
      .filter((n) => n.scrim_id === scrimId)
      .sort((a, b) => a.timestamp_ms - b.timestamp_ms);
  },

  /**
   * Deletes a note by its ID.
   */
  async deleteNote(noteId: string): Promise<boolean> {
    const list = getLocalNotes().filter((n) => n.id !== noteId);
    saveLocalNotes(list);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('scrim_notes').delete().eq('id', noteId);
      } catch (_) {}
    }

    return true;
  },

  /**
   * Toggles bookmark status for a note.
   */
  async toggleBookmark(noteId: string): Promise<boolean> {
    const list = getLocalNotes();
    const item = list.find((n) => n.id === noteId);
    if (item) {
      item.is_bookmarked = !item.is_bookmarked;
      saveLocalNotes(list);
    }

    if (isSupabaseConfigured && item) {
      try {
        await supabase.from('scrim_notes').update({ is_bookmarked: item.is_bookmarked }).eq('id', noteId);
      } catch (_) {}
    }

    return item ? item.is_bookmarked : false;
  },
};
