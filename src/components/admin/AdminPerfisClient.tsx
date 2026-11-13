'use client';

import { useState } from 'react';
import {
  Users,
  ShieldAlert,
  Eye,
  ExternalLink,
  Search,
  X,
  Trash2,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  User,
} from 'lucide-react';
import { adminSuspendProfile, adminUnsuspendProfile, adminDeleteProfile, adminSetPublished } from '@/lib/admin/actions';

interface ProfileRow {
  id: string;
  display_name: string;
  slug: string;
  city: string;
  state: string;
  is_published: boolean;
  is_suspended: boolean;
  created_at: string;
  whatsapp?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
}

export function AdminPerfisClient({ initialProfiles }: { initialProfiles: ProfileRow[] }) {
  const [list, setList] = useState<ProfileRow[]>(initialProfiles);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'suspended'>('all');

  // Modal de confirmação
  const [modalAction, setModalAction] = useState<{
    id: string;
    action: 'suspend' | 'unsuspend' | 'delete' | 'unpublish';
    name: string;
  } | null>(null);
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Drawer de detalhes
  const [detailProfile, setDetailProfile] = useState<ProfileRow | null>(null);

  // ─── Filtro ───────────────────────────────────────────────────────────────────
  const filtered = list.filter((p) => {
    const matchSearch =
      p.display_name.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && p.is_published && !p.is_suspended) ||
      (filterStatus === 'draft' && !p.is_published && !p.is_suspended) ||
      (filterStatus === 'suspended' && p.is_suspended);

    return matchSearch && matchStatus;
  });

  // ─── Ações ────────────────────────────────────────────────────────────────────
  async function handleConfirm() {
    if (!modalAction) return;
    if (
      (modalAction.action === 'suspend' || modalAction.action === 'unsuspend') &&
      !reason.trim()
    ) {
      setErrorMsg('O motivo é obrigatório para registro de auditoria.');
      return;
    }

    setLoadingId(modalAction.id);
    setErrorMsg('');
    setSuccessMsg('');

    let res: { success?: boolean; error?: string };
    if (modalAction.action === 'suspend') {
      res = await adminSuspendProfile(modalAction.id, reason.trim());
    } else if (modalAction.action === 'unsuspend') {
      res = await adminUnsuspendProfile(modalAction.id, reason.trim());
    } else if (modalAction.action === 'delete') {
      res = await adminDeleteProfile(modalAction.id);
    } else {
      res = await adminSetPublished(modalAction.id, false);
    }

    if (res.success) {
      if (modalAction.action === 'delete') {
        setList((prev) => prev.filter((p) => p.id !== modalAction.id));
        if (detailProfile?.id === modalAction.id) setDetailProfile(null);
      } else if (modalAction.action === 'unpublish') {
        setList((prev) =>
          prev.map((p) => (p.id === modalAction.id ? { ...p, is_published: false } : p))
        );
        if (detailProfile?.id === modalAction.id)
          setDetailProfile((prev) => prev ? { ...prev, is_published: false } : null);
      } else {
        const isSuspended = modalAction.action === 'suspend';
        setList((prev) =>
          prev.map((p) => (p.id === modalAction.id ? { ...p, is_suspended: isSuspended } : p))
        );
        if (detailProfile?.id === modalAction.id)
          setDetailProfile((prev) => prev ? { ...prev, is_suspended: isSuspended } : null);
      }
      setSuccessMsg('Ação realizada com sucesso.');
      setModalAction(null);
      setReason('');
    } else {
      setErrorMsg(res.error || 'Erro ao executar ação.');
    }
    setLoadingId(null);
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            Gestão de Perfis Profissionais
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {list.length} perfis cadastrados • {list.filter((p) => p.is_published).length} publicados • {list.filter((p) => p.is_suspended).length} suspensos
          </p>
        </div>
      </div>

      {/* Alertas globais */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {successMsg}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome, cidade ou slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-black/30 border border-white/15 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft', 'suspended'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                filterStatus === f
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'published' ? 'Publicados' : f === 'draft' ? 'Rascunhos' : 'Suspensos'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Profissional</th>
                <th className="p-3.5">Localização</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 text-xs">
                    Nenhum perfil encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
              {filtered.map((prof) => (
                <tr key={prof.id} className="hover:bg-white/5 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        {prof.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={prof.avatar_url} alt={prof.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white whitespace-nowrap">{prof.display_name}</p>
                        <p className="text-slate-500 text-[10px]">{prof.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">
                    {prof.city} — {prof.state}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                        prof.is_published
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-700/50 text-slate-400'
                      }`}>
                        {prof.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                      {prof.is_suspended && (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold w-fit">
                          Suspenso
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* Ver detalhes */}
                      <button
                        onClick={() => setDetailProfile(prof)}
                        title="Ver detalhes"
                        className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Ver perfil público */}
                      {prof.is_published && (
                        <a
                          href={`/profissionais/${prof.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ver na vitrine pública"
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Despublicar */}
                      {prof.is_published && !prof.is_suspended && (
                        <button
                          onClick={() => setModalAction({ id: prof.id, action: 'unpublish', name: prof.display_name })}
                          title="Despublicar"
                          disabled={loadingId === prof.id}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition disabled:opacity-50"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Suspender / Reativar */}
                      {prof.is_suspended ? (
                        <button
                          onClick={() => setModalAction({ id: prof.id, action: 'unsuspend', name: prof.display_name })}
                          title="Reativar conta"
                          disabled={loadingId === prof.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 font-bold text-[11px] transition disabled:opacity-50"
                        >
                          Reativar
                        </button>
                      ) : (
                        <button
                          onClick={() => setModalAction({ id: prof.id, action: 'suspend', name: prof.display_name })}
                          title="Suspender conta"
                          disabled={loadingId === prof.id}
                          className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 font-bold text-[11px] transition disabled:opacity-50"
                        >
                          Suspender
                        </button>
                      )}

                      {/* Excluir permanentemente */}
                      <button
                        onClick={() => setModalAction({ id: prof.id, action: 'delete', name: prof.display_name })}
                        title="Excluir permanentemente"
                        disabled={loadingId === prof.id}
                        className="p-1.5 rounded-lg bg-red-900/20 text-red-500 hover:bg-red-900/40 transition disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Drawer de Detalhes do Perfil ──────────────────────────────────────── */}
      {detailProfile && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setDetailProfile(null)}
          />
          {/* Painel lateral */}
          <div className="w-full max-w-md bg-slate-900 border-l border-white/10 flex flex-col h-full overflow-y-auto shadow-2xl">
            {/* Header do drawer */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-slate-900 z-10">
              <h2 className="font-black text-white text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-400" />
                Detalhes do Perfil
              </h2>
              <button
                onClick={() => setDetailProfile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Avatar + nome */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/15 flex items-center justify-center flex-shrink-0">
                  {detailProfile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={detailProfile.avatar_url} alt={detailProfile.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                <div>
                  <p className="font-black text-white text-lg leading-tight">{detailProfile.display_name}</p>
                  <p className="text-xs text-orange-400 font-semibold mt-0.5">{detailProfile.city} • {detailProfile.state}</p>
                  <div className="flex gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      detailProfile.is_published
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-700/50 text-slate-400'
                    }`}>
                      {detailProfile.is_published ? 'Publicado' : 'Rascunho'}
                    </span>
                    {detailProfile.is_suspended && (
                      <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
                        Suspenso
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {detailProfile.bio && (
                <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Apresentação</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{detailProfile.bio}</p>
                </div>
              )}

              {/* Contatos */}
              <div className="grid grid-cols-2 gap-3">
                {detailProfile.whatsapp && (
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">WhatsApp</p>
                    <p className="text-sm text-emerald-300 font-mono">{detailProfile.whatsapp}</p>
                  </div>
                )}
                {detailProfile.phone && (
                  <div className="p-3 rounded-xl bg-black/20 border border-white/10">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Telefone</p>
                    <p className="text-sm text-slate-300 font-mono">{detailProfile.phone}</p>
                  </div>
                )}
              </div>

              {/* Metadados */}
              <div className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">ID</span>
                  <span className="text-slate-300 font-mono text-[10px]">{detailProfile.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Slug</span>
                  <span className="text-slate-300 font-mono">{detailProfile.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Criado em</span>
                  <span className="text-slate-300">
                    {new Date(detailProfile.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Links de acesso */}
              <div className="flex flex-col gap-2">
                {detailProfile.is_published && (
                  <a
                    href={`/profissionais/${detailProfile.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold hover:bg-sky-500/20 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir Perfil Público na Vitrine
                  </a>
                )}
              </div>

              {/* Ações administrativas */}
              <div className="border-t border-white/10 pt-4 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Ações Administrativas</p>

                {detailProfile.is_published && !detailProfile.is_suspended && (
                  <button
                    onClick={() => {
                      setDetailProfile(null);
                      setModalAction({ id: detailProfile.id, action: 'unpublish', name: detailProfile.display_name });
                    }}
                    className="w-full flex items-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 transition"
                  >
                    <EyeOff className="w-4 h-4" />
                    Despublicar Perfil
                  </button>
                )}

                {detailProfile.is_suspended ? (
                  <button
                    onClick={() => {
                      setDetailProfile(null);
                      setModalAction({ id: detailProfile.id, action: 'unsuspend', name: detailProfile.display_name });
                    }}
                    className="w-full flex items-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Reativar Conta
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setDetailProfile(null);
                      setModalAction({ id: detailProfile.id, action: 'suspend', name: detailProfile.display_name });
                    }}
                    className="w-full flex items-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Suspender Conta
                  </button>
                )}

                <button
                  onClick={() => {
                    setDetailProfile(null);
                    setModalAction({ id: detailProfile.id, action: 'delete', name: detailProfile.display_name });
                  }}
                  className="w-full flex items-center gap-2 py-2.5 px-4 rounded-xl bg-red-900/20 text-red-500 border border-red-900/30 text-xs font-bold hover:bg-red-900/30 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Permanentemente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal de Confirmação ─────────────────────────────────────────────── */}
      {modalAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {modalAction.action === 'delete' ? (
                <Trash2 className="w-5 h-5 text-red-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-orange-400" />
              )}
              {modalAction.action === 'suspend' && 'Suspender Perfil'}
              {modalAction.action === 'unsuspend' && 'Reativar Perfil'}
              {modalAction.action === 'unpublish' && 'Despublicar Perfil'}
              {modalAction.action === 'delete' && 'Excluir Perfil Permanentemente'}
            </h3>

            <p className="text-xs text-slate-300">
              Perfil alvo: <strong className="text-white">{modalAction.name}</strong>
            </p>

            {modalAction.action === 'delete' && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                ⚠️ Esta ação é <strong>irreversível</strong>. Todos os dados do perfil serão removidos permanentemente.
              </div>
            )}

            {modalAction.action === 'unpublish' && (
              <p className="text-xs text-slate-400">
                O perfil deixará de aparecer na busca pública imediatamente, mas o profissional ainda poderá publicá-lo novamente.
              </p>
            )}

            {(modalAction.action === 'suspend' || modalAction.action === 'unsuspend') && (
              <div>
                <label htmlFor="modal-reason" className="block text-xs font-semibold text-slate-300 mb-1">
                  Motivo (obrigatório para log de auditoria):
                </label>
                <textarea
                  id="modal-reason"
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    modalAction.action === 'suspend'
                      ? 'Ex: Fraude documental confirmada, perfil falso, violação dos termos...'
                      : 'Ex: Regularização atendida, identidade verificada...'
                  }
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                />
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {errorMsg}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setModalAction(null); setReason(''); setErrorMsg(''); }}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loadingId !== null}
                className={`px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 transition ${
                  modalAction.action === 'delete'
                    ? 'bg-red-700 hover:bg-red-600 text-white'
                    : modalAction.action === 'unsuspend'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'btn-primary'
                }`}
              >
                {loadingId ? 'Aguarde...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
