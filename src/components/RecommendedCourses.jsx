import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SlidersHorizontal,
  ChevronDown,
  Clock,
  Layers,
  Sparkles,
  Code2,
  Cpu,
  Compass,
  ArrowRight,
  Flame,
  Check,
} from "lucide-react";

const COURSES = [
  {
    id: "fullstack-path",
    title: "The Fullstack Developer Path",
    badges: [
      { label: "PRO", color: "bg-indigo-600 text-white" },
      { label: "HOT", color: "bg-rose-500 text-white" },
    ],
    description: "Launch your career as a fullstack developer. Covers modern frontend React, Node.js, Express, databases, authentication, and end-to-end fullstack deployment.",
    tech: "Fullstack",
    modules: 96,
    level: "Beginner",
    hours: 108.4,
    instructors: [
      { name: "Per Borgen", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces" },
      { name: "Bob Ziroll", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces" },
      { name: "Guil Hernandez", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=faces" },
    ],
    path: "/player",
  },
  {
    id: "learn-react",
    title: "Learn React",
    badges: [
      { label: "FREE", color: "bg-blue-600 text-white" },
      { label: "HOT", color: "bg-rose-500 text-white" },
    ],
    partner: "MDN",
    description: "The ultimate interactive React course! Master JSX, props, state, effects, conditional rendering, forms, and build 8 real-world interactive projects in the browser.",
    tech: "React",
    modules: 13,
    level: "Intermediate",
    hours: 15.1,
    instructors: [
      { name: "Bob Ziroll", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces" },
    ],
    path: "/player",
  },
  {
    id: "learn-javascript",
    title: "Learn JavaScript",
    badges: [
      { label: "FREE", color: "bg-blue-600 text-white" },
      { label: "HOT", color: "bg-rose-500 text-white" },
    ],
    partner: "MDN",
    description: "Learn the fundamentals of JavaScript by solving 140+ interactive coding challenges. Along the way you will build games, browser extensions, and mobile dashboards.",
    tech: "JavaScript",
    modules: 9,
    level: "Beginner",
    hours: 9.4,
    instructors: [
      { name: "Per Borgen", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces" },
    ],
    path: "/course/javascript/introduction",
  },
  {
    id: "backend-path",
    title: "The Backend Developer Path",
    badges: [
      { label: "PRO", color: "bg-indigo-600 text-white" },
      { label: "UPDATED", color: "bg-purple-600 text-white" },
    ],
    description: "The comprehensive path to becoming a backend developer. Focused on in-demand skills from the Node.js ecosystem, Express, PostgreSQL, Redis, APIs, and microservices.",
    tech: "Backend",
    modules: 63,
    level: "Intermediate",
    hours: 36.2,
    instructors: [
      { name: "Guil Hernandez", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=faces" },
      { name: "Bob Ziroll", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces" },
    ],
    path: "/player",
  },
  {
    id: "frontend-path",
    title: "The Frontend Developer Path",
    badges: [
      { label: "PRO", color: "bg-indigo-600 text-white" },
      { label: "HOT", color: "bg-rose-500 text-white" },
    ],
    partner: "MDN",
    description: "Launch your career as a frontend developer with this immersive path. Created in collaboration with Mozilla MDN, ensuring you learn the latest best practices.",
    tech: "Frontend",
    modules: 75,
    level: "Beginner",
    hours: 82.0,
    instructors: [
      { name: "Per Borgen", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces" },
      { name: "Bob Ziroll", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces" },
    ],
    path: "/player",
  },
  {
    id: "learn-html-css",
    title: "Learn HTML and CSS",
    badges: [
      { label: "FREE", color: "bg-blue-600 text-white" },
      { label: "HOT", color: "bg-rose-500 text-white" },
    ],
    partner: "MDN",
    description: "This course will teach you HTML and CSS through building and deploying five awesome projects. It assumes no prior experience and takes you from zero to confident coder.",
    tech: "HTML & CSS",
    modules: 11,
    level: "Beginner",
    hours: 11.5,
    instructors: [
      { name: "Per Borgen", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces" },
    ],
    path: "/course/javascript/introduction",
  },
  {
    id: "ai-engineer-path",
    title: "The AI Engineer Path",
    badges: [
      { label: "PRO", color: "bg-indigo-600 text-white" },
      { label: "NEW", color: "bg-emerald-600 text-white" },
    ],
    description: "Build LLM applications, AI agents, semantic vector databases, and rag systems with LangChain and OpenAI. Master the modern generative AI stack hands-on.",
    tech: "AI & LLMs",
    modules: 48,
    level: "Intermediate",
    hours: 42.0,
    instructors: [
      { name: "Guil Hernandez", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=faces" },
    ],
    path: "/player",
  },
  {
    id: "ui-design-fundamentals",
    title: "UI Design Fundamentals",
    badges: [
      { label: "FREE", color: "bg-blue-600 text-white" },
    ],
    description: "Learn essential UI design principles for developers: typography, color harmony, visual hierarchy, layout grids, spacing, and micro-interactions.",
    tech: "Design",
    modules: 12,
    level: "Beginner",
    hours: 8.5,
    instructors: [
      { name: "Bob Ziroll", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces" },
    ],
    path: "/player",
  },
];

export default function RecommendedCourses() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("discover");
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState("All");

  const filteredCourses = COURSES.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
      c.tech.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesTech = selectedTech === "All" || c.tech === selectedTech;
    return matchesSearch && matchesTech;
  });

  return (
    <section id="catalog" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 select-none">
      {/* ── Catalog Filter Tabs (Scrimba Style) ── */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("discover")}
          className={`flex items-center gap-1.5 pb-2 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === "discover"
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <span>Discover</span>
          <span className="text-xs font-mono px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {COURSES.length}
          </span>
          {activeTab === "discover" && (
            <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("started")}
          className={`flex items-center gap-1.5 pb-2 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === "started"
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <span>Started</span>
          <span className="text-xs font-mono px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            0
          </span>
          {activeTab === "started" && (
            <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`flex items-center gap-1.5 pb-2 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === "completed"
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <span>Completed</span>
          <span className="text-xs font-mono px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            0
          </span>
          {activeTab === "completed" && (
            <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
          )}
        </button>
      </div>

      {/* ── Filter Input & Sort Controls Row ── */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[260px] max-w-md flex items-center bg-white dark:bg-[#12141f] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 shadow-xs">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={`Filter ${COURSES.length} results...`}
            className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none"
          />
        </div>

        {/* Sort Pill */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#12141f] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            <span>Most Popular</span>
            <span className="text-slate-400">✕</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* ── Authentic Scrimba Course Cards Grid (2-Column) ── */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => navigate(course.path)}
            className="group relative bg-white dark:bg-[#12141f] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 hover:shadow-xl hover:border-blue-400/60 dark:hover:border-blue-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Header: Title and Badges */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {course.title}
                </h3>

                <div className="flex items-center gap-1.5 shrink-0">
                  {course.badges.map((b) => (
                    <span
                      key={b.label}
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm ${b.color}`}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Partnership row */}
              {course.partner && (
                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>In partnership with</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1 rounded text-[11px]">
                    {course.partner}
                  </span>
                </div>
              )}

              {/* Description */}
              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                {course.description}
              </p>
            </div>

            {/* Bottom Meta & Instructors Row */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5" />
                  {course.tech}
                </span>
                <span>{course.modules} modules</span>
                <span>·</span>
                <span>{course.level}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {course.hours} hrs
                </span>
              </div>

              {/* Overlapping Instructor Avatars */}
              <div className="flex items-center -space-x-2 shrink-0">
                {course.instructors.map((ins, idx) => (
                  <img
                    key={idx}
                    src={ins.avatar}
                    alt={ins.name}
                    title={ins.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-[#12141f]"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}