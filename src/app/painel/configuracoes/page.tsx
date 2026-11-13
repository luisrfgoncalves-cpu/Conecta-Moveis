import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { UpdateEmailForm } from '@/components/auth/UpdateEmailForm';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Configurações — Painel Conecta Móveis',
};

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">Configurações</h1>
        <p className="text-slate-400 text-sm mt-1">Gerencie as informações de acesso da sua conta.</p>
      </div>

      {/* Alterar e-mail */}
      <section aria-labelledby="email-section-title" className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400">
            <Mail className="w-4 h-4" aria-hidden />
          </div>
          <div>
            <h2 id="email-section-title" className="text-base font-black text-white">E-mail de acesso</h2>
            <p className="text-xs text-slate-400">
              Atual: <span className="text-slate-200 font-medium">{user.email}</span>
              {!user.email_confirmed_at && (
                <span className="ml-2 text-amber-400">(não confirmado)</span>
              )}
            </p>
          </div>
        </div>
        <UpdateEmailForm currentEmail={user.email ?? ''} />
        <p className="mt-3 text-xs text-slate-500">
          Você receberá um link de confirmação no novo endereço. O e-mail atual continua ativo até a confirmação.
        </p>
      </section>
    </div>
  );
}
