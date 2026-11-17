'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function BrandIntroSound() {
  const pathname = usePathname();

  useEffect(() => {
    // Tocar uma única vez por sessão do usuário
    if (typeof window === 'undefined') return;

    // Não tocar na página de apresentação para não conflitar com o vídeo
    if (pathname?.startsWith('/apresentacao')) return;

    const hasPlayed = sessionStorage.getItem('vm_intro_sfx_played');
    if (hasPlayed) return;

    // Função que tenta disparar o áudio com volume suave
    const playIntro = () => {
      try {
        const audio = new Audio('/brand/vitrine-moveleira-sfx.mp3');
        // Volume reduzido para nível sutil e elegante (12%), sem sustos ao usuário
        audio.volume = 0.12;
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
  }, [pathname]);

  return null;
}
