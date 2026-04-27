import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock, ArrowRight, ChevronRight } from "lucide-react";
import javascriptImg from "../assets/javascript.png";
import pythonImg from "../assets/python.png";
import javaImg from "../assets/java.png";
import cImg from "../assets/cprogram.jpg";
import fullStackImg from "../assets/fullstackcor.png";

const LEVEL_COLOR = {
  "Beginner": "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
  "Intermediate": "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
  "Advanced": "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20",
};

const courses = [
  { name: "JavaScript", instructor: "Mark Wilson", rating: "4.7", duration: "6h 15m", level: "Beginner", img: javascriptImg },
  { name: "Python Programming", instructor: "Emma Clark", rating: "4.8", duration: "9h", level: "Intermediate", img: pythonImg },
  { name: "Java Programming", instructor: "Nina Patel", rating: "4.6", duration: "8h", level: "Beginner", img: javaImg },
  { name: "C Programming Fundamentals", instructor: "James Anderson", rating: "4.5", duration: "7h 45m", level: "Beginner", img: cImg },
  { name: "Full Stack Web Development", instructor: "Robert Singh", rating: "4.9", duration: "20h", level: "Advanced", img: fullStackImg },
];

export default function RecommendedCourses() {
  const navigate = useNavigate();
  const go = (name) => navigate(`/course/${encodeURIComponent(name)}`);

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Recommended Courses</h2>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">Handpicked paths to accelerate your skills</p>
        </div>
        <button className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group">
          See all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course, i) => (
          <div
            key={i}
            onClick={() => go(course.name)}
            className="group bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-slate-800/60 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            {/* Thumbnail */}
            <div className="relative overflow-hidden h-40 bg-gray-50 dark:bg-slate-800 flex items-center justify-center p-6 border-b border-gray-100 dark:border-slate-700/50">
              <img
                src={course.img}
                alt={course.name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
              />
              {/* Level badge on image */}
              <span className={`absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg border backdrop-blur-sm ${LEVEL_COLOR[course.level] ?? ''}`}>
                {course.level}
              </span>
            </div>

            {/* Info */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1 uppercase tracking-wide">{course.instructor}</p>
                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {course.name}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Meta row */}
                <div className="flex items-center justify-between text-sm font-medium text-gray-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-gray-900 dark:text-white font-bold">{course.rating}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {course.duration}
                  </span>
                </div>

                {/* CTA */}
                <button
                  onClick={e => { e.stopPropagation(); go(course.name); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white transition-all duration-300 group-hover:shadow-md group-hover:shadow-indigo-500/20"
                >
                  Start Learning <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}