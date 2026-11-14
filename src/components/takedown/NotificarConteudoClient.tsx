'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Send, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { submitTakedownNotice, type CreateTakedownInput } from '@/lib/takedown/actions';

export function NotificarConteudoClient() {
  const searchParams = useSearchParams();
  const rawType = searchParams.get('tipo');
  const initialType: CreateTakedownInput['targetType'] =
    rawType === 'portfolio_image' || rawType === 'review' || rawType === 'company'
      ? rawType
      : 'profile';
  const initialId = searchParams.get('id') || '';
  const initialUrl = searchParams.get('url') || '';

  const [category, setCategory] = useState<CreateTakedownInput['category']>('copyright_image');
  const [notifierName, setNotifierName] = useState('');
  const [notifierEmail, setNotifierEmail] = useState('');
  const [targetUrl, setTargetUrl] = useState(initialUrl);
  const [description, setDescription] = useState('');
  const [goodFaith, setGoodFaith] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [protocol, setProtocol] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!goodFaith) {
      setErrorMsg('É obrigatório declarar boa-fé e veracidade dos fatos informados.');
      return;
    }

    if (!notifierName.trim() || !notifierEmail.trim()) {
      setErrorMsg('Preencha seu nome e e-mail de contato.');
      return;
    }

    if (description.trim().length < 15) {
      setErrorMsg('Descreva detalhadamente o motivo (mínimo de 15 caracteres).');
      return;
    }

    setLoading(true);
    const res = await submitTakedownNotice({
      category,
      targetType: initialType,
      targetId: initialId || undefined,
      targetUrl: targetUrl.trim() || undefined,
      description: description.trim(),
      notifierName: notifierName.trim(),
      notifierEmail: notifierEmail.trim(),
      goodFaithDeclaration: goodFaith,
    });

    if (res.success && res.protocol) {
      setProtocol(res.protocol);
    } else {
      setErrorMsg(res.error || 'Falha ao registrar notificação.');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Início
        </Link>
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <Shield className="w-7 h-7 text-orange-400" />
          Notificação e Retirada de Conteúdo
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Canal oficial para apontar conteúdos em desacordo com direitos autorais, imagem, honra ou termos de uso.
        </p>
      </div>

      {protocol ? (
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 bg-emerald-950/15 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white">Notificação Registrada com Sucesso!</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Sua solicitação foi recebida pela moderação e um snapshot das informações foi preservado com segurança.
          </p>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 max-w-sm mx-auto">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold mb-1">
              Número de Protocolo:
            </span>
            <span className="text-lg font-mono font-black text-orange-400 tracking-wider">
              {protocol}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Guarde este protocolo. O setor de moderação realizará a triagem e análise técnica fundamentada.
          </p>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="cat-select" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Categoria da Infração
              </label>
              <select
                id="cat-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as CreateTakedownInput['category'])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:border-orange-500 focus:outline-none"
              >
                <option value="copyright_image">Direitos Autorais ou Foto Copiada sem Autorização</option>
                <option value="trademark">Uso Indevido de Marca Registrada</option>
                <option value="defamation">Ofensa, Calúnia ou Ataque à Honra</option>
                <option value="privacy">Exposição Indevida de Dados Pessoais / LGPD</option>
                <option value="fraud">Suspeita de Golpe, Fraude ou Perfil Falso</option>
                <option value="illegal_grave">Conteúdo Gravíssimo (Crime ou Ilegalidade Extrema)</option>
                <option value="other">Outra Infração aos Termos de Uso</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Seu Nome Completo
                </label>
                <input
                  id="name-input"
                  type="text"
                  required
                  value={notifierName}
                  onChange={(e) => setNotifierName(e.target.value)}
                  placeholder="Nome do notificante ou procurador"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="email-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Seu E-mail de Contato
                </label>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={notifierEmail}
                  onChange={(e) => setNotifierEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="url-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Link do Perfil ou Foto Denunciada (Opcional)
              </label>
              <input
                id="url-input"
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://conectamoveis.com.br/profissionais/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:border-orange-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label htmlFor="desc-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Descrição dos Fatos e Justificativa
              </label>
              <textarea
                id="desc-input"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explique detalhadamente por que este conteúdo viola seus direitos ou as regras da plataforma..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:border-orange-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={goodFaith}
                  onChange={(e) => setGoodFaith(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 text-orange-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  Declaro sob as penas da lei que sou o titular dos direitos alegados ou estou legalmente autorizado a agir em seu nome, prestando estas informações de boa-fé e ciente de que denúncias caluniosas geram responsabilidade civil e criminal.
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !goodFaith}
            className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            {loading ? (
              <span>Registrando Notificação...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Enviar Notificação Formal</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
