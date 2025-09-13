import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Register from './components/RegisterPage'; // From our previous code
import TimelineCodePlayer from './components/TimelineCodePlayer';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} /> {/* <-- New Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;


// App.js
// import React from "react";
// import TimelineCodePlayer from "./components/TimelineCodePlayer";
// import MonacoEditor from "@monaco-editor/react";


// function App() {
//   return (
//     <div className="App">
//       <TimelineCodePlayer />
//     </div>
//   );
// }

// export default App;