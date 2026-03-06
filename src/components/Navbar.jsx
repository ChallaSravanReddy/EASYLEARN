import React from "react";
import { Link, useNavigate } from "react-router-dom";
import userImg from "../assets/user.jpg";
import { Search, Bell, LogIn } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 w-full flex justify-between items-center px-6 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 z-40 transition-all duration-300">
      <div className="flex items-center gap-6 flex-1">
        <div className="hidden md:flex items-center bg-gray-100 dark:bg-slate-800 rounded-2xl px-4 py-2 w-full max-w-md border border-transparent focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for courses, lessons..."
            className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 w-full ml-3 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2 md:gap-4 border-r border-gray-200 dark:border-gray-800 pr-4 md:pr-6">
          <ThemeToggle />
          
          <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-all rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group">
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
            <Bell className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 ml-2">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate("/profile")}
          >
            <div className="relative">
              <img
                src={userImg}
                alt="user"
                className="w-9 h-9 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-all shadow-sm"
              />
              <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-none">Student Name</p>
              <p className="text-[10px] text-gray-500 font-medium mt-1">Premium Plan</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="hidden sm:flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}