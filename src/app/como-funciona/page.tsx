import { Metadata } from 'next';
import Link from 'next/link';
import {
  Search,
  UserCheck,
} from 'lucide-react';
import { BackButton } from '@/components/navigation/BackButton';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Alert } from '@/components/ui/Feedback';
import { ComoFuncionaOnboarding } from '@/components/onboarding/ComoFuncionaOnboarding';

export const metadata: Metadata = {
  title: 'Como Funciona | Vitrine Moveleira',
  description:
    'Entenda como funciona o Vitrine Moveleira para quem procura serviços e para quem anuncia montagem, marcenaria e projetos em Jundiaí e região.',
};

export default function ComoFuncionaPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Cabeçalho */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs items={[{ label: 'Como Funciona' }]} />
          <BackButton fallback="/" label="Voltar à tela anterior" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Como Funciona o Vitrine Moveleira
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
          Somos um catálogo aberto do polo moveleiro de Jundiaí e região. Conheça as duas formas de utilizar a plataforma.
        </p>
      </div>

      {/* Alerta de Função e Transparência */}
      <Alert type="legal">
        <strong className="text-white font-bold block mb-1">O que a plataforma faz e não faz:</strong>
        A Vitrine Moveleira oferece espaço de divulgação e catálogo aberto. Não intermediamos negócios, não somos empregadores, não cobramos comissão e não recebemos pagamentos por serviços. Valores, prazos e condições são combinados diretamente entre você e o profissional.
      </Alert>

      {/* Trilha 1: Para quem procura profissionais */}
      <section className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Search className="w-3.5 h-3.5" />
            <span>Trilha 1</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Para quem procura serviços moveleiros
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Como encontrar o montador, marceneiro ou projetista ideal para a sua necessidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-black">
              1
            </div>
            <h3 className="font-bold text-white text-base">Busque no catálogo</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Filtre por categoria (montagem, marcenaria sob medida, projeto 3D), especialidade e cidade de atuação na região.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center font-black">
              2
            </div>
            <h3 className="font-bold text-white text-base">Entre na sua conta gratuita</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para ver o botão de WhatsApp e falar com o profissional, entre na sua conta gratuita. Isso protege os profissionais contra mensagens indesejadas e spam.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black">
              3
            </div>
            <h3 className="font-bold text-white text-base">Negocie direto</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Converse pelo WhatsApp, tire dúvidas, peça orçamentos e combine prazos e pagamento sem taxas ou comissões.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Link
            href="/encontrar-profissionais"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition"
          >
            <span>Buscar profissionais agora</span>
          </Link>
          <ComoFuncionaOnboarding variant="track1" />
        </div>
      </section>

      {/* Trilha 2: Para quem anuncia */}
      <section className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Trilha 2</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Para quem anuncia seu trabalho
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Como montar sua vitrine e ser encontrado por clientes da região.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black">
              1
            </div>
            <h3 className="font-bold text-white text-base">Crie sua conta</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              O cadastro é rápido e gratuito no período de lançamento. Confirme seu e-mail para validar seu acesso.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
              2
            </div>
            <h3 className="font-bold text-white text-base">Publique seu anúncio</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Preencha sua bio, especialidades, cidades de atuação e envie fotos de apresentação dos seus trabalhos.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center font-black">
              3
            </div>
            <h3 className="font-bold text-white text-base">Receba contatos no WhatsApp</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Clientes interessados abrem conversa diretamente no seu WhatsApp para combinar os serviços.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Link
            href="/para-profissionais"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition"
          >
            <span>Ver detalhes para profissionais</span>
          </Link>
          <ComoFuncionaOnboarding variant="track2" />
          <Link
            href="/planos"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-xs transition"
          >
            <span>Conhecer os planos</span>
          </Link>
        </div>
      </section>

      {/* Caixa de Apresentação Reabrível */}
      <ComoFuncionaOnboarding variant="box" />

      {/* Caixa de Dúvidas e Links Úteis */}
      <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white">Ficou com alguma dúvida?</h3>
          <p className="text-xs text-slate-300">
            Consulte nossas dicas de segurança ou veja a declaração completa sobre o que a plataforma faz e não faz.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/contrate-com-seguranca"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition"
          >
            Dicas de segurança
          </Link>
          <Link
            href="/funcao-da-plataforma"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition"
          >
            Função da plataforma
          </Link>
        </div>
      </div>
    </div>
  );
}
