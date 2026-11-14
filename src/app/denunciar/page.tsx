import { Suspense } from 'react';
import type { Metadata } from 'next';
import { NotificarConteudoClient } from '@/components/takedown/NotificarConteudoClient';

export const metadata: Metadata = {
  title: 'Notificação de Conteúdo e Retirada — Conecta Móveis',
  description: 'Canal de envio de notificações extrajudiciais, violações de direitos autorais ou infrações de termos.',
};

export default function DenunciarPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Carregando formulário...</div>}>
      <NotificarConteudoClient />
    </Suspense>
  );
}
