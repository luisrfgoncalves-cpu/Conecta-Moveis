'use client';

import { useState, useCallback } from 'react';
import { MessageCircle, ExternalLink, AlertTriangle, X } from 'lucide-react';
import { trackWhatsAppClick } from '@/lib/contact/actions';

interface WhatsAppTrackerProps {
  profileId: string;
  whatsapp: string;
}

export function WhatsAppTracker({ profileId, whatsapp }: WhatsAppTrackerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const number = whatsapp.replace(/\D/g, '');
  const waUrl = `https://wa.me/55${number}`;

  const openWhatsAppDirectly = useCallback(() => {
    trackWhatsAppClick(profileId).catch(() => { });
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }, [profileId, waUrl]);

  const handleInitialClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Checar se já visualizou a tela de saída nesta sessão para este anunciante
    const sessionKey = `wa_exit_seen_${profileId}`;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage.getItem(sessionKey)) {
        openWhatsAppDirectly();
        return;
      }
    } catch {
      // Caso sessionStorage bloqueado
    }

    setIsOpen(true);
  };

  const handleConfirm = () => {
    const sessionKey = `wa_exit_seen_${profileId}`;
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(sessionKey, 'true');
      }
    } catch { }

    setIsOpen(false);
    openWhatsAppDirectly();
  };

  return (
    <>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleInitialClick}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition cursor-pointer"
      >
        <MessageCircle className="w-4 h-4 text-emerald-400" aria-hidden />
        <span>WhatsApp: {whatsapp}</span>
      </a>

      {/* Modal de Aviso de Saída da Plataforma */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-saida-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
        >
          <div className="glass-panel max-w-md w-full p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5 bg-slate-950/90 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1"
              aria-label="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 id="modal-saida-titulo" className="text-base font-bold text-white">
                Aviso de Saída da Plataforma
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Você vai conversar diretamente com o anunciante, fora da Conecta Móveis. Preço, prazo, contrato e pagamento são combinados somente entre vocês. Antes de fechar negócio, peça contrato por escrito, confira referências e evite pagar todo o valor adiantado.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
              >
                <span>Continuar para o WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
