'use client';

import { useState, useTransition } from 'react';
import {
  Search,
  Tag,
  BarChart2,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import type { SearchSynonym, NoResultLog } from '@/lib/search/schemas';
import {
  upsertSearchSynonym,
  deleteSearchSynonym,
  purgeOldSearchLogs,
} from '@/lib/search/actions';

interface AdminBuscaClientProps {
  initialSynonyms: SearchSynonym[];
  initialNoResults: NoResultLog[];
}

export function AdminBuscaClient({
  initialSynonyms,
  initialNoResults,
}: AdminBuscaClientProps) {
  const [tab, setTab] = useState<'sinonimos' | 'sem-resultado'>('sinonimos');
  const [synonyms, setSynonyms] = useState(initialSynonyms);
  const [noResults] = useState(initialNoResults);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Formulário de novo sinônimo
  const [newTerm, setNewTerm] = useState('');
  const [newSynonyms, setNewSynonyms] = useState('');

  function showFeedback(ok: boolean, msg: string) {
    setFeedback({ ok, msg });
    setTimeout(() => setFeedback(null), 4000);
  }

  function handleAddSynonym(e: React.FormEvent) {
    e.preventDefault();
    if (!newTerm.trim()) return;
    startTransition(async () => {
      const res = await upsertSearchSynonym({
        term: newTerm.trim(),
        synonyms: newSynonyms.split(',').map((s) => s.trim()).filter(Boolean),
        is_active: true,
      });
      if (res.success) {
        showFeedback(true, 'Sinônimo adicionado.');
        setNewTerm('');
        setNewSynonyms('');
        // Refresh otimista
        setSynonyms((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            term: newTerm.trim().toLowerCase(),
            synonyms: newSynonyms.split(',').map((s) => s.trim()).filter(Boolean),
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      } else {
        showFeedback(false, res.error || 'Erro ao adicionar.');
      }
    });
  }

  function handleToggle(syn: SearchSynonym) {
    startTransition(async () => {
      const res = await upsertSearchSynonym({
        id: syn.id,
        term: syn.term,
        synonyms: syn.synonyms,
        is_active: !syn.is_active,
      });
      if (res.success) {
        setSynonyms((prev) =>
          prev.map((s) => (s.id === syn.id ? { ...s, is_active: !s.is_active } : s))
        );
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Remover este sinônimo?')) return;
    startTransition(async () => {
      const res = await deleteSearchSynonym(id);
      if (res.success) {
        setSynonyms((prev) => prev.filter((s) => s.id !== id));
        showFeedback(true, 'Sinônimo removido.');
      } else {
        showFeedback(false, res.error || 'Erro ao remover.');
      }
    });
  }

  function handlePurge() {
    if (!confirm('Deseja excluir registros de buscas sem resultado com mais de 365 dias?')) return;
    startTransition(async () => {
      const res = await purgeOldSearchLogs(365);
      if (res.success) {
        showFeedback(
          true,
          `Ciclo de limpeza concluído: ${res.deletedCount ?? 0} registros antigos expurgados.`
        );
      } else {
        showFeedback(false, res.error || 'Erro ao executar ciclo de limpeza.');
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${
            feedback.ok
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.ok ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 flex-shrink-0" />
          )}
          {feedback.msg}
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-1 border-b">
        {(
          [
            { id: 'sinonimos', label: 'Sinônimos de Busca', icon: Tag },
            { id: 'sem-resultado', label: 'Termos Sem Resultado', icon: Search },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Aba: Sinônimos */}
      {tab === 'sinonimos' && (
        <div className="space-y-6">
          {/* Formulário de novo sinônimo */}
          <form
            onSubmit={handleAddSynonym}
            className="bg-gray-50 border rounded-lg p-4 space-y-3"
          >
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Novo Sinônimo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Termo principal</label>
                <input
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="ex: montador"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Sinônimos (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={newSynonyms}
                  onChange={(e) => setNewSynonyms(e.target.value)}
                  placeholder="ex: instalador de móveis, instalador"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2 transition-colors"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Adicionar
            </button>
          </form>

          {/* Lista de sinônimos */}
          {synonyms.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Nenhum sinônimo cadastrado.</p>
          ) : (
            <div className="divide-y border rounded-lg overflow-hidden">
              {synonyms.map((syn) => (
                <div
                  key={syn.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    syn.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'
                  }`}
                >
                  <span className="font-mono text-sm font-medium text-gray-800 w-32 flex-shrink-0">
                    {syn.term}
                  </span>
                  <span className="flex-1 text-sm text-gray-600">
                    {syn.synonyms.join(', ') || <em className="text-gray-400">sem sinônimos</em>}
                  </span>
                  <button
                    onClick={() => handleToggle(syn)}
                    disabled={isPending}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      syn.is_active
                        ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                        : 'border-gray-300 text-gray-500 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {syn.is_active ? 'ativo' : 'inativo'}
                  </button>
                  <button
                    onClick={() => handleDelete(syn.id)}
                    disabled={isPending}
                    className="text-red-400 hover:text-red-600 disabled:opacity-50"
                    aria-label="Remover sinônimo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Aba: Termos Sem Resultado */}
      {tab === 'sem-resultado' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 text-gray-700">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span>Dados agregados por termo e dia — sem identificação de usuário ou IP (LGPD art. 6º, III).</span>
            </div>
            <button
              onClick={handlePurge}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-60 self-start sm:self-auto"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpar registros &gt; 365 dias
            </button>
          </div>

          {noResults.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <BarChart2 className="h-8 w-8 mb-2" />
              <p className="text-sm">Nenhum termo sem resultado registrado nos últimos 30 dias.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Termo</th>
                    <th className="px-4 py-2.5 text-left">Data</th>
                    <th className="px-4 py-2.5 text-right">Buscas</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {noResults.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono text-gray-800">{r.term}</td>
                      <td className="px-4 py-2.5 text-gray-500">{r.search_date}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-800">
                        {r.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

