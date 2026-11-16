'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
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
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

export default function ApresentacaoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ctaRevealed, setCtaRevealed] = useState(false);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const revealCta = () => {
    setCtaRevealed(true);
  };

  const handleVideoProgress = () => {
    if (videoRef.current && videoRef.current.duration) {
      if (
        videoRef.current.currentTime / videoRef.current.duration >= 0.8 ||
        videoRef.current.currentTime >= 45
      ) {
        revealCta();
      }
    }
  };

  const handleVideoEnded = () => {
    revealCta();
    const cta = document.getElementById('cta-container');
    if (cta) {
      cta.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350 && !ctaRevealed) {
        revealCta();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ctaRevealed]);

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
      
      {/* DOBRA 1: HERO VSL (SEM BARRA FIXA, APENAS O VÍDEO E O SUPER BOTÃO DISPARADO) */}
      <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-8 z-10 text-center">
        
        {/* Topo Integrado: Logo original à esquerda sem barra fixa */}
        <div className="max-w-6xl mx-auto flex items-center justify-between mb-8 sm:mb-12">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
            <Image
              src="/brand/vitrine-moveleira-intro.svg"
              alt="Vitrine Moveleira"
              width={220}
              height={50}
              priority
              className="h-11 sm:h-16 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
            />
          </Link>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/50 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-200">Jundiaí e Região</span>
          </div>
        </div>

        {/* Headline Principal Restaurada */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.12] max-w-5xl mx-auto mb-5 drop-shadow-[0_0_35px_rgba(255,107,0,0.35)]">
          O jeito inteligente de encontrar{' '}
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
            marceneiros e montadores
          </span>{' '}
          perto de você.
        </h1>

        {/* Sub-headline */}
        <p className="text-sm sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8 font-normal">
          Sem intermediários cobrando comissões e sem formulários demorados. Veja fotos informadas pelos anunciantes, conheça os profissionais da sua cidade e converse{' '}
          <strong className="text-white font-bold">diretamente pelo WhatsApp</strong> com total liberdade.
        </p>

        {/* O VÍDEO CENTRALIZADO COM PROPORÇÃO VERTICAL NATIVA */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="mb-3">
            <h2 className="text-base sm:text-xl font-bold text-slate-200 tracking-tight">
              Como Funciona a Vitrine moveleira
            </h2>
          </div>

          <div className="card-3d-led rounded-3xl p-2 sm:p-4 vsl-frame-led relative border-2 border-orange-500/60 shadow-[0_0_45px_-5px_rgba(255,107,0,0.45)]">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-white/10 flex items-center justify-center">
              <video
                ref={videoRef}
                controls
                playsInline
                poster="/brand/vitrine-moveleira-cover.jpg"
                preload="metadata"
                className="w-full h-full object-contain rounded-xl"
                onTimeUpdate={handleVideoProgress}
                onEnded={handleVideoEnded}
              >
                <source src="/videos/vitrine-moveleira-apresentacao.mp4" type="video/mp4" />
                Seu navegador não suporta vídeos em HTML5.
              </video>
            </div>
          </div>
        </div>

        {/* BOTÃO ÚNICO DISPARADO: CANTOS ARREDONDADOS E TEXTO OBJETIVO */}
        <div 
          id="cta-container" 
          className={`max-w-md mx-auto mb-8 transition-all duration-700 ease-out ${
            ctaRevealed 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-6 pointer-events-none'
          }`}
        >
          <Link
            href="/encontrar-profissionais"
            className="btn-super-led-pulsing w-full py-4 sm:py-5 px-8 text-base sm:text-lg font-black text-white flex items-center justify-center gap-3 tracking-wide cursor-pointer shadow-2xl"
          >
            <span>Conhecer a Vitrine Moveleira</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* DOBRA 2: DORES REAIS COM FOTOS FOTOGRÁFICAS E CARDS 3D ROXOS VIVOS */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-black text-purple-400 uppercase tracking-widest block mb-2">A Realidade do Mercado</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
            As dificuldades reais na hora de planejar, montar ou divulgar serviços
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Problemas comuns que clientes e profissionais autônomos enfrentam no dia a dia:
          </p>
        </div>

        {/* Grid de 2 Dores (empilhado com clareza em coluna no celular, 2 colunas no PC) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Dor do Cliente com Imagem Real */}
          <div className="card-pain-3d p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="rounded-2xl overflow-hidden border border-white/20 mb-5 relative aspect-[16/10] shadow-inner">
                <Image
                  src="/images/apresentacao/dor-cliente.jpg"
                  alt="Casal com planta no apartamento vazio querendo móveis planejados"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-black text-white mb-4">Para Quem Precisa de Móveis ou Montagem</h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Ficar refém de indicações de terceiros:</strong> Ter que pedir contato em grupos de condomínio ou amigos sem saber se a pessoa é experiente no que você precisa.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Não saber onde procurar profissionais da cidade:</strong> Dificuldade em achar profissionais atuantes que atendam especificamente o seu bairro em Jundiaí e região.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Não conhecer a especialidade e fotos de serviços:</strong> Precisar solicitar orçamentos sem poder ver fotos reais de trabalhos concluídos anteriormente.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Falta de atendimento direto:</strong> Ter que passar por formulários complexos em vez de conversar direto pelo WhatsApp no número do profissional.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card Dor do Profissional com Imagem Real */}
          <div className="card-pain-3d p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="rounded-2xl overflow-hidden border border-white/20 mb-5 relative aspect-[16/10] shadow-inner">
                <Image
                  src="/images/apresentacao/dor-profissional.jpg"
                  alt="Marceneiro moderno em oficina com MDF olhando celular"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-black text-white mb-4">Para Marceneiros e Montadores Autônomos</h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Depender apenas de indicações e do boca a boca:</strong> Enfrentar semanas sem serviços novos por não ter uma vitrine digital própria no ar.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Não saber como anunciar ou gastar caro em anúncios:</strong> Pagar valores elevados no Facebook e depender de terceiros para configurar campanhas que nem sempre trazem clientes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Não ser conhecido na própria região:</strong> Dificuldade para alcançar moradores locais que estão se mudando ou reformando casas e apartamentos na sua cidade.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Pagar altas comissões sobre o trabalho:</strong> Ter parte da mão de obra retida por aplicativos intermediários para poder pegar serviços.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Falta de contatos parceiros para atender demandas:</strong> Não ter uma rede acessível de outros montadores, marceneiros e parceiros para indicar ou trocar suporte.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DOBRA 3: SOLUÇÕES E BENEFÍCIOS REAIS DO APP COM FOTOS AMBIENTADAS */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-black text-orange-400 uppercase tracking-widest block mb-2">A Proposta da Plataforma</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
            O que o app da Vitrine Moveleira realmente entrega
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Benefícios práticos criados especificamente para a região de Jundiaí e cidades vizinhas:
          </p>
        </div>

        {/* 4 Pilares Reais com Relevo 3D e Borda LED (Grid 1 coluna no mobile, 2 no tablet, 4 no desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left mb-12">
          <div className="card-3d-led p-5">
            <div className="w-11 h-11 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/40">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-white mb-1.5">WhatsApp Direto</h4>
            <p className="text-xs text-slate-300 leading-relaxed">Clique para abrir a conversa diretamente no WhatsApp informado pelo anunciante, sem formulários intermediários.</p>
          </div>

          <div className="card-3d-led p-5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/40">
              <Percent className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-white mb-1.5">Sem Taxa por Serviço</h4>
            <p className="text-xs text-slate-300 leading-relaxed">A plataforma não retém comissão sobre serviços fechados. O acerto é 100% direto entre as partes.</p>
          </div>

          <div className="card-3d-led p-5">
            <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/40">
              <Camera className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-white mb-1.5">Fotos dos Anunciantes</h4>
            <p className="text-xs text-slate-300 leading-relaxed">Espaço dedicado para que cada profissional apresente suas próprias fotos de montagens e móveis realizados.</p>
          </div>

          <div className="card-3d-led p-5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/40">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-white mb-1.5">Foco Regional</h4>
            <p className="text-xs text-slate-300 leading-relaxed">Filtros por categorias e cidades para encontrar profissionais que realmente atendem o seu bairro.</p>
          </div>
        </div>

        {/* 2 Cards de Soluções com Escopo Técnico Completo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card-3d-led p-6 flex flex-col justify-between">
            <div>
              <div className="rounded-2xl overflow-hidden border border-white/20 mb-5 relative aspect-[16/10]">
                <Image
                  src="/images/apresentacao/solucao-montagem.jpg"
                  alt="Montador profissional alinhando armário planejado com precisão"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Montagem e Ajustes de Móveis</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Encontre profissionais capacitados para montagem e desmontagem de móveis convencionais, modulados comprados pela internet ou em lojas, móveis planejados e projetos sob medida, incluindo regulagem precisa de dobradiças, gavetas e fixações seguras.
              </p>
            </div>
            <Link href="/servicos/montador-de-moveis/jundiai-sp" className="inline-flex items-center gap-2 text-xs font-bold text-orange-400 hover:text-orange-300 transition">
              <span>Ver montadores no catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="card-3d-led p-6 flex flex-col justify-between">
            <div>
              <div className="rounded-2xl overflow-hidden border border-white/20 mb-5 relative aspect-[16/10]">
                <Image
                  src="/images/apresentacao/solucao-projetista.jpg"
                  alt="Projetista moveleiro desenvolvendo layout 3D de ambientes planejados"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Projetos de Móveis e Ambientes Planejados</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Conecte-se com profissionais e marceneiros dedicados ao atendimento personalizado de ambientes planejados e otimização de espaços para residências e apartamentos, com paginação em desenhos 3D para facilitar a visualização e montagem.
              </p>
            </div>
            <Link href="/servicos/marceneiro/jundiai-sp" className="inline-flex items-center gap-2 text-xs font-bold text-orange-400 hover:text-orange-300 transition">
              <span>Ver marceneiros no catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* DOBRA 4: CATEGORIAS OFICIAIS DO CATÁLOGO (SEM CARROSSEL: GRADE DIRETA E VISÍVEL NO CELULAR) */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center sm:text-left mb-8">
          <span className="text-xs font-black text-purple-400 uppercase tracking-widest block mb-1">Categorias Oficiais</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">Segmentos Disponíveis no App</h2>
        </div>

        {/* Grade 1 coluna no celular, 2 colunas no tablet, 3 colunas no PC (SEM CARROSSEL) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="card-3d-led p-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/40">
              <Wrench className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">Montador de Móveis</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">Montagem e desmontagem de móveis convencionais, modulados e suporte a planejados.</p>
            <span className="text-[11px] font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/30">Convencionais • Modulados • Planejados</span>
          </div>

          <div className="card-3d-led p-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/40">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">Marceneiro (Autônomo)</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">Marcenaria fina, móveis sob medida e adaptações.</p>
            <span className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/30">Cozinhas Sob Medida • Painéis • Closets</span>
          </div>

          <div className="card-3d-led p-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/40">
              <Box className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">Loja de Planejados</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">Showrooms e comércio de mobiliário planejado residencial e corporativo.</p>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">Ambientes Completos • Showrooms</span>
          </div>

          <div className="card-3d-led p-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/40">
              <Hammer className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">Marcenaria e Fábrica</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">Fábricas e oficinas com usinagem por CNC, corte e fita de borda.</p>
            <span className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/30">Corte CNC • Grandes Lotes • Chapas</span>
          </div>

          <div className="card-3d-led p-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4 border border-sky-500/40">
              <Ruler className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">Projetista</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">Projetos de móveis, visualização 3D de ambientes e detalhamento técnico para produção.</p>
            <span className="text-[11px] font-bold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-lg border border-sky-500/30">Promob • Render 3D • Planta Técnica</span>
          </div>

          <div className="card-3d-led p-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/40">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">Parceiros Complementares</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">Eletricistas para iluminação LED, serralheiros, vidraceiros e serviços de apoio.</p>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">Fita LED • Vidraçaria • Ferragens</span>
          </div>
        </div>
      </section>

      {/* DOBRA 5: ISENÇÃO TOTAL E TRANSPARÊNCIA RADICAL */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block mb-2">Compromisso Ético</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">Divisão Clara de Responsabilidades</h2>
          <p className="text-sm sm:text-base text-slate-300">
            Respeitamos a legislação brasileira e o Marco Civil da Internet. Conheça com exatidão o nosso papel:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-3d-led p-6 sm:p-8">
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

          <div className="card-3d-led p-6 sm:p-8 border-rose-500/50">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">Isenções e Ausência de Vínculo</h3>
            </div>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
              <li className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Sem vínculo de emprego ou sociedade:</strong> Os anunciantes atuam de forma totalmente autônoma.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">A plataforma não oferece garantia:</strong> Não fiscalizamos serviços e não garantimos prazos ou qualidade técnica.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Zero intermediação financeira:</strong> Pagamentos, recibos e sinais são combinados diretamente entre as partes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Não representamos endosso:</strong> A decisão e conferência de referências cabem exclusivamente ao cliente.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* DOBRA 6: CAPTURA ESTRATÉGICA DE LEADS */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10">
        <div className="card-3d-led rounded-3xl p-6 sm:p-10 border-orange-500/50 relative overflow-hidden text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4 border border-orange-500/40">
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
              className="w-full sm:flex-1 bg-black/60 border border-white/30 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition shadow-inner"
            />
            <input 
              type="text" 
              required 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Sua cidade (ex: Jundiaí)" 
              className="w-full sm:w-44 bg-black/60 border border-white/30 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition shadow-inner"
            />
            <button 
              type="submit" 
              className="btn-super-led-pulsing w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm font-bold text-white shrink-0 cursor-pointer"
            >
              Avise-me
            </button>
          </form>
          {submitted && (
            <div className="text-xs text-emerald-400 font-bold mt-4">
              ✓ E-mail registrado com sucesso! Você será avisado quando houver novos anúncios.
            </div>
          )}
          <p className="text-[11px] text-slate-500 mt-3">
            Zero spam. Usado exclusivamente para avisos da plataforma de acordo com a LGPD.
          </p>
        </div>
      </section>

      {/* DOBRA 7: PERGUNTAS FREQUENTES */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10">
        <div className="text-center mb-10">
          <span className="text-xs font-black text-purple-400 uppercase tracking-widest block mb-2">Esclarecimentos Detalhados</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">Dúvidas Frequentes</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Toque em cada pergunta para abrir a explicação completa:</p>
        </div>

        <div className="space-y-3.5">
          <details className="card-3d-led p-4 sm:p-5 border-white/20 group cursor-pointer" open>
            <summary className="text-xs sm:text-sm font-bold text-white flex items-center justify-between list-none">
              <span>1. O visitante paga alguma coisa para consultar os contatos?</span>
              <ChevronDown className="w-4 h-4 text-orange-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              Não. A consulta aos anúncios no catálogo é totalmente gratuita. Você pesquisa por categoria, filtra pela sua cidade e clica para conversar diretamente pelo WhatsApp informado pelo anunciante sem pagar nada à plataforma.
            </p>
          </details>

          <details className="card-3d-led p-4 sm:p-5 border-white/20 group cursor-pointer">
            <summary className="text-xs sm:text-sm font-bold text-white flex items-center justify-between list-none">
              <span>2. A Vitrine Moveleira oferece garantia sobre os serviços anunciados?</span>
              <ChevronDown className="w-4 h-4 text-orange-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              Não. A Vitrine Moveleira atua exclusivamente como catálogo publicitário digital. A plataforma não executa serviços, não fiscaliza montagens e não garante prazos ou qualidade de execução. Todas as condições e orçamentos devem ser ajustados por escrito diretamente entre contratante e prestador.
            </p>
          </details>

          <details className="card-3d-led p-4 sm:p-5 border-white/20 group cursor-pointer">
            <summary className="text-xs sm:text-sm font-bold text-white flex items-center justify-between list-none">
              <span>3. A plataforma cobra comissões dos profissionais sobre os serviços fechados?</span>
              <ChevronDown className="w-4 h-4 text-orange-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              Não cobramos comissões por serviços fechados. O montante acordado entre cliente e anunciante pertence inteiramente ao profissional autônomo ou empresa cadastrada.
            </p>
          </details>

          <details className="card-3d-led p-4 sm:p-5 border-white/20 group cursor-pointer">
            <summary className="text-xs sm:text-sm font-bold text-white flex items-center justify-between list-none">
              <span>4. Como os pagamentos são realizados? O dinheiro passa pelo site?</span>
              <ChevronDown className="w-4 h-4 text-orange-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              Nenhum valor passa pela Vitrine Moveleira. A plataforma não possui custódia financeira e não processa pagamentos de mão de obra. As formas de pagamento são combinadas diretamente entre você e o profissional.
            </p>
          </details>

          <details className="card-3d-led p-4 sm:p-5 border-white/20 group cursor-pointer">
            <summary className="text-xs sm:text-sm font-bold text-white flex items-center justify-between list-none">
              <span>5. Quais cuidados o cliente deve tomar ao acertar um serviço?</span>
              <ChevronDown className="w-4 h-4 text-orange-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              É prudente solicitar fotos de trabalhos anteriores, alinhar formalmente por escrito o escopo do serviço (materiais, ferragens, medidas, datas de entrega) e solicitar recibos ou contratos de prestação de serviços.
            </p>
          </details>

          <details className="card-3d-led p-4 sm:p-5 border-white/20 group cursor-pointer">
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

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center p-2 mx-auto shadow-lg shadow-orange-500/30">
            <Image
              src="/brand/vitrine-moveleira-icone.png"
              alt="Ícone Vitrine Moveleira"
              width={56}
              height={56}
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Acesse a Vitrine Moveleira
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Catálogo técnico regional para o setor moveleiro de Jundiaí e região.
          </p>
          <div className="pt-2">
            <Link
              href="/encontrar-profissionais"
              className="btn-super-led-pulsing inline-flex items-center gap-2 px-9 py-4 text-sm font-black text-white"
            >
              <span>Conhecer a Vitrine Moveleira</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="text-[11px] text-slate-500 pt-6 border-t border-white/5 space-y-1.5">
            <p>A Vitrine Moveleira é um catálogo de publicidade independente. Não presta serviços, não emprega os anunciantes e não atua como fiadora ou garantidora de negócios particulares.</p>
            <p>© 2026 Vitrine Moveleira. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* BARRA FIXA MOBILE COM O BOTÃO ÚNICO DE ENTRAR NO APP */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-[#05070d]/95 backdrop-blur-xl border-t border-purple-500/30 shadow-2xl flex items-center">
        <Link
          href="/encontrar-profissionais"
          className="btn-super-led-pulsing w-full py-4 px-4 text-xs font-black text-white text-center flex items-center justify-center gap-2 shadow-lg tracking-wide"
        >
          <span>Conhecer a Vitrine Moveleira</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
