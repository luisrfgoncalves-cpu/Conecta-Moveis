import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ChangePasswordForm, DownloadDataButton, DeleteAccountForm } from '@/components/auth/SecurityForms';
import { LGPDRequestSection } from '@/components/auth/LGPDRequestSection';
import { Lock, Download, Trash2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Segurança — Painel Conecta Móveis',
};

export default async function SegurancaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">Segurança</h1>
        <p className="text-slate-400 text-sm mt-1">
          Gerencie sua senha e dados pessoais armazenados na plataforma.
        </p>
      </div>

      {/* Alterar senha */}
      <section aria-labelledby="password-section-title" className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
            <Lock className="w-4 h-4" aria-hidden />
          </div>
          <div>
            <h2 id="password-section-title" className="text-base font-black text-white">Alterar senha</h2>
            <p className="text-xs text-slate-400">Escolha uma senha nova com pelo menos 8 caracteres.</p>
          </div>
        </div>
        <ChangePasswordForm />
      </section>

      {/* Baixar meus dados */}
      <section aria-labelledby="download-section-title" className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400">
            <Download className="w-4 h-4" aria-hidden />
          </div>
          <div>
            <h2 id="download-section-title" className="text-base font-black text-white">Meus dados (LGPD)</h2>
            <p className="text-xs text-slate-400">Baixe uma cópia completa dos dados que armazenamos sobre você.</p>
          </div>
        </div>
        <DownloadDataButton />
        <p className="mt-3 text-xs text-slate-500">
          O arquivo JSON inclui: perfil, funções, perfis profissionais, favoritos, solicitações, avaliações,
          consentimentos e assinaturas. Nenhuma senha é exportada.
        </p>
      </section>

      {/* Solicitações de Direitos LGPD (Art. 18 / 19) */}
      <LGPDRequestSection />

      {/* Excluir conta */}
      <section aria-labelledby="delete-section-title" className="glass-panel rounded-2xl p-6 border border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-400">
            <Trash2 className="w-4 h-4" aria-hidden />
          </div>
          <div>
            <h2 id="delete-section-title" className="text-base font-black text-white">Excluir conta</h2>
            <p className="text-xs text-slate-400">Esta ação é permanente e irreversível.</p>
          </div>
        </div>
        <DeleteAccountForm />
      </section>
    </div>
  );
}

