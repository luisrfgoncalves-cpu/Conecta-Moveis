import type { Metadata } from 'next';
import { getOperatorSettings } from '@/lib/config/operator';
import { Mail, Shield, Building, AlertCircle, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Canais de Contato e Identificação do Operador — Conecta Móveis',
  description: 'Canais de atendimento ao usuário, privacidade e titulares de dados, notificações judiciais e dados do operador.',
};

export default function ContatoPage() {
  const op = getOperatorSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Início
        </Link>
        <h1 className="text-3xl font-black text-white">Canais de Contato e Identificação do Operador</h1>
        <p className="text-sm text-slate-400 mt-2">
          Informações institucionais e canais oficiais de comunicação da plataforma Conecta Móveis.
        </p>
      </div>

      {/* Identificação do Operador */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Building className="w-5 h-5 text-orange-400" />
          Dados da Empresa Operadora
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-400 font-semibold block">Razão Social:</span>
            <span className="text-white font-medium">{op.razaoSocial}</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-400 font-semibold block">CNPJ:</span>
            <span className={`font-mono font-medium ${op.isPending ? 'text-amber-400' : 'text-white'}`}>
              {op.cnpj}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-400 font-semibold block">Localidade da Operação:</span>
            <span className="text-white font-medium">{op.cidade} / {op.estado} — Brasil</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-400 font-semibold block">Natureza da Aplicação:</span>
            <span className="text-white font-medium">Provedor de aplicação de internet (Vitrine de divulgação)</span>
          </div>
        </div>

        {op.isPending && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Ambiente preliminar: Dados cadastrais formais de pessoa jurídica em homologação antes do lançamento definitivo.
            </span>
          </div>
        )}
      </div>

      {/* Canais Oficiais de Atendimento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Mail className="w-4 h-4 text-sky-400" />
            Atendimento Geral ao Usuário
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dúvidas sobre o funcionamento do catálogo, cadastro de profissionais e orientações de uso.
          </p>
          <a
            href={`mailto:${op.emailAtendimento}`}
            className="inline-block text-xs font-mono text-sky-400 hover:text-sky-300 underline"
          >
            {op.emailAtendimento}
          </a>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Shield className="w-4 h-4 text-emerald-400" />
            Canal de Titulares de Dados (LGPD)
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Solicitações sobre direitos de privacidade, confirmação de tratamento e exclusão de dados pessoais.
          </p>
          <a
            href={`mailto:${op.emailTitulares}`}
            className="inline-block text-xs font-mono text-emerald-400 hover:text-emerald-300 underline"
          >
            {op.emailTitulares}
          </a>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <FileText className="w-4 h-4 text-amber-400" />
            Canal de Notificação de Conteúdo
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Notificações extrajudiciais sobre violação de direitos autorais, imagem ou termos da plataforma.
          </p>
          <a
            href={`mailto:${op.emailNotificacoes}`}
            className="inline-block text-xs font-mono text-amber-400 hover:text-amber-300 underline"
          >
            {op.emailNotificacoes}
          </a>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Shield className="w-4 h-4 text-purple-400" />
            Canal de Autoridades Judiciais e Policiais
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Canal exclusivo para o recebimento de ofícios, intimações e ordens judiciais formais.
          </p>
          <a
            href={`mailto:${op.emailAutoridades}`}
            className="inline-block text-xs font-mono text-purple-400 hover:text-purple-300 underline"
          >
            {op.emailAutoridades}
          </a>
        </div>
      </div>
    </div>
  );
}

