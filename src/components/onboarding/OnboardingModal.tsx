'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Search,
  MessageSquare,
  ShieldCheck,
  Users,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { ONBOARDING_TRACKS } from './onboardingData';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrack?: 'procurar' | 'divulgar';
  allowTrackSwitch?: boolean;
}

export function OnboardingModal({
  isOpen,
  onClose,
  defaultTrack = 'procurar',
  allowTrackSwitch = true,
}: OnboardingModalProps) {
  const [currentTrack, setCurrentTrack] = useState<'procurar' | 'divulgar'>(defaultTrack);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // Sincroniza a trilha quando defaultTrack muda
  useEffect(() => {
    setCurrentTrack(defaultTrack);
    setCurrentStepIndex(0);
  }, [defaultTrack, isOpen]);

  const track = ONBOARDING_TRACKS[currentTrack];
  const steps = track.steps;
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Marca no localStorage que a trilha foi visualizada
  const markAsSeen = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`conecta_onboarding_${currentTrack}_seen`, 'true');
      }
    } catch {
      // Ignora erro caso localStorage esteja bloqueado no navegador
    }
  }, [currentTrack]);

  const handleClose = useCallback(() => {
    markAsSeen();
    onClose();
  }, [markAsSeen, onClose]);

  const handleNext = () => {
    if (isLastStep) {
      handleClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleTrackChange = (newTrack: 'procurar' | 'divulgar') => {
    setCurrentTrack(newTrack);
    setCurrentStepIndex(0);
  };

  // Gerenciamento de acessibilidade por teclado: ESC e Setas Direita/Esquerda
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (isLastStep) {
          handleClose();
        } else {
          setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Foca o botão principal ao abrir
    const timer = setTimeout(() => {
      nextButtonRef.current?.focus();
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, isLastStep, steps.length, handleClose]);

  if (!isOpen) return null;

  // Renderizador de ícones
  const renderIcon = (name: string) => {
    const iconClass =
      currentTrack === 'procurar'
        ? 'w-8 h-8 sm:w-10 sm:h-10 text-orange-400'
        : 'w-8 h-8 sm:w-10 sm:h-10 text-emerald-400';

    switch (name) {
      case 'search':
        return <Search className={iconClass} aria-hidden="true" />;
      case 'message':
        return <MessageSquare className={iconClass} aria-hidden="true" />;
      case 'shield':
        return <ShieldCheck className={iconClass} aria-hidden="true" />;
      case 'users':
        return <Users className={iconClass} aria-hidden="true" />;
      case 'clock':
        return <Clock className={iconClass} aria-hidden="true" />;
      case 'sparkles':
        return <Sparkles className={iconClass} aria-hidden="true" />;
      default:
        return <Search className={iconClass} aria-hidden="true" />;
    }
  };

  const themeAccentBorder =
    currentTrack === 'procurar'
      ? 'border-orange-500/30'
      : 'border-emerald-500/30';

  const themeAccentBg =
    currentTrack === 'procurar' ? 'bg-orange-500/10' : 'bg-emerald-500/10';

  const themePrimaryButton =
    currentTrack === 'procurar'
      ? 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-400 text-white shadow-orange-500/20'
      : 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400 text-white shadow-emerald-500/20';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-step-title"
      aria-describedby="onboarding-step-desc"
      ref={modalRef}
    >
      {/* Região oculta para leitores de tela anunciarem a mudança de passo */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Apresentação do Vitrine Moveleira. ${track.label}. Tela ${currentStep.stepNumber} de ${currentStep.totalSteps}: ${currentStep.title}`}
      </div>

      <div
        className={`relative w-full max-w-lg bg-slate-900 border ${themeAccentBorder} rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between gap-4 bg-slate-950/40">
          {allowTrackSwitch ? (
            <div
              className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10"
              role="tablist"
              aria-label="Escolher trilha da apresentação"
            >
              <button
                type="button"
                role="tab"
                aria-selected={currentTrack === 'procurar'}
                onClick={() => handleTrackChange('procurar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentTrack === 'procurar'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Quem procura
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={currentTrack === 'divulgar'}
                onClick={() => handleTrackChange('divulgar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentTrack === 'divulgar'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Quem anuncia
              </button>
            </div>
          ) : (
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                currentTrack === 'procurar'
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {track.label}
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="text-xs text-slate-400 hover:text-white font-medium px-2 py-1 rounded-lg hover:bg-white/5 transition"
              title="Pular apresentação (Esc)"
            >
              Pular
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label="Fechar apresentação"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Slide */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Badge e Ícone */}
          <div className="flex items-center justify-between gap-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${themeAccentBorder} ${themeAccentBg} ${
                currentTrack === 'procurar' ? 'text-orange-400' : 'text-emerald-400'
              }`}
            >
              {currentStep.tag}
            </span>

            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border ${themeAccentBorder} ${themeAccentBg} flex items-center justify-center shadow-inner`}
            >
              {renderIcon(currentStep.iconName)}
            </div>
          </div>

          {/* Textos Principais */}
          <div className="space-y-3">
            <h2
              id="onboarding-step-title"
              className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug"
            >
              {currentStep.title}
            </h2>

            <p
              id="onboarding-step-desc"
              className="text-sm sm:text-base text-slate-200 font-semibold leading-relaxed"
            >
              {currentStep.leadText}
            </p>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-1">
              {currentStep.description}
            </p>
          </div>

          {/* Indicadores de Progresso (Dots) */}
          <div
            className="flex items-center justify-center gap-2 pt-2"
            role="group"
            aria-label="Progresso da apresentação"
          >
            {steps.map((_, index) => {
              const isActive = index === currentStepIndex;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentStepIndex(index)}
                  aria-label={`Ir para a tela ${index + 1} de ${steps.length}`}
                  aria-current={isActive ? 'step' : undefined}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? currentTrack === 'procurar'
                        ? 'w-8 bg-orange-500'
                        : 'w-8 bg-emerald-500'
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Rodapé com Navegação */}
        <div className="p-5 sm:p-6 border-t border-white/10 flex items-center justify-between gap-3 bg-slate-950/60">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirstStep}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              isFirstStep
                ? 'opacity-30 cursor-not-allowed text-slate-500'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            aria-label="Voltar para a tela anterior"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              ref={nextButtonRef}
              type="button"
              onClick={handleNext}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md focus:outline-none focus:ring-2 ${themePrimaryButton}`}
            >
              {isLastStep ? (
                <>
                  <span>Concluir</span>
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Próximo</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
