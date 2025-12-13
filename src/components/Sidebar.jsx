import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import userImg from '../assets/user.jpg';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'My Courses', path: '/courses', icon: '📚' },
    { name: 'Languages', path: '/languages', icon: '🌐' },
    { name: 'Projects', path: '/projects', icon: '💻' },
    { name: 'More', path: '/more', icon: '⋯' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white shadow-2xl flex flex-col z-50 transition-all duration-300">
      {/* Logo/Brand Section */}
      <div className="p-8 border-b border-gray-800">
        <h1 className="text-3xl font-extrabold text-primary font-caveat tracking-wider cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/')}>
          EASY LEARN
        </h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                      ? 'bg-primary text-gray-900 shadow-lg shadow-primary/20'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="tracking-wide">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer group" onClick={() => navigate("/profile")}>
          <div className="relative">
            <img
              src={userImg}
              alt="user"
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 group-hover:border-primary transition-colors"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-tight group-hover:text-primary transition-colors">Student Name</span>
            <span className="text-xs text-gray-400">View Profile</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 shadow-sm active:scale-95"
        >
          <span>Log Out</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>

        <div className="text-[10px] text-gray-600 text-center mt-4 font-medium uppercase tracking-widest">
          © 2025 Easy Learn
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

