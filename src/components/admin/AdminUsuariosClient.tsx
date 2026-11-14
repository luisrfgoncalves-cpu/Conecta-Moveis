'use client';

import { useState } from 'react';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  CreditCard,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  searchAdminUsers,
  suspendUserAccount,
  reactivateUserAccount,
  forceUserLogout,
  deleteUserAccountTwoStep,
  grantManualPlan,
} from '@/lib/admin/actions';

interface UserItem {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_suspended: boolean;
  created_at: string;
  role: string | null;
  active_plan: string;
}

interface AdminUsuariosClientProps {
  initialUsers: UserItem[];
  currentUserRole: string;
}

export function AdminUsuariosClient({ initialUsers, currentUserRole }: AdminUsuariosClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Modais de ação
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'reactivate' | 'logout' | 'plan' | 'delete' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Formulário de plano manual
  const [planCode, setPlanCode] = useState('pro');
  const [planOrigin, setPlanOrigin] = useState<'manual' | 'convite' | 'teste' | 'pago_futuro'>('manual');
  const [validUntil, setValidUntil] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    const res = await searchAdminUsers(searchTerm);
    if (res.success && res.users) {
      setUsers(res.users);
    } else {
      setFeedback({ type: 'err', text: res.error || 'Falha na pesquisa de contas.' });
    }
    setLoading(false);
  }

  function openAction(user: UserItem, type: 'suspend' | 'reactivate' | 'logout' | 'plan' | 'delete') {
    setSelectedUser(user);
    setActionType(type);
    setActionReason('');
    setDeleteConfirmation('');
    setFeedback(null);
  }

  function closeAction() {
    setSelectedUser(null);
    setActionType(null);
    setActionReason('');
    setDeleteConfirmation('');
  }

  async function submitAction() {
    if (!selectedUser || !actionType) return;
    setLoading(true);
    setFeedback(null);

    let res: { success: boolean; error?: string } = { success: false };

    if (actionType === 'suspend') {
      res = await suspendUserAccount(selectedUser.id, actionReason);
      if (res.success) {
        setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, is_suspended: true } : u)));
      }
    } else if (actionType === 'reactivate') {
      res = await reactivateUserAccount(selectedUser.id, actionReason);
      if (res.success) {
        setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, is_suspended: false } : u)));
      }
    } else if (actionType === 'logout') {
      res = await forceUserLogout(selectedUser.id, actionReason);
    } else if (actionType === 'delete') {
      res = await deleteUserAccountTwoStep(selectedUser.id, actionReason, deleteConfirmation);
      if (res.success) {
        setUsers(users.filter((u) => u.id !== selectedUser.id));
      }
    } else if (actionType === 'plan') {
      res = await grantManualPlan({
        userId: selectedUser.id,
        planCode,
        origin: planOrigin,
        validUntil: validUntil ? validUntil : null,
        reason: actionReason,
      });
      if (res.success) {
        setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, active_plan: planCode } : u)));
      }
    }

    if (res.success) {
      setFeedback({ type: 'ok', text: 'Ação administrativa executada e registrada com sucesso!' });
      closeAction();
    } else {
      setFeedback({ type: 'err', text: res.error || 'Falha ao executar operação.' });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-sky-400" />
          Gestão de Usuários e Contas
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ficha cadastral somente leitura, suspensões preventivas, atribuição de planos manuais e encerramento de contas.
        </p>
      </div>

      {feedback && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
          feedback.type === 'ok'
            ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
            : 'bg-red-500/15 border border-red-500/40 text-red-300'
        }`}>
          {feedback.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Busca */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Pesquisar'}
        </button>
      </form>

      {/* Tabela de Usuários */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Nome e Contato</th>
                <th className="p-3.5">Papel</th>
                <th className="p-3.5">Plano Ativo</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Cadastro</th>
                <th className="p-3.5 text-right">Ações Administrativas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Nenhum usuário localizado.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{u.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      {u.phone && <div className="text-[10px] text-slate-500">{u.phone}</div>}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        u.role === 'owner'
                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          : u.role === 'admin'
                          ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                          : u.role === 'moderator'
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/10'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold uppercase">
                        {u.active_plan}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {u.is_suspended ? (
                        <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-bold uppercase">
                          Suspenso
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                          Ativo
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                      {/* Atribuir Plano Manual */}
                      <button
                        onClick={() => openAction(u, 'plan')}
                        title="Conceder Plano Manual"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 transition"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </button>

                      {/* Suspender ou Reativar */}
                      {u.is_suspended ? (
                        <button
                          onClick={() => openAction(u, 'reactivate')}
                          title="Reativar Conta"
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => openAction(u, 'suspend')}
                          title="Suspender Conta"
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Forçar Logout */}
                      <button
                        onClick={() => openAction(u, 'logout')}
                        title="Forçar Encerramento de Sessão"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>

                      {/* Exclusão em Duas Etapas (Apenas Owner) */}
                      {currentUserRole === 'owner' && (
                        <button
                          onClick={() => openAction(u, 'delete')}
                          title="Excluir Definitivamente (Exclusivo Owner)"
                          className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Genérico de Ação Administrativa */}
      {selectedUser && actionType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel rounded-2xl border border-white/10 bg-slate-950 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {actionType === 'suspend' && <ShieldAlert className="w-4 h-4 text-red-400" />}
                {actionType === 'reactivate' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                {actionType === 'logout' && <LogOut className="w-4 h-4 text-slate-300" />}
                {actionType === 'plan' && <CreditCard className="w-4 h-4 text-amber-400" />}
                {actionType === 'delete' && <Trash2 className="w-4 h-4 text-red-500" />}
                <span>
                  {actionType === 'suspend' && 'Suspender Conta de Usuário'}
                  {actionType === 'reactivate' && 'Reativar Conta de Usuário'}
                  {actionType === 'logout' && 'Forçar Logout da Sessão'}
                  {actionType === 'plan' && 'Conceder Plano Manual'}
                  {actionType === 'delete' && 'Exclusão Definitiva (Etapa 2/2)'}
                </span>
              </h3>
              <button onClick={closeAction} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div>Usuário: <strong className="text-white">{selectedUser.full_name}</strong></div>
              <div>E-mail: <span className="font-mono text-slate-400">{selectedUser.email}</span></div>
            </div>

            {/* Campos adicionais para Plano Manual */}
            {actionType === 'plan' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label htmlFor="planSelectModal" className="block text-[11px] text-slate-400 mb-1">Selecione o Plano:</label>
                  <select
                    id="planSelectModal"
                    value={planCode}
                    onChange={(e) => setPlanCode(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="gratuito">Gratuito (Básico)</option>
                    <option value="pro">Profissional (Pro)</option>
                    <option value="destaque">Destaque Exclusivo</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="planOriginModal" className="block text-[11px] text-slate-400 mb-1">Origem da Concessão:</label>
                  <select
                    id="planOriginModal"
                    value={planOrigin}
                    onChange={(e) => setPlanOrigin(e.target.value as 'manual' | 'convite' | 'teste' | 'pago_futuro')}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="manual">Concessão Manual</option>
                    <option value="convite">Convite de Anunciante</option>
                    <option value="teste">Período de Degustação / Teste</option>
                    <option value="pago_futuro">Acordo Comercial Futuro</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="planValidUntilModal" className="block text-[11px] text-slate-400 mb-1">Válido Até (opcional, vazio = vitalício):</label>
                  <input
                    id="planValidUntilModal"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {/* Aviso de exclusão e palavra de confirmação */}
            {actionType === 'delete' && (
              <div className="space-y-2 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs">
                <p>
                  <strong>ATENÇÃO:</strong> Esta ação é irreversível. O usuário será removido da base de dados respeitando-se apenas os logs obrigatórios do Marco Civil.
                </p>
                <div>
                  <label htmlFor="confirmDelInput" className="block text-[11px] text-red-300 font-bold mb-1">
                    Digite exatamente &apos;CONFIRMAR_EXCLUSAO&apos; abaixo:
                  </label>
                  <input
                    id="confirmDelInput"
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="CONFIRMAR_EXCLUSAO"
                    className="w-full bg-slate-900 border border-red-500/40 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Campo de Justificativa Obrigatório para Qualquer Ação */}
            <div>
              <label htmlFor="actionReasonInput" className="block text-[11px] text-slate-400 mb-1">
                Justificativa Administrativa * (mínimo 10 caracteres):
              </label>
              <textarea
                id="actionReasonInput"
                rows={2}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Informe o motivo formal que será gravado no livro de auditoria..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={closeAction}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={
                  loading ||
                  actionReason.trim().length < 10 ||
                  (actionType === 'delete' && deleteConfirmation !== 'CONFIRMAR_EXCLUSAO')
                }
                onClick={submitAction}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold disabled:opacity-50 ${
                  actionType === 'delete'
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'btn-primary'
                }`}
              >
                {loading ? 'Processando...' : 'Confirmar e Registrar em Auditoria'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
