import { Metadata } from 'next';
import Link from 'next/link';
import {
  Wrench,
  Sparkles,
  MessageSquare,
  FileCheck,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { BackButton } from '@/components/navigation/BackButton';
import { Alert } from '@/components/ui/Feedback';

export const metadata: Metadata = {
  title: 'Divulgue seu Trabalho | Para Profissionais | Conecta Móveis',
  description:
    'Publique seu perfil profissional e fotos de apresentação no catálogo do polo moveleiro de Jundiaí e região. Cadastro gratuito no período de lançamento.',
};

export default function ParaProfissionaisPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Navegação Topo */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs items={[{ label: 'Para Profissionais' }]} />
          <BackButton fallback="/" label="Voltar à tela anterior" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Wrench className="w-3.5 h-3.5" />
            <span>Espaço para quem anuncia</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Divulgue seus serviços em Jundiaí e região
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Uma vitrine digital dedicada ao setor moveleiro para você publicar suas fotos de apresentação, informar suas especialidades e receber contatos diretos no seu WhatsApp.
          </p>
        </div>
      </div>

      {/* Aviso Legal de Função */}
      <Alert type="legal">
        <strong className="text-white font-bold block mb-1">O que a plataforma faz e não faz:</strong>
        A Conecta Móveis oferece espaço de divulgação e catálogo aberto. Não intermediamos negócios, não prometemos clientes ou resultados financeiros e não participamos de orçamentos, contratos ou pagamentos. Os valores acordados são 100% seus.
      </Alert>

      {/* Benefícios Reais e Já Existentes */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          O que você tem na plataforma hoje
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Contato direto no WhatsApp</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Quem visita seu perfil e está autenticado pode abrir conversa diretamente no seu número de WhatsApp cadastrado.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Sem comissão sobre serviços</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Não cobramos porcentagem nem taxa sobre nenhum serviço fechado. O pagamento combinado com o cliente é integralmente seu.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Fotos de apresentação</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Publique fotos de trabalhos realizados para que quem procura possa conhecer suas especialidades com clareza.
            </p>
          </div>
        </div>
      </section>

      {/* Passo a Passo Simples do Cadastro */}
      <section className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Como começar em 3 passos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-black text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="text-sm font-bold text-white">Crie sua conta</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cadastre-se com seu e-mail e confirme o endereço para proteger seu acesso.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-black text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="text-sm font-bold text-white">Monte seu anúncio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Preencha sua bio, categoria, especialidades, cidade de atuação e envie suas fotos de apresentação.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-black text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="text-sm font-bold text-white">Fique visível</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seu perfil fica visível nas buscas de quem procura serviços na sua cidade e região.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            Cadastro gratuito no período de lançamento. Mudanças de planos e preços serão comunicadas com antecedência.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/planos"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition text-center"
            >
              Conhecer planos
            </Link>
            <Link
              href="/criar-conta"
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition text-center"
            >
              Criar conta agora
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
