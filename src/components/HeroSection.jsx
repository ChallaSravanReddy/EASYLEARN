import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star, Sparkles, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full pt-8 pb-16 md:py-16 overflow-hidden select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        
        {/* ── Left Column: Headline & CTA ── */}
        <div className="flex-1 flex flex-col items-start text-left max-w-xl">
          <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white font-sans">
            Learn to Code
            <br />
            Like a Pro
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            We teach you the essential skills you need to succeed as a dev in 2026
          </p>

          <div className="mt-8 flex flex-col items-start gap-2.5">
            <button
              onClick={() => navigate('/player')}
              className="bg-[#0086ff] hover:bg-[#0074e0] active:bg-[#0065c4] text-white font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-md shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center gap-2 group"
            >
              <span>TRY IT FOR FREE</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-1 font-medium">
              Takes 2 min - no signup
            </p>
          </div>
        </div>

        {/* ── Right Column: Iconic 3D Tilted Interactive Scrim Card ── */}
        <div className="w-full lg:w-[500px] flex justify-center perspective-[1200px]">
          <div
            onClick={() => navigate('/player')}
            className="group relative w-full max-w-[480px] bg-[#12141f] rounded-2xl border border-slate-700/80 shadow-2xl p-4 sm:p-5 cursor-pointer transition-all duration-500 hover:rotate-0 hover:scale-[1.02] transform lg:-rotate-y-6 lg:rotate-x-3 lg:rotate-1 hover:shadow-blue-500/20"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Top Editor Tab Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 font-mono text-[11px] text-slate-400">index.js</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                Live Scrim
              </span>
            </div>

            {/* Simulated Monaco Editor Buffer */}
            <div className="relative py-4 font-mono text-xs sm:text-[13px] text-slate-300 leading-relaxed overflow-hidden">
              <div className="text-slate-500">
                <span className="text-purple-400">import</span> React, {'{'} useState {'}'}{' '}
                <span className="text-purple-400">from</span>{' '}
                <span className="text-emerald-300">&apos;react&apos;</span>;
              </div>
              <div className="mt-1 text-slate-500">
                <span className="text-purple-400">import</span> ReactDOM{' '}
                <span className="text-purple-400">from</span>{' '}
                <span className="text-emerald-300">&apos;react-dom&apos;</span>;
              </div>
              <div className="mt-2 text-slate-400">
                <span className="text-blue-400 font-bold">function</span>{' '}
                <span className="text-amber-300">App</span>() {'{'}
              </div>
              <div className="pl-4 text-slate-300">
                <span className="text-purple-400">const</span> [greeting, setGreeting] ={' '}
                <span className="text-blue-400">useState</span>(
                <span className="text-emerald-300">&quot;Hello Scrimba!&quot;</span>);
              </div>
              <div className="pl-4 mt-1 text-slate-500 italic">
                // Challenge: Edit the state variable live inside the player!
              </div>
              <div className="pl-4 text-slate-300">
                <span className="text-purple-400">return</span> (
              </div>
              <div className="pl-8 text-cyan-300">
                &lt;<span className="text-rose-400">h1</span> className=
                <span className="text-emerald-300">&quot;title&quot;</span>&gt;{'{'}greeting{'}'}&lt;/<span className="text-rose-400">h1</span>&gt;
              </div>
              <div className="pl-4 text-slate-300">);</div>
              <div className="text-slate-400">{'}'}</div>

              {/* Center Glow Play Button */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] group-hover:bg-black/20 transition-all rounded-lg">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600/90 group-hover:bg-blue-500 group-hover:scale-110 flex items-center justify-center shadow-2xl shadow-blue-500/50 text-white transition-all duration-300 ring-4 ring-white/20">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-0.5" />
                </div>
              </div>
            </div>

            {/* Bottom Scrimba Instructor Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-[11px] ring-1 ring-slate-700">
                  PB
                </div>
                <div>
                  <p className="font-semibold text-white leading-tight">Welcome to Scrimba</p>
                  <p className="text-[11px] text-slate-400">By Per Borgen</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                  2:23
                </span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}