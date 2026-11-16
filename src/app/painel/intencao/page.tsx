import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { IntencaoCards } from './IntencaoCards';

export const metadata: Metadata = {
  title: 'O que você quer fazer? — Conecta Móveis',
  description: 'Escolha como deseja aproveitar a plataforma.',
};

export default async function PainelIntencaoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/entrar?redirect=/painel/intencao');
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          O que você quer fazer?
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Essa preferência nos ajuda a organizar seu painel e navegação. Você pode mudar a qualquer momento.
        </p>
      </div>

      <IntencaoCards />
    </div>
  );
}
