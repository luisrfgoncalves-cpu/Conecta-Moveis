'use client';

import React, { useState } from 'react';
import { PlayCircle, Eye } from 'lucide-react';
import { OnboardingModal } from './OnboardingModal';

interface ComoFuncionaOnboardingProps {
  variant?: 'track1' | 'track2' | 'box';
}

export function ComoFuncionaOnboarding({ variant = 'box' }: ComoFuncionaOnboardingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTrack, setActiveTrack] = useState<'procurar' | 'divulgar'>('procurar');

  const openTrack = (track: 'procurar' | 'divulgar') => {
    setActiveTrack(track);
    setIsOpen(true);
  };

  if (variant === 'track1') {
    return (
      <>
        <button
          type="button"
          onClick={() => openTrack('procurar')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold text-xs uppercase tracking-wider transition"
          aria-label="Abrir apresentação de 3 telas para quem procura serviços"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Ver apresentação rápida (3 telas)</span>
        </button>

        <OnboardingModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          defaultTrack={activeTrack}
          allowTrackSwitch={true}
        />
      </>
    );
  }

  if (variant === 'track2') {
    return (
      <>
        <button
          type="button"
          onClick={() => openTrack('divulgar')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider transition"
          aria-label="Abrir apresentação de 3 telas para quem anuncia serviços"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Ver apresentação para anunciantes (3 telas)</span>
        </button>

        <OnboardingModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          defaultTrack={activeTrack}
          allowTrackSwitch={true}
        />
      </>
    );
  }

  return (
    <>
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-900/60">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Eye className="w-3.5 h-3.5" />
            <span>Apresentação inicial</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Quer rever a apresentação da plataforma?
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Veja as 3 etapas resumidas de como usar o catálogo para procurar profissionais ou divulgar o seu trabalho.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
          <button
            type="button"
            onClick={() => openTrack('procurar')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold transition"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Apresentação: Quem procura</span>
          </button>
          <button
            type="button"
            onClick={() => openTrack('divulgar')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Apresentação: Quem anuncia</span>
          </button>
        </div>
      </div>

      <OnboardingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultTrack={activeTrack}
        allowTrackSwitch={true}
      />
    </>
  );
}
