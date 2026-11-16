'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, X, Smartphone, Share2, PlusSquare, ArrowRight } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Detectar iOS / Safari
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(ua);
      setIsIos(isApple);

      // Checar se já foi dispensado nesta sessão
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

      if (!dismissed && !isStandalone) {
        // No iOS não há evento beforeinstallprompt, então exibe o banner após 3s
        if (isApple) {
          const timer = setTimeout(() => setShowBanner(true), 3000);
          return () => clearTimeout(timer);
        }
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Abre o guia passo a passo para Android ou iPhone
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!showBanner && !showGuideModal) return null;

  return (
    <>
      {/* Banner Inferior Discreto e Elegante */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="glass-panel p-4 rounded-2xl border border-orange-500/30 bg-slate-950/95 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-orange-500/30 overflow-hidden relative shrink-0 flex items-center justify-center">
                <Image
                  src="/icon-192.png"
                  alt="Vitrine Moveleira"
                  width={48}
                  height={48}
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-white truncate">
                  Instalar Vitrine Moveleira
                </h4>
                <p className="text-[11px] text-slate-300 truncate">
                  Acesse montadores e marceneiros em 1 toque
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-2 btn-neon text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Permanecer na web"
                className="p-2 rounded-xl text-slate-400 hover:text-white transition"
                title="Permanecer na web"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Guia de Instalação (Android / iPhone) */}
      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="glass-panel max-w-md w-full p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5 bg-slate-950/95 shadow-2xl relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1"
              aria-label="Fechar guia"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Como Instalar no seu Celular
                </h3>
                <p className="text-xs text-slate-300">
                  {isIos ? 'Guia para iPhone (iOS / Safari)' : 'Guia para Android (Chrome)'}
                </p>
              </div>
            </div>

            {isIos ? (
              /* Instruções iOS */
              <div className="space-y-3 pt-2 text-xs text-slate-200">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <p className="leading-relaxed">
                    Toque no botão de <strong>Compartilhar</strong> <Share2 className="w-3.5 h-3.5 inline mx-1 text-sky-400" /> na barra inferior do Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <p className="leading-relaxed">
                    Role as opções e selecione <strong>Adicionar à Tela de Início</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <p className="leading-relaxed">
                    Toque em <strong>Adicionar</strong> no topo direito. O ícone da Vitrine Moveleira aparecerá como um app no seu celular!
                  </p>
                </div>
              </div>
            ) : (
              /* Instruções Android */
              <div className="space-y-3 pt-2 text-xs text-slate-200">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <p className="leading-relaxed">
                    No Google Chrome, toque nos <strong>3 pontinhos</strong> (menu) no canto superior direito.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <p className="leading-relaxed">
                    Selecione <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <p className="leading-relaxed">
                    Confirme a instalação para abrir o app direto sem barras de navegação!
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 rounded-xl btn-neon text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Entendi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
