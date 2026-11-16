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
      className={`btn-back-3d group ${className}`}
    >
      <div className="w-5 h-5 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 group-hover:bg-orange-500/30 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5 text-orange-400 group-hover:-translate-x-0.5 transition-transform" />
      </div>
      <span className="tracking-wide uppercase text-[11px] font-black">{label}</span>
    </button>
  );
}


