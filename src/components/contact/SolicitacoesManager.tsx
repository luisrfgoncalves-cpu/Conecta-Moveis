'use client';

import { useState } from 'react';
import { MessageSquare, CheckCircle2, Archive, Clock, User } from 'lucide-react';
import {
  markContactRequestRead,
  archiveContactRequest,
  type ContactRequestItem,
} from '@/lib/contact/actions';

interface SolicitacoesManagerProps {
  initialRequests: ContactRequestItem[];
}

export function SolicitacoesManager({ initialRequests }: SolicitacoesManagerProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');

  const filtered = requests.filter((r) => {
    if (filter === 'unread') return !r.is_read && !r.is_archived;
    if (filter === 'archived') return r.is_archived;
    return !r.is_archived;
  });

  async function handleMarkRead(id: string) {
    await markContactRequestRead(id);
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_read: true } : r))
    );
  }

  async function handleArchive(id: string) {
    await archiveContactRequest(id);
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_archived: true } : r))
    );
  }

  const unreadCount = requests.filter((r) => !r.is_read && !r.is_archived).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-orange-400" aria-hidden />
          Solicitações de Contato
          {unreadCount > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </h1>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'unread', 'archived'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {f === 'all' ? 'Ativas' : f === 'unread' ? 'Não lidas' : 'Arquivadas'}
          </button>
        ))}
      </div>

      {/* Aviso de retenção */}
      <div className="glass-panel rounded-xl p-3 border border-white/10 text-xs text-slate-400 flex items-start gap-2">
        <Clock className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" aria-hidden />
        <span>
          As mensagens são apagadas automaticamente após <strong>90 dias</strong> da data de envio, conforme a nossa política de privacidade.
        </span>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" aria-hidden />
          <p className="text-sm">Nenhuma solicitação{filter === 'unread' ? ' não lida' : filter === 'archived' ? ' arquivada' : ''}.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((req) => (
            <li
              key={req.id}
              className={`glass-panel rounded-2xl p-5 space-y-3 border transition-colors ${
                !req.is_read && !req.is_archived
                  ? 'border-orange-500/30 bg-orange-500/5'
                  : 'border-white/10'
              }`}
            >
              {/* Remetente */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">
                    {req.sender?.full_name?.charAt(0)?.toUpperCase() ?? <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {req.sender?.full_name ?? 'Usuário'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{req.sender?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!req.is_read && !req.is_archived && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 rounded-full px-2 py-0.5 font-medium">
                      Nova
                    </span>
                  )}
                  <time
                    dateTime={req.created_at}
                    className="text-xs text-slate-500"
                    title={new Date(req.created_at).toLocaleString('pt-BR')}
                  >
                    {new Date(req.created_at).toLocaleDateString('pt-BR')}
                  </time>
                </div>
              </div>

              {/* Mensagem */}
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                {req.message}
              </p>

              {/* Expiração */}
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden />
                Expira em {new Date(req.expires_at).toLocaleDateString('pt-BR')}
              </p>

              {/* Ações */}
              {!req.is_archived && (
                <div className="flex gap-2 pt-1">
                  {!req.is_read && (
                    <button
                      onClick={() => handleMarkRead(req.id)}
                      className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />
                      Marcar como lida
                    </button>
                  )}
                  <button
                    onClick={() => handleArchive(req.id)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" aria-hidden />
                    Arquivar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

