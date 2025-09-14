import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // You'll need to create this CSS file
import googleLogo from "../assets/googlelogo.png";
import iosLogo from "../assets/ioslogo.png";
import fbLogo from "../assets/fblogo.png";
import loginImage from "../assets/loginimage.png";
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-panel">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password" required />
          </div>
          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember Me</label>
            </div>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="social-text">or continue with</p>
        {/* <div className="social-login-icons">
          <img src="/path/to/google-icon.png" alt="Google" onClick={() => handleSocialLogin(googleProvider)} />
          <img src="/path/to/apple-icon.png" alt="Apple" onClick={() => handleSocialLogin(appleProvider)} />
          <img src="/path/to/facebook-icon.png" alt="Facebook" onClick={() => handleSocialLogin(facebookProvider)} />
        </div> */}
        <div className="social-login-icons">
  <img
    src={googleLogo}
    alt="Google"
    onClick={() => handleSocialLogin(googleProvider)}
    style={{ cursor: "pointer", width: "32px", margin: "0 8px" }}
  />
  <img
    src={iosLogo}
    alt="Apple"
    onClick={() => handleSocialLogin(appleProvider)}
    style={{ cursor: "pointer", width: "32px", margin: "0 8px" }}
  />
  <img
    src={fbLogo}
    alt="Facebook"
    onClick={() => handleSocialLogin(facebookProvider)}
    style={{ cursor: "pointer", width: "32px", margin: "0 8px" }}
  />
</div>
        <p className="signup-link-text">Don't have an account? <a href="/register" className="signup-link">Sign Up</a></p>
      </div>
     <div className="login-illustration-panel">
  <img src={loginImage} alt="EdA Learning" />
</div>
    </div>
  );
};

export default LoginPage;