'use client';

import React, { useState, useEffect } from 'react';
import { OnboardingModal } from './OnboardingModal';

interface OnboardingTriggerProps {
  intent: 'procurar' | 'divulgar';
  /**
   * Delay em milissegundos antes de abrir na primeira visita (padrão: 800ms)
   */
  delayMs?: number;
}

/**
 * Disparador automático do onboarding para a primeira visita.
 * Verifica o localStorage antes de abrir e nunca bloqueia a página.
 */
export function OnboardingTrigger({ intent, delayMs = 800 }: OnboardingTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Evita execução durante SSR
    if (typeof window === 'undefined') return;

    try {
      const storageKey = `conecta_onboarding_${intent}_seen`;
      const hasSeen = localStorage.getItem(storageKey);

      if (!hasSeen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, delayMs);

        return () => clearTimeout(timer);
      }
    } catch {
      // Ignora erro se cookies/localStorage estiverem desativados
    } finally {
      setChecked(true);
    }
  }, [intent, delayMs]);

  if (!checked || !isOpen) return null;

  return (
    <OnboardingModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      defaultTrack={intent}
      allowTrackSwitch={true}
    />
  );
}
