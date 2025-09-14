// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import LandingPage from "./components/LandingPage";
// import Dashboard from "./components/Dashboard";
// import Footer from "./components/Footer";
// import RecommendedCourses from "./components/RecommendedCourses";
// import LoginPage from './components/LoginPage';
// import Register from './components/RegisterPage'; // From our previous code
// import TimelineCodePlayer from './components/TimelineCodePlayer';
// import { AuthProvider, useAuth } from './context/AuthContext';

// const PrivateRoute = ({ children }) => {
//   const { currentUser } = useAuth();
//   return currentUser ? children : <Navigate to="/login" />;
// };

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<Register />} />
//           <Route 
//             path="/dashboard" 
//             element={
//               <PrivateRoute>
//                 <Dashboard />
//               </PrivateRoute>
//             } 
//           />
//           <Route path="/courses" element={<RecommendedCourses />} />
//           {/* Add more routes as needed */}
//         </Routes>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;


// // App.js
// // import React from "react";
// // import TimelineCodePlayer from "./components/TimelineCodePlayer";
// // import MonacoEditor from "@monaco-editor/react";


// // function App() {
// //   return (
// //     <div className="App">
// //       <TimelineCodePlayer />
// //     </div>
// //   );
// // }

// // export default App;
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layout Components
// import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import LandingPage from "./components/LandingPage";
import Profile from "./components/Profile";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Dashboard from "./components/Dashboard";
import CourseSyllabus from "./components/CourseSyllabus"; // Handles all courses dynamically
// import PracticePage from "./components/PracticePage";

import styles from "./styles/App.module.css";
import "./App.css";
function App() {
  return (
    <Router>
      <div className={styles.app}>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/Profile" element={<Profile />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Dynamic syllabus page */}
          <Route path="/course/:courseName" element={<CourseSyllabus />} />
          {/* <Route path="/practice/:moduleName" element={<PracticePage />} /> */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
