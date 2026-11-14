'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HardDrive,
  Database,
  Users,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import type { CapacityMetrics } from '@/lib/capacity/metrics';
import { getLiveCapacityMetrics } from '@/lib/capacity/metrics';

interface AdminCapacidadeClientProps {
  initialMetrics: CapacityMetrics;
}

export function AdminCapacidadeClient({ initialMetrics }: AdminCapacidadeClientProps) {
  const [metrics, setMetrics] = useState<CapacityMetrics>(initialMetrics);
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const updated = await getLiveCapacityMetrics();
      setMetrics(updated);
    } finally {
      setRefreshing(false);
    }
  }

  const isStorageCritical = metrics.storageAlertLevel === 'critical_90';
  const isStorageWarning = metrics.storageAlertLevel === 'warning_70';

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <HardDrive className="w-7 h-7 text-orange-400" />
            Painel de Capacidade e Infraestrutura
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitoramento de cotas do plano gratuito (Supabase Free) com alertas de teto para 300 anunciantes.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary text-xs px-4 py-2 rounded-xl flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
        </button>
      </div>

      {/* Alerta de Faixa */}
      {isStorageCritical && (
        <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong className="text-red-300 block font-semibold">Alerta Crítico: Capacidade em 90%+</strong>
            <p className="text-slate-300 text-xs mt-0.5">
              O armazenamento está próximo de atingir a cota máxima gratuita do Supabase. Programe o upgrade
              para o plano Pro para evitar interrupção de uploads.
            </p>
          </div>
        </div>
      )}

      {isStorageWarning && !isStorageCritical && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong className="text-amber-300 block font-semibold">Atenção: Capacidade em 70%+</strong>
            <p className="text-slate-300 text-xs mt-0.5">
              O consumo atingiu a faixa preventiva de atenção (70%). Acompanhe a projeção no simulador.
            </p>
          </div>
        </div>
      )}

      {/* Métricas Principais em Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Storage */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Storage de Fotos</span>
            <HardDrive className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">
              {metrics.estimatedStorageUsedMb} <span className="text-sm font-normal text-slate-400">/ {metrics.storageLimitMb} MB</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metrics.storageUsagePercent >= 90
                    ? 'bg-red-500'
                    : metrics.storageUsagePercent >= 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, metrics.storageUsagePercent)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5 flex justify-between">
              <span>{metrics.storageUsagePercent}% usado</span>
              <span>Cota Supabase Free</span>
            </p>
          </div>
        </div>

        {/* Card Banco de Dados */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Banco Postgres</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">
              {metrics.estimatedDbUsedMb} <span className="text-sm font-normal text-slate-400">/ {metrics.dbLimitMb} MB</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.dbUsagePercent)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5 flex justify-between">
              <span>{metrics.dbUsagePercent}% usado</span>
              <span>Cota: 500 MB Free</span>
            </p>
          </div>
        </div>

        {/* Card Perfis Ativos */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Perfis Cadastrados</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">
              {metrics.totalProfiles}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Capacidade sustentável gratuita: <strong>{metrics.maxSustainableProfiles} perfis</strong>
            </p>
          </div>
        </div>

        {/* Card Fotos de Apresentação */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Fotos Publicadas</span>
            <ImageIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">
              {metrics.totalImages}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Média de {metrics.avgImagesPerProfile} fotos por profissional
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Dimensionamento de 300 Usuários */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          Meta de Dimensionamento: 300 Profissionais sob Custo Zero
        </h2>
        <p className="text-xs text-slate-400">
          Cálculo matemático medido para a arquitetura WebP da Fase 24 (1 foto capa + 2 perfil por anunciante):
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-2.5 px-3">Recurso</th>
                <th className="py-2.5 px-3">Cálculo para 300 Perfis</th>
                <th className="py-2.5 px-3">Consumo Previsto</th>
                <th className="py-2.5 px-3">Teto do Supabase Free</th>
                <th className="py-2.5 px-3">Margem Livre</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Storage de Imagens</td>
                <td className="py-2.5 px-3">300 perfis × 3 fotos × ~220 KB</td>
                <td className="py-2.5 px-3 font-mono text-orange-300">~193 MB</td>
                <td className="py-2.5 px-3 font-mono">1.000 MB (1 GB)</td>
                <td className="py-2.5 px-3 font-mono text-emerald-400">~807 MB (80.7% livre)</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Seguro
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Banco PostgreSQL</td>
                <td className="py-2.5 px-3">300 contas + avaliações + contatos</td>
                <td className="py-2.5 px-3 font-mono text-cyan-300">~60 MB</td>
                <td className="py-2.5 px-3 font-mono">500 MB</td>
                <td className="py-2.5 px-3 font-mono text-emerald-400">~440 MB (88.0% livre)</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Seguro
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Tráfego de Saída</td>
                <td className="py-2.5 px-3">10.000 visitas/mês com cache Vercel</td>
                <td className="py-2.5 px-3 font-mono text-purple-300">~8 GB / mês</td>
                <td className="py-2.5 px-3 font-mono">100 GB (Vercel Hobby)</td>
                <td className="py-2.5 px-3 font-mono text-emerald-400">~92 GB (92.0% livre)</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Seguro
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-2 flex flex-wrap gap-4 text-xs">
          <Link
            href="/admin/configuracoes"
            className="text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
          >
            Abrir Simulador de Capacidade Dinâmico →
          </Link>
          <Link
            href="/admin/backup"
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            Baixar Backup Manual (.json) →
          </Link>
        </div>
      </div>
    </div>
  );
}

