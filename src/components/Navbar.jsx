import React from "react";
import { Link, useNavigate } from "react-router-dom";
import userImg from "../assets/user.jpg";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-md transition-all duration-300">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-3xl font-extrabold text-gray-900 font-caveat tracking-wide hover:text-primary transition-colors">
          EASY LEARN
        </Link>
        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-5 py-2 focus-within:ring-2 focus-within:ring-primary/60 transition-all">
          <input
            type="text"
            placeholder="What do you want to learn?"
            className="bg-transparent border-none outline-none text-sm text-gray-700 w-72 placeholder-gray-400"
          />
          <button className="ml-3 text-gray-500 hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-base font-semibold text-gray-600 hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/dashboard" className="text-base font-semibold text-gray-600 hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/courses" className="text-base font-semibold text-gray-600 hover:text-primary transition-colors">
            My Courses
          </Link>
        </div>
        
        <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
          <button className="relative p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-gray-50">
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/profile")}>
            <img
              src={userImg}
              alt="user"
              className="w-9 h-9 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-all shadow-sm"
            />
          </div>

          <Link to="/login">
            <button className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
              Login
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}