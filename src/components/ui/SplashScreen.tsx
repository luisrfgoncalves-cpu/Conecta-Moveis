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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06080d] transition-opacity duration-700 ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Luz ambiente de fundo neon laranja */}
      <div className="absolute w-96 h-96 rounded-full bg-orange-600/25 blur-[140px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-[90vw] w-full px-4">
        {/* Animação oficial com a imagem glossy e passagem de luz */}
        <div className="relative w-full max-w-[580px] h-[190px] sm:h-[220px]">
          <Image
            src="/brand/vitrine-moveleira-intro.svg"
            alt="Vitrine Moveleira"
            fill
            priority
            unoptimized
            className="object-contain"
          />
        </div>

        {/* Indicador de carregamento discreto */}
        <div className="flex items-center gap-2 pt-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-bounce" />
        </div>
      </div>
    </div>
  );
}

