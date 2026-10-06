import React from "react";
import { Mail, Github, Twitter, Linkedin, Heart } from "lucide-react";

const LINKS = {
  "Courses": ["Fullstack Path", "Frontend Path", "Backend Path", "React Course", "JavaScript Bootcamp"],
  "Community": ["Discord", "Student Showcases", "Podcast", "Blog", "Study Groups"],
  "Company": ["About Scrimba", "Careers", "Teach on Scrimba", "Press Kit", "Privacy Policy", "Terms of Service"],
};

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 dark:bg-[#08090f] text-slate-400 border-t border-slate-800 select-none">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-10">
          {/* Brand + Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            {/* Scrimba Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 shrink-0">
                <div className="w-2.5 h-3.5 bg-white rounded-[2px] transform -translate-y-0.5" />
                <div className="w-2.5 h-3.5 bg-white rounded-[2px] transform translate-y-0.5" />
              </div>
              <span className="text-base font-black tracking-widest text-white uppercase font-sans">
                SCRIMBA
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              The next-generation interactive learning platform. Code inside screencasts, build real projects, and accelerate your engineering career.
            </p>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Weekly Dev Tips & Lessons
              </p>
              <form className="flex gap-2 max-w-xs" onSubmit={(e) => e.preventDefault()}>
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-xs placeholder-slate-500 pl-9 pr-3 py-2 rounded-lg outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#0086ff] hover:bg-[#0074e0] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer uppercase tracking-wider"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <p className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">
                {heading}
              </p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Scrimba / EasyLearn. Built for developers worldwide.</p>

          <div className="flex items-center gap-4">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}