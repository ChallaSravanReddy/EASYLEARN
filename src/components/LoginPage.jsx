import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import googleLogo from "../assets/googlelogo.png";
import iosLogo from "../assets/ioslogo.png";
import fbLogo from "../assets/fblogo.png";
import loginImage from "../assets/loginimage.png";
import { supabase } from '../supabaseClient'; // Import Supabase client

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Login successful!', data);

      // Check role from user_metadata
      const role = data.user?.user_metadata?.role || 'student';
      
      if (role === 'instructor') {
        navigate('/instructor-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerName) => {
    if (providerName === 'Google') {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            // Redirect back to the application after successful login
            redirectTo: `${window.location.origin}/dashboard`
          }
        });
        
        if (error) throw error;
      } catch (err) {
        console.error(`${providerName} Login Error:`, err.message);
        setError(err.message);
        setLoading(false);
      }
    } else {
      setError(`${providerName} login is not yet configured.`);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-[calc(100vh-100px)]">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-indigo-500/10 dark:shadow-none overflow-hidden flex flex-col md:flex-row max-w-5xl w-full min-h-[600px] border border-gray-100 dark:border-slate-800">

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-slate-900 relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[200px] -left-[200px] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[80px]" />
          </div>

          <div className="mb-8 text-center md:text-left z-10">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Welcome Back</h2>
            <p className="text-gray-500 dark:text-slate-400">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 z-10">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-slate-300">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/40 outline-none transition-all bg-gray-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-slate-300">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/40 outline-none transition-all bg-gray-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">
                <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Forgot Password?</a>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 dark:shadow-none hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 z-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center gap-6 mt-6">
              {[
                { icon: googleLogo, alt: "Google" },
                { icon: iosLogo, alt: "Apple" },
                { icon: fbLogo, alt: "Facebook" }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSocialLogin(item.alt)}
                  className="p-3 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all transform hover:-translate-y-1 hover:shadow-md dark:shadow-none"
                >
                  <img src={item.icon} alt={item.alt} className="w-6 h-6 object-contain" />
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-slate-400 z-10 font-medium">
            Don't have an account? <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1">Sign up</Link>
          </p>
        </div>

        {/* Illustration Section */}
        <div className="hidden md:block w-1/2 bg-slate-900 relative overflow-hidden p-12">
          {/* Decorative glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 mix-blend-screen pointer-events-none" />
          <div className="absolute -bottom-[200px] -right-[200px] w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative h-full flex flex-col items-center justify-center">
            <img src={loginImage} alt="Login Illustration" className="w-full max-w-sm h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out z-10 relative" />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-12 bg-gradient-to-t from-slate-950 to-transparent text-white z-10">
            <h3 className="text-3xl font-extrabold tracking-tight">Start your learning journey</h3>
            <p className="mt-3 text-slate-300 font-medium text-lg max-w-md">Access thousands of courses from top instructors worldwide.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;