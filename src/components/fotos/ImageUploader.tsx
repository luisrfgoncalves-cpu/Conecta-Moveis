'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ImagePlus,
  Info,
} from 'lucide-react';
import { processImagePipeline } from '@/lib/images/clientProcessor';
import type { ImageType } from '@/lib/portfolio/config';

export interface PreparedPhotoItem {
  file: File;
  previewUrl: string;
  imageType: ImageType;
  authorshipDeclared: boolean;
  originalSizeKB: number;
  processedSizeKB: number;
  wasConverted: boolean;
}

interface ImageUploaderProps {
  maxPhotos?: number;
  currentCount?: number;
  onPhotosReady?: (photos: PreparedPhotoItem[]) => void;
  disabled?: boolean;
}

interface LocalPhotoItem extends PreparedPhotoItem {
  id: string;
  processing: boolean;
  error?: string;
}

export function ImageUploader({
  maxPhotos = 3,
  currentCount = 0,
  onPhotosReady,
  disabled = false,
}: ImageUploaderProps) {
  const [items, setItems] = useState<LocalPhotoItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableSlots = Math.max(0, maxPhotos - currentCount - items.length);

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setErrorMessage(null);
      const incoming = Array.from(fileList);

      if (incoming.length > availableSlots) {
        setErrorMessage(
          `Você pode adicionar mais ${availableSlots} foto(s) de acordo com a cota do seu plano.`
        );
        return;
      }

      const newEntries: LocalPhotoItem[] = incoming.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        imageType: 'trabalho_realizado',
        authorshipDeclared: false,
        originalSizeKB: Math.round(f.size / 1024),
        processedSizeKB: Math.round(f.size / 1024),
        wasConverted: false,
        processing: true,
      }));

      setItems((prev) => [...prev, ...newEntries]);

      // Processamento em segundo plano (HEIC -> JPEG/WebP e compressão leve)
      const results = await Promise.all(
        newEntries.map(async (entry) => {
          try {
            const processed = await processImagePipeline(entry.file);
            URL.revokeObjectURL(entry.previewUrl);
            return {
              ...entry,
              file: processed.file,
              previewUrl: processed.previewUrl,
              originalSizeKB: processed.originalSizeKB,
              processedSizeKB: processed.processedSizeKB,
              wasConverted: processed.wasConverted,
              processing: false,
            };
          } catch {
            return {
              ...entry,
              processing: false,
              error: 'Não foi possível processar esta imagem. Tente outro formato.',
            };
          }
        })
      );

      setItems((prev) =>
        prev.map((it) => {
          const match = results.find((r) => r.id === it.id);
          return match || it;
        })
      );
    },
    [availableSlots]
  );

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const updateItem = (id: string, updates: Partial<LocalPhotoItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const confirmAll = () => {
    const unconfirmed = items.filter((i) => !i.authorshipDeclared && !i.error && !i.processing);
    if (unconfirmed.length > 0) {
      setErrorMessage('Por favor, confirme a declaração de autoria para todas as fotos.');
      return;
    }

    const ready = items.filter((i) => !i.error && !i.processing);
    if (onPhotosReady) {
      onPhotosReady(ready);
    }
  };

  const allValid =
    items.length > 0 &&
    items.every((i) => i.authorshipDeclared && !i.processing && !i.error);

  return (
    <div className="space-y-4">
      {/* Área de Seleção / Drop */}
      {availableSlots > 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
            isDragging
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-white/20 hover:border-orange-500/50 bg-white/5'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,.heic,.heif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = '';
            }}
            disabled={disabled}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <ImagePlus className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">
              Toque para escolher fotos do celular ou arraste para cá
            </p>
            <p className="text-xs text-slate-400">
              Fotos diretas da câmera (JPEG, PNG, WebP ou HEIC do iPhone) · Otimizadas automaticamente
            </p>
            <span className="text-xs font-semibold text-orange-400 mt-1">
              {availableSlots} vaga(s) disponível(is) para envio
            </span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Lista de Imagens Selecionadas com Controles */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-white/10">
                  <Image
                    src={item.previewUrl}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  {item.processing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-white truncate">{item.file.name}</p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition"
                      title="Remover"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.wasConverted && <span className="text-orange-400 mr-1">HEIC convertido •</span>}
                    {item.originalSizeKB} KB → {item.processedSizeKB} KB (WebP otimizado)
                  </p>

                  {item.error && <p className="text-[11px] text-red-400 mt-1">{item.error}</p>}
                </div>
              </div>

              {/* Seleção do Tipo de Foto */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Classificação da Imagem (CDC art. 37):</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => updateItem(item.id, { imageType: 'trabalho_realizado' })}
                    className={`py-2 px-3 rounded-xl border font-semibold text-left transition ${
                      item.imageType === 'trabalho_realizado'
                        ? 'bg-orange-500/20 border-orange-500/60 text-orange-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    🔨 Trabalho realizado
                    <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                      Foto real de serviço feito por você
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateItem(item.id, { imageType: 'ilustrativa' })}
                    className={`py-2 px-3 rounded-xl border font-semibold text-left transition ${
                      item.imageType === 'ilustrativa'
                        ? 'bg-blue-500/20 border-blue-500/60 text-blue-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    🖼️ Imagem ilustrativa
                    <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                      Projeto 3D, arte ou conceito
                    </span>
                  </button>
                </div>

                {/* Declaração de Autoria e Consentimento */}
                <label className="flex items-start gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.authorshipDeclared}
                    onChange={(e) => updateItem(item.id, { authorshipDeclared: e.target.checked })}
                    className="mt-0.5 rounded border-white/20 text-orange-500 focus:ring-orange-500 bg-slate-950"
                  />
                  <span className="text-[11px] text-slate-300 leading-tight">
                    Declaro que sou o autor desta foto ou possuo autorização expressa, e que eventuais pessoas identificáveis consentiram com a divulgação.
                  </span>
                </label>

                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3 text-orange-400 shrink-0" />
                  Dica de privacidade: evite expor rostos de terceiros, placas de veículos e fachadas com número.
                </p>
              </div>
            </div>
          ))}

          {onPhotosReady && (
            <button
              type="button"
              onClick={confirmAll}
              disabled={!allValid}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Confirmar e Adicionar {items.length} Foto(s)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
