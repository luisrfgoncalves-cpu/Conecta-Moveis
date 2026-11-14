'use client';

import { useState } from 'react';
import {
  Settings,
  Server,
  Sliders,
  Flag,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import {
  InfraProfile,
  SystemSetting,
  FeatureFlag,
  CapacitySimulationResult,
} from '@/lib/config/schemas';
import {
  updateInfraProfile,
  updateSystemSetting,
  updateFeatureFlag,
  simulateCapacity,
} from '@/lib/config/actions';

interface AdminConfiguracoesClientProps {
  initialProfile: InfraProfile;
  initialSettings: SystemSetting[];
  initialFlags: FeatureFlag[];
}

export function AdminConfiguracoesClient({
  initialProfile,
  initialSettings,
  initialFlags,
}: AdminConfiguracoesClientProps) {
  const [activeTab, setActiveTab] = useState<'infra' | 'settings' | 'flags' | 'simulator'>('infra');

  // Estado da Infraestrutura
  const [currentProfile, setCurrentProfile] = useState<InfraProfile>(initialProfile);
  const [targetProfileId, setTargetProfileId] = useState<'gratuito' | 'pro' | 'personalizado'>(initialProfile.id);
  const [profileConfirmed, setProfileConfirmed] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Estado das Configurações
  const [settingsList, setSettingsList] = useState<SystemSetting[]>(initialSettings);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('');
  const [settingSaving, setSettingSaving] = useState(false);
  const [settingMsg, setSettingMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Estado das Feature Flags
  const [flagsList, setFlagsList] = useState<FeatureFlag[]>(initialFlags);
  const [legalApprovalInput, setLegalApprovalInput] = useState<Record<string, string>>({});
  const [flagSaving, setFlagSaving] = useState<string | null>(null);
  const [flagMsg, setFlagMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Estado do Simulador de Capacidade
  const [simProfiles, setSimProfiles] = useState(100);
  const [simPhotos, setSimPhotos] = useState(5);
  const [simPhotoKb, setSimPhotoKb] = useState(600);
  const [simVisitors, setSimVisitors] = useState(2500);
  const [simResult, setSimResult] = useState<CapacitySimulationResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Handlers de Infraestrutura
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);

    const res = await updateInfraProfile(targetProfileId, profileConfirmed);
    if (res.success) {
      setCurrentProfile({
        ...currentProfile,
        id: targetProfileId,
        name:
          targetProfileId === 'pro'
            ? 'Plano Profissional'
            : targetProfileId === 'personalizado'
            ? 'Infraestrutura Dedicada'
            : 'Plano Gratuito',
      });
      setProfileMsg({ type: 'ok', text: 'Perfil de infraestrutura atualizado com sucesso!' });
      setProfileConfirmed(false);
    } else {
      setProfileMsg({ type: 'err', text: res.error || 'Falha ao atualizar perfil.' });
    }
    setProfileSaving(false);
  }

  // Handlers de Configuração
  async function handleSaveSetting(key: string) {
    setSettingSaving(true);
    setSettingMsg(null);

    const setting = settingsList.find((s) => s.key === key);
    const parsedVal = setting?.value_type === 'number' ? Number(editValue) : editValue;

    const res = await updateSystemSetting(key, parsedVal, editReason);
    if (res.success) {
      setSettingsList(
        settingsList.map((s) => (s.key === key ? { ...s, value: parsedVal } : s))
      );
      setSettingMsg({ type: 'ok', text: `Configuração '${key}' salva com sucesso!` });
      setEditingKey(null);
      setEditReason('');
    } else {
      setSettingMsg({ type: 'err', text: res.error || res.warning || 'Falha ao salvar configuração.' });
    }
    setSettingSaving(false);
  }

  // Handlers de Feature Flag
  async function handleToggleFlag(key: string, newState: 'desligado' | 'teste' | 'ligado') {
    setFlagSaving(key);
    setFlagMsg(null);

    const legalId = legalApprovalInput[key];
    const res = await updateFeatureFlag(key, newState, legalId);
    if (res.success) {
      setFlagsList(
        flagsList.map((f) =>
          f.key === key ? { ...f, state: newState, legal_approval_id: legalId || f.legal_approval_id } : f
        )
      );
      setFlagMsg({ type: 'ok', text: `Estado da flag '${key}' alterado para '${newState}'.` });
    } else {
      setFlagMsg({ type: 'err', text: res.error || 'Falha ao alterar estado da flag.' });
    }
    setFlagSaving(null);
  }

  // Handlers do Simulador
  async function handleRunSimulation() {
    setSimulating(true);
    const res = await simulateCapacity({
      total_profiles: simProfiles,
      photos_per_profile: simPhotos,
      avg_photo_size_kb: simPhotoKb,
      active_monthly_visitors: simVisitors,
      views_per_visitor: 5,
    });
    setSimResult(res);
    setSimulating(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-orange-400" />
          Arquitetura de Configurações e Upgrade
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Controle central de tetos técnicos de infraestrutura, limites comerciais, feature flags e projeção de capacidade.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('infra')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'infra'
              ? 'bg-orange-500 text-white'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Infraestrutura & Tetos</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-orange-500 text-white'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Configurações Globais ({settingsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('flags')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'flags'
              ? 'bg-orange-500 text-white'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Feature Flags ({flagsList.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('simulator');
            if (!simResult) handleRunSimulation();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'simulator'
              ? 'bg-orange-500 text-white'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Simulador de Capacidade</span>
        </button>
      </div>

      {/* TAB 1: INFRAESTRUTURA */}
      {activeTab === 'infra' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400">Perfil Ativo da Infraestrutura</span>
                <h2 className="text-xl font-black text-white">{currentProfile.name}</h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Ativo: {currentProfile.id}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Armazenamento</span>
                <div className="text-lg font-black text-white">{currentProfile.storage_mb} MB</div>
                <span className="text-[10px] text-slate-500">Teto de fotos e mídias</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Banco de Dados</span>
                <div className="text-lg font-black text-white">{currentProfile.db_mb} MB</div>
                <span className="text-[10px] text-slate-500">Teto PostgreSQL</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Transferência Mensal</span>
                <div className="text-lg font-black text-white">{currentProfile.transfer_gb_month} GB</div>
                <span className="text-[10px] text-slate-500">Egress mensal permitido</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Upload Máximo</span>
                <div className="text-lg font-black text-white">{currentProfile.max_upload_size_mb} MB</div>
                <span className="text-[10px] text-slate-500">Limite individual por foto</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-orange-400" />
              Upgrade ou Alteração do Perfil de Infraestrutura
            </h3>
            <p className="text-xs text-slate-300">
              Apenas altere este perfil <strong>após assinar formalmente o plano correspondente</strong> no Supabase e na Vercel, conforme instruído no Playbook.
            </p>

            {profileMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                profileMsg.type === 'ok'
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                  : 'bg-red-500/15 border border-red-500/40 text-red-300'
              }`}>
                {profileMsg.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="targetProfileSelect" className="block text-xs font-semibold text-slate-300">
                Selecione o Perfil Contratado:
              </label>
              <select
                id="targetProfileSelect"
                value={targetProfileId}
                onChange={(e) => setTargetProfileId(e.target.value as 'gratuito' | 'pro' | 'personalizado')}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="gratuito">Plano Gratuito (Supabase Free / Vercel Hobby) — 1 GB Storage / 500 MB BD</option>
                <option value="pro">Plano Profissional (Supabase Pro / Vercel Pro) — 100 GB Storage / 8 GB BD</option>
                <option value="personalizado">Infraestrutura Dedicada / Enterprise — 500 GB Storage / 32 GB BD</option>
              </select>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                id="confirmHiring"
                type="checkbox"
                checked={profileConfirmed}
                onChange={(e) => setProfileConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-white/20 bg-slate-900 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="confirmHiring" className="text-xs text-slate-300">
                Confirmo que o plano selecionado foi devidamente contratado e faturado nos consoles dos provedores.
              </label>
            </div>

            <button
              type="submit"
              disabled={profileSaving || !profileConfirmed}
              className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <span>{profileSaving ? 'Salvando...' : 'Aplicar Novo Perfil de Infraestrutura'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: CONFIGURAÇÕES GLOBAIS */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {settingMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              settingMsg.type === 'ok'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/15 border border-red-500/40 text-red-300'
            }`}>
              {settingMsg.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{settingMsg.text}</span>
            </div>
          )}

          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Chave / Descrição</th>
                    <th className="p-3.5">Escopo</th>
                    <th className="p-3.5">Parâmetro Atual</th>
                    <th className="p-3.5">Limites (Min - Max)</th>
                    <th className="p-3.5">Requisito</th>
                    <th className="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {settingsList.map((setting) => (
                    <tr key={setting.key} className="hover:bg-white/5">
                      <td className="p-3.5 max-w-[280px]">
                        <div className="font-mono font-bold text-orange-400">{setting.key}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{setting.description}</div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300 uppercase">
                          {setting.scope}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-bold text-white">
                        {String(setting.value)}
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {setting.min_value !== null && setting.max_value !== null
                          ? `${setting.min_value} a ${setting.max_value}`
                          : 'Livre'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {setting.requires_infra_profile === 'pro' && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">
                            Requer Pro
                          </span>
                        )}
                        {setting.requires_legal_review && (
                          <span className="ml-1 px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-bold">
                            Jurídico
                          </span>
                        )}
                        {!setting.requires_infra_profile && !setting.requires_legal_review && (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingKey(setting.key);
                            setEditValue(String(setting.value));
                            setEditReason('');
                          }}
                          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal / Painel de Edição inline */}
          {editingKey && (
            <div className="glass-panel rounded-2xl p-5 border border-orange-500/30 bg-slate-950/90 space-y-3">
              <h4 className="text-xs font-bold text-orange-400">
                Editar Configuração: <code className="text-white">{editingKey}</code>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="newConfigVal" className="block text-[11px] text-slate-400 mb-1">Nova Definição Numérica:</label>
                  <input
                    id="newConfigVal"
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label htmlFor="configJustification" className="block text-[11px] text-slate-400 mb-1">Motivo / Justificativa (min 10 caracteres):</label>
                  <input
                    id="configJustification"
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="Ex: Ajuste para campanha de novos marceneiros"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingKey(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={settingSaving || editReason.trim().length < 10}
                  onClick={() => handleSaveSetting(editingKey)}
                  className="btn-primary px-4 py-1.5 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {settingSaving ? 'Salvando...' : 'Salvar com Histórico'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FEATURE FLAGS */}
      {activeTab === 'flags' && (
        <div className="space-y-4">
          {flagMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              flagMsg.type === 'ok'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/15 border border-red-500/40 text-red-300'
            }`}>
              {flagMsg.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{flagMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flagsList.map((flag) => {
              const isLockedByInfra = flag.requires_infra_profile === 'pro' && currentProfile.id === 'gratuito';

              return (
                <div key={flag.key} className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {flag.name}
                        {isLockedByInfra && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{flag.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      flag.state === 'ligado'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : flag.state === 'teste'
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                    }`}>
                      {flag.state}
                    </span>
                  </div>

                  {isLockedByInfra && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Requer plano pago da infraestrutura</span>
                    </div>
                  )}

                  {flag.requires_legal_review && (
                    <div className="space-y-1 pt-1">
                      <label htmlFor={`legalInput-${flag.key}`} className="block text-[10px] uppercase font-bold text-purple-300">
                        ID de Aprovação Jurídica (ex: J-004):
                      </label>
                      <input
                        id={`legalInput-${flag.key}`}
                        type="text"
                        defaultValue={flag.legal_approval_id || ''}
                        onChange={(e) =>
                          setLegalApprovalInput({ ...legalApprovalInput, [flag.key]: e.target.value })
                        }
                        placeholder="Informe ID de aprovação (ex: J-001)"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleToggleFlag(flag.key, 'desligado')}
                      disabled={flagSaving === flag.key || flag.state === 'desligado'}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40"
                    >
                      Desligar
                    </button>
                    <button
                      onClick={() => handleToggleFlag(flag.key, 'teste')}
                      disabled={flagSaving === flag.key || flag.state === 'teste' || isLockedByInfra}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 disabled:opacity-40"
                    >
                      Modo Teste
                    </button>
                    <button
                      onClick={() => handleToggleFlag(flag.key, 'ligado')}
                      disabled={flagSaving === flag.key || flag.state === 'ligado' || isLockedByInfra}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 disabled:opacity-40"
                    >
                      Ligar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SIMULADOR DE CAPACIDADE */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-400" />
              Parâmetros de Simulação de Tráfego e Volume
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="simProfilesInput" className="block text-xs font-semibold text-slate-300 mb-1">
                  Total de Marceneiros/Perfis:
                </label>
                <input
                  id="simProfilesInput"
                  type="number"
                  min="1"
                  max="10000"
                  value={simProfiles}
                  onChange={(e) => setSimProfiles(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label htmlFor="simPhotosInput" className="block text-xs font-semibold text-slate-300 mb-1">
                  Fotos Médias por Perfil:
                </label>
                <input
                  id="simPhotosInput"
                  type="number"
                  min="1"
                  max="50"
                  value={simPhotos}
                  onChange={(e) => setSimPhotos(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label htmlFor="simPhotoKbInput" className="block text-xs font-semibold text-slate-300 mb-1">
                  Peso Médio por Foto (KB):
                </label>
                <input
                  id="simPhotoKbInput"
                  type="number"
                  min="100"
                  max="5000"
                  value={simPhotoKb}
                  onChange={(e) => setSimPhotoKb(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label htmlFor="simVisitorsInput" className="block text-xs font-semibold text-slate-300 mb-1">
                  Visitantes Mensais Estimados:
                </label>
                <input
                  id="simVisitorsInput"
                  type="number"
                  min="100"
                  max="500000"
                  value={simVisitors}
                  onChange={(e) => setSimVisitors(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <span>{simulating ? 'Calculando...' : 'Recalcular Projeção'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {simResult && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
                simResult.storage_alert_level === 'critical_90' || simResult.db_alert_level === 'critical_90'
                  ? 'bg-red-500/15 border border-red-500/40 text-red-200'
                  : simResult.storage_alert_level === 'warning_70' || simResult.db_alert_level === 'warning_70'
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200'
                  : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-200'
              }`}>
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm mb-0.5">Diagnóstico de Capacidade:</strong>
                  {simResult.recommendation}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Armazenamento */}
                <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Storage (Mídias)</span>
                    <span className="text-white">{simResult.storage_usage_percent}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        simResult.storage_usage_percent >= 90
                          ? 'bg-red-500'
                          : simResult.storage_usage_percent >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, simResult.storage_usage_percent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>{simResult.projected_storage_mb} MB projetados</span>
                    <span>Teto: {currentProfile.storage_mb} MB</span>
                  </div>
                </div>

                {/* Banco de Dados */}
                <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Banco de Dados (PostgreSQL)</span>
                    <span className="text-white">{simResult.db_usage_percent}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        simResult.db_usage_percent >= 90
                          ? 'bg-red-500'
                          : simResult.db_usage_percent >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, simResult.db_usage_percent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>{simResult.projected_db_mb} MB projetados</span>
                    <span>Teto: {currentProfile.db_mb} MB</span>
                  </div>
                </div>

                {/* Transferência Mensal */}
                <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Transferência Mensal</span>
                    <span className="text-white">{simResult.transfer_usage_percent}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        simResult.transfer_usage_percent >= 90
                          ? 'bg-red-500'
                          : simResult.transfer_usage_percent >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, simResult.transfer_usage_percent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>{simResult.projected_transfer_gb_month} GB projetados</span>
                    <span>Teto: {currentProfile.transfer_gb_month} GB</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 flex items-center justify-between">
                <span>Capacidade máxima sustentável de perfis antes de 90% de Storage:</span>
                <span className="font-mono text-base font-bold text-orange-400">
                  {simResult.max_profiles_sustainable} perfis
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
