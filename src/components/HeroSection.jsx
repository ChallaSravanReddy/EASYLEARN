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
    <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 mb-10">
      {/* Glow accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 px-8 py-12">

        {/* Left — Text */}
        <div className="flex-1 space-y-6 text-white">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-3 py-1 uppercase tracking-widest">
            <PlayCircle className="w-3.5 h-3.5" />
            Top Rated Course
          </span>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Master{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              Full Stack
            </span>
            <br />Development
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-base leading-relaxed max-w-md">
            From front-end to back-end — learn modern technologies, build real-world projects,
            and land your dream engineering role.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => navigate("/course/Full%20Stack%20Web%20Development")}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-900/40"
            >
              Enroll Now — Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm px-6 py-3 rounded-xl border border-white/10 transition-colors"
            >
              Browse Courses
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-5 pt-2">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white">{value}</span>
                <span className="text-sm text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Image */}
        <div className="flex-shrink-0 lg:w-[360px] w-full">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src={FullStackImage}
              alt="Full Stack Development Course"
              className="w-full object-cover aspect-video"
            />
            {/* Overlay: play button */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-slate-900/60 to-transparent">
              <button
                onClick={() => navigate("/course/Full%20Stack%20Web%20Development")}
                className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all"
              >
                <PlayCircle className="w-7 h-7 text-white" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}