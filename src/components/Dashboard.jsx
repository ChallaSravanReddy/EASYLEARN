import React from 'react';
import { useNavigate } from 'react-router-dom';
import RecommendedCourses from './RecommendedCourses';
import { BookOpen, CheckCircle2, Clock, Trophy, ArrowRight, TrendingUp, PlayCircle, Zap } from 'lucide-react';

const STATS = [
  { label: 'In Progress', value: '3', icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  { label: 'Completed', value: '12', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { label: 'Hours Learned', value: '45h', icon: Clock, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  { label: 'Achievements', value: '8', icon: Trophy, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
];

const ENROLLED = [
  { id: 1, title: 'JavaScript Introduction', progress: 65, lastAccessed: '2 hours ago', accent: 'bg-indigo-600' },
  { id: 2, title: 'Python Basics', progress: 30, lastAccessed: '1 day ago', accent: 'bg-violet-500' },
];

const ACTIVITY = [
  'Completed "Variables" in JavaScript',
  'Started "Functions and Scope"',
  'Earned "Quick Learner" badge',
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-10 max-w-screen-xl mx-auto">

      {/* ── Welcome Banner ─────────────────────────────────── */}
      <section className="relative bg-slate-900 rounded-3xl overflow-hidden text-white p-10 md:p-12 shadow-2xl shadow-indigo-900/20 border border-slate-800">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 opacity-70 mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 opacity-60 mix-blend-screen" />
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNHYtNGgtMnY0aC00djJoNHY0aDJ2LTRoNHYtMmgtNHptMC0zMFYwaC0ydjRoLTR2Mmg0djRoMnYtNGg0VjJoLTR6bS0zMCAwVjBoLTJ2NGgtNHYyaDR2NGgydi00aDRWMmgtNHpNMzYgNjR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bS0zMCAwaS00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          <div className="space-y-6 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 uppercase tracking-widest backdrop-blur-md">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Your next milestone is close
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">Student!</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              You've completed <span className="text-white font-bold">65%</span> of your JavaScript course. Keep going — the finish line is close!
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/course/javascript/introduction')}
                className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-900/50 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> Continue Learning
              </button>
              <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-base px-8 py-3.5 rounded-xl border border-white/10 transition-all backdrop-blur-sm hover:-translate-y-0.5">
                View Path
              </button>
            </div>
          </div>
          {/* Progress ring visual */}
          <div className="hidden lg:flex items-center gap-8 shrink-0">
            <div className="text-center group">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="65 35" strokeLinecap="round" className="group-hover:stroke-[#818cf8] transition-colors duration-300" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-white">65%</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-4 font-semibold uppercase tracking-wider">JavaScript</p>
            </div>
            <div className="text-center group">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="30 70" strokeLinecap="round" className="group-hover:stroke-[#a78bfa] transition-colors duration-300" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-extrabold text-white">30%</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-4 font-semibold uppercase tracking-wider">Python</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-slate-800/60 p-6 flex items-center gap-5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1">
            <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none mb-1">{value}</p>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ──────────────────────────────────────── */}
      <div className="grid xl:grid-cols-3 gap-8">

        {/* Left: In Progress + Recommended */}
        <div className="xl:col-span-2 space-y-10">

          {/* In Progress */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">In Progress</h2>
              <button className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group">
                View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {ENROLLED.map(course => (
                <div key={course.id} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-slate-800/60 p-6 space-y-6 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">{course.title}</h3>
                    <span className="text-xs font-medium text-gray-400 dark:text-slate-500 whitespace-nowrap shrink-0">{course.lastAccessed}</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-slate-400">
                      <span>Progress</span>
                      <span className="font-bold text-gray-900 dark:text-white">{course.progress}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${course.accent} rounded-full transition-all duration-1000 ease-out relative`} style={{ width: `${course.progress}%` }}>
                         <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/course/javascript/introduction')}
                    className="w-full py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-md group-hover:shadow-indigo-500/20"
                  >
                    <PlayCircle className="w-5 h-5" /> Resume Learning
                  </button>
                </div>
              ))}
            </div>
          </section>

          <RecommendedCourses />
        </div>

        {/* Right: Activity Feed */}
        <div>
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-slate-800/60 p-8 sticky top-8 shadow-xl shadow-gray-200/20 dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-gray-900 dark:text-white text-xl tracking-tight">Recent Activity</h3>
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                 <Zap className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div className="space-y-6">
              {ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  {i !== ACTIVITY.length - 1 && <div className="absolute top-8 left-[9px] w-[2px] h-full bg-gray-100 dark:bg-slate-800 -z-10" />}
                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 border-4 border-white dark:border-slate-900 flex items-center justify-center shrink-0 z-10 mt-0.5">
                     <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  </div>
                  <div className="pb-2">
                    <p className="text-base text-gray-800 dark:text-slate-200 font-semibold leading-snug">{item}</p>
                    <p className="text-xs font-medium text-gray-400 dark:text-slate-500 mt-1">Today, 2:40 PM</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3.5 text-sm font-bold text-gray-600 dark:text-slate-300 border-2 border-gray-100 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:border-gray-200 dark:hover:border-slate-700 transition-all duration-300">
              View Full History
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}