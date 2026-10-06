import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Video as VideoIcon,
  Calendar,
  ArrowRight,
  Clock,
  Trash2,
  Play,
  Sparkles,
  Radio,
  Search,
  Database,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { scrimDatabase } from '../services/scrimDatabase';

export default function InstructorDashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await scrimDatabase.getAllClasses();
      setClasses(data);
    } catch (err) {
      console.error('Failed to load recorded classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this recorded class from the database?')) {
      return;
    }
    setDeleteId(id);
    await scrimDatabase.deleteClass(id);
    await loadClasses();
    setDeleteId(null);
  };

  const categories = ['All', ...Array.from(new Set(classes.map((c) => c.category || 'General')))];

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalMinutes = Math.round(
    classes.reduce((sum, c) => sum + (c.duration_ms || 0), 0) / 60000
  );
  const totalViews = classes.reduce((sum, c) => sum + (c.views_count || 0), 0);

  const formatDuration = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
      {/* ── Top Header Banner ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Database className="w-3.5 h-3.5" />
              Recorded Classes Database
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Sync
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Instructor Studio & Library
          </h1>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            Record, publish, and manage all your interactive telemetry classes. Every keystroke, audio stream, and code snapshot is saved and synchronized with the database.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/studio')}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-pulse" /> Launch Recording Studio
          </button>
          <button
            onClick={() => navigate('/instructor/lesson/new')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3.5 px-5 rounded-2xl border border-slate-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Timeline Lesson
          </button>
        </div>
      </div>

      {/* ── Metrics Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Classes</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{classes.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Duration</p>
          <p className="text-3xl font-extrabold text-indigo-500 mt-1">{totalMinutes}m</p>
        </div>
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Views</p>
          <p className="text-3xl font-extrabold text-emerald-500 mt-1">{totalViews}</p>
        </div>
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Interactive Telemetry</p>
          <p className="text-3xl font-extrabold text-violet-500 mt-1">100%</p>
        </div>
      </div>

      {/* ── Main Database Records Section ─────────────────────── */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-indigo-500" />
              Recorded Classes in Database ({filteredClasses.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Classes stored in local IndexedDB and synced to Supabase PostgreSQL.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-mono">Querying database records...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <VideoIcon className="w-12 h-12 text-slate-400 mx-auto opacity-40" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No recorded classes found
              </h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                {searchQuery
                  ? `No classes matching "${searchQuery}". Try clearing search.`
                  : "You haven't recorded any classes yet. Click 'Launch Recording Studio' to start teaching!"}
              </p>
            </div>
            <button
              onClick={() => navigate('/studio')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md cursor-pointer transition-all hover:scale-105"
            >
              <Radio className="w-4 h-4" /> Start Recording in Studio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/player?scrimId=${item.id}`)}
                className="group flex flex-col bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 hover:border-indigo-500/80 p-5 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer relative"
              >
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {item.category || 'General'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDuration(item.duration_ms)}</span>
                  </div>
                </div>

                {/* Class Title & Description */}
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {item.description || 'Interactive code session with telemetry and voice playback.'}
                </p>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={deleteId === item.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/player?scrimId=${item.id}`);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Play</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
