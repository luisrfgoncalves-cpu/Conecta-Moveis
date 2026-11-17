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
  Star,
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

    // Se deslizou mais de 45px
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

          {/* Grade de Fotos */}
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

                {/* Overlay de hover com botão de expansão */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-orange-400" />
                    Ampliar
                  </span>
                </div>

                {/* Selos de Foto */}
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

                {/* Botão de Denúncia */}
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

      {/* LIGHTBOX MODAL EM TELA CHEIA */}
      {activeProject && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between animate-in fade-in duration-200"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Barra Superior (Topo) */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-slate-950/60 z-20">
            <div className="flex items-center gap-3 min-w-0">
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-black shrink-0">
                {activeImageIdx + 1} / {activeProject.images.length}
              </span>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {activeProject.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {professionalName} • {professionalCity} - {professionalState}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ReportButton
                targetType="image"
                targetId={activeImage.id}
                isLoggedIn={isLoggedIn}
              />
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Fechar visualização"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Fechar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Área Central da Foto com Navegação */}
          <div className="relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden min-h-0">
            {/* Seta Esquerda (Anterior) */}
            {activeProject.images.length > 1 && (
              <button
                type="button"
                onClick={prevImage}
                aria-label="Foto anterior"
                className="absolute left-2 sm:left-4 z-20 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-orange-500 border border-white/15 text-white transition-all shadow-xl cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Imagem em Resolução Original */}
            <div className="relative max-h-[62vh] sm:max-h-[70vh] w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage.image_url}
                alt={`${activeProject.title} — foto ${activeImageIdx + 1}`}
                className="max-h-[62vh] sm:max-h-[70vh] max-w-[95vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-white/10"
              />

              {activeImage.image_type === 'ilustrativa' && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-950/85 text-blue-300 border border-blue-500/30 backdrop-blur-md shadow-lg">
                    Imagem ilustrativa
                  </span>
                </div>
              )}
            </div>

            {/* Seta Direita (Próxima) */}
            {activeProject.images.length > 1 && (
              <button
                type="button"
                onClick={nextImage}
                aria-label="Próxima foto"
                className="absolute right-2 sm:right-4 z-20 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-orange-500 border border-white/15 text-white transition-all shadow-xl cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          {/* Miniaturas de Navegação Rápida (quando houver mais de 1 foto) */}
          {activeProject.images.length > 1 && (
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-950/80 border-t border-white/5 overflow-x-auto max-w-full z-10">
              {activeProject.images.map((img, thumbIdx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImageIdx(thumbIdx)}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    thumbIdx === activeImageIdx
                      ? 'border-orange-500 scale-105 shadow-md'
                      : 'border-white/15 opacity-60 hover:opacity-100'
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

          {/* Template de Rodapé da Vitrine com Conversão Direta */}
          <div className="px-4 sm:px-6 py-4 border-t border-white/10 bg-slate-950/90 z-20">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-11 h-11 rounded-2xl bg-slate-900 border border-white/15 overflow-hidden shrink-0 flex items-center justify-center">
                  {professionalAvatar ? (
                    <Image
                      src={professionalAvatar}
                      alt={professionalName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-sm font-black text-slate-200">
                      {professionalName.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm truncate">
                      {professionalName}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                      <MapPin className="w-3 h-3 text-sky-400" />
                      {professionalCity}
                    </span>
                  </div>
                  {activeProject.description ? (
                    <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                      {activeProject.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 flex items-center gap-1">
                      <Star className="w-3 h-3 text-orange-400" />
                      Foto informada pelo anunciante
                    </p>
                  )}
                </div>
              </div>

              {/* Botão de Contato com Conversão Contextual */}
              <div className="w-full sm:w-auto shrink-0">
                {isLoggedIn ? (
                  professionalWhatsapp ? (
                    <button
                      type="button"
                      onClick={handleWhatsAppContact}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Conversar sobre este serviço</span>
                    </button>
                  ) : null
                ) : (
                  <Link
                    href={`/criar-conta?redirect=/profissionais/${slug}`}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-neon text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg text-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Liberar contato para este serviço</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
