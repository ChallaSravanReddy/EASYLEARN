import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-w-5xl w-full min-h-[600px]">

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-gray-500">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-primary font-semibold hover:underline">Forgot Password?</a>
            </div>

            <button type="submit" className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200">
              Sign In
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center gap-6 mt-6">
              {[
                { icon: googleLogo, provider: googleProvider, alt: "Google" },
                { icon: iosLogo, provider: appleProvider, alt: "Apple" },
                { icon: fbLogo, provider: facebookProvider, alt: "Facebook" }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSocialLogin(item.provider)}
                  className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all transform hover:scale-110"
                >
                  <img src={item.icon} alt={item.alt} className="w-6 h-6" />
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Sign up</Link>
          </p>
        </div>

        {/* Illustration Section */}
        <div className="hidden md:block w-1/2 bg-gradient-to-br from-primary/10 to-yellow-100 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <img src={loginImage} alt="Login Illustration" className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="absolute bottom-0 left-0 w-full p-12 bg-gradient-to-t from-black/50 to-transparent text-white">
            <h3 className="text-2xl font-bold tracking-tight">Start your learning journey</h3>
            <p className="mt-2 opacity-90">Access thousands of courses from top instructors.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;