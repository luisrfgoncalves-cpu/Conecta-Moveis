import { Metadata } from 'next';
import { Flag, ShieldAlert } from 'lucide-react';
import { ReportButton } from '@/components/reports/ReportButton';
import { createClient } from '@/lib/supabase/server';
import { BackButton } from '@/components/navigation/BackButton';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Denunciar — Conecta Móveis',
  description: 'Relate conteúdo inadequado ou comportamento abusivo na plataforma.',
};

interface DenunciarPageProps {
  searchParams: Promise<{ tipo?: string; alvo?: string }>;
}

export default async function DenunciarPage({ searchParams }: DenunciarPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;

  const validTypes = ['profile', 'image', 'review', 'company'] as const;
  const targetType = validTypes.includes(params.tipo as (typeof validTypes)[number])
    ? (params.tipo as (typeof validTypes)[number])
    : 'profile';

  // UUID válido ou UUID nulo (formulário sem contexto)
  const targetId =
    params.alvo && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.alvo)
      ? params.alvo
      : '00000000-0000-0000-0000-000000000000';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs items={[{ label: 'Canal de Denúncias' }]} />
          <BackButton fallback="/" label="Voltar à tela anterior" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <Flag className="w-8 h-8 text-red-400" aria-hidden />
          Enviar Denúncia
        </h1>
        <p className="text-sm text-slate-300">
          Relate conteúdo inadequado, perfis fraudulentos, fotos plagiadas ou condutas abusivas.
          Sua denúncia é <strong>totalmente confidencial</strong> e nunca ficará visível para outros usuários.
        </p>
      </div>

      {/* Aviso de processo */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" aria-hidden />
        <p className="text-xs text-slate-300 leading-relaxed">
          Toda denúncia vai diretamente para a fila de moderação administrativa.
          O sigilo do denunciante é garantido. O prazo de análise é de até 5 dias úteis.
        </p>
      </div>

      {/* Formulário de denúncia — funcional */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <ReportButton
          targetType={targetType}
          targetId={targetId}
          isLoggedIn={!!user}
        />
        {/* O ReportButton abre modal — aqui exibimos versão inline expandida */}
        <p className="text-xs text-slate-500 mt-4">
          Ao enviar, você concorda que sua denúncia será armazenada e analisada pela nossa equipe de moderação.
          Denúncias de má-fé podem resultar em suspensão da conta.
        </p>
      </div>
    </div>
  );
}
