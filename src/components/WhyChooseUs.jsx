import React from "react";
import { Code2, Video, Puzzle, Users } from "lucide-react";

const FEATURES = [
  {
    icon: Code2,
    title: "Learn by Doing",
    desc: "Code alongside the lesson in real time. Run it instantly and see results — no passive watching.",
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10",
  },
  {
    icon: Video,
    title: "Interactive Video Lessons",
    desc: "Pause, edit, and practice directly inside the video. You code, you learn.",
    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
  },
  {
    icon: Puzzle,
    title: "Checkpoint Challenges",
    desc: "Quizzes and coding tasks at every milestone ensure you understand before moving on.",
    color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10",
  },
  {
    icon: Users,
    title: "Collaborative Coding",
    desc: "Pair-program with friends or join coding rooms. Learning becomes a team experience.",
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="mb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Why Choose EasyLearn?</h2>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">A fundamentally different way to learn programming</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURES.map(({ icon: Icon, title, desc, color }) => (
          <div
            key={title}
            className="group bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-slate-800/60 p-6 flex gap-5 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${color} group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
