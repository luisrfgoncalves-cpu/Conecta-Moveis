import { Hero } from '@/components/ui/Hero';
import { SearchBox } from '@/components/ui/SearchBox';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Feedback';
import { FaqSection } from '@/components/ui/FaqSection';
import { ProCtaSection } from '@/components/ui/ProCtaSection';
import { Sparkles, Layers, ShieldCheck, ArrowRight, Zap, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="w-full space-y-20 pb-24">
      {/* Hero Principal com Luzes Neon */}
      <Hero />

      {/* Caixa de Busca com Pílulas Rápidas e Efeito Glass Flutuante */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
        <SearchBox />
      </div>

      {/* Barra de Métricas em Tempo Real do Polo Moveleiro com Alto Contraste */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-5 sm:p-7 grid grid-cols-1 sm:grid-cols-3 gap-6 border border-white/15 text-center sm:text-left shadow-xl">
          <div className="flex items-center gap-4 sm:border-r sm:border-white/15 sm:pr-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">+120 Profissionais</div>
              <div className="text-xs text-slate-200 font-medium">Em Jundiaí e cidades do entorno</div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:border-r sm:border-white/15 sm:px-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">Zero Taxa</div>
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

      {/* Aviso Institucional e Legal Transparente com Leitura Cristalina */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Alert type="legal">
          <strong className="text-white font-extrabold text-sm block mb-1.5">Aviso Institucional de Segurança e LGPD:</strong>
          <span className="text-slate-200 font-normal">
            Este catálogo é publicado diretamente pelos profissionais e empresas parceiras. A plataforma não atua como prestadora nem garantidora de montagens, fabricações ou orçamentos. A negociação e a contratação são 100% livres e diretas entre você e o profissional.
          </span>
        </Alert>
      </div>

      {/* Vitrine Estilo Streaming / Fileira 1: Montagem e Marcenaria */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/15 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-400 mb-1.5">
              <Sparkles className="w-4 h-4" />
              Vitrine em Destaque
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Especialistas em Evidência em Jundiaí/SP
            </h2>
            <p className="text-sm text-slate-200 mt-1">
              Portfólios com acabamento profissional e perfis catalogados na região.
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

        {/* Grade com Informações Humanizadas e Botão Direto de WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="Montagem Especializada de Cozinha Planejada e Iluminação"
            professionalName="Carlos Silva • Montador Autônomo"
            category="Montador de Móveis"
            location="Jundiaí - SP (Vila Arens e Centro)"
            imageUrl="/images/portfolio-cozinha.svg"
            experience="Responde em até 1 hora"
            tags={['Cozinhas', 'Ferragens Blum', 'LED Embutido']}
            isDemo={true}
          />
          <Card
            title="Marcenaria Fina: Dormitórios, Closets e Painéis Ripados"
            professionalName="Marcenaria Oliveira & Design"
            category="Marceneiro"
            location="Jundiaí - SP (Eloy Chaves e Medeiros)"
            imageUrl="/images/portfolio-closet.svg"
            experience="12 anos de atuação"
            tags={['Closets', 'Portas Reflecta', 'Ripados']}
            isDemo={true}
          />
          <Card
            title="Painéis de Home Theater em Grande Formato com Marmorato"
            professionalName="Studio Móveis Jundiaí"
            category="Marcenaria & Projetos"
            location="Jundiaí e Itupeva - SP"
            imageUrl="/images/portfolio-painel.svg"
            experience="Atendimento presencial"
            tags={['Painéis TV', 'Marmorato', 'Fita LED']}
            isDemo={true}
          />
        </div>
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
              <h3 className="font-extrabold text-white text-lg">Catálogo Visual</h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Fotos de serviços reais aprovadas manualmente, permitindo avaliar a precisão e o acabamento dos profissionais.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg">Transparência Total</h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Sem depoimentos fakes ou notas manipuladas. Avaliações com base em contato prévio de verdade.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg">Livre de Comissões</h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Nenhum percentual ou porcentagem é retido sobre o trabalho executado pelos prestadores de serviço.
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
