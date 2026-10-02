import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle2, ArrowLeft } from "lucide-react";

export default function JavaScriptSyllabus() {
  const navigate = useNavigate();

  const topics = [
    "Introduction to JavaScript",
    "Variables and Data Types",
    "Operators and Expressions",
    "Control Structures (if, else, switch, loops)",
    "Functions and Scope",
    "Objects and Arrays",
    "DOM Manipulation",
    "Events and Listeners",
    "Modern ES6+ Features",
    "Asynchronous JavaScript (Promises, async/await)",
    "APIs and Fetch",
    "Project Work & Capstone",
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">JavaScript Syllabus</h2>
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
        <ul className="space-y-3">
          {topics.map((topic, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{topic}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}