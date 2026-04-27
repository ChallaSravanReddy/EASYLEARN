import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Layout Components
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// Pages
import LandingPage from "./components/LandingPage";
import Profile from "./components/Profile";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Dashboard from "./components/Dashboard";
import CourseSyllabus from "./components/CourseSyllabus";
import TimelineCodePlayer from "./components/TimelineCodePlayer";
import TimelineEditor from "./components/TimelineEditor";
import InstructorDashboard from "./components/InstructorDashboard";
import WebChat from "./components/WebChat";

import "./App.css";

function Layout() {
  const location = useLocation();

  // Hide Sidebar & Footer on login, register, timeline player/editor pages
  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname.startsWith("/lesson/") ||
    location.pathname.startsWith("/instructor/lesson/new") ||
    location.pathname === "/course/javascript/introduction";

  // Show WebChat only on the TimelineCodePlayer page
  const showWebChat = location.pathname.startsWith("/lesson/") || location.pathname === "/course/javascript/introduction";

  return (
    <div className="flex min-h-screen bg-transparent">
      {!hideLayout && <Sidebar />}
      {/* Explicit margin-left is required because Sidebar is fixed */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!hideLayout ? 'main-content-shifted' : ''}`}>
        <main className={`flex-1 w-full overflow-x-hidden p-6 md:p-10 pb-8`}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/course/:courseName" element={<CourseSyllabus />} />
            <Route path="/course/javascript/introduction" element={<TimelineCodePlayer />} />
            
            {/* Engine & Instructor Routes */}
            <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/lesson/new" element={<TimelineEditor />} />
            <Route path="/lesson/:lessonId" element={<TimelineCodePlayer />} />
          </Routes>
        </main>
        {!hideLayout && <Footer />}
        {showWebChat && <WebChat />}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  const { theme } = useTheme();

  // Apply theme class to document element
  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Layout />
    </div>
  );
}

export default App;


