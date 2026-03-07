import React from 'react';
import { useNavigate } from 'react-router-dom';
import RecommendedCourses from './RecommendedCourses';
import { BookOpen, CheckCircle2, Clock, Trophy, ArrowRight, TrendingUp, PlayCircle, Zap } from 'lucide-react';

const STATS = [
  { label: 'In Progress', value: '3', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50   dark:bg-blue-900/30' },
  { label: 'Completed', value: '12', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50  dark:bg-green-900/30' },
  { label: 'Hours Learned', value: '45h', icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/30' },
  { label: 'Achievements', value: '8', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50  dark:bg-amber-900/30' },
];

const ENROLLED = [
  { id: 1, title: 'JavaScript Introduction', progress: 65, lastAccessed: '2 hours ago', accent: 'bg-indigo-600' },
  { id: 2, title: 'Python Basics', progress: 30, lastAccessed: '1 day ago', accent: 'bg-blue-500' },
];

const ACTIVITY = [
  'Completed "Variables" in JavaScript',
  'Started "Functions and Scope"',
  'Earned "Quick Learner" badge',
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto">

      {/* ── Welcome Banner ─────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl overflow-hidden text-white p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4 max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-3 py-1 uppercase tracking-widest">
              <TrendingUp className="w-3.5 h-3.5" /> Your next milestone is close
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Welcome back, <span className="text-indigo-400">Student!</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              You've completed <span className="text-white font-bold">65%</span> of your JavaScript course. Keep going — the finish line is close!
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={() => navigate('/course/javascript/introduction')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-900/40"
              >
                <PlayCircle className="w-4 h-4" /> Continue Learning
              </button>
              <button className="flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-slate-300 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                View Path
              </button>
            </div>
          </div>
          {/* Progress ring visual */}
          <div className="hidden lg:flex items-center gap-6 shrink-0">
            <div className="text-center">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="65 35" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-extrabold text-white">65%</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">JavaScript</p>
            </div>
            <div className="text-center">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="30 70" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-extrabold text-white">30%</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">Python</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white leading-none">{value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ──────────────────────────────────────── */}
      <div className="grid xl:grid-cols-3 gap-6">

        {/* Left: In Progress + Recommended */}
        <div className="xl:col-span-2 space-y-8">

          {/* In Progress */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">In Progress</h2>
              <button className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {ENROLLED.map(course => (
                <div key={course.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 space-y-4 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{course.title}</h3>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 whitespace-nowrap shrink-0">{course.lastAccessed}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                      <span>Progress</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${course.accent} rounded-full transition-all duration-700`} style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/course/javascript/introduction')}
                    className="w-full py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <PlayCircle className="w-4 h-4" /> Resume
                  </button>
                </div>
              ))}
            </div>
          </section>

          <RecommendedCourses />
        </div>

        {/* Right: Activity Feed */}
        <div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Recent Activity</h3>
              <Zap className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="space-y-3">
              {ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-800 dark:text-slate-200 font-medium leading-snug">{item}</p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">Today, 2:40 PM</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-5 py-2 text-sm font-semibold text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              View History
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}