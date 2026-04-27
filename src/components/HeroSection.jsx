import React from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, ArrowRight, Star, Users, BookOpen } from "lucide-react";
import FullStackImage from "../assets/Full_Stack.png";

const STATS = [
  { label: "Courses", value: "50+", icon: BookOpen },
  { label: "Learners", value: "1.2M+", icon: Users },
  { label: "Rating", value: "4.9 ★", icon: Star },
];

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative rounded-3xl overflow-hidden bg-slate-900 mb-10 shadow-2xl shadow-indigo-900/20 border border-slate-800">
      {/* Premium Glow Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 opacity-70 mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 opacity-60 mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-50" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNHYtNGgtMnY0aC00djJoNHY0aDJ2LTRoNHYtMmgtNHptMC0zMFYwaC0ydjRoLTR2Mmg0djRoMnYtNGg0VjJoLTR6bS0zMCAwVjBoLTJ2NGgtNHYyaDR2NGgydi00aDRWMmgtNHpNMzYgNjR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bS0zMCAwaS00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 px-8 py-16 md:px-12 md:py-20">

        {/* Left — Text */}
        <div className="flex-1 space-y-8 text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              Top Rated Course
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Master{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
              Full Stack
            </span>
            <br />Development
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-lg leading-relaxed max-w-xl font-medium">
            From front-end to back-end — learn modern technologies, build real-world projects,
            and land your dream engineering role.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate("/course/Full%20Stack%20Web%20Development")}
              className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-900/50 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              Enroll Now — Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-base px-8 py-3.5 rounded-xl border border-white/10 transition-all backdrop-blur-sm hover:-translate-y-0.5"
            >
              Browse Courses
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-white/10">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white leading-none">{value}</div>
                  <div className="text-sm text-slate-400 mt-1">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Image */}
        <div className="flex-shrink-0 lg:w-[480px] w-full relative">
          {/* Decorative elements behind image */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur-2xl opacity-50"></div>
          
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer bg-slate-800">
            <img
              src={FullStackImage}
              alt="Full Stack Development Course"
              className="w-full object-cover aspect-video group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
            />
            {/* Overlay: play button */}
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors duration-500">
              <button
                onClick={() => navigate("/course/Full%20Stack%20Web%20Development")}
                className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-indigo-600/80 shadow-2xl"
              >
                <PlayCircle className="w-8 h-8 text-white ml-1" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}