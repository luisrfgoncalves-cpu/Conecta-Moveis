'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  X,
  Crop,
  Move,
  Maximize2,
} from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (croppedFile: File) => void;
  aspectRatio?: number; // 1 para quadrado
  fileName?: string;
  title?: string;
}

export function ImageCropperModal({
  imageSrc,
  onCancel,
  onConfirm,
  aspectRatio = 1,
  fileName = 'foto-perfil.webp',
  title = 'Ajustar e Enquadrar Foto',
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // em graus (0, 90, 180, 270)
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const offsetStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Carregar dimensões naturais da imagem
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
  };

  // Mouse e Touch drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    offsetStartRef.current = { ...offset };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setOffset({
        x: offsetStartRef.current.x + dx,
        y: offsetStartRef.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers para celular (Android / iPhone)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      offsetStartRef.current = { ...offset };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setOffset({
      x: offsetStartRef.current.x + dx,
      y: offsetStartRef.current.y + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Rotacionar em 90 graus
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Resetar zoom e posição
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Processar o recorte final no Canvas
  const handleApplyCrop = () => {
    if (!imageRef.current || !containerRef.current || !naturalSize.width) return;

    const CROP_BOX_SIZE = 280; // tamanho da viewport de corte em px na tela
    const TARGET_SIZE = 512; // tamanho exportado final em px

    const canvas = document.createElement('canvas');
    canvas.width = TARGET_SIZE;
    canvas.height = TARGET_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Fundo limpo
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

    const scale = TARGET_SIZE / CROP_BOX_SIZE;

    ctx.save();
    // Centraliza o ponto de transformação
    ctx.translate(TARGET_SIZE / 2, TARGET_SIZE / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Considera o deslocamento feito pelo usuário
    const adjustedOffsetX = offset.x * scale;
    const adjustedOffsetY = offset.y * scale;

    // Dimensões base ajustadas para preencher o quadrado (fit cover inicial)
    const isRotated90or270 = rotation % 180 !== 0;
    const origW = isRotated90or270 ? naturalSize.height : naturalSize.width;
    const origH = isRotated90or270 ? naturalSize.width : naturalSize.height;

    const baseScale = Math.max(TARGET_SIZE / origW, TARGET_SIZE / origH);
    const renderW = naturalSize.width * baseScale;
    const renderH = naturalSize.height * baseScale;

    ctx.drawImage(
      imageRef.current,
      -renderW / 2 + adjustedOffsetX / zoom,
      -renderH / 2 + adjustedOffsetY / zoom,
      renderW,
      renderH
    );

    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const baseName = fileName.replace(/\.[^.]+$/, '');
        const croppedFile = new File([blob], `${baseName}.webp`, {
          type: 'image/webp',
          lastModified: Date.now(),
        });
        onConfirm(croppedFile);
      },
      'image/webp',
      0.88
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cropper-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/15 p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-white">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 id="cropper-title" className="text-base sm:text-lg font-black text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-400">
                Arraste para posicionar e use os controles para dar zoom ou girar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Área de Visualização e Recorte */}
        <div className="relative flex items-center justify-center bg-black/60 rounded-xl overflow-hidden py-4 select-none touch-none">
          {/* Caixa de visualização com guia visual */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-[280px] h-[280px] rounded-2xl overflow-hidden border-2 border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.4)] cursor-grab active:cursor-grabbing bg-slate-950 flex items-center justify-center"
            style={{
              aspectRatio: `${aspectRatio}`,
            }}
          >
            {/* Linhas de grade (regra dos terços) para enquadramento profissional */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-20 border border-white/20">
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-white/15" />
              <div className="border-r border-white/15" />
              <div />
            </div>

            {/* Imagem a ser manipulada */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Pré-visualização para corte"
              onLoad={onImageLoad}
              draggable={false}
              className="max-w-none pointer-events-none transition-transform duration-75"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transformOrigin: 'center center',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: imageLoaded ? 1 : 0,
              }}
            />

            {/* Dica central móvel */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-sm text-[10px] text-slate-300 px-2 py-0.5 rounded-full pointer-events-none z-30 flex items-center gap-1 border border-white/10">
              <Move className="w-2.5 h-2.5 text-orange-400" /> Arraste para centralizar
            </div>
          </div>
        </div>

        {/* Controles de Zoom, Giro e Reset */}
        <div className="space-y-3 bg-black/30 p-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-orange-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-xs font-mono text-slate-300 w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={handleRotate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition border border-white/10"
            >
              <RotateCw className="w-3.5 h-3.5 text-orange-400" />
              Girar 90° ({rotation}°)
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Centralizar / Resetar
            </button>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-white/20 text-slate-300 text-xs font-semibold hover:bg-white/5 transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            className="btn-neon px-5 py-2.5 text-xs flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Confirmar e Usar Foto
          </button>
        </div>
      </div>
    </div>
  );
}
