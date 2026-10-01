import React from 'react';
import { Image, FileCode, FileText } from 'lucide-react';

interface ScrimbaFileIconProps {
  fileName: string;
  className?: string;
}

export default function ScrimbaFileIcon({ fileName, className = 'w-3.5 h-3.5' }: ScrimbaFileIconProps) {
  const lower = fileName.toLowerCase();

  if (
    lower.endsWith('.js') ||
    lower.endsWith('.jsx') ||
    lower.endsWith('.ts') ||
    lower.endsWith('.tsx') ||
    lower.endsWith('.mjs')
  ) {
    return (
      <span className="w-4 h-4 rounded-[3px] bg-amber-400 text-slate-950 font-bold text-[9px] flex items-center justify-center font-mono shrink-0 select-none shadow-sm leading-none">
        JS
      </span>
    );
  }

  if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.endsWith('.sass')) {
    return (
      <span className="w-4 h-4 text-sky-400 font-extrabold text-sm flex items-center justify-center font-mono shrink-0 select-none leading-none">
        #
      </span>
    );
  }

  if (lower.endsWith('.html') || lower.endsWith('.htm')) {
    return (
      <span className="w-4 h-4 text-orange-400 font-extrabold text-[10px] flex items-center justify-center font-mono shrink-0 select-none leading-none tracking-tighter">
        &lt;&gt;
      </span>
    );
  }

  if (lower.endsWith('.json')) {
    return (
      <span className="w-4 h-4 text-emerald-400 font-bold text-[11px] flex items-center justify-center font-mono shrink-0 select-none leading-none">
        &#123;&#125;
      </span>
    );
  }

  if (
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.ico')
  ) {
    return <Image className={`text-purple-400 shrink-0 ${className}`} />;
  }

  if (lower.endsWith('.md') || lower.endsWith('.txt')) {
    return <FileText className={`text-slate-400 shrink-0 ${className}`} />;
  }

  return <FileCode className={`text-indigo-400 shrink-0 ${className}`} />;
}
