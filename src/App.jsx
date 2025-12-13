
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

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
import WebChat from "./components/WebChat";

import "./App.css";

function Layout() {
  const location = useLocation();
  const { theme } = useTheme();

  // Hide Navbar & Footer on login and register pages, and the timeline player page
  const hideLayout = location.pathname === "/login" ||location.pathname === "/dashboard" || location.pathname === "/register" || location.pathname === "/course/javascript/introduction";
  
  // Show WebChat only on the TimelineCodePlayer page
  const showWebChat = location.pathname === "/course/javascript/introduction";
  //above line to remove for chatbot removal

  return (
    <div className={styles.app}>
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/course/:courseName" element={<CourseSyllabus />} />
        <Route path="/course/javascript/introduction" element={<TimelineCodePlayer />} />
      </Routes>
      {!hideLayout && <Footer />}
      {showWebChat && <WebChat />}
      {/*above line to remove for chatbot removal*/}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
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
    <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}>
      <Layout />
    </div>
  );
}

export default App;


