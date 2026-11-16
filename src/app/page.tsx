import { Hero } from '@/components/ui/Hero';
import { SearchBox } from '@/components/ui/SearchBox';
import { Alert } from '@/components/ui/Feedback';
import { FaqSection } from '@/components/ui/FaqSection';
import { ProCtaSection } from '@/components/ui/ProCtaSection';
import { Sparkles, Layers, ShieldCheck, ArrowRight, Zap, Users, MessageSquare, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { getShowcaseData } from '@/lib/search/actions';
import { getSystemSettingValue } from '@/lib/config/actions';
import { ProfessionalCard } from '@/components/search/ProfessionalCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [{ totalCount, profiles }, showPublicCounter, minPublicCounter] = await Promise.all([
    getShowcaseData(),
    getSystemSettingValue<boolean>('show_public_counter'),
    getSystemSettingValue<number>('min_public_counter'),
  ]);

  const shouldShowCounter = Boolean(
    showPublicCounter && totalCount >= (minPublicCounter ?? 20)
  );

  return (
    <div className="w-full space-y-12 sm:space-y-16 pb-24">
      {/* Hero Principal com H1 e Subtítulo de Alta Conversão */}
      <Hero />

      {/* Caixa de Busca Imediata com 'O que você procura', 'Cidade ou bairro' e Acesso Rápido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-20">
        <SearchBox />
      </div>

      {/* Aviso da Plataforma reposicionado de forma elegante e não intrusiva */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Alert type="legal">
          <strong className="text-white font-extrabold text-xs block mb-1">Aviso da plataforma:</strong>
          <span className="text-slate-200 text-xs font-normal">
            Este catálogo é publicado diretamente pelos anunciantes. A plataforma não participa das negociações, orçamentos ou pagamentos, e não garante a execução dos serviços.
          </span>
        </Alert>
      </div>

      {/* Barra de Métricas Reais do Polo Moveleiro */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`glass-panel rounded-2xl p-5 sm:p-7 grid grid-cols-1 ${shouldShowCounter ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-6 border border-white/15 text-center sm:text-left shadow-xl`}>
          {shouldShowCounter && (
            <div className="flex items-center gap-4 sm:border-r sm:border-white/15 sm:pr-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{totalCount} Profissionais</div>
                <div className="text-xs text-slate-200 font-medium">Cadastrados em Jundiaí e região</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 sm:border-r sm:border-white/15 sm:px-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">Sem comissão</div>
              <div className="text-xs text-slate-200 font-medium">Sem comissão sobre serviços prestados</div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">WhatsApp Direto</div>
              <div className="text-xs text-slate-200 font-medium">Contato rápido sem burocracia</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vitrine Estilo Streaming / Perfis em Exibição */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/15 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-400 mb-1.5">
              <Sparkles className="w-4 h-4" />
              Vitrine em Destaque
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Perfis em exibição
            </h2>
            <p className="text-sm text-slate-200 mt-1">
              Fotos de apresentação e profissionais cadastrados na região.
            </p>
          </div>

          <Link
            href="/encontrar-profissionais"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-400 hover:text-orange-300 transition"
          >
            <span>Explorar catálogo completo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grade de Perfis Reais ou Estado Vazio Honesto */}
        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((prof) => (
              <ProfessionalCard key={prof.id} professional={prof} />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-bold text-white">
                Os primeiros perfis estão chegando
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Seja um dos primeiros a publicar o seu perfil e divulgar seu trabalho em Jundiaí e região.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/criar-conta"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-neon text-xs font-black uppercase tracking-wider shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publicar Meu Perfil</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Seção CTA para Atrair Novos Profissionais (Two-Sided Marketplace) */}
      <ProCtaSection />

      {/* Faixa de Pilares da Plataforma com Texto Branco Nítido */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-white/15">
          <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg">Regras públicas</h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Fotos publicadas pelos anunciantes e analisadas quanto às regras da plataforma.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg">Direto no WhatsApp</h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Contato rápido e direto entre quem procura e os profissionais para orçamentos independentes.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg">Livre de Comissões</h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                A plataforma não recebe pagamento pelos serviços e não cobra comissão sobre eles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Interativa de Perguntas Frequentes (FAQ) */}
      <FaqSection />
    </div>
  );
}
