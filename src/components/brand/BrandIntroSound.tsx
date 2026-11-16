'use client';

import { useEffect } from 'react';

export function BrandIntroSound() {
  useEffect(() => {
    // Tocar uma única vez por sessão do usuário
    if (typeof window === 'undefined') return;

    const hasPlayed = sessionStorage.getItem('vm_intro_sfx_played');
    if (hasPlayed) return;

    // Função que tenta disparar o áudio com volume suave
    const playIntro = () => {
      try {
        const audio = new Audio('/brand/vitrine-moveleira-sfx.mp3');
        audio.volume = 0.4;
        audio.play().then(() => {
          sessionStorage.setItem('vm_intro_sfx_played', 'true');
        }).catch(() => {
          // Navegadores bloqueiam autoplay sem interação prévia.
          // Aguardamos o primeiro clique ou toque para executar o som de introdução uma única vez.
          const handleFirstInteraction = () => {
            audio.play().then(() => {
              sessionStorage.setItem('vm_intro_sfx_played', 'true');
            }).catch(() => {});
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
          };
          window.addEventListener('click', handleFirstInteraction, { once: true });
          window.addEventListener('touchstart', handleFirstInteraction, { once: true });
        });
      } catch {
        // Ignora silenciosamente caso o dispositivo não suporte áudio
      }
    };

    // Pequeno delay de 300ms para harmonizar perfeitamente com a animação de entrada do logo
    const timer = setTimeout(playIntro, 300);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
