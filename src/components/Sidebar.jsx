import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import userImg from '../assets/user.jpg';
import {
  Home, LayoutDashboard, BookOpen, Globe, Code2,
  LogOut, ChevronRight, GraduationCap, PenTool
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useAuth();

  const navItems = userRole === 'instructor' 
    ? [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Instructor Dashboard', path: '/instructor-dashboard', icon: LayoutDashboard },
        { name: 'Create Lesson', path: '/instructor/lesson/new', icon: PenTool },
      ]
    : [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Courses', path: '/courses', icon: BookOpen },
        { name: 'Languages', path: '/languages', icon: Globe },
        { name: 'Projects', path: '/projects', icon: Code2 },
      ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 hidden md:flex flex-col z-[100] bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-r border-gray-200/50 dark:border-slate-800/50">

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
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                    ${isActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-100/50 dark:shadow-none'
                      : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-gray-400 dark:text-slate-500 group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-500 dark:text-indigo-400" />
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
