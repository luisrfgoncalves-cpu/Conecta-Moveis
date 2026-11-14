import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Mail, Scale, Lock } from 'lucide-react';
import { getOperatorSettings } from '@/lib/config/operator';

export const metadata: Metadata = {
  title: 'Canal de Autoridades e Ordens Judiciais — Conecta Móveis',
  description: 'Canal exclusivo para o recebimento e cumprimento de ofícios, requisições policiais e ordens judiciais.',
};

export default function AutoridadesPage() {
  const op = getOperatorSettings();

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
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Scale className="w-8 h-8 text-orange-400" />
          Canal de Autoridades e Ordens Judiciais
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Orientações para Magistrados, Ministério Público, Delegacias de Polícia e Órgãos de Segurança Pública.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Procedimento de Cumprimento e Cadeia de Custódia
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          A Conecta Móveis coopera estritamente com as autoridades públicas no combate a fraudes, crimes cibernéticos e infrações legais, em estrito cumprimento ao Marco Civil da Internet (Lei 12.965/2014) e à Lei Geral de Proteção de Dados (Lei 13.709/2018).
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          Todo conteúdo sob investigação é preservado com carimbo de data/hora, endereço de IP de origem e cálculo de integridade criptográfica <strong>Hash SHA-256</strong> para resguardar a cadeia de custódia da evidência digital.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Mail className="w-4 h-4 text-purple-400" />
            E-mail Institucional Exclusivo
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ofícios e intimações judiciais devem ser encaminhados com assinatura digital do órgão expedidor para:
          </p>
          <a
            href={`mailto:${op.emailAutoridades}`}
            className="inline-block text-xs font-mono font-bold text-purple-400 hover:text-purple-300 underline"
          >
            {op.emailAutoridades}
          </a>
          <p className="text-[11px] text-slate-500">
            Apenas e-mails oficiais de domínios governamentais (.jus.br, .gov.br, .mp.br, .policiacivil.sp.gov.br) são processados neste canal.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Lock className="w-4 h-4 text-sky-400" />
            Dados Cadastrais e Logs de Acesso
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            A quebra de sigilo de registros de conexão e de acesso à aplicação depende de ordem judicial específica, nos termos do art. 15 da Lei 12.965/2014.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Para urgências com risco à vida ou abuso infantil (R9), a plataforma adota o procedimento imediato de <strong>Ocultação e Preservação de Evidência</strong> em até 2 horas.
          </p>
        </div>
      </div>
    </div>
  );
}

