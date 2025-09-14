import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig'; // Import `db`
import { doc, setDoc } from 'firebase/firestore'; // New Firestore imports
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css'; // You'll need to create this CSS file
import googleLogo from "../assets/googlelogo.png";
import iosLogo from "../assets/ioslogo.png";
import fbLogo from "../assets/fblogo.png";
import RegisterImage from "../assets/registerimage.png";

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // 1. Create the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Save additional user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName: fullName,
        email: email,
        role: role,
        createdAt: new Date(),
      });

      console.log('User registered and profile created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error registering user:', error.message);
      alert(error.message); // Display Firebase error message
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-form-panel">
        <h2 className="register-title">Create Your Account</h2>
        <div className="role-toggle-container">
          <button
            className={`role-button ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
          >
            Student
          </button>
          <button
            className={`role-button ${role === 'instructor' ? 'active' : ''}`}
            onClick={() => setRole('instructor')}
          >
            Instructor
          </button>
        </div>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="fullName">Full name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
            />
          </div>
          <div className="terms-checkbox">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">I agree to the Terms of Service & Privacy Policy</label>
          </div>
          <button type="submit" className="create-account-button">Create Account</button>
        </form>
        <p className="social-text">or continue with</p>
        <div className="social-login-icons">
          <img src={googleLogo} alt="Google" style={{ cursor: "pointer", width: "32px", margin: "0 8px" }} />
          <img src={iosLogo} alt="Apple" style={{ cursor: "pointer", width: "32px", margin: "0 8px" }} />
          <img src={fbLogo} alt="Facebook" style={{ cursor: "pointer", width: "32px", margin: "0 8px" }} />
          {/* Social login buttons go here */}
        </div>
        <p className="login-link-text">Already have an account? <a href="/login">Login</a></p>
      </div>
      <div className="register-illustration-panel">
        <img src={RegisterImage} alt="EdA Learning" />
      </div>
    </div>
  );
};

export default RegisterPage;