'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, X, HardDrive, ExternalLink } from 'lucide-react';
import { adminApprovePhoto, adminRejectPhoto } from '@/lib/admin/actions';

interface PendingPhotoItem {
  id: string;
  image_url: string;
  thumb_url?: string;
  bytes_size: number;
  created_at: string;
  portfolio_items?: {
    title: string;
    professional_profiles?: {
      display_name: string;
    };
  };
}

export function AdminFotosClient({ initialPhotos }: { initialPhotos: PendingPhotoItem[] }) {
  const [photos, setPhotos] = useState<PendingPhotoItem[]>(initialPhotos);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleConfirm() {
    if (!modalAction) return;
    if (!reason.trim()) {
      setErrorMsg('O motivo é estritamente obrigatório.');
      return;
    }

    setLoadingId(modalAction.id);
    setErrorMsg('');

    const res = modalAction.action === 'approve'
      ? await adminApprovePhoto(modalAction.id, reason.trim())
      : await adminRejectPhoto(modalAction.id, reason.trim());

    if (res.success) {
      setPhotos((prev) => prev.filter((p) => p.id !== modalAction.id));
      setModalAction(null);
      setReason('');
    } else {
      setErrorMsg(res.error || 'Erro na operação.');
    }
    setLoadingId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-amber-400" />
            Fila de Fotos Pendentes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Modere fotos enviadas pelos profissionais antes da exibição pública ({photos.length} na fila).
          </p>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
          Nenhuma foto aguardando moderação no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col">
              <div className="relative aspect-square bg-slate-900 group">
                <Image
                  src={photo.thumb_url || photo.image_url}
                  alt={photo.portfolio_items?.title || 'Foto de portfólio pendente'}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                  {(photo.bytes_size / 1024).toFixed(0)} KB
                </div>
                {photo.image_url && (
                  <a
                    href={photo.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver imagem em tamanho original"
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white/80 hover:text-white backdrop-blur-md transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-white truncate">
                    {photo.portfolio_items?.title || 'Projeto'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    Por: {photo.portfolio_items?.professional_profiles?.display_name || 'Profissional'}
                  </p>
                </div>
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setModalAction({ id: photo.id, action: 'approve' })}
                    disabled={loadingId === photo.id}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Aprovar
                  </button>
                  <button
                    onClick={() => setModalAction({ id: photo.id, action: 'reject' })}
                    disabled={loadingId === photo.id}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold border border-red-500/30 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    Recusar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Justificativa Obrigatória */}
      {modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white">
              {modalAction.action === 'approve' ? 'Aprovar Foto' : 'Recusar e Deletar Foto'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {modalAction.action === 'approve'
                ? 'A foto será movida para o bucket público e ficará visível no portfólio.'
                : 'A foto será removida permanentemente do banco e do Storage do Supabase.'}
            </p>
            <div>
              <label htmlFor="modal-reason-input" className="block text-xs font-semibold text-slate-300 mb-1">
                Motivo da decisão (obrigatório para log de auditoria):
              </label>
              <textarea
                id="modal-reason-input"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Informe o motivo da aprovação ou recusa..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
              />
              {errorMsg && <p className="text-xs text-red-400 mt-1">{errorMsg}</p>}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setModalAction(null); setReason(''); setErrorMsg(''); }}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loadingId !== null}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50 ${
                  modalAction.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

