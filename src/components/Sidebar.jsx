import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import userImg from '../assets/user.jpg';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Courses', path: '/courses' },
    { name: 'Languages', path: '/languages' },
    { name: 'Projects', path: '/projects' },
    { name: 'More', path: '/more' },
  ];

  return (
    <div 
      className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col z-50"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '256px',
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50
      }}
    >
      {/* Logo/Brand Section */}
      <div 
        className="p-6 border-b border-gray-200 dark:border-gray-700"
        style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}
      >
        <h1 
          className="text-2xl font-bold text-primary font-caveat dark:text-yellow-400"
          style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#ffd700',
            fontFamily: 'Caveat, cursive'
          }}
        >
          EASY LEARN
        </h1>
      </div>

      
      {/* Navigation Items */}
      <nav 
        className="flex-1 p-4"
        style={{ flex: 1, padding: '1rem' }}
      >
        <ul className="space-y-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map((item) => (
            <li key={item.name} style={{ marginBottom: '0.5rem' }}>
              <Link
                to={item.path}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  location.pathname === item.path
                    ? 'bg-primary text-dark dark:bg-yellow-600 dark:text-gray-900 font-semibold'
                    : 'text-dark dark:text-gray-200 hover:text-primary dark:hover:text-yellow-400'
                }`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s',
                  backgroundColor: location.pathname === item.path ? '#ffd700' : 'transparent',
                  color: location.pathname === item.path ? '#181824' : 'inherit',
                  fontWeight: location.pathname === item.path ? '600' : '400'
                }}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div 
        className="p-4 border-t border-gray-200 dark:border-gray-700"
        style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}
      >
        {/* Notification & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span 
            className="text-lg cursor-pointer transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-yellow-400"
            style={{ fontSize: '1.25rem', cursor: 'pointer', transition: 'color 0.2s' }}
          >
            🔔
          </span>
          <img
            src={userImg}
            alt="user"
            className="w-8 h-8 rounded-full object-cover border-2 border-primary dark:border-yellow-400 cursor-pointer"
            onClick={() => navigate("/profile")}
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #ffd700',
              cursor: 'pointer'
            }}
          />
          <span 
            className="text-dark dark:text-gray-200"
            style={{ 
              flex: 1, 
              fontSize: '0.875rem', 
              fontWeight: '500',
              color: '#181824'
            }}
          >
            Profile
          </span>
        </div>

        {/* Login Button */}
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button 
            className="bg-primary text-dark dark:bg-yellow-600 dark:text-gray-900 border-none rounded px-4 py-2 text-sm font-bold cursor-pointer shadow-sm transition-all hover:bg-yellow-300 dark:hover:bg-yellow-500 hover:shadow-md w-full"
            style={{
              backgroundColor: '#ffd700',
              color: '#181824',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s',
              width: '100%'
            }}
          >
            Login
          </button>
        </Link>

        {/* Footer Text */}
        <div 
          className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3"
          style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginTop: '0.75rem' }}
        >
          © 2025 Easy Learn
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
