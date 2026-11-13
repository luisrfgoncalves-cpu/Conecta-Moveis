'use client';

import { useCallback } from 'react';
import { Share2, Copy } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
}

export function ShareButton({ url, title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    // Web Share API — mobile-first
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: text ?? title, url });
        return;
      } catch {
        // Usuário cancelou ou API indisponível — fallback para cópia
      }
    }

    // Fallback: cópia de link
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard não disponível (HTTP sem permissão) — ignora
    }
  }, [url, title, text]);

  return (
    <button
      onClick={handleShare}
      aria-label="Compartilhar perfil"
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
    >
      {copied ? (
        <>
          <Copy className="w-4 h-4 text-green-400" aria-hidden />
          <span className="text-sm font-medium text-green-400">Link copiado!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" aria-hidden />
          <span className="text-sm font-medium">Compartilhar</span>
        </>
      )}
    </button>
  );
}

