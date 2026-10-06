import React from 'react';

export default function SocialProof() {
  const companies = [
    { name: 'Google', font: 'font-sans font-bold' },
    { name: 'amazon', font: 'font-sans font-bold lowercase tracking-tight' },
    { name: 'Microsoft', font: 'font-sans font-semibold tracking-tight' },
    { name: 'Apple', font: 'font-sans font-medium' },
    { name: 'Meta', font: 'font-sans font-black tracking-tight' },
    { name: 'Adobe', font: 'font-sans font-extrabold uppercase tracking-wider' },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 border-t border-b border-slate-200/60 dark:border-slate-800/60 select-none">
      <p className="text-center text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
        Join 2 million learners from companies like
      </p>

      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
        {companies.map((c) => (
          <span
            key={c.name}
            className={`text-lg sm:text-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ${c.font}`}
          >
            {c.name}
          </span>
        ))}
      </div>
    </section>
  );
}
