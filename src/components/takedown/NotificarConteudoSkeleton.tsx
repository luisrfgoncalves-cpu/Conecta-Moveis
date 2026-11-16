import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function NotificarConteudoSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8" aria-busy="true">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Início
        </Link>
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <Shield className="w-7 h-7 text-orange-400" />
          Notificação e Retirada de Conteúdo
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Canal oficial para apontar conteúdos em desacordo com direitos autorais, imagem, honra ou termos de uso.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Categoria da Infração
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-slate-400 text-xs">
              Direitos Autorais ou Foto Copiada sem Autorização
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Seu Nome Completo
              </label>
              <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-slate-500 text-xs">
                Nome do notificante ou procurador
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Seu E-mail de Contato
              </label>
              <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-slate-500 text-xs">
                email@exemplo.com
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Descrição dos Fatos e Justificativa
            </label>
            <div className="w-full h-24 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-slate-500 text-xs">
              Explique detalhadamente por que este conteúdo viola seus direitos ou as regras da plataforma...
            </div>
          </div>
        </div>

        <div className="w-full py-3 px-4 rounded-xl bg-orange-500/50 text-white font-bold text-xs uppercase tracking-wider text-center cursor-not-allowed">
          Enviar Notificação Formal
        </div>
      </div>
    </div>
  );
}
