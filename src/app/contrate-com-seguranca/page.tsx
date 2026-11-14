import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, FileText, CheckCircle, Scale, PhoneCall } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Orientações de Segurança na Contratação — Conecta Móveis',
  description: 'Recomendações neutras e boas práticas para clientes e profissionais ao negociar e solicitar serviços de marcenaria e montagem.',
};

export default function ContrateComSegurancaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Início
        </Link>
        <h1 className="text-3xl font-black text-white">Orientações de Segurança para Contratação</h1>
        <p className="text-sm text-slate-400 mt-2">
          Orientações neutras para clientes e profissionais construírem relações de trabalho claras, seguras e transparentes.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3 bg-amber-500/5">
        <div className="flex items-center gap-2 text-amber-400">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <h2 className="text-base font-bold text-white">Aviso de Isenção</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          A Conecta Móveis opera exclusivamente como espaço de divulgação e aproximação inicial. A plataforma não participa, não fiscaliza e não garante as negociações, orçamentos, contratos ou serviços combinados entre as partes. Estas recomendações visam a segurança mútua de contratantes e prestadores.
        </p>
      </div>

      {/* 4 Blocos de Orientações Neutras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-400" />
            1. Exija Contrato por Escrito
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nunca combine serviços complexos apenas por mensagens informais. Formalize um documento simples assinado por ambas as partes contendo:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>Nome completo, CPF/CNPJ e contato das partes;</li>
            <li>Descrição detalhada do escopo (medidas, materiais, ferragens);</li>
            <li>Prazo de início e prazo final de entrega;</li>
            <li>Condições e marcos de pagamento.</li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            2. Pagamentos e Comprovantes
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Proteja seu dinheiro e assegure a sustentabilidade da execução do trabalho:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>Evite adiantar a quantia total do serviço antes da entrega;</li>
            <li>Parcele o pagamento vinculado a etapas comprovadas (ex: início, medição e finalização);</li>
            <li>Exija recibo ou nota fiscal a cada pagamento efetuado;</li>
            <li>Guarde comprovantes bancários com identificação do titular.</li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-sky-400" />
            3. Resolução de Conflitos
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Em caso de atrasos, divergências ou descumprimento de prazos:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>Priorize o diálogo por escrito documentando as solicitações;</li>
            <li>Envie notificação formal estipulando prazo razoável para conclusão;</li>
            <li>Registre denúncia na plataforma caso haja suspeita de golpe ou fraude para avaliarmos a suspensão do anunciante.</li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-purple-400" />
            4. Onde Buscar Apoio em Jundiaí/SP
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Caso não haja acordo entre as partes, os canais oficiais de proteção do consumidor e conciliação são:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5">
            <li><strong>Procon Jundiaí:</strong> R. Barão de Jundiaí, 1093 - Centro | Tel: (11) 4521-2244</li>
            <li><strong>Juizado Especial Cível (JEC):</strong> Fórum de Jundiaí para causas de até 20 salários mínimos sem advogado.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
