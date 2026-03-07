import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import userImg from '../assets/user.jpg';
import {
  Home, LayoutDashboard, BookOpen, Globe, Code2,
  LogOut, ChevronRight, GraduationCap
} from 'lucide-react';

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Courses', path: '/courses', icon: BookOpen },
  { name: 'Languages', path: '/languages', icon: Globe },
  { name: 'Projects', path: '/projects', icon: Code2 },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 hidden md:flex flex-col z-[100] bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800">

      {/* ── Brand ──────────────────────────────────── */}
      <div
        className="flex items-center gap-2.5 px-6 h-16 border-b border-gray-200 dark:border-slate-800 cursor-pointer shrink-0"
        onClick={() => navigate('/')}
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <GraduationCap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
          Easy<span className="text-indigo-600">Learn</span>
        </span>
      </div>

      {/* ── Navigation ─────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase tracking-widest px-3 mb-2">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/70 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400 dark:text-slate-500'}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-400" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── User Card ──────────────────────────────── */}
      <div className="shrink-0 p-3 border-t border-gray-200 dark:border-slate-800">
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800/70 transition-colors group"
          onClick={() => navigate('/profile')}
        >
          <div className="relative shrink-0">
            <img
              src={userImg}
              alt="user"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-slate-700"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-950 rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">Student Name</p>
            <p className="text-[11px] text-gray-500 dark:text-slate-500 truncate">Premium Member</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
