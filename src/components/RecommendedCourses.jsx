import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock, ArrowRight, ChevronRight } from "lucide-react";
import javascriptImg from "../assets/javascript.png";
import pythonImg from "../assets/python.png";
import javaImg from "../assets/java.png";
import cImg from "../assets/cprogram.jpg";
import fullStackImg from "../assets/fullstackcor.png";

const LEVEL_COLOR = {
  "Beginner": "text-green-600  bg-green-50  dark:text-green-400  dark:bg-green-900/30  border-green-200  dark:border-green-800/40",
  "Intermediate": "text-amber-600  bg-amber-50  dark:text-amber-400  dark:bg-amber-900/30  border-amber-200  dark:border-amber-800/40",
  "Advanced": "text-red-600    bg-red-50    dark:text-red-400    dark:bg-red-900/30    border-red-200    dark:border-red-800/40",
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recommended Courses</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Handpicked paths to accelerate your skills</p>
        </div>
        <button className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
          See all <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courses.map((course, i) => (
          <div
            key={i}
            onClick={() => go(course.name)}
            className="group bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-gray-200/60 dark:hover:shadow-none hover:border-indigo-200 dark:hover:border-indigo-800/60 transition-all duration-200"
          >
            {/* Thumbnail */}
            <div className="relative overflow-hidden h-36 bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
              <img
                src={course.img}
                alt={course.name}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
              {/* Level badge on image */}
              <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${LEVEL_COLOR[course.level] ?? ''}`}>
                {course.level}
              </span>
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[11px] text-gray-400 dark:text-slate-500 font-medium truncate">{course.instructor}</p>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {course.name}
                </h3>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{course.rating}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {course.duration}
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={e => { e.stopPropagation(); go(course.name); }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/40 rounded-lg hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all"
              >
                Start Learning <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}