'use client';

import { useState } from 'react';
import { Shield, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { createDataSubjectRequest, type DSRType } from '@/lib/lgpd/actions';

export function LGPDRequestSection() {
  const [requestType, setRequestType] = useState<DSRType>('access_data');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<{ protocol: string; deadline: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const res = await createDataSubjectRequest(requestType, details);
    if (res.success && res.protocol && res.deadline) {
      setResult({ protocol: res.protocol, deadline: res.deadline });
      setDetails('');
    } else {
      setErrorMsg(res.error || 'Falha ao processar solicitação.');
    }
    setLoading(false);
  }

  return (
    <section aria-labelledby="lgpd-dsr-title" className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
          <Shield className="w-4 h-4" aria-hidden />
        </div>
        <div>
          <h2 id="lgpd-dsr-title" className="text-base font-black text-white">
            Direitos do Titular (LGPD)
          </h2>
          <p className="text-xs text-slate-400">
            Exerça seus direitos previstos nos artigos 18 e 19 da Lei Geral de Proteção de Dados. Cada pedido recebe um número de protocolo registrado.
          </p>
        </div>
      </div>

      {result ? (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Solicitação Registrada com Sucesso!</span>
          </div>
          <p className="text-xs text-slate-300">
            Nº do Protocolo: <strong className="font-mono text-orange-400">{result.protocol}</strong>
          </p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Prazo legal de resposta completa: até <strong>{result.deadline}</strong> (15 dias conforme Art. 19, II).
          </p>
          <button
            onClick={() => setResult(null)}
            className="text-xs text-orange-400 underline font-semibold mt-1"
          >
            Fazer outra solicitação
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label htmlFor="requestType" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tipo de Pedido
            </label>
            <select
              id="requestType"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as DSRType)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="access_data">Acesso e Cópia Completa dos Dados</option>
              <option value="confirm_treatment">Confirmação da Existência de Tratamento</option>
              <option value="correction">Correção de Dados Incompletos ou Inexatos</option>
              <option value="portability">Portabilidade dos Dados</option>
              <option value="revocation_consent">Revogação de Consentimento</option>
              <option value="opposition">Oposição a Tratamento Específico</option>
              <option value="elimination">Eliminação de Dados Pessoais</option>
            </select>
          </div>

          <div>
            <label htmlFor="details" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Detalhes ou Justificativa (Opcional)
            </label>
            <textarea
              id="details"
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Especifique se deseja corrigir algum dado ou esclarecer a demanda..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'Registrando...' : 'Registrar Solicitação Formal'}</span>
          </button>
        </form>
      )}
    </section>
  );
}

