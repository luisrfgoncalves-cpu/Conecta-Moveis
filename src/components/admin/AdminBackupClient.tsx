'use client';

import { useState } from 'react';
import { Download, Database, ShieldCheck, ExternalLink, HardDrive, AlertCircle, FileCheck, RefreshCw } from 'lucide-react';
import { exportDatabaseBackup } from '@/lib/admin/actions';

export function AdminBackupClient() {
  const [loading, setLoading] = useState(false);
  const [lastExport, setLastExport] = useState<{
    date: string;
    counts: Record<string, number>;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleDownloadBackup() {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await exportDatabaseBackup();
      if (!res.success || !res.data) {
        setErrorMsg(res.error || 'Erro ao gerar arquivo de backup.');
        setLoading(false);
        return;
      }

      // Criar blob e disparar download direto no navegador
      const jsonStr = JSON.stringify(res.data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const now = new Date();
      const dateTag = now.toISOString().slice(0, 10);
      link.href = url;
      link.download = `conecta-moveis-backup-${dateTag}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setLastExport({
        date: now.toLocaleString('pt-BR'),
        counts: res.data.metadata.counts,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha na conexão com o servidor.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-orange-400" />
          Backup & Gestão de Dados
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Ferramenta administrativa de salvaguarda de dados e acompanhamento de cotas de infraestrutura.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center gap-3 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Card Principal de Exportação */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              Exportar Backup do Banco de Dados
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Gera um arquivo JSON completo contendo todos os cadastros essenciais da plataforma: perfis profissionais, projetos, links de fotos, avaliações, contatos, categorias e logs de auditoria.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-orange-500/20 shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Gerando Backup...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Baixar Backup (.json)
              </>
            )}
          </button>
        </div>

        {lastExport && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <FileCheck className="w-4 h-4" />
              Backup gerado com sucesso em {lastExport.date}!
            </div>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-300">
              <span className="px-2 py-0.5 rounded bg-black/40">Perfis: {lastExport.counts.professional_profiles}</span>
              <span className="px-2 py-0.5 rounded bg-black/40">Projetos: {lastExport.counts.portfolio_items}</span>
              <span className="px-2 py-0.5 rounded bg-black/40">Fotos registradas: {lastExport.counts.portfolio_images}</span>
              <span className="px-2 py-0.5 rounded bg-black/40">Avaliações: {lastExport.counts.reviews}</span>
              <span className="px-2 py-0.5 rounded bg-black/40">Mensagens: {lastExport.counts.contact_requests}</span>
            </div>
          </div>
        )}

        <div className="border-t border-white/5 pt-4 text-xs text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Este botão é exclusivo do painel de administração e não fica exposto para nenhum visitante do site.</span>
        </div>
      </div>

      {/* Acompanhamento das Infraestruturas: Vercel e Supabase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vercel Hobby Guide */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-sky-400" />
              Hospedagem Vercel (Plano Hobby)
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
              Uso Não Comercial
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            A Vercel hospeda o site e as funções do servidor. No plano gratuito Hobby:
          </p>

          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li><strong>Largura de banda:</strong> 100 GB por mês.</li>
            <li><strong>Funções serverless:</strong> 100.000 invocações por mês.</li>
            <li><strong>Regra do plano:</strong> O plano gratuito é para testes e uso não comercial inicial. Antes de ativar cobranças de mensalidades de profissionais ou patrocínios, deve-se migrar para o plano Pro ($20/mês).</li>
          </ul>

          <div className="pt-2">
            <a
              href="https://vercel.com/dashboard/usage"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 underline"
            >
              Abrir painel de consumo da Vercel
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Supabase Free Tier Guide */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              Banco & Storage (Supabase Free)
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              500 MB / 1 GB
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            O plano gratuito do Supabase não possui backup automatizado ponto-a-ponto da plataforma. Por isso:
          </p>

          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li><strong>Banco PostgreSQL:</strong> 500 MB (suficiente para mais de 50.000 profissionais e clientes).</li>
            <li><strong>Storage de Imagens:</strong> 1 GB (suficiente para ~15.000 fotos comprimidas em WebP).</li>
            <li><strong>Recomendação de Backup:</strong> Baixar o arquivo JSON semanalmente através do botão acima.</li>
          </ul>

          <div className="pt-2">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
            >
              Abrir dashboard do Supabase
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
