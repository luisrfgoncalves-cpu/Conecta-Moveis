'use client';

import { useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import { trackWhatsAppClick } from '@/lib/contact/actions';

interface WhatsAppTrackerProps {
  profileId: string;
  whatsapp: string;
}

export function WhatsAppTracker({ profileId, whatsapp }: WhatsAppTrackerProps) {
  const handleClick = useCallback(async () => {
    // Fire-and-forget — não bloqueia navegação
    trackWhatsAppClick(profileId).catch(() => {});
  }, [profileId]);

  const number = whatsapp.replace(/\D/g, '');

  return (
    <a
      href={`https://wa.me/55${number}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition"
    >
      <MessageCircle className="w-4 h-4 text-emerald-400" aria-hidden />
      <span>WhatsApp: {whatsapp}</span>
    </a>
  );
}

