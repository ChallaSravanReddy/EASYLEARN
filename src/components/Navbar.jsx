import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import userImg from "../assets/user.jpg";
import { Search, X, Sparkles, Bell, ArrowRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="sticky top-0 z-40 w-full flex flex-col bg-white dark:bg-[#0c0d14] select-none transition-colors duration-200">
      {/* ── 1. Scrimba Top Announcement Banner ── */}
      {showBanner && (
        <div className="w-full bg-[#e0f2fe] dark:bg-[#082f49] border-b border-sky-200 dark:border-sky-900/60 px-4 py-2 flex items-center justify-center gap-3 text-xs md:text-sm text-slate-800 dark:text-sky-100 font-medium transition-all">
          <div className="flex items-center gap-2">
            <span className="text-slate-900 dark:text-white font-semibold">New Course: Learn AI Agents</span>
            <button
              onClick={() => navigate('/player')}
              className="px-2.5 py-0.5 rounded-full bg-white dark:bg-sky-950 text-slate-900 dark:text-sky-200 text-xs font-bold uppercase tracking-wider border border-slate-300 dark:border-sky-700 hover:bg-slate-50 dark:hover:bg-sky-900 transition-colors cursor-pointer shadow-xs"
            >
              DISCOVER
            </button>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-4 p-1 rounded-full text-slate-500 hover:text-slate-900 dark:text-sky-300 dark:hover:text-white hover:bg-sky-200/50 dark:hover:bg-sky-900/50 transition-colors cursor-pointer"
            title="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── 2. Scrimba Global Search Header ── */}
      <header className="w-full px-6 py-3 border-b border-slate-200/90 dark:border-slate-800/80 flex items-center justify-between gap-4">
        {/* Centered Omnibox */}
        <div className="flex-1 max-w-xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, lessons, explainers, teachers..."
              className="w-full bg-[#f8fafc] dark:bg-[#12141f] border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 pl-10 pr-12 py-2 rounded-lg outline-none transition-all shadow-xs focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded shadow-xs">
                ⌘K
              </kbd>
            </div>
          </form>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />

          {currentUser ? (
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 pl-2 cursor-pointer group"
            >
              <img
                src={currentUser?.user_metadata?.avatar_url || userImg}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-blue-400 transition-all"
              />
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-700 rounded-md transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </header>
    </div>
  );
}