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
      {/* Grade de Projetos na Página */}
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
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
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
                    Ver no mostruário
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

      {/* TEMPLATE DE MOSTRUÁRIO VITRINE MOVELEIRA (ESTILO CANVA / SHOWROOM) */}
      {activeProject && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* FUNDO AMBIENTAL DINÂMICO DESFOCADO (Elimina 100% do espaço vazio preto em volta) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.image_url}
              alt=""
              className="w-full h-full object-cover blur-3xl opacity-40 scale-125 transform transition-all duration-700"
            />
            <div className="absolute inset-0 bg-slate-950/75" />
          </div>

          {/* CARD DO TEMPLATE DE APRESENTAÇÃO */}
          <div className="relative w-full max-w-5xl max-h-[94vh] sm:max-h-[90vh] bg-slate-950/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
            
            {/* LADO VISUAL: QUADRO DA FOTO (Adaptação para Vertical, Horizontal ou Quadrada) */}
            <div className="relative flex-1 min-h-[42vh] md:min-h-0 bg-black/40 flex items-center justify-center p-3 sm:p-6 overflow-hidden group">
              
              {/* Moldura da Imagem */}
              <div className="relative max-h-[42vh] sm:max-h-[50vh] md:max-h-[76vh] w-full h-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage.image_url}
                  alt={`${activeProject.title} — foto ${activeImageIdx + 1}`}
                  className="max-h-[42vh] sm:max-h-[50vh] md:max-h-[76vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 select-none"
                />

                {/* Selo no topo da foto */}
                {activeImage.image_type === 'ilustrativa' && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-950/85 text-blue-300 border border-blue-500/30 backdrop-blur-md shadow-lg">
                      Imagem ilustrativa
                    </span>
                  </div>
                )}
              </div>

              {/* Setas de Navegação Ergonômicas (Flutuam junto à foto) */}
              {activeProject.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    aria-label="Foto anterior"
                    className="absolute left-3 md:left-5 z-20 p-2 sm:p-2.5 rounded-full bg-slate-950/80 hover:bg-orange-500 border border-white/15 text-white transition-all shadow-xl cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Próxima foto"
                    className="absolute right-3 md:right-5 z-20 p-2 sm:p-2.5 rounded-full bg-slate-950/80 hover:bg-orange-500 border border-white/15 text-white transition-all shadow-xl cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </>
              )}
            </div>

            {/* LADO EDITORIAL: PAINEL DE APRESENTAÇÃO DO PROJETO (ESTILO PRANCHA / CANVA) */}
            <div className="w-full md:w-80 lg:w-96 p-4 sm:p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 bg-slate-900/70 backdrop-blur-md overflow-y-auto max-h-[48vh] md:max-h-[90vh]">
              
              {/* Cabeçalho do Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-orange-400">
                      Vitrine Moveleira • Mostruário
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <ReportButton
                      targetType="image"
                      targetId={activeImage.id}
                      isLoggedIn={isLoggedIn}
                    />
                    <button
                      type="button"
                      onClick={closeLightbox}
                      aria-label="Fechar"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                      title="Fechar (Esc)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Título e Descrição */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      {activeProject.title}
                    </h3>
                    {activeProject.images.length > 1 && (
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-slate-300 shrink-0">
                        {activeImageIdx + 1} de {activeProject.images.length}
                      </span>
                    )}
                  </div>
                  {activeProject.description ? (
                    <p className="text-xs text-slate-300 leading-relaxed max-h-24 overflow-y-auto pr-1">
                      {activeProject.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-orange-400" />
                      Foto informada pelo anunciante
                    </p>
                  )}
                </div>

                {/* Card de Identificação do Profissional */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-white/15 overflow-hidden shrink-0 flex items-center justify-center">
                    {professionalAvatar ? (
                      <Image
                        src={professionalAvatar}
                        alt={professionalName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs font-black text-slate-200">
                        {professionalName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {professionalName}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                      {professionalCity} - {professionalState}
                    </p>
                  </div>
                </div>

                {/* Miniaturas Carrossel (Se houver mais de 1 foto no projeto) */}
                {activeProject.images.length > 1 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-orange-400" />
                        Fotos deste projeto
                      </span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                      {activeProject.images.map((img, thumbIdx) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setActiveImageIdx(thumbIdx)}
                          className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            thumbIdx === activeImageIdx
                              ? 'border-orange-500 scale-105 shadow-md'
                              : 'border-white/10 opacity-60 hover:opacity-100'
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
                  </div>
                )}
              </div>

              {/* Botão de WhatsApp Comercial / Ação Direta */}
              <div className="pt-4 mt-2 border-t border-white/10 space-y-1.5">
                {isLoggedIn ? (
                  professionalWhatsapp ? (
                    <button
                      type="button"
                      onClick={handleWhatsAppContact}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 shrink-0" />
                      <span>Conversar sobre este serviço</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  ) : null
                ) : (
                  <Link
                    href={`/criar-conta?redirect=/profissionais/${slug}`}
                    className="w-full py-3 px-4 rounded-xl btn-neon text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg text-center"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>Liberar contato para este serviço</span>
                  </Link>
                )}
                <p className="text-[10px] text-slate-400 text-center">
                  Converse direto pelo WhatsApp sem intermediários
                </p>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
