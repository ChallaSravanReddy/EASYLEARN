import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Book, Clock, Award, Lock, BookOpen, ArrowLeft } from "lucide-react";

const syllabusData = {
  "JavaScript": [
    "Introduction to JavaScript",
    "Variables & Data Types",
    "Functions and Scope",
    "DOM Manipulation",
    "ES6+ Features",
    "Projects: Build Interactive Web Pages"
  ],
  "Python Programming": [
    "Python Basics",
    "Data Structures",
    "OOP in Python",
    "File Handling & Modules",
    "Libraries: NumPy, Pandas",
    "Project: Data Analysis App"
  ],
  "Java Programming": [
    "Java Basics",
    "Classes & Objects",
    "Collections Framework",
    "Exception Handling",
    "Multithreading",
    "Project: Console-based Application"
  ],
  "C Programming Fundamentals": [
    "Introduction to C",
    "Control Statements",
    "Functions & Pointers",
    "Arrays & Strings",
    "Structures",
    "Mini Project: Banking System"
  ],
  "Full Stack Web Development": [
    "HTML, CSS, JavaScript",
    "React.js Frontend",
    "Node.js + Express.js Backend",
    "Databases: MongoDB",
    "Authentication & Authorization",
    "Final Project: Full MERN App"
  ]
};

export default function CourseSyllabus() {
  const { courseName } = useParams();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(courseName);
  const syllabus = syllabusData[decodedName];

  if (!syllabus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-8">
        <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-4xl mb-6">
          ⚠️
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Course not found</h2>
        <p className="text-gray-500 mb-8 max-w-md">The course you are looking for does not exist or has been moved. Check our course catalog for more options.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-8 py-3.5 bg-primary text-gray-900 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <header className="relative bg-slate-900 rounded-[32px] p-12 text-white overflow-hidden shadow-2xl shadow-indigo-900/20 border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10 space-y-6">
          <button
            className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors group"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold font-caveat tracking-wider">{decodedName}</h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              Master {decodedName} with our comprehensive curriculum designed for all skill levels. 
              Build real-world projects and earn your certificate.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-white/5">
              <Book className="w-4 h-4 text-primary" /> {syllabus.length} Lessons
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-white/5">
              <Clock className="w-4 h-4 text-blue-400" /> 12 Hours Total
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-white/5">
              <Award className="w-4 h-4 text-amber-400" /> Certificate Included
            </div>
          </div>
        </div>
      </header>

      {/* Syllabus Grid */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </span>
          Course Curriculum
        </h2>

        <div className="space-y-4">
          {syllabus.map((topic, index) => {
            const isIntroJS = decodedName === "JavaScript" && topic === "Introduction to JavaScript";

            return (
              <div
                key={index}
                onClick={() => {
                  if (isIntroJS) {
                    navigate("/course/javascript/introduction");
                  }
                }}
                className={`
                  group relative p-6 rounded-[24px] border transition-all duration-300 flex items-center gap-6
                  ${isIntroJS
                    ? "bg-white dark:bg-slate-800 border-primary cursor-pointer shadow-lg shadow-primary/10 -translate-y-1"
                    : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-700 dark:text-gray-400 hover:shadow-md hover:-translate-y-0.5"
                  }
                `}
              >
                {/* Number Badge */}
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all
                  ${isIntroJS 
                    ? "bg-primary text-white shadow-lg shadow-primary/30 group-hover:scale-110" 
                    : "bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500 group-hover:bg-gray-100 dark:group-hover:bg-slate-700 group-hover:text-gray-600 dark:group-hover:text-gray-300"}
                `}>
                  {index + 1}
                </div>

                <div className="flex-1">
                  <h3 className={`font-bold text-xl transition-colors ${isIntroJS ? "text-gray-900 dark:text-white group-hover:text-primary" : "text-gray-700 dark:text-gray-300"}`}>
                    {topic}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Lesson {index + 1} • 45m</p>
                </div>

                <div className="flex items-center gap-3">
                  {isIntroJS ? (
                    <button className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">
                      Start Now
                    </button>
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-300 dark:text-gray-600">
                      <Lock className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {isIntroJS && (
                   <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                      <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-md shadow-lg">New</span>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
