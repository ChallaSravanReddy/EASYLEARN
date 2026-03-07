import React from "react";
import { Code2, Video, Puzzle, Users } from "lucide-react";

const FEATURES = [
  {
    icon: Code2,
    title: "Learn by Doing",
    desc: "Code alongside the lesson in real time. Run it instantly and see results — no passive watching.",
    color: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30",
  },
  {
    icon: Video,
    title: "Interactive Video Lessons",
    desc: "Pause, edit, and practice directly inside the video. You code, you learn.",
    color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30",
  },
  {
    icon: Puzzle,
    title: "Checkpoint Challenges",
    desc: "Quizzes and coding tasks at every milestone ensure you understand before moving on.",
    color: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-900/30",
  },
  {
    icon: Users,
    title: "Collaborative Coding",
    desc: "Pair-program with friends or join coding rooms. Learning becomes a team experience.",
    color: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="mb-10">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Why Choose EasyLearn?</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">A fundamentally different way to learn programming</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURES.map(({ icon: Icon, title, desc, color }) => (
          <div
            key={title}
            className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 flex gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{title}</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
