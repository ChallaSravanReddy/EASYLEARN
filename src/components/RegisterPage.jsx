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
      navigate('/dashboard');
    } catch (error) {
      console.error('Error registering user:', error.message);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-w-5xl w-full min-h-[600px]">

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Create Account</h2>
            <p className="text-gray-500">Join our community of learners today</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${role === 'student' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setRole('student')}
            >
              Student
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${role === 'instructor' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setRole('instructor')}
            >
              Instructor
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-gray-50 focus:bg-white"
              />
            </div>

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
                placeholder="Create a password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600">
              <input type="checkbox" id="terms" required className="mt-1 rounded border-gray-300 text-primary focus:ring-primary" />
              <label htmlFor="terms">I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> & <a href="#" className="text-primary hover:underline">Privacy Policy</a></label>
            </div>

            <button type="submit" className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200">
              Create Account
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="flex justify-center gap-6 mt-6">
              {[googleLogo, iosLogo, fbLogo].map((logo, index) => (
                <button
                  key={index}
                  className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all transform hover:scale-110"
                >
                  <img src={logo} alt="Social Login" className="w-6 h-6" />
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
          </p>
        </div>

        {/* Illustration Section */}
        <div className="hidden md:block w-1/2 bg-gradient-to-bl from-primary/10 to-blue-50 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <img src={RegisterImage} alt="Register Illustration" className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="absolute bottom-0 left-0 w-full p-12 bg-gradient-to-t from-black/50 to-transparent text-white">
            <h3 className="text-2xl font-bold tracking-tight">Join thousands of students</h3>
            <p className="mt-2 opacity-90">Master new skills and advance your career.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;