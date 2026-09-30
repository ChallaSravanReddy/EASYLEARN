import React from "react";
import { useNavigate } from "react-router-dom";
import userImg from "../assets/user.jpg";
import { Search, Bell, LogIn, GraduationCap } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800">
      <div className="flex items-center gap-4 h-16 px-6">

        {/* Search */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses, topics..."
              className="w-full bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-indigo-300 dark:focus:border-indigo-700 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-slate-500 pl-9 pr-4 py-2 rounded-lg outline-none transition-all focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto">
          <ThemeToggle />

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-white transition-all">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950" />
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-2" />

          {/* User Avatar */}
          {currentUser && (
            <div
              className="flex items-center gap-2.5 cursor-pointer group px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
              onClick={() => navigate("/profile")}
            >
              <img
                src={currentUser?.user_metadata?.avatar_url || userImg}
                alt="user"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-slate-700 group-hover:ring-indigo-300 dark:group-hover:ring-indigo-700 transition-all"
              />
              <div className="hidden lg:block">
                <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none">
                  {currentUser?.user_metadata?.full_name || 'Student Name'}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-slate-500 mt-0.5 capitalize">
                  {userRole === 'instructor' ? 'Instructor' : 'Student'}
                </p>
              </div>
            </div>
          )}

          {/* Login CTA */}
          {!currentUser && (
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors ml-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}