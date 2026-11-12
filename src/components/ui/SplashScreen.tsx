'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Esmaece e remove a splash screen suavemente após 900ms
    const timerFade = setTimeout(() => {
      setFade(true);
    }, 800);

    const timerRemove = setTimeout(() => {
      setVisible(false);
    }, 1200);

    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerRemove);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06080d] transition-opacity duration-500 ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Luz ambiente de fundo neon laranja */}
      <div className="absolute w-72 h-72 rounded-full bg-orange-600/20 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center space-y-6">
        <Image
          src="/brand/logo-conecta-moveis.png"
          alt="Conecta Móveis"
          width={280}
          height={60}
          priority
          className="h-16 w-auto object-contain animate-pulse"
        />

        {/* Indicador de carregamento discreto */}
        <div className="flex items-center gap-1.5 pt-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
        </div>
      </div>
    </div>
  );
}

