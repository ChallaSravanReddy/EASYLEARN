import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:scale-105 active:scale-95"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-500 animate-in spin-in-90 duration-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700 animate-in spin-in-90 duration-500" />
      )}
    </button>
  );
};

export default ThemeToggle;
