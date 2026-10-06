import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import userImg from '../assets/user.jpg';
import {
  Home,
  Layers,
  LayoutGrid,
  Compass,
  Sparkles,
  Users,
  BookOpen,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  LogOut,
  Radio,
  PlayCircle,
  HelpCircle,
  Shield,
  FileCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, currentUser } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const mainNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Topics', path: '/#catalog', icon: Layers },
    { name: 'Courses', path: '/dashboard', icon: LayoutGrid },
    { name: 'Career Paths', path: '/#career-paths', icon: Compass },
    { name: 'Explain', path: '/player', icon: Sparkles, badge: 'BETA' },
  ];

  const secondaryNavItems = [
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Docs', path: '/docs', icon: BookOpen },
    { name: 'Roadmap', path: '/roadmap', icon: Calendar },
    { name: 'Pricing', path: '/pricing', icon: Tag },
  ];

  const extendedNavItems = [
    { name: 'Recording Studio', path: '/studio', icon: Radio },
    { name: 'Scrim Player', path: '/player', icon: PlayCircle },
    { name: 'Community FAQ', path: '/faq', icon: HelpCircle },
    { name: 'Code Guidelines', path: '/guidelines', icon: FileCode },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-56 hidden md:flex flex-col z-[100] bg-white dark:bg-[#0c0d14] border-r border-slate-200/90 dark:border-slate-800/80 select-none transition-colors duration-200">
      {/* ── Scrimba Brand Logo & Wordmark ── */}
      <div
        className="flex items-center gap-2.5 px-5 h-16 cursor-pointer shrink-0 border-b border-transparent dark:border-slate-800/30"
        onClick={() => navigate('/')}
      >
        {/* Scrimba Signature Twin Offset Square Blocks */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-2.5 h-4 bg-slate-900 dark:bg-white rounded-[2px] transform -translate-y-0.5" />
          <div className="w-2.5 h-4 bg-slate-900 dark:bg-white rounded-[2px] transform translate-y-0.5" />
        </div>
        <span className="text-base font-black tracking-widest text-slate-900 dark:text-white uppercase font-sans">
          SCRIMBA
        </span>
      </div>

      {/* ── Navigation Menu Items ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
        {/* Main Section */}
        <ul className="space-y-0.5">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <div className="my-2 border-t border-slate-200/60 dark:border-slate-800/60" />

        {/* Secondary Section */}
        <ul className="space-y-0.5">
          {secondaryNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={1.8} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Expandable "Show more..." */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full flex items-center justify-between px-3 py-2 text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <span>{showMore ? 'Show less' : 'Show more...'}</span>
          {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showMore && (
          <ul className="space-y-0.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
            {extendedNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={1.8} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* ── Bottom Section: Authentic Scrimba Actions ── */}
      <div className="shrink-0 p-3.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0c0d14] flex flex-col gap-2.5">
        <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 select-none font-normal">
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <span>·</span>
          <Link to="/terms" className="hover:underline">Terms</Link>
          <span>·</span>
          <Link to="/cookies" className="hover:underline">Cookies</Link>
        </div>

        {currentUser ? (
          <div className="flex flex-col gap-2">
            <div
              className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => navigate('/profile')}
            >
              <img
                src={currentUser?.user_metadata?.avatar_url || userImg}
                alt="user"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {currentUser?.user_metadata?.full_name || 'Student'}
                </p>
                <p className="text-[10px] text-slate-500 truncate capitalize">
                  {userRole === 'instructor' ? 'Instructor' : 'Pro Learner'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/pricing')}
              className="w-full py-2 px-3 rounded-md bg-[#e0f2fe] dark:bg-sky-950/70 hover:bg-sky-200 dark:hover:bg-sky-900/90 text-[#0070f3] dark:text-sky-300 text-xs font-bold uppercase tracking-wider transition-colors border border-sky-200 dark:border-sky-800/50 cursor-pointer shadow-xs text-center"
            >
              UPGRADE TO PRO
            </button>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/login');
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-3 rounded-md bg-[#0086ff] hover:bg-[#0074e0] active:bg-[#0065c4] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 cursor-pointer text-center"
            >
              SIGN IN
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="w-full py-2.5 px-3 rounded-md bg-[#e0f2fe] dark:bg-sky-950/70 hover:bg-sky-200 dark:hover:bg-sky-900 text-[#0070f3] dark:text-sky-300 text-xs font-bold uppercase tracking-wider transition-colors border border-sky-200 dark:border-sky-800/50 cursor-pointer text-center"
            >
              UPGRADE TO PRO
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
