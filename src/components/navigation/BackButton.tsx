'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { sounds } from '@/lib/sound';

interface BackButtonProps {
  fallback?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  fallback = '/',
  label = 'Voltar',
  className = '',
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    sounds.playClick();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shadow-sm group ${className}`}
    >
      <ArrowLeft className="w-3.5 h-3.5 text-orange-400 group-hover:-translate-x-0.5 transition-transform" />
      <span>{label}</span>
    </button>
  );
}

