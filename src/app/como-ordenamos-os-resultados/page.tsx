import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, SlidersHorizontal, Sparkles, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Como Ordenamos os Resultados — Conecta Móveis',
  description: 'Critérios objetivos de ordenação, neutralidade algorítmica e rotulagem de anúncios na plataforma Conecta Móveis.',
};

export default function ComoOrdenamosOsResultadosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div>
        <Link
          href="/encontrar-profissionais"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para a Busca
        </Link>
        <h1 className="text-3xl font-black text-white">Como Ordenamos os Resultados</h1>
        <p className="text-sm text-slate-400 mt-2">
          Transparência sobre a apresentação e os critérios de ordenação dos anúncios na plataforma.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-orange-400" />
          Princípio da Neutralidade e Rotatividade
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          A Conecta Móveis não cria rankings subjetivos de &quot;melhores profissionais&quot;, nem endossa qualquer prestador cadastrado. Para assegurar oportunidade igualitária a todos os anunciantes e neutralidade perante o consumidor, aplicamos os seguintes critérios objetivos:
        </p>
      </div>

      <div className="space-y-4 text-xs">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            1. Ordem Rotativa Padrão (Sem privilégios de qualidade)
          </h3>
          <p className="text-slate-300 leading-relaxed">
            A ordenação padrão inicial da vitrine utiliza um algoritmo rotativo (rodízio diário por sessão) entre os perfis ativos e publicados da cidade ou categoria pesquisada. Isso garante que todos os profissionais tenham visibilidade equilibrada sem favorecimento arbitrário da plataforma.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            2. Destaques Patrocinados (Sempre Rotulados)
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Perfis que contratam planos de visibilidade comercial podem ter destaque nas primeiras posições de forma rotativa. Todo e qualquer perfil com essa característica é <strong>obrigatoriamente rotulado com a etiqueta ostensiva &quot;Destaque patrocinado&quot;</strong>, em respeito ao art. 36 do Código de Defesa do Consumidor e às normas do CONAR. A contratação de planos pagos <strong>nunca altera avaliações nem isenta o anunciante de moderação</strong>.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            3. Opções Livres de Escolha do Usuário
          </h3>
          <p className="text-slate-300 leading-relaxed">
            O visitante pode a qualquer momento alterar o filtro de ordenação para atender à sua preferência:
          </p>
          <ul className="text-slate-400 space-y-1 list-disc list-inside pt-1">
            <li><strong>Mais recentes:</strong> Ordena pela data de cadastro do perfil.</li>
            <li><strong>Perfil mais completo:</strong> Prioriza perfis com portfólio de fotos de trabalhos e descrição detalhada.</li>
            <li><strong>Melhor avaliados:</strong> Ordena pelas notas médias atribuídas livremente por outros usuários com interação registrada.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

