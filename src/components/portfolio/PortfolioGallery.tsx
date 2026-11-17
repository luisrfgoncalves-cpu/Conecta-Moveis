'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  MessageCircle,
  MapPin,
  Camera,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ReportButton } from '@/components/reports/ReportButton';
import { trackWhatsAppClick } from '@/lib/contact/actions';

export interface PortfolioImage {
  id: string;
  image_url: string;
  thumb_url: string | null;
  sort_order?: number;
  is_demo?: boolean;
  image_type?: 'trabalho_realizado' | 'ilustrativa';
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string | null;
  images: PortfolioImage[];
}

interface PortfolioGalleryProps {
  portfolio: PortfolioProject[];
  professionalId: string;
  professionalName: string;
  professionalCity: string;
  professionalState: string;
  professionalAvatar?: string | null;
  professionalWhatsapp?: string | null;
  slug: string;
  isLoggedIn: boolean;
}

export function PortfolioGallery({
  portfolio,
  professionalId,
  professionalName,
  professionalCity,
  professionalState,
  professionalAvatar,
  professionalWhatsapp,
  slug,
  isLoggedIn,
}: PortfolioGalleryProps) {
  const [activeProjectIdx, setActiveProjectIdx] = useState<number | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const touchStartXRef = useRef<number | null>(null);

  const activeProject = activeProjectIdx !== null ? portfolio[activeProjectIdx] : null;
  const activeImage = activeProject ? activeProject.images[activeImageIdx] : null;

  const openLightbox = (projectIdx: number, imageIdx: number) => {
    setActiveProjectIdx(projectIdx);
    setActiveImageIdx(imageIdx);
  };

  const closeLightbox = useCallback(() => {
    setActiveProjectIdx(null);
    setActiveImageIdx(0);
  }, []);

  const nextImage = useCallback(() => {
    if (!activeProject) return;
    setActiveImageIdx((prev) => (prev + 1) % activeProject.images.length);
  }, [activeProject]);

  const prevImage = useCallback(() => {
    if (!activeProject) return;
    setActiveImageIdx((prev) => (prev - 1 + activeProject.images.length) % activeProject.images.length);
  }, [activeProject]);

  // Teclado (ESC, Setas) e bloqueio de rolagem da página quando aberto
  useEffect(() => {
    if (activeProjectIdx === null) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeProjectIdx, closeLightbox, nextImage, prevImage]);

  // Gestos de toque no celular (Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (diff > 45) {
      nextImage();
    } else if (diff < -45) {
      prevImage();
    }
    touchStartXRef.current = null;
  };

  const handleWhatsAppContact = () => {
    if (!professionalWhatsapp || !activeProject) return;
    const cleanNumber = professionalWhatsapp.replace(/\D/g, '');
    const message = `Olá ${professionalName}, vi a foto do seu serviço "${activeProject.title}" na Vitrine Moveleira e gostaria de mais informações!`;
    const url = `https://wa.me/55${cleanNumber}?text=${encodeURIComponent(message)}`;

    trackWhatsAppClick(professionalId).catch(() => {});
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Grade de Fotos na Página */}
      {portfolio.map((project, pIdx) => (
        <div key={project.id} className="space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{project.title}</span>
              <span className="text-[11px] font-normal text-slate-400">
                ({project.images.length} {project.images.length === 1 ? 'foto' : 'fotos'})
              </span>
            </h3>
            {project.description && (
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed break-words">
                {project.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {project.images.map((img, imgIdx) => (
              <div
                key={img.id}
                onClick={() => openLightbox(pIdx, imgIdx)}
                className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-white/10 group cursor-pointer shadow-md hover:border-orange-500/50 transition-all duration-300"
              >
                <Image
                  src={img.thumb_url || img.image_url}
                  alt={`${project.title} — foto ${imgIdx + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-orange-400" />
                    Ver mostruário
                  </span>
                </div>

                {img.image_type === 'ilustrativa' && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/85 text-blue-300 border border-blue-500/30 backdrop-blur-md">
                      Ilustrativa
                    </span>
                  </div>
                )}
                {img.is_demo && (
                  <div className="absolute bottom-2 left-2 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/90 text-white backdrop-blur-md">
                      <Sparkles className="w-2.5 h-2.5" />
                      Demonstração
                    </span>
                  </div>
                )}

                <div
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ReportButton
                    targetType="image"
                    targetId={img.id}
                    isLoggedIn={isLoggedIn}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* TEMPLATE DE MOSTRUÁRIO GRÁFICO (ESTILO PRANCHA DE ARQUITETURA / CANVA) */}
      {activeProject && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-300"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 1. CENÁRIO DE FUNDO AMBIENTAL (Preenche 100% da tela eliminando o vazio) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.image_url}
              alt=""
              className="w-full h-full object-cover blur-3xl opacity-35 scale-125 transform transition-all duration-700"
            />
            {/* Iluminação ambiente dourada/escura */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#080c16]/85 via-[#060911]/90 to-[#04060c]/95" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(249,115,22,0.12)_0%,transparent_70%)]" />
          </div>

          {/* Botão Fechar Flutuante Geral (Topo Direito da Tela) */}
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Fechar mostruário"
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-900/80 hover:bg-orange-500 border border-white/20 text-white shadow-2xl transition cursor-pointer backdrop-blur-md"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 2. A PRANCHA DO TEMPLATE (CARD DE APRESENTAÇÃO DE LUXO) */}
          <div className="relative w-full max-w-4xl max-h-[92vh] bg-gradient-to-b from-[#0e1424]/95 via-[#0a0e1a]/95 to-[#060912]/98 border border-amber-500/30 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(249,115,22,0.18)] flex flex-col overflow-hidden backdrop-blur-2xl">
            
            {/* TOPO DO TEMPLATE: EMBLEMA DA PLATAFORMA & CABEÇALHO GRÁFICO */}
            <div className="relative px-5 py-3 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shadow-[0_0_8px_#f97316]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
                  Vitrine Moveleira
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-semibold text-slate-400 pl-2 border-l border-white/10">
                  Mostruário de Apresentação
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  Foto {activeImageIdx + 1} de {activeProject.images.length}
                </span>
                <ReportButton
                  targetType="image"
                  targetId={activeImage.id}
                  isLoggedIn={isLoggedIn}
                />
              </div>

              {/* Friso dourado inferior decorativo */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
            </div>

            {/* MEIO DO TEMPLATE: CENÁRIO EMOLDURADO DA FOTO */}
            <div className="relative flex-1 min-h-[44vh] sm:min-h-[50vh] md:min-h-[54vh] bg-[#05070d]/80 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
              
              {/* Moldura de Exposição da Foto com Sombra 3D e Iluminação */}
              <div className="relative max-h-[44vh] sm:max-h-[50vh] md:max-h-[54vh] w-full h-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage.image_url}
                  alt={`${activeProject.title} — foto ${activeImageIdx + 1}`}
                  className="max-h-[44vh] sm:max-h-[50vh] md:max-h-[54vh] max-w-full object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/15 select-none"
                />

                {/* Selo Ilustrativo se houver */}
                {activeImage.image_type === 'ilustrativa' && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-bold bg-slate-950/90 text-blue-300 border border-blue-500/40 backdrop-blur-md shadow-lg">
                      Imagem ilustrativa
                    </span>
                  </div>
                )}
              </div>

              {/* Setas de Navegação Ergonômicas coladas na lateral */}
              {activeProject.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    aria-label="Foto anterior"
                    className="absolute left-3 sm:left-5 z-20 p-2.5 sm:p-3 rounded-full bg-slate-950/85 hover:bg-orange-500 border border-white/20 text-white transition-all shadow-2xl cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Próxima foto"
                    className="absolute right-3 sm:right-5 z-20 p-2.5 sm:p-3 rounded-full bg-slate-950/85 hover:bg-orange-500 border border-white/20 text-white transition-all shadow-2xl cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* BASE DO TEMPLATE: PLACA DE IDENTIFICAÇÃO DO MÓVEL & ASSINATURA EDITORIAL */}
            <div className="relative px-5 py-4 border-t border-amber-500/20 bg-gradient-to-t from-[#04060d] via-[#090d18] to-[#0c1222] shrink-0 space-y-3">
              
              {/* Friso dourado superior decorativo */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

              {/* Informações Principais do Móvel e do Anunciante */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                
                {/* Identificação do Projeto */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight break-words capitalize">
                      {activeProject.title}
                    </h3>
                  </div>

                  {activeProject.description ? (
                    <p className="text-xs text-slate-300 leading-relaxed break-words line-clamp-2 max-w-xl">
                      {activeProject.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-orange-400" />
                      <span>Foto de serviço informada pelo anunciante</span>
                    </p>
                  )}
                </div>

                {/* Bloco do Profissional & Ação do WhatsApp */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 pt-1 md:pt-0">
                  
                  {/* Card do Autor (Marceneiro/Montador) */}
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                    <div className="relative w-9 h-9 rounded-xl bg-slate-900 border border-amber-500/30 overflow-hidden shrink-0 flex items-center justify-center">
                      {professionalAvatar ? (
                        <Image
                          src={professionalAvatar}
                          alt={professionalName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xs font-black text-amber-400">
                          {professionalName.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 pr-1">
                      <p className="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[160px]">
                        {professionalName}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                        <span>{professionalCity} - {professionalState}</span>
                      </p>
                    </div>
                  </div>

                  {/* Botão de WhatsApp Oficial */}
                  <div className="flex-1 md:flex-initial">
                    {isLoggedIn ? (
                      professionalWhatsapp ? (
                        <button
                          type="button"
                          onClick={handleWhatsAppContact}
                          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 shrink-0" />
                          <span>Conversar sobre este serviço</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null
                    ) : (
                      <Link
                        href={`/criar-conta?redirect=/profissionais/${slug}`}
                        className="w-full md:w-auto px-5 py-2.5 rounded-xl btn-neon text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg text-center"
                      >
                        <MessageCircle className="w-4 h-4 shrink-0" />
                        <span>Liberar WhatsApp para este serviço</span>
                      </Link>
                    )}
                  </div>
                </div>

              </div>

              {/* Régua de Miniaturas do Projeto (Amostras) */}
              {activeProject.images.length > 1 && (
                <div className="flex items-center gap-2 pt-1 border-t border-white/5 overflow-x-auto max-w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
                    <Layers className="w-3 h-3 text-amber-400" />
                    Fotos do projeto:
                  </span>
                  {activeProject.images.map((img, thumbIdx) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImageIdx(thumbIdx)}
                      className={`relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        thumbIdx === activeImageIdx
                          ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/30'
                          : 'border-white/10 opacity-50 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img.thumb_url || img.image_url}
                        alt={`Miniatura ${thumbIdx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
