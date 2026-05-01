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
    <section className="relative h-[35vh] min-h-[380px] rounded-3xl overflow-hidden bg-slate-900 mb-10 shadow-2xl shadow-indigo-900/20 border border-slate-800 flex items-center">
      {/* Premium Glow Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 opacity-70 mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 opacity-60 mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-50" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNHYtNGgtMnY0aC00djJoNHY0aDJ2LTRoNHYtMmgtNHptMC0zMFYwaC0ydjRoLTR2Mmg0djRoMnYtNGg0VjJoLTR6bS0zMCAwVjBoLTJ2NGgtNHYyaDR2NGgydi00aDRWMmgtNHpNMzYgNjR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bS0zMCAwaS00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full gap-8 px-8 py-4 md:px-12">

        {/* Left — Text */}
        <div className="flex-1 space-y-4 text-white">
          {/* Badge */}


          {/* Heading */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
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

        </div>

        {/* Right — Image */}
        <div className="flex-shrink-0 lg:w-[480px] w-full relative">
          {/* Decorative elements behind image */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur-2xl opacity-50"></div>
          
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer bg-slate-800">
            <img
              src={FullStackImage}
              alt="Full Stack Development Course"
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
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