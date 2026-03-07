import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Book, Clock, Lock, BookOpen, ArrowLeft, PlayCircle,
  ShieldCheck, CheckCircle2, Star, Users, ChevronRight, AlertTriangle
} from "lucide-react";

const syllabusData = {
  "JavaScript": {
    tag: "Most Popular",
    rating: "4.9",
    reviews: "3,412",
    students: "15,240+",
    totalHours: "24h 30m",
    level: "All Levels",
    description: "Master JavaScript from the ground up — variables, ES6+ features, DOM manipulation, and real-world project builds.",
    lessons: [
      { title: "Introduction to JavaScript", duration: "45m", videos: 3, isNew: true, available: true, desc: "Understand the JS engine, link scripts, and write your first code." },
      { title: "Variables & Data Types", duration: "1h 15m", videos: 4, available: false, desc: "Deep dive into let, const, primitives, and reference types." },
      { title: "Functions and Scope", duration: "2h 30m", videos: 6, available: false, desc: "Arrow functions, closures, lexical scope, higher-order functions." },
      { title: "DOM Manipulation", duration: "3h", videos: 8, available: false, desc: "Selectors, event listeners, bubbling, and dynamic UIs." },
      { title: "Modern ES6+ Features", duration: "2h", videos: 5, available: false, desc: "Destructuring, spread/rest, optional chaining, nullish coalescing." },
      { title: "Capstone: Interactive Apps", duration: "5h", videos: 10, available: false, desc: "Build an expense tracker, weather app, and to-do dashboard." }
    ]
  },
  "Python Programming": {
    tag: "Bestseller",
    rating: "4.8", reviews: "2,890", students: "22,100+", totalHours: "32h 15m", level: "Beginner Friendly",
    description: "Learn Python — the world's most versatile language. From simple scripts to data analysis with Pandas and NumPy.",
    lessons: [
      { title: "Python Basics", duration: "1h", videos: 3, available: false, desc: "Environment setup, basic syntax, and writing simple scripts." },
      { title: "Data Structures", duration: "2h", videos: 5, available: false, desc: "Lists, dictionaries, sets, and tuples in depth." },
      { title: "OOP in Python", duration: "3h", videos: 6, available: false, desc: "Classes, inheritance, polymorphism, and dunder methods." },
      { title: "File Handling & Modules", duration: "2h", videos: 4, available: false, desc: "Reading/writing files and structuring Python applications." },
      { title: "NumPy & Pandas", duration: "5h", videos: 8, available: false, desc: "Data science libraries for analyzing massive datasets." },
      { title: "Capstone: Data Analysis", duration: "6h", videos: 10, available: false, desc: "Build a complete analysis pipeline and visualization dashboard." }
    ]
  },
  "Java Programming": {
    tag: "Enterprise Ready",
    rating: "4.7", reviews: "1,650", students: "18,400+", totalHours: "40h", level: "Intermediate",
    description: "Build robust, scalable Java applications. Perfect for enterprise careers and Android development.",
    lessons: [
      { title: "Java Basics", duration: "1h 30m", videos: 4, available: false, desc: "JVM architecture, syntax, and basic data types." },
      { title: "Classes & Objects", duration: "2h 30m", videos: 5, available: false, desc: "Mastering object-oriented principles in Java." },
      { title: "Collections Framework", duration: "3h", videos: 7, available: false, desc: "Lists, Sets, Maps, and choosing the right data structure." },
      { title: "Exception Handling", duration: "1h 45m", videos: 3, available: false, desc: "Try-catch, custom exceptions, and robust code design." },
      { title: "Multithreading", duration: "4h", videos: 6, available: false, desc: "Concurrency, thread lifecycles, and synchronization." },
      { title: "Capstone: Console Application", duration: "5h", videos: 8, available: false, desc: "Build a comprehensive banking system." }
    ]
  },
  "C Programming Fundamentals": {
    tag: "Core Skills",
    rating: "4.8", reviews: "980", students: "10,200+", totalHours: "20h", level: "Beginner",
    description: "Understand the core of computer science — memory management, pointers, and systems programming in C.",
    lessons: [
      { title: "Introduction to C", duration: "1h", videos: 3, available: false, desc: "Compilers, syntax, and printing to console." },
      { title: "Control Statements", duration: "1h 30m", videos: 4, available: false, desc: "If-else, switch, loops, and flow control." },
      { title: "Functions & Pointers", duration: "3h", videos: 6, available: false, desc: "Memory addresses, passing by reference, and recursion." },
      { title: "Arrays & Strings", duration: "2h", videos: 5, available: false, desc: "Memory layouts, pointer arithmetic, string manipulation." },
      { title: "Structures", duration: "2h", videos: 4, available: false, desc: "Custom data types and linked lists basics." },
      { title: "Capstone: Banking System", duration: "4h", videos: 7, available: false, desc: "Build an ATM simulator with file persistence." }
    ]
  },
  "Full Stack Web Development": {
    tag: "High Demand",
    rating: "4.9", reviews: "6,200", students: "35,800+", totalHours: "65h", level: "Beginner to Advanced",
    description: "Become a Full Stack Engineer. Build production-grade apps with MongoDB, Express, React, and Node.js.",
    lessons: [
      { title: "HTML, CSS & JavaScript", duration: "10h", videos: 15, available: false, desc: "The fundamental building blocks of the web." },
      { title: "React.js Frontend", duration: "15h", videos: 25, available: false, desc: "Hooks, state management, context, and the virtual DOM." },
      { title: "Node.js + Express Backend", duration: "12h", videos: 20, available: false, desc: "RESTful APIs and understanding the event loop." },
      { title: "MongoDB & Databases", duration: "8h", videos: 12, available: false, desc: "NoSQL modeling, Mongoose, and aggregation pipelines." },
      { title: "Auth & Security", duration: "5h", videos: 8, available: false, desc: "JWT, secure cookies, and protecting routes." },
      { title: "Capstone: MERN Platform", duration: "15h", videos: 22, available: false, desc: "Full real estate platform with payment integration." }
    ]
  }
};

const FEATURES = [
  "Full Lifetime Access",
  "HD Video Lessons",
  "Downloadable Resources",
  "Mobile & Desktop Access",
  "Certificate of Completion",
  "Community Support"
];

export default function CourseSyllabus() {
  const { courseName } = useParams();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(courseName);
  const course = syllabusData[decodedName];

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mb-5">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Course not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm text-sm">
          The course you are looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const totalLessons = course.lessons.length;

  return (
    <div className="w-full max-w-screen-xl mx-auto pb-16">

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
        {/* subtle glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>

          <div className="flex flex-col gap-5">
            <div className="space-y-3">
              {/* Tag + Rating */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                  {course.tag}
                </span>
                <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {course.rating}
                  <span className="text-slate-500 font-normal ml-1">({course.reviews} reviews)</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {decodedName}
              </h1>

              {/* Description */}
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                {course.description}
              </p>
            </div>

            {/* Stats row — below title */}
            <div className="flex flex-wrap gap-2.5">
              {[
                { label: "Modules", value: `${totalLessons} Lessons`, icon: BookOpen, color: "text-blue-400" },
                { label: "Duration", value: course.totalHours, icon: Clock, color: "text-purple-400" },
                { label: "Students", value: course.students, icon: Users, color: "text-green-400" },
                { label: "Level", value: course.level, icon: Book, color: "text-amber-400" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3.5 py-2">
                  <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
                  <span className="text-xs font-semibold text-slate-300">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left: Curriculum */}
        <div className="lg:col-span-2">
          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Content</h2>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {totalLessons} Lessons · {course.totalHours}
            </span>
          </div>

          <div className="space-y-3">
            {course.lessons.map((lesson, index) => {
              const unlocked = lesson.available || lesson.isNew;
              return (
                <div
                  key={index}
                  onClick={unlocked ? () => navigate("/course/javascript/introduction") : undefined}
                  className={`
                    group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                    ${unlocked
                      ? "bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/60 cursor-pointer hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-100 dark:hover:shadow-none"
                      : "bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700/50 cursor-default"
                    }
                  `}
                >
                  {/* Index number */}
                  <div className={`
                    w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold transition-all
                    ${unlocked
                      ? "bg-indigo-600 text-white group-hover:scale-105"
                      : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400"}
                  `}>
                    {unlocked ? <PlayCircle className="w-5 h-5" /> : index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-base truncate ${unlocked ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                        {lesson.title}
                      </h3>
                      {lesson.isNew && (
                        <span className="flex-shrink-0 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700/50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 truncate">{lesson.desc}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                        <PlayCircle className="w-3 h-3" /> {lesson.videos} videos
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                        <Clock className="w-3 h-3" /> {lesson.duration}
                      </span>
                    </div>
                  </div>

                  {/* CTA / Lock */}
                  {unlocked ? (
                    <button className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700/50 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all">
                      Start <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div>
          <div className="sticky top-20 space-y-4">
            {/* Enroll CTA */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">{course.rating}</span>
                <span className="text-sm text-gray-500">({course.reviews} ratings)</span>
              </div>

              <button
                onClick={() => navigate("/course/javascript/introduction")}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-indigo-200 dark:shadow-none mb-4"
              >
                Enroll Now — Free
              </button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-5">30-day money-back guarantee</p>

              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">This course includes:</h4>
              <ul className="space-y-2.5">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Help Card */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Satisfaction Guarantee</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Not satisfied? Get a full refund within 30 days, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
