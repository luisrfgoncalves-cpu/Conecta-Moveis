import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

export default function PrivacidadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-3">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Início
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Política de Privacidade e LGPD
        </h1>
        <p className="text-xs text-orange-400 font-semibold uppercase tracking-wider">
          Em conformidade com a Lei nº 13.709/2018 (LGPD)
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 text-sm text-slate-200 leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-sky-400" />
            1. Coleta Mínima de Dados
          </h2>
          <p>
            Coletamos apenas os dados essenciais para o funcionamento do catálogo. Não solicitamos dados sensíveis, números de documentos obrigatórios desnecessários ou endereço residencial de consumidores no cadastro.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-sky-400" />
            2. Ciclo de Vida e Descarte de Mensagens (90 Dias)
          </h2>
          <p>
            As mensagens e solicitações de contato enviadas através da plataforma são retidas pelo período de 90 dias para permitir o histórico de negociação e eventual direito de avaliação, sendo excluídas de forma automatizada e definitiva após esse prazo.
          </p>
        </div>
      </div>
    </div>
  );
}
