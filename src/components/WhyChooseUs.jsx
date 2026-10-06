import React from "react";
import { PlayCircle, Code2, Bot, Users, Sparkles, CheckCircle2 } from "lucide-react";

const FEATURES = [
  {
    icon: PlayCircle,
    title: "Interact with Instructor Code",
    desc: "Don't just watch videos passively. Click into the editor at any second, modify variables, fix bugs, and run the code directly.",
    tag: "Interactive Player",
  },
  {
    icon: Code2,
    title: "140+ Built-in Coding Challenges",
    desc: "Every milestone tests your understanding. Write real code, hit Run Tests, and get instant telemetry feedback without leaving the lesson.",
    tag: "Instant Feedback",
  },
  {
    icon: Bot,
    title: "AI Code Explainer (BETA)",
    desc: "Stuck on a tricky closure, regex, or async promise? Click Explain for plain-English explanations tuned specifically to the current codebase.",
    tag: "AI Powered",
  },
  {
    icon: Users,
    title: "Thriving Developer Community",
    desc: "Share your projects, ask questions in our global Discord, pair-program with peers, and get recognized by hiring engineering teams.",
    tag: "Community",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 select-none">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Scrimba Method</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Why learning on Scrimba is 10x faster
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
          Research shows developers retain 75% more by typing and testing code compared to watching standard video streams.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURES.map(({ icon: Icon, title, desc, tag }) => (
          <div
            key={title}
            className="group bg-white dark:bg-[#12141f] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-7 hover:shadow-xl hover:border-blue-400/60 dark:hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Included in Free & Pro paths</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
