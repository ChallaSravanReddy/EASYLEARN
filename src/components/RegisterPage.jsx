import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import googleLogo from "../assets/googlelogo.png";
import iosLogo from "../assets/ioslogo.png";
import fbLogo from "../assets/fblogo.png";
import RegisterImage from "../assets/registerimage.png";

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        fullName: fullName,
        email: email,
        role: role,
        createdAt: new Date(),
      });

      console.log('User registered and profile created successfully!');
      if (role === 'instructor') {
        navigate('/instructor-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error registering user:', error.message);
      alert(error.message);
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
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Create Account</h2>
            <p className="text-gray-500 dark:text-slate-400">Join our community of learners today</p>
          </div>

          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl mb-6 z-10">
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${role === 'student' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
              onClick={() => setRole('student')}
            >
              Student
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${role === 'instructor' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
              onClick={() => setRole('instructor')}
            >
              Instructor
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-5 z-10">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-semibold text-gray-700 dark:text-slate-300">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/40 outline-none transition-all bg-gray-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>

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
                placeholder="Create a password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/40 outline-none transition-all bg-gray-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
              <input type="checkbox" id="terms" required className="mt-1 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800" />
              <label htmlFor="terms">I agree to the <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Terms of Service</a> & <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Privacy Policy</a></label>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 dark:shadow-none hover:-translate-y-0.5 transition-all duration-300">
              Create Account
            </button>
          </form>

          <div className="mt-6 z-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 font-medium">Or sign up with</span>
              </div>
            </div>

            <div className="flex justify-center gap-6 mt-6">
              {[googleLogo, iosLogo, fbLogo].map((logo, index) => (
                <button
                  key={index}
                  className="p-3 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all transform hover:-translate-y-1 hover:shadow-md dark:shadow-none"
                >
                  <img src={logo} alt="Social Login" className="w-6 h-6 object-contain" />
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400 z-10 font-medium">
            Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1">Log in</Link>
          </p>
        </div>

        {/* Illustration Section */}
        <div className="hidden md:block w-1/2 bg-slate-900 relative overflow-hidden p-12">
          {/* Decorative glow */}
          <div className="absolute inset-0 bg-gradient-to-bl from-indigo-600/20 to-purple-600/20 mix-blend-screen pointer-events-none" />
          <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-violet-500/30 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative h-full flex flex-col items-center justify-center">
            <img src={RegisterImage} alt="Register Illustration" className="w-full max-w-sm h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out z-10 relative" />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-12 bg-gradient-to-t from-slate-950 to-transparent text-white z-10">
            <h3 className="text-3xl font-extrabold tracking-tight">Join thousands of students</h3>
            <p className="mt-3 text-slate-300 font-medium text-lg max-w-md">Master new skills and advance your career with expertly crafted courses.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;