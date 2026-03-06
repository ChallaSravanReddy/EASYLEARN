import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import userImg from '../assets/user.jpg';
import { 
  Home, 
  LayoutDashboard, 
  BookOpen, 
  Globe, 
  Code2, 
  MoreHorizontal, 
  LogOut,
  User
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/courses', icon: BookOpen },
    { name: 'Languages', path: '/languages', icon: Globe },
    { name: 'Projects', path: '/projects', icon: Code2 },
    { name: 'More', path: '/more', icon: MoreHorizontal },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 dark:bg-slate-950 text-white shadow-2xl hidden md:flex flex-col z-[100] transition-all duration-300 border-r border-gray-800 dark:border-slate-800">
      {/* Logo/Brand Section */}
      <div className="p-6 md:p-8 flex items-center justify-center md:justify-start">
        <h1 
          className="text-3xl font-extrabold text-primary font-caveat tracking-wider cursor-pointer hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95" 
          onClick={() => navigate('/')}
        >
          EASY LEARN
        </h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-4 px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive
                      ? 'bg-primary text-gray-900 shadow-xl shadow-primary/20 scale-[1.02]'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="font-bold tracking-wide">{item.name}</span>
                  {isActive && (
                    <div className="absolute right-0 top-0 h-full w-1 bg-primary rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 mt-auto border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
        <div 
          className="flex items-center gap-3 mb-4 p-3 rounded-2xl hover:bg-gray-800/80 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-700" 
          onClick={() => navigate("/profile")}
        >
          <div className="relative">
            <img
              src={userImg}
              alt="user"
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 group-hover:border-primary transition-all duration-500"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-gray-900 rounded-full shadow-lg"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white group-hover:text-primary transition-colors duration-300">Student Name</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Premium Member</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-3 bg-gray-800/50 border border-gray-700 text-gray-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 shadow-sm active:scale-95 group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Log Out</span>
        </button>

        <div className="text-[10px] text-gray-600 dark:text-gray-500 text-center mt-6 font-bold uppercase tracking-[0.2em] opacity-50">
          © 2025 Easy Learn
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

