'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowUpRight, 
  ArrowRight, 
  Search, 
  Briefcase, 
  ShieldCheck, 
  MessageCircle, 
  Percent, 
  Camera, 
  MapPin, 
  Wrench, 
  Sparkles, 
  Box, 
  Hammer, 
  Ruler, 
  Lightbulb, 
  Bell, 
  ChevronDown, 
  Check, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Video 
} from 'lucide-react';

interface TabItem {
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  items: string[];
  ctaText: string;
  ctaLink: string;
}

const TAB_DATA: Record<string, TabItem> = {
  montagem: {
    title: 'Montagem e Desmontagem de Móveis',
    desc: 'Ideal para quem comprou móveis em sites ou lojas físicas e precisa de montagem qualificada no seu bairro.',
    icon: Wrench,
    color: 'text-orange-400',
    items: [
      'Móveis modulados de lojas ou internet',
      'Desmontagem e remontagem para mudança',
      'Regulagem de portas, gavetas e dobradiças',
      'Fixação de móveis em paredes com segurança',
    ],
    ctaText: 'Ver Montadores no Catálogo',
    ctaLink: '/servicos/montador-de-moveis/jundiai-sp',
  },
  marcenaria: {
    title: 'Marcenaria Sob Medida e Personalizada',
    desc: 'Para reformas e projetos onde cada centímetro precisa ser aproveitado com móveis sob medida.',
    icon: Hammer,
    color: 'text-amber-400',
    items: [
      'Cozinhas planejadas e armários sob medida',
      'Painéis de TV, ripados e nichos decorativos',
      'Armários para dormitórios e closets',
      'Móveis para banheiros e lavabos',
    ],
    ctaText: 'Ver Marceneiros no Catálogo',
    ctaLink: '/servicos/marceneiro/jundiai-sp',
  },
  lojas: {
    title: 'Lojas de Móveis Planejados & Showrooms',
    desc: 'Para quem quer mobiliar a residência inteira com assistência de lojas consolidadas e showrooms estruturados.',
    icon: Box,
    color: 'text-emerald-400',
    items: [
      'Projetos para residências completas',
      'Consultoria técnica de layout de ambientes',
      'Variedade de padrões de acabamentos e ferragens',
      'Atendimento presencial em showrooms locais',
    ],
    ctaText: 'Ver Lojas no Catálogo',
    ctaLink: '/servicos/loja-de-planejados/jundiai-sp',
  },
};

export default function ApresentacaoPage() {
  const [activeTab, setActiveTab] = useState<'montagem' | 'marcenaria' | 'lojas'>('montagem');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const currentTab = TAB_DATA[activeTab];

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && city) {
      setSubmitted(true);
      setEmail('');
      setCity('');
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 selection:bg-orange-500 selection:text-white pb-24 sm:pb-0">
      
      {/* NAVBAR DEDICADA */}
      <header className="sticky top-0 z-50 w-full bg-[#05070d]/90 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand/vitrine-moveleira-intro.svg"
              alt="Vitrine Moveleira"
              width={220}
              height={50}
              priority
              className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
            />
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <a href="#como-funciona" className="hidden md:inline-block text-xs font-bold text-slate-300 hover:text-white transition">
              Como Funciona
            </a>
            <a href="#interativo" className="hidden md:inline-block text-xs font-bold text-slate-300 hover:text-white transition">
              Simulador
            </a>
            <a href="#faq" className="text-xs font-bold text-slate-300 hover:text-white transition">
              Dúvidas
            </a>
          </div>
        </div>
      </header>

      {/* DOBRA 1: HERO SECTION VSL */}
      <section className="relative pt-10 pb-14 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8 z-10 text-center">
        
        {/* Badge Regional */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-orange-500/30 mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200">Catálogo Aberto para Consulta — Jundiaí e Região</span>
        </div>

        {/* Headline Principal Restaurada */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.12] max-w-5xl mx-auto mb-5 drop-shadow-[0_0_35px_rgba(255,107,0,0.35)]">
          O jeito inteligente de encontrar{' '}
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
            marceneiros e montadores
          </span>{' '}
          perto de você.
        </h1>

        {/* Sub-headline Restaurada */}
        <p className="text-sm sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8 font-normal">
          Sem intermediários cobrando comissões e sem formulários demorados. Veja fotos informadas pelos anunciantes, conheça os profissionais da sua cidade e converse{' '}
          <strong className="text-white font-bold">diretamente pelo WhatsApp</strong> com total liberdade.
        </p>

        {/* O VÍDEO CENTRALIZADO */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="mb-4">
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Como Funciona a Vitrine moveleira
            </h2>
          </div>

          <div className="glass-box-3d rounded-3xl p-2.5 sm:p-4 vsl-frame-led relative border border-orange-500/40 shadow-[0_0_45px_-5px_rgba(255,107,0,0.35)]">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-white/10 flex items-center justify-center">
              <video
                controls
                poster="/brand/vitrine-moveleira-cover.jpg"
                preload="metadata"
                className="w-full h-full object-cover rounded-xl"
              >
                <source src="/videos/vitrine-moveleira-apresentacao.mp4" type="video/mp4" />
                Seu navegador não suporta vídeos em HTML5.
              </video>
            </div>
          </div>
        </div>

        {/* CTAs APÓS O VÍDEO */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-6">
          <Link
            href="/encontrar-profissionais"
            className="btn-super-led w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2.5 shadow-xl"
          >
            <Search className="w-4 h-4" />
            <span>Consultar Anúncios no App</span>
          </Link>
          <Link
            href="/criar-conta"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl glass-box-3d border border-white/20 hover:border-orange-500/50 text-sm font-bold text-slate-200 hover:text-white transition flex items-center justify-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-orange-400" />
            <span>Divulgar Meus Serviços</span>
          </Link>
        </div>

        {/* ISENÇÃO TÉCNICA */}
        <div className="max-w-2xl mx-auto p-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-slate-400 flex items-center justify-center gap-2 mb-12">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Plataforma técnica de catálogo publicitário. A contratação, valores e prazos são acertados exclusivamente entre você e o profissional.</span>
        </div>

        {/* 4 CARDS 3D DE INDICADORES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto text-left">
          <div className="glass-box-3d p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">Canal Aberto</div>
              <div className="text-[11px] text-slate-400">WhatsApp direto</div>
            </div>
          </div>

          <div className="glass-box-3d p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Zero Comissão</div>
              <div className="text-[11px] text-slate-400">Sem taxas sobre serviço</div>
            </div>
          </div>

          <div className="glass-box-3d p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Portfólios Informados</div>
              <div className="text-[11px] text-slate-400">Fotos de trabalhos</div>
            </div>
          </div>

          <div className="glass-box-3d p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Foco Regional</div>
              <div className="text-[11px] text-slate-400">Jundiaí e Região</div>
            </div>
          </div>
        </div>
      </section>

      {/* DOBRA 2: SIMULADOR INTERATIVO */}
      <section id="interativo" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-2">Simulação Prática</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">Qual serviço você procura hoje?</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Toque em uma opção para ver como os anúncios são organizados no app:</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          {(['montagem', 'marcenaria', 'lojas'] as const).map((tab) => {
            const data = TAB_DATA[tab];
            const Icon = data.icon;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold glass-box-3d transition flex items-center gap-2 ${
                  isActive
                    ? 'border-orange-500 text-white shadow-[0_0_15px_rgba(255,107,0,0.3)] bg-orange-500/20'
                    : 'text-slate-300 border-white/10 hover:border-white/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${data.color}`} />
                <span>{tab === 'montagem' ? 'Montagem de Móveis' : tab === 'marcenaria' ? 'Marcenaria Sob Medida' : 'Lojas & Showrooms'}</span>
              </button>
            );
          })}
        </div>

        <div className="glass-box-3d rounded-3xl p-6 sm:p-8 border border-orange-500/30 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold ${currentTab.color}`}>
                <currentTab.icon className="w-4 h-4" />
                <span>Segmento em Destaque</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">{currentTab.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{currentTab.desc}</p>
              <Link
                href={currentTab.ctaLink}
                className="btn-super-led inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-black text-white"
              >
                <span>{currentTab.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Serviços comuns cadastrados:</div>
              <ul className="space-y-2.5">
                {currentTab.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
                    <Check className={`w-4 h-4 ${currentTab.color} shrink-0`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DOBRA 3: O QUE É VS O QUE NÃO É */}
      <section id="como-funciona" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-2">Transparência Radical</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">Divisão clara de papéis e responsabilidades</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Respeitamos o Marco Civil da Internet e a legislação vigente. Conheça com precisão o nosso papel:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* O QUE É */}
          <div className="glass-box-3d p-6 sm:p-8 rounded-3xl border border-emerald-500/30">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">Função do Catálogo</h3>
            </div>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Catálogo de Publicidade Digital:</strong> Canal temático regional para que profissionais divulguem seus serviços.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Acesso Aberto e Gratuito:</strong> Qualquer pessoa pesquisa por categorias e vê contatos sem taxas.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Canal Direto no WhatsApp:</strong> Conversa no número fornecido diretamente por cada anunciante.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Privacidade e LGPD:</strong> Não comercializamos cadastros e respeitamos a legislação brasileira.</span>
              </li>
            </ul>
          </div>

          {/* O QUE NÃO É */}
          <div className="glass-box-3d p-6 sm:p-8 rounded-3xl border border-rose-500/30">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">Isenções e Ausência de Vínculo</h3>
            </div>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
              <li className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Sem vínculo de emprego ou sociedade:</strong> Os anunciantes atuam de forma totalmente autônoma.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">A plataforma não oferece garantia:</strong> Não fiscalizamos serviços e não garantimos prazos ou qualidade técnica.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Zero intermediação financeira:</strong> Pagamentos, recibos e sinais são combinados diretamente entre as partes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Não representamos endosso:</strong> A decisão e conferência de referências cabem exclusivamente ao cliente.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* DOBRA 4: ESPECIALIDADES OFICIAIS DO CATÁLOGO */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-1">Categorias Oficiais</span>
            <h2 className="text-xl sm:text-3xl font-black text-white">Segmentos Atendidos na Vitrine</h2>
          </div>
          <span className="text-xs text-slate-400 block sm:hidden">Deslize para o lado 👉</span>
        </div>

        <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          <div className="w-[85%] sm:w-auto shrink-0 glass-box-3d rounded-2xl p-5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center mb-3 border border-orange-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-white mb-1.5">Montadores de Móveis</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">Montagem de móveis convencionais, modulados comprados pela internet e desmontagens para mudança.</p>
            <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/25">Guarda-roupas • Cozinhas • Camas</span>
          </div>

          <div className="w-[85%] sm:w-auto shrink-0 glass-box-3d rounded-2xl p-5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-white mb-1.5">Marceneiros Autônomos</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">Móveis sob medida, adaptações de marcenaria, painéis ripados, banheiros e reformas.</p>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">Cozinhas • Closets • Ripados</span>
          </div>

          <div className="w-[85%] sm:w-auto shrink-0 glass-box-3d rounded-2xl p-5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/30">
              <Box className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-white mb-1.5">Lojas de Planejados</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">Showrooms e empresas especializadas para mobiliar residências inteiras e ambientes corporativos.</p>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">Ambientes Completos • Showrooms</span>
          </div>

          <div className="w-[85%] sm:w-auto shrink-0 glass-box-3d rounded-2xl p-5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-3 border border-purple-500/30">
              <Hammer className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-white mb-1.5">Marcenarias e Fábricas</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">Fábricas de médio e grande porte com centro de usinagem CNC, corte e borda de chapas em volume.</p>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/25">Usinagem CNC • Lotes • Estruturas</span>
          </div>

          <div className="w-[85%] sm:w-auto shrink-0 glass-box-3d rounded-2xl p-5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-3 border border-sky-500/30">
              <Ruler className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-white mb-1.5">Projetistas 3D & Promob</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">Desenhos técnicos, renderizações 3D realistas e detalhamento para produção moveleira.</p>
            <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/25">Projetos 3D • Render • Plantas</span>
          </div>

          <div className="w-[85%] sm:w-auto shrink-0 glass-box-3d rounded-2xl p-5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/15 text-yellow-400 flex items-center justify-center mb-3 border border-yellow-500/30">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-white mb-1.5">Parceiros Complementares</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">Fitas LED para móveis, serralheria fina, vidraçaria, espelhos, transporte e serviços integrados.</p>
            <span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/25">Fita LED • Vidros • Serralheria</span>
          </div>
        </div>
      </section>

      {/* DOBRA 5: CAPTURA ESTRATÉGICA DE LEADS */}
      <section id="captura-lead" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10">
        <div className="glass-box-3d rounded-3xl p-6 sm:p-10 border border-orange-500/40 relative overflow-hidden text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4 border border-orange-500/30 shadow-inner">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-white mb-2">
            Não encontrou profissional no seu bairro ou cidade?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed mb-6">
            Cadastre seu e-mail e cidade. Enviaremos um aviso assim que novos montadores ou marceneiros anunciarem na sua área.
          </p>

          <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="w-full sm:flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition shadow-inner"
            />
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Sua cidade (ex: Jundiaí)"
              className="w-full sm:w-44 bg-black/50 border border-white/20 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition shadow-inner"
            />
            <button
              type="submit"
              className="btn-super-led w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white shrink-0"
            >
              Avise-me
            </button>
          </form>

          {submitted && (
            <div className="text-xs text-emerald-400 font-bold mt-4 animate-fade-in">
              ✓ E-mail registrado com sucesso! Você será avisado quando houver novos anúncios.
            </div>
          )}
          <p className="text-[11px] text-slate-500 mt-3">
            Zero spam. Usado exclusivamente para avisos da plataforma de acordo com a LGPD.
          </p>
        </div>
      </section>

      {/* DOBRA 6: PERGUNTAS FREQUENTES */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-2">Esclarecimentos Detalhados</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">Dúvidas Frequentes</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Toque em cada pergunta para abrir a explicação completa:</p>
        </div>

        <div className="space-y-3.5">
          <details className="glass-box-3d rounded-2xl p-4 sm:p-5 border border-white/10 group cursor-pointer" open>
            <summary className="text-xs sm:text-sm font-bold text-white flex items-center justify-between list-none">
              <span>1. O visitante paga alguma coisa para consultar os contatos?</span>
              <ChevronDown className="w-4 h-4 text-orange-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              Não. A consulta aos anúncios no catálogo é totalmente gratuita. Você pesquisa por categoria, filtra pela sua cidade e clica para conversar diretamente pelo WhatsApp informado pelo anunciante sem pagar nada à plataforma.
            </p>
          </details>

          <details className="glass-box-3d rounded-2xl p-4 sm:p-5 border border-white/10 group cursor-pointer">
            <summary className="text-xs sm:text-sm font-bold text-white flex items-center justify-between list-none">
              <span>2. A Vitrine Moveleira oferece garantia sobre os serviços anunciados?</span>
              <ChevronDown className="w-4 h-4 text-orange-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              Não. A Vitrine Moveleira atua exclusivamente como catálogo publicitário digital. A plataforma não executa serviços, não fiscaliza montagens e não garante prazos ou qualidade de execução. Todas as condições e orçamentos devem ser ajustados por escrito diretamente entre contratante e prestador.
            </p>
          </details>

          <details className="glass-box-3d rounded-2xl p-4 sm:p-5 border border-white/10 group cursor-pointer">
            <summary className="text-xs sm:text-sm font-bold text-white flex items-center justify-between list-none">
              <span>3. A plataforma cobra comissões dos profissionais sobre os serviços fechados?</span>
              <ChevronDown className="w-4 h-4 text-orange-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              Não cobramos comissões por serviços fechados. O montante acordado entre cliente e anunciante pertence inteiramente ao profissional autônomo ou empresa cadastrada.
            </p>
          </details>

          <details className="glass-box-3d rounded-2xl p-4 sm:p-5 border border-white/10 group cursor-pointer">
            <summary className="text-xs sm:text-sm font-bold text-white flex items-center justify-between list-none">
              <span>4. Como os pagamentos são realizados? O dinheiro passa pelo site?</span>
              <ChevronDown className="w-4 h-4 text-orange-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              Nenhum valor passa pela Vitrine Moveleira. A plataforma não possui custódia financeira e não processa pagamentos de mão de obra. As formas de pagamento são combinadas diretamente entre você e o profissional.
            </p>
          </details>

          <details className="glass-box-3d rounded-2xl p-4 sm:p-5 border-white/10 group cursor-pointer">
            <summary className="text-xs sm:text-sm font-bold text-white flex items-center justify-between list-none">
              <span>5. Quais cuidados o cliente deve tomar ao acertar um serviço?</span>
              <ChevronDown className="w-4 h-4 text-orange-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              É prudente solicitar fotos de trabalhos anteriores, alinhar formalmente por escrito o escopo do serviço (materiais, ferragens, medidas, datas de entrega) e solicitar recibos ou contratos de prestação de serviços.
            </p>
          </details>

          <details className="glass-box-3d rounded-2xl p-4 sm:p-5 border-white/10 group cursor-pointer">
            <summary className="text-xs sm:text-sm font-bold text-white flex items-center justify-between list-none">
              <span>6. Como um profissional ou empresa pode divulgar no catálogo?</span>
              <ChevronDown className="w-4 h-4 text-orange-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              Basta acessar a opção &quot;Divulgar Meus Serviços&quot; no app, preencher seus dados, cadastrar sua apresentação, selecionar suas categorias e cidades de atendimento e incluir fotos de seus trabalhos. Seu anúncio fica disponível para consulta pública.
            </p>
          </details>
        </div>
      </section>

      {/* DOBRA 7: RODAPÉ */}
      <footer className="border-t border-white/10 py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 text-center">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center p-2 mx-auto shadow-lg shadow-orange-500/30">
            <Image
              src="/brand/vitrine-moveleira-icone.png"
              alt="Ícone Vitrine Moveleira"
              width={56}
              height={56}
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-white">
            Acesse a Vitrine Moveleira
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Catálogo técnico regional para o setor moveleiro de Jundiaí e região.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="btn-super-led inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-xs sm:text-sm font-black text-white"
            >
              <span>Entrar no Catálogo Agora</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="text-[11px] text-slate-500 pt-6 border-t border-white/5 space-y-1.5">
            <p>A Vitrine Moveleira é um catálogo de publicidade independente. Não presta serviços, não emprega os anunciantes e não atua como fiadora ou garantidora de negócios particulares.</p>
            <p>© 2026 Vitrine Moveleira. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* BARRA FIXA MOBILE */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-[#05070d]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl flex items-center gap-2.5">
        <Link
          href="/encontrar-profissionais"
          className="btn-super-led flex-1 py-3 px-3 rounded-xl text-xs font-black text-white text-center flex items-center justify-center gap-1.5 shadow-lg"
        >
          <Search className="w-4 h-4" />
          <span>Buscar Anúncios no App</span>
        </Link>
        <Link
          href="/criar-conta"
          className="glass-box-3d py-3 px-3 rounded-xl text-xs font-bold text-slate-300 text-center flex items-center justify-center gap-1.5 border border-white/20"
        >
          <Briefcase className="w-4 h-4 text-orange-400" />
          <span>Anunciar</span>
        </Link>
      </div>

    </div>
  );
}
