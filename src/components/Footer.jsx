import React from "react";
import { GraduationCap, Mail, Github, Twitter, Linkedin } from "lucide-react";

const LINKS = {
  "Product": ["Courses", "Projects", "Certifications", "Roadmaps"],
  "Company": ["About Us", "Blog", "Careers", "Press"],
  "Support": ["Help Center", "FAQs", "Privacy Policy", "Terms of Service"],
};

const SOCIALS = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 dark:bg-black text-gray-400 border-t border-gray-800 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-10">

          {/* Brand + Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">
                Easy<span className="text-indigo-500">Learn</span>
              </span>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Empowering learners worldwide with industry-relevant skills and certifications.
            </p>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Stay updated</p>
              <form className="flex gap-2 max-w-xs" onSubmit={e => e.preventDefault()}>
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-gray-900 dark:bg-slate-900 border border-gray-800 dark:border-slate-700 text-gray-200 text-sm placeholder-gray-600 pl-9 pr-3 py-2 rounded-lg outline-none focus:border-indigo-600 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">{heading}</p>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 hover:text-white transition-colors"
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
        <div className="border-t border-gray-900 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} EasyLearn, Inc. All rights reserved.</p>

          {/* Socials */}
          <div className="flex items-center gap-1">
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="p-2 rounded-lg text-gray-600 hover:text-white hover:bg-gray-800 transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}