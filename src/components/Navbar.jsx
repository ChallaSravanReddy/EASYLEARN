import React from "react";
import { Link, useNavigate } from "react-router-dom";
import userImg from "../assets/user.jpg";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center px-8 py-2 bg-white shadow-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-primary font-caveat">EASY LEARN</h2>
        <input
          type="text"
          placeholder="What do you want to learn"
          className="px-3 py-1.5 rounded-l-full border border-gray-200 outline-none text-sm bg-gray-50 w-40 transition-colors focus:border-primary"
        />
        <button className="bg-primary text-dark border-none rounded-r-full px-3.5 py-1.5 text-sm cursor-pointer transition-colors hover:bg-yellow-300">
          →
        </button>
      </div>
      <div className="flex items-center gap-4">
        <a href="#" className="no-underline text-dark text-sm font-medium py-1 border-b-2 border-transparent transition-all hover:text-primary hover:border-primary">
          Home
        </a>
        <a href="#" className="no-underline text-dark text-sm font-medium py-1 border-b-2 border-transparent transition-all hover:text-primary hover:border-primary">
          Dashboard
        </a>
        <a href="#" className="no-underline text-dark text-sm font-medium py-1 border-b-2 border-transparent transition-all hover:text-primary hover:border-primary">
          My Courses
        </a>
        <span className="text-lg cursor-pointer transition-colors hover:text-primary">🔔</span>
        <img
          src={userImg}
          alt="user"
          className="w-7 h-7 rounded-full object-cover border-2 border-primary cursor-pointer"
          onClick={() => navigate("/profile")}
        />
        <Link to="/login">
          <button className="bg-primary text-dark border-none rounded px-4 py-1.5 text-sm font-bold cursor-pointer shadow-sm transition-all hover:bg-yellow-300 hover:shadow-md">
            Login
          </button>
        </Link>
      </div>
    </nav>
  );
}