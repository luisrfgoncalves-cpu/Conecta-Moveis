'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  ChevronDown, 
  Check, 
  CheckCircle2, 
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

export default function ApresentacaoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ctaRevealed, setCtaRevealed] = useState(false);

  useEffect(() => {
    // No celular, o botão sempre aparece após 5 segundos no máximo como fallback
    const mobileTimer = setTimeout(() => {
      setCtaRevealed(true);
    }, 5000);

    return () => clearTimeout(mobileTimer);
  }, []);

  const handleVideoProgress = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if ((duration > 0 && current / duration >= 0.7) || current >= 40) {
        setCtaRevealed(true);
      }
    }
  }, []);

  const handleVideoEnded = useCallback(() => {
    setCtaRevealed(true);
    setTimeout(() => {
      const cta = document.getElementById('cta-container');
      if (cta) {
        cta.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnded = () => {
      setCtaRevealed(true);
      setTimeout(() => {
        const cta = document.getElementById('cta-container');
        if (cta) cta.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    };

    const onTimeUpdate = () => {
      if (video.duration > 0) {
        if (video.currentTime / video.duration >= 0.7 || video.currentTime >= 40) {
          setCtaRevealed(true);
        }
      }
    };

    video.addEventListener('ended', onEnded);
    video.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setCtaRevealed(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 selection:bg-orange-500 selection:text-white">
      
      {/* DOBRA 1: HERO VSL (SEM BARRA FIXA, APENAS O VÍDEO E O SUPER BOTÃO DISPARADO) */}
      <section className="relative pt-2 pb-6 sm:pt-3 sm:pb-8 md:pt-4 md:pb-8 px-4 sm:px-6 lg:px-8 z-10 text-center">
        
        {/* Topo Integrado: Logo original à esquerda sem barra fixa */}
        <div className="max-w-6xl mx-auto flex items-center justify-between mb-2 sm:mb-3">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
            <Image
              src="/brand/vitrine-moveleira-intro.svg"
              alt="Vitrine Moveleira"
              width={220}
              height={50}
              priority
              className="h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/50 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-200">Jundiaí e Região</span>
          </div>
        </div>

        {/* Headline Principal Restaurada (mesmo texto, entrelinha compacta no desktop) */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-black text-white tracking-tight leading-[1.12] max-w-4xl mx-auto mb-2 drop-shadow-[0_0_35px_rgba(255,107,0,0.35)]">
          O jeito inteligente de encontrar{' '}
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
            marceneiros e montadores
          </span>{' '}
          perto de você.
        </h1>

        {/* Sub-headline */}
        <p className="text-xs sm:text-sm md:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed mb-3 sm:mb-4 font-normal">
          A vitrine digital que reúne quem fabrica, projeta e monta móveis na sua cidade. Sem intermediários cobrando comissões: veja fotos de serviços informadas pelos anunciantes e converse{' '}
          <strong className="text-white font-bold">direto pelo WhatsApp</strong>.
        </p>

        {/* O VÍDEO CENTRALIZADO COM PROPORÇÃO VERTICAL NATIVA - 100% ENQUADRADO NA PRIMEIRA DOBRA */}
        <div className="max-w-[620px] md:max-w-[660px] lg:max-w-[700px] mx-auto mb-4">
          <div className="card-3d-led rounded-3xl p-1.5 sm:p-2 vsl-frame-led relative border-2 border-orange-500/60 shadow-[0_0_40px_-5px_rgba(255,107,0,0.4)]">
            <div className="relative rounded-2xl overflow-hidden aspect-video max-h-[46vh] sm:max-h-[48vh] bg-black border border-white/10 flex items-center justify-center">
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

        {/* BOTÃO ÚNICO DISPARADO: NO CELULAR SEMPRE VISÍVEL / NO DESKTOP FADE-IN */}
        <div 
          id="cta-container" 
          className={`max-w-md mx-auto mb-8 transition-all duration-700 ease-out ${
            ctaRevealed 
              ? 'opacity-100 translate-y-0 pointer-events-auto' 
              : 'max-sm:opacity-100 max-sm:translate-y-0 max-sm:pointer-events-auto sm:opacity-0 sm:translate-y-6 sm:pointer-events-none'
          }`}
        >
          <Link
            href="/"
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
          <span className="text-xs sm:text-sm font-black text-purple-400 uppercase tracking-widest block mb-2">A Realidade do Mercado</span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            As dificuldades reais na hora de planejar, montar ou divulgar serviços
          </h2>
          <p className="text-base sm:text-lg text-slate-200">
            Problemas comuns que clientes e profissionais autônomos enfrentam no dia a dia:
          </p>
        </div>

        {/* Grid de 2 Dores (empilhado com clareza em coluna no celular, 2 colunas no PC) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Dor do Cliente com Imagem Real */}
          <div className="card-pain-3d p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="rounded-2xl overflow-hidden border border-white/20 mb-5 relative aspect-[16/10] shadow-inner">
                <Image
                  src="/images/apresentacao/dor-cliente.jpg"
                  alt="Casal com planta no apartamento vazio querendo móveis planejados"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-4">Para Quem Precisa de Móveis ou Montagem</h3>
              <ul className="space-y-4 text-sm sm:text-base text-slate-200">
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Ficar refém de indicações de terceiros:</strong> Ter que pedir contato em grupos de condomínio ou amigos sem saber se a pessoa é qualificada no que você precisa.</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Não saber onde procurar profissionais da cidade:</strong> Dificuldade em achar profissionais atuantes que atendam especificamente o seu bairro em Jundiaí e região.</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Não conhecer a especialidade e fotos de serviços:</strong> Precisar solicitar orçamentos sem poder ver fotos reais de trabalhos concluídos anteriormente.</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Falta de atendimento direto:</strong> Ter que passar por formulários complexos em vez de conversar direto pelo WhatsApp no número do profissional.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card Dor do Profissional com Imagem Real */}
          <div className="card-pain-3d p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="rounded-2xl overflow-hidden border border-white/20 mb-5 relative aspect-[16/10] shadow-inner">
                <Image
                  src="/images/apresentacao/dor-profissional.jpg"
                  alt="Marceneiro moderno em oficina com MDF olhando celular"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-4">Para Marceneiros e Montadores Autônomos</h3>
              <ul className="space-y-4 text-sm sm:text-base text-slate-200">
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Depender apenas de indicações e do boca a boca:</strong> Enfrentar semanas sem serviços novos por não ter uma vitrine digital própria no ar.</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Não saber como anunciar ou gastar caro em anúncios:</strong> Pagar valores elevados no Facebook e depender de terceiros para configurar campanhas que nem sempre trazem clientes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Não ser conhecido na própria região:</strong> Dificuldade para alcançar moradores locais que estão se mudando ou reformando casas e apartamentos na sua cidade.</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Pagar altas comissões sobre o trabalho:</strong> Ter parte da mão de obra retida por aplicativos intermediários para poder pegar serviços.</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
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
          <span className="text-xs sm:text-sm font-black text-orange-400 uppercase tracking-widest block mb-2">A Proposta da Plataforma</span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            O que o app da Vitrine Moveleira realmente entrega
          </h2>
          <p className="text-base sm:text-lg text-slate-200">
            Benefícios práticos criados especificamente para a região de Jundiaí e cidades vizinhas:
          </p>
        </div>

        {/* 4 Pilares Reais com Relevo 3D e Borda LED (Grid 1 coluna no mobile, 2 no tablet, 4 no desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left mb-12">
          <div className="card-3d-led p-5 sm:p-6">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/40">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">WhatsApp Direto</h4>
            <p className="text-sm text-slate-200 leading-relaxed">Clique para abrir a conversa diretamente no WhatsApp informado pelo anunciante, sem formulários intermediários.</p>
          </div>

          <div className="card-3d-led p-5 sm:p-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/40">
              <Percent className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">Sem Taxa por Serviço</h4>
            <p className="text-sm text-slate-200 leading-relaxed">A plataforma não retém comissão sobre serviços fechados. O acerto é negociado diretamente entre as partes.</p>
          </div>

          <div className="card-3d-led p-5 sm:p-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/40">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">Fotos dos Anunciantes</h4>
            <p className="text-sm text-slate-200 leading-relaxed">Espaço dedicado para que cada profissional apresente suas próprias fotos de montagens e móveis realizados.</p>
          </div>

          <div className="card-3d-led p-5 sm:p-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/40">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">Foco Regional</h4>
            <p className="text-sm text-slate-200 leading-relaxed">Filtros por categorias e cidades para encontrar profissionais atuantes que realmente atendem o seu bairro.</p>
          </div>
        </div>

        {/* 2 Cards de Soluções com Escopo Técnico Completo (Sem links ou botões de saída) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card-3d-led p-6 sm:p-8 flex flex-col justify-start">
            <div className="rounded-2xl overflow-hidden border border-white/20 mb-5 relative aspect-[16/10]">
              <Image
                src="/images/apresentacao/solucao-montagem.jpg"
                alt="Montador profissional alinhando armário planejado com precisão"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-3">Montagem e Ajustes de Móveis</h3>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Encontre profissionais capacitados para montagem e desmontagem de móveis convencionais, modulados comprados pela internet ou em lojas, móveis planejados e projetos sob medida, incluindo regulagem precisa de dobradiças, gavetas e fixações seguras.
            </p>
          </div>

          <div className="card-3d-led p-6 sm:p-8 flex flex-col justify-start">
            <div className="rounded-2xl overflow-hidden border border-white/20 mb-5 relative aspect-[16/10]">
              <Image
                src="/images/apresentacao/solucao-projetista.jpg"
                alt="Projetista moveleiro desenvolvendo layout 3D de ambientes planejados"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-3">Projetos de Móveis e Ambientes Planejados</h3>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Conecte-se com profissionais e marceneiros dedicados ao atendimento personalizado de ambientes planejados e otimização de espaços para residências e apartamentos, com paginação em desenhos 3D para facilitar a visualização e montagem.
            </p>
          </div>
        </div>
      </section>

      {/* DOBRA 4: CATEGORIAS OFICIAIS DO CATÁLOGO (SEM CARROSSEL: GRADE DIRETA E VISÍVEL NO CELULAR) */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center sm:text-left mb-8">
          <span className="text-xs sm:text-sm font-black text-purple-400 uppercase tracking-widest block mb-1">Categorias Oficiais</span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white">Segmentos Disponíveis no App</h2>
        </div>

        {/* Grade 1 coluna no celular, 2 colunas no tablet, 3 colunas no PC (SEM CARROSSEL) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="card-3d-led p-6 sm:p-7">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/40">
              <Wrench className="w-6 h-6" />
            </div>
            <h4 className="text-lg sm:text-xl font-black text-white mb-2">Montador de Móveis</h4>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-4">Montagem e desmontagem de móveis convencionais, modulados e suporte a planejados.</p>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/30">Convencionais • Modulados • Planejados</span>
          </div>

          <div className="card-3d-led p-6 sm:p-7">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/40">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-lg sm:text-xl font-black text-white mb-2">Marceneiro (Autônomo)</h4>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-4">Marcenaria fina, móveis sob medida e adaptações.</p>
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/30">Cozinhas Sob Medida • Painéis • Closets</span>
          </div>

          <div className="card-3d-led p-6 sm:p-7">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/40">
              <Box className="w-6 h-6" />
            </div>
            <h4 className="text-lg sm:text-xl font-black text-white mb-2">Loja de Planejados</h4>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-4">Showrooms e comércio de mobiliário planejado residencial e corporativo.</p>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">Ambientes Completos • Showrooms</span>
          </div>

          <div className="card-3d-led p-6 sm:p-7">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/40">
              <Hammer className="w-6 h-6" />
            </div>
            <h4 className="text-lg sm:text-xl font-black text-white mb-2">Marcenaria e Fábrica</h4>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-4">Fábricas e oficinas com usinagem por CNC, corte e fita de borda.</p>
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/30">Corte CNC • Grandes Lotes • Chapas</span>
          </div>

          <div className="card-3d-led p-6 sm:p-7">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4 border border-sky-500/40">
              <Ruler className="w-6 h-6" />
            </div>
            <h4 className="text-lg sm:text-xl font-black text-white mb-2">Projetista</h4>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-4">Projetos de móveis, visualização 3D de ambientes e detalhamento técnico para produção.</p>
            <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/30">Promob • Render 3D • Planta Técnica</span>
          </div>

          <div className="card-3d-led p-6 sm:p-7">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/40">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h4 className="text-lg sm:text-xl font-black text-white mb-2">Parceiros Complementares</h4>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-4">Eletricistas para iluminação LED, serralheiros, vidraceiros e serviços de apoio.</p>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30">Fita LED • Vidraçaria • Ferragens</span>
          </div>
        </div>
      </section>

      {/* DOBRA 5: ISENÇÃO TOTAL E TRANSPARÊNCIA RADICAL */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-widest block mb-2">Compromisso Ético</span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-4">Divisão Clara de Responsabilidades</h2>
          <p className="text-base sm:text-lg text-slate-200">
            Respeitamos a legislação brasileira e o Marco Civil da Internet. Conheça com exatidão o nosso papel:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-3d-led p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white">Função do Catálogo</h3>
            </div>
            <ul className="space-y-4 text-sm sm:text-base text-slate-200">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Catálogo de Publicidade Digital:</strong> Canal temático regional para que profissionais divulguem seus serviços.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Acesso Aberto e Gratuito:</strong> Qualquer pessoa pesquisa por categorias e vê contatos sem taxas.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Canal Direto no WhatsApp:</strong> Conversa no número fornecido diretamente por cada anunciante.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Privacidade e LGPD:</strong> Não comercializamos cadastros e respeitamos a legislação brasileira.</span>
              </li>
            </ul>
          </div>

          <div className="card-3d-led p-6 sm:p-8 border-rose-500/50">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white">Isenções e Ausência de Vínculo</h3>
            </div>
            <ul className="space-y-4 text-sm sm:text-base text-slate-200">
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Sem vínculo de emprego ou sociedade:</strong> Os anunciantes atuam de forma totalmente autônoma.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">A plataforma não oferece garantia:</strong> Não fiscalizamos serviços e não garantimos prazos ou qualidade técnica.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Zero intermediação financeira:</strong> Pagamentos, recibos e sinais são combinados diretamente entre as partes.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Não representamos endosso:</strong> A decisão e conferência de referências cabem exclusivamente ao cliente.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* DOBRA 6: PERGUNTAS FREQUENTES */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10">
        <div className="text-center mb-10">
          <span className="text-xs font-black text-purple-400 uppercase tracking-widest block mb-2">Esclarecimentos Detalhados</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">Dúvidas Frequentes</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Toque em cada pergunta para abrir a explicação completa:</p>
        </div>

        <div className="space-y-3.5">
          <details className="card-3d-led p-5 sm:p-6 border-white/20 group cursor-pointer" open>
            <summary className="text-sm sm:text-base font-bold text-white flex items-center justify-between list-none">
              <span>1. O visitante paga alguma coisa para consultar os contatos?</span>
              <ChevronDown className="w-5 h-5 text-orange-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
            </summary>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              Não. A consulta aos anúncios no catálogo é totalmente gratuita. Você pesquisa por categoria, filtra pela sua cidade e clica para conversar diretamente pelo WhatsApp informado pelo anunciante sem pagar nada à plataforma.
            </p>
          </details>

          <details className="card-3d-led p-5 sm:p-6 border-white/20 group cursor-pointer">
            <summary className="text-sm sm:text-base font-bold text-white flex items-center justify-between list-none">
              <span>2. A Vitrine Moveleira oferece garantia sobre os serviços anunciados?</span>
              <ChevronDown className="w-5 h-5 text-orange-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
            </summary>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              Não. A Vitrine Moveleira atua exclusivamente como catálogo publicitário digital. A plataforma não executa serviços, não fiscaliza montagens e não garante prazos ou qualidade de execução. Todas as condições e orçamentos devem ser ajustados por escrito diretamente entre contratante e prestador.
            </p>
          </details>

          <details className="card-3d-led p-5 sm:p-6 border-white/20 group cursor-pointer">
            <summary className="text-sm sm:text-base font-bold text-white flex items-center justify-between list-none">
              <span>3. A plataforma cobra comissões dos profissionais sobre os serviços fechados?</span>
              <ChevronDown className="w-5 h-5 text-orange-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
            </summary>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              Não cobramos comissões por serviços fechados. O montante acordado entre cliente e anunciante pertence inteiramente ao profissional autônomo ou empresa cadastrada.
            </p>
          </details>

          <details className="card-3d-led p-5 sm:p-6 border-white/20 group cursor-pointer">
            <summary className="text-sm sm:text-base font-bold text-white flex items-center justify-between list-none">
              <span>4. Como os pagamentos são realizados? O dinheiro passa pelo site?</span>
              <ChevronDown className="w-5 h-5 text-orange-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
            </summary>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              Nenhum valor passa pela Vitrine Moveleira. A plataforma não possui custódia financeira e não processa pagamentos de mão de obra. As formas de pagamento são combinadas diretamente entre você e o profissional.
            </p>
          </details>

          <details className="card-3d-led p-5 sm:p-6 border-white/20 group cursor-pointer">
            <summary className="text-sm sm:text-base font-bold text-white flex items-center justify-between list-none">
              <span>5. Quais cuidados o cliente deve tomar ao acertar um serviço?</span>
              <ChevronDown className="w-5 h-5 text-orange-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
            </summary>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              É prudente solicitar fotos de trabalhos anteriores, alinhar formalmente por escrito o escopo do serviço (materiais, ferragens, medidas, datas de entrega) e solicitar recibos ou contratos de prestação de serviços.
            </p>
          </details>

          <details className="card-3d-led p-5 sm:p-6 border-white/20 group cursor-pointer">
            <summary className="text-sm sm:text-base font-bold text-white flex items-center justify-between list-none">
              <span>6. Como um profissional ou empresa pode divulgar no catálogo?</span>
              <ChevronDown className="w-5 h-5 text-orange-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
            </summary>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mt-3 pt-3 border-t border-white/10">
              Basta acessar a opção &quot;Divulgar Meus Serviços&quot; no app, preencher seus dados, cadastrar sua apresentação, selecionar suas categorias e cidades de atendimento e incluir fotos de seus trabalhos. Seu anúncio fica disponível para consulta pública.
            </p>
          </details>
        </div>
      </section>

      {/* RODAPÉ COM LOGO OFICIAL */}
      <footer className="border-t border-white/10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-center mx-auto mb-4">
            <Image
              src="/brand/vitrine-moveleira-intro.svg"
              alt="Vitrine Moveleira"
              width={260}
              height={60}
              className="h-12 sm:h-16 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
            />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Acesse a Vitrine Moveleira
          </h3>
          <p className="text-sm sm:text-base text-slate-300">
            Catálogo técnico regional para o setor moveleiro de Jundiaí e região.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="btn-super-led-pulsing inline-flex items-center gap-2 px-9 py-4 text-base font-black text-white"
            >
              <span>Conhecer a Vitrine Moveleira</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="text-xs text-slate-400 pt-6 border-t border-white/5 space-y-1.5 leading-relaxed">
            <p>A Vitrine Moveleira é um catálogo de publicidade independente. Não presta serviços, não emprega os anunciantes e não atua como fiadora ou garantidora de negócios particulares.</p>
            <p>© 2026 Vitrine Moveleira. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
