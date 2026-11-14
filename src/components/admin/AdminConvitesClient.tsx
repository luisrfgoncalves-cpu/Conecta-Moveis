'use client';

import { useState, useTransition } from 'react';
import {
  createInviteLink,
  revokeInviteLink,
  duplicateInviteLink,
} from '@/lib/invites/actions';
import { InviteLinkRecord } from '@/lib/invites/schemas';
import { generateQRCodeSVG } from '@/lib/invites/qrcode';
import {
  Ticket,
  Plus,
  Copy,
  Check,
  QrCode,
  RotateCcw,
  Ban,
  Sparkles,
  BarChart3,
  Layers,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react';

interface AdminConvitesClientProps {
  initialInvites: InviteLinkRecord[];
  initialStats: Record<string, number>;
  appBaseUrl: string;
}

export function AdminConvitesClient({
  initialInvites,
  initialStats,
  appBaseUrl,
}: AdminConvitesClientProps) {
  const [invites, setInvites] = useState<InviteLinkRecord[]>(initialInvites);
  const [stats, setStats] = useState<Record<string, number>>(initialStats);
  const [isPending, startTransition] = useTransition();

  // Estados do formulário de criação
  const [type, setType] = useState<'convite' | 'teste' | 'campanha'>('teste');
  const [planCode, setPlanCode] = useState<'gratuito' | 'pro' | 'destaque'>('pro');
  const [trialDays, setTrialDays] = useState<number>(30); // Decidido pelo dono
  const [maxUses, setMaxUses] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [campaignLabel, setCampaignLabel] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Notificações e modais
  const [createdResult, setCreatedResult] = useState<{
    fullToken: string;
    url: string;
    invite: InviteLinkRecord;
  } | null>(null);
  const [activeQrModal, setActiveQrModal] = useState<{ url: string; label: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const result = await createInviteLink({
        type,
        plan_code: planCode,
        trial_days: Number(trialDays) || 0,
        max_uses: maxUses ? parseInt(maxUses, 10) : undefined,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        campaign_label: campaignLabel.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (!result.success || !result.invite || !result.fullToken) {
        setErrorMessage(result.error || 'Falha ao gerar link de convite.');
        return;
      }

      const fullUrl = `${appBaseUrl}/convite/${result.fullToken}`;
      setCreatedResult({
        fullToken: result.fullToken,
        url: fullUrl,
        invite: result.invite,
      });

      // Atualiza listagem local
      setInvites((prev) => [result.invite!, ...prev]);
      const camp = result.invite.campaign_label || 'Sem campanha';
      setStats((prev) => ({ ...prev, [camp]: (prev[camp] || 0) }));

      // Limpa formulário
      setCampaignLabel('');
      setNotes('');
      setMaxUses('');
      setExpiresAt('');
    });
  }

  function handleRevoke(id: string) {
    if (!confirm('Deseja realmente revogar este convite? Ninguém mais poderá resgatá-lo.')) return;
    setErrorMessage(null);

    startTransition(async () => {
      const result = await revokeInviteLink(id);
      if (result.success) {
        setInvites((prev) =>
          prev.map((inv) => (inv.id === id ? { ...inv, is_active: false } : inv))
        );
      } else {
        setErrorMessage(result.error || 'Falha ao revogar convite.');
      }
    });
  }

  function handleDuplicate(id: string) {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await duplicateInviteLink(id);
      if (result.success && result.fullToken) {
        alert(
          `Convite duplicado com sucesso!\nToken novo: ${result.fullToken}\nLink: ${appBaseUrl}/convite/${result.fullToken}`
        );
        window.location.reload();
      } else {
        setErrorMessage(result.error || 'Falha ao duplicar convite.');
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Alerta de erro geral */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal de Token Gerado (Segurança: Exibição Única) */}
      {createdResult && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 shadow-2xl relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Link de Convite Criado com Sucesso!</h3>
                <p className="text-xs text-amber-300 font-medium">
                  Atenção: Por segurança criptográfica, o token completo não será mostrado novamente.
                  Copie e guarde o link agora.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCreatedResult(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-mono text-sm text-emerald-300 break-all select-all">
              {createdResult.url}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => copyToClipboard(createdResult.url, 'created-url')}
                className="btn-neon px-4 py-2 text-xs flex items-center gap-2"
              >
                {copiedKey === 'created-url' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Link
                  </>
                )}
              </button>
              <button
                onClick={() =>
                  setActiveQrModal({
                    url: createdResult.url,
                    label: createdResult.invite.campaign_label || 'Convite',
                  })
                }
                className="px-4 py-2 text-xs rounded-xl border border-white/20 text-white hover:bg-white/10 transition flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas Agregadas de Campanhas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total de Convites</span>
            <Ticket className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white">{invites.length}</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Resgates Realizados</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {invites.reduce((acc, curr) => acc + (curr.uses_count || 0), 0)}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Convites Ativos</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {invites.filter((i) => i.is_active).length}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Campanhas Distintas</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{Object.keys(stats).length}</div>
        </div>
      </div>

      {/* Formulário de Criação de Convite / Campanha */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Criar Novo Link de Convite ou Campanha</h2>
            <p className="text-xs text-slate-400">
              Configure o tipo, plano, e defina livremente a quantidade de dias de teste.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tipo de Link
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'convite' | 'teste' | 'campanha')}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="teste" className="bg-slate-900 text-white">
                  Degustação / Teste
                </option>
                <option value="convite" className="bg-slate-900 text-white">
                  Convite Direto
                </option>
                <option value="campanha" className="bg-slate-900 text-white">
                  Campanha Divulgação
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Plano Concedido
              </label>
              <select
                value={planCode}
                onChange={(e) => setPlanCode(e.target.value as 'gratuito' | 'pro' | 'destaque')}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="pro" className="bg-slate-900 text-white">
                  Plano Profissional
                </option>
                <option value="destaque" className="bg-slate-900 text-white">
                  Plano Destaque
                </option>
                <option value="gratuito" className="bg-slate-900 text-white">
                  Plano Gratuito
                </option>
              </select>
            </div>

            {/* Controle Total do Dono: Dias de Teste */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Dias de Degustação / Teste</span>
                <span className="text-[10px] text-orange-400 font-normal">Decidido por você</span>
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={trialDays}
                onChange={(e) => setTrialDays(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Ex: 30 (dias)"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Rótulo da Campanha <span className="text-slate-500">(opcional)</span>
              </label>
              <input
                type="text"
                value={campaignLabel}
                onChange={(e) => setCampaignLabel(e.target.value)}
                placeholder="Ex: Instagram_Nov26, Feira_Moveis"
                className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Máximo de Resgates <span className="text-slate-500">(vazio = ilimitado)</span>
              </label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Ex: 50"
                className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Data de Validade <span className="text-slate-500">(opcional)</span>
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observações Internas <span className="text-slate-500">(apenas administradores)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Entregue para marceneiros do grupo local"
              className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="btn-neon px-6 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando Link...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Criar Link de Convite
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Listagem de Links Criados */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h2 className="text-lg font-bold text-white mb-4">Links Gerados</h2>

        {invites.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">Nenhum convite gerado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 uppercase text-[11px] tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Código (Preview)</th>
                  <th className="py-3 px-4">Tipo / Campanha</th>
                  <th className="py-3 px-4">Plano</th>
                  <th className="py-3 px-4">Degustação</th>
                  <th className="py-3 px-4">Usos</th>
                  <th className="py-3 px-4">Validade</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invites.map((inv) => {
                  const isExpired = inv.expires_at && new Date(inv.expires_at) < new Date();
                  const isExhausted = inv.max_uses && (inv.uses_count || 0) >= inv.max_uses;

                  return (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-4 font-mono text-xs text-orange-400">
                        {inv.token_preview}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white capitalize">{inv.type}</div>
                        <div className="text-xs text-slate-400">
                          {inv.campaign_label || 'Sem rótulo'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-white uppercase text-xs">
                        {inv.plan_code}
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs">
                        {inv.trial_days > 0 ? `${inv.trial_days} dias` : 'Permanente'}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {inv.uses_count} {inv.max_uses ? `/ ${inv.max_uses}` : ''}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {inv.expires_at ? new Date(inv.expires_at).toLocaleDateString() : 'Sem prazo'}
                      </td>
                      <td className="py-3 px-4">
                        {!inv.is_active ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30">
                            Revogado
                          </span>
                        ) : isExpired ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Expirado
                          </span>
                        ) : isExhausted ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            Esgotado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Ativo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Duplicar configuração"
                            onClick={() => handleDuplicate(inv.id)}
                            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          {inv.is_active && (
                            <button
                              title="Revogar convite"
                              onClick={() => handleRevoke(inv.id)}
                              className="p-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/20 text-red-400 transition"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Exibição de QR Code */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/20 bg-slate-900 max-w-sm w-full text-center relative shadow-2xl">
            <button
              onClick={() => setActiveQrModal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">QR Code de Convite</h3>
            <p className="text-xs text-slate-400 mb-6">{activeQrModal.label}</p>

            <div
              className="flex justify-center mb-6"
              dangerouslySetInnerHTML={{
                __html: generateQRCodeSVG(activeQrModal.url, 220),
              }}
            />

            <div className="bg-black/50 p-2.5 rounded-xl border border-white/10 text-[11px] font-mono text-slate-300 break-all mb-4">
              {activeQrModal.url}
            </div>

            <button
              onClick={() => copyToClipboard(activeQrModal.url, 'modal-url')}
              className="btn-neon w-full py-2.5 text-xs flex items-center justify-center gap-2 font-semibold"
            >
              {copiedKey === 'modal-url' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Link Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Link
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
