import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Ticket,
  Check,
  Sparkles,
  Layers,
  Database,
  Zap,
  Bot,
  Globe,
  Award,
  Gamepad2,
  Users,
  Eye,
  ListChecks,
  PlayCircle,
  Code2,
} from 'lucide-react';

export default function PricingPage() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('yearly');

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 select-none">
      {/* ── Page Header ── */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Scrimba Price Plans
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
          A small price for a new career. What will you build?
        </p>
      </div>

      {/* ── Pricing Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* ── Plan 1: Scrimba Pro (Recommended) ── */}
        <div className="relative bg-white dark:bg-[#12141f] border-2 border-blue-500/60 dark:border-blue-500/50 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
          <div className="absolute -top-3.5 right-8 px-3 py-1 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider rounded-full shadow-md">
            Most Popular
          </div>

          <div>
            {/* Title */}
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Scrimba Pro
              </h2>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              All you need to get started and stay ahead as a modern web developer.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl flex items-center mb-8">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Yearly</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-500 text-white rounded">
                  Save 35%
                </span>
              </button>
            </div>

            {/* Features List */}
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Your Pro Plan includes
            </p>

            <ul className="space-y-3.5 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white">Fullstack Developer Path</span>
              </li>
              <li className="flex items-center gap-3">
                <Database className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white">Backend Developer Path</span>
              </li>
              <li className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white">Frontend Developer Path</span>
              </li>
              <li className="flex items-center gap-3">
                <Bot className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white">AI Engineer Path</span>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                <span>All 70+ courses (with multiple-language captions)</span>
              </li>
              <li className="flex items-center gap-3">
                <Award className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Verified course certificates</span>
              </li>
              <li className="flex items-center gap-3">
                <Gamepad2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Unlimited Challenges and Instant Feedback</span>
              </li>
              <li className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                <span>100 AI Explainers per month</span>
              </li>
              <li className="flex items-center gap-3">
                <Users className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Full access to Discord community & review channels</span>
              </li>
            </ul>
          </div>

          {/* Pricing & CTA */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-baseline gap-1.5 mb-4">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {billingCycle === 'yearly' ? '$18' : '$28'}
              </span>
              <span className="text-sm font-medium text-slate-500">/ month</span>
              {billingCycle === 'yearly' && (
                <span className="text-xs text-slate-400 ml-2">(billed annually $216)</span>
              )}
            </div>

            <button
              onClick={() => navigate('/player')}
              className="w-full py-4 rounded-xl bg-[#0086ff] hover:bg-[#0074e0] active:bg-[#0065c4] text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 cursor-pointer text-center"
            >
              UPGRADE TO PRO
            </button>
          </div>
        </div>

        {/* ── Plan 2: Freemium ── */}
        <div className="bg-white dark:bg-[#12141f] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 shadow-xl flex flex-col justify-between">
          <div>
            {/* Title */}
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Freemium
              </h2>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Get started, connect with the community and explore what Scrimba can offer.
            </p>

            {/* Spacer to align visually with Pro card */}
            <div className="h-10 mb-8" />

            {/* Features List */}
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Free Access includes
            </p>

            <ul className="space-y-3.5 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-3">
                <ListChecks className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>All free intro courses (React, JS, HTML/CSS)</span>
              </li>
              <li className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Access to intro scrims per Pro course</span>
              </li>
              <li className="flex items-center gap-3">
                <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Basic access to Discord community</span>
              </li>
              <li className="flex items-center gap-3">
                <Code2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Up to 10 interactive coding challenges</span>
              </li>
              <li className="flex items-center gap-3">
                <PlayCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>10 free AI Explainers</span>
              </li>
            </ul>
          </div>

          {/* Pricing & CTA */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-baseline gap-1.5 mb-4">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                $0
              </span>
              <span className="text-sm font-medium text-slate-500">/ Forever</span>
            </div>

            <button
              onClick={() => navigate('/player')}
              className="w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider transition-all cursor-pointer text-center border border-slate-300 dark:border-slate-700"
            >
              SIGN UP FOR FREE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
