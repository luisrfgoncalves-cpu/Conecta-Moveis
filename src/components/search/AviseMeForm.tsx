'use client';

import { useState } from 'react';
import { Bell, Mail, X } from 'lucide-react';
import { CATEGORIES_CATALOG } from '@/lib/profile/schemas';
import { registerAlertRequest } from '@/lib/alerts/actions';

interface AviseMeFormProps {
  cidadeSugerida?: string;
  categoriaSugerida?: string;
  onClose?: () => void;
}

export function AviseMeForm({ cidadeSugerida = '', categoriaSugerida = '', onClose }: AviseMeFormProps) {
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState(cidadeSugerida);
  const [categoria, setCategoria] = useState(categoriaSugerida);
  const [consentimento, setConsentimento] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleClose = () => {
    setDismissed(true);
    onClose?.();
  };

  if (dismissed) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const result = await registerAlertRequest({ email, cidade, categoria, consentimento });

    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMsg(result.error || 'Erro ao registrar. Tente novamente.');
    }
  };

  if (status === 'success') {
    return (
      <div className="relative rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar aviso"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-400 hover:text-emerald-200 hover:bg-emerald-500/20 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Bell className="w-5 h-5 text-emerald-400" />
        </div>
        <p className="text-sm font-bold text-emerald-300">Registrado com sucesso!</p>
        <p className="text-xs text-slate-400">
          Você receberá um aviso por e-mail quando houver um profissional disponível na sua região.
          Poderá cancelar a qualquer momento pelo link no e-mail.
        </p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4 text-left">
      <button
        type="button"
        onClick={handleClose}
        aria-label="Fechar aviso"
        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
        title="Fechar"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 pr-8">
        <Bell className="w-5 h-5 text-orange-400 shrink-0" />
        <h4 className="text-sm font-bold text-white">Avise-me quando houver profissional</h4>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">
        Informe seu e-mail e receba um aviso quando um profissional estiver disponível na sua região.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* E-mail */}
        <div>
          <label htmlFor="avise-email" className="block text-xs font-semibold text-slate-300 mb-1">
            E-mail *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="avise-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Cidade */}
          <div>
            <label htmlFor="avise-cidade" className="block text-xs font-semibold text-slate-300 mb-1">
              Cidade
            </label>
            <input
              id="avise-cidade"
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex: Jundiaí"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="avise-categoria" className="block text-xs font-semibold text-slate-300 mb-1">
              Categoria
            </label>
            <select
              id="avise-categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="">Qualquer</option>
              {CATEGORIES_CATALOG.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Consentimento LGPD */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={consentimento}
            onChange={(e) => setConsentimento(e.target.checked)}
            className="mt-0.5 accent-orange-500 shrink-0"
          />
          <span className="text-xs text-slate-400 leading-relaxed">
            Concordo com o uso do meu e-mail para receber este aviso único.
            Posso cancelar a qualquer momento pelo link no e-mail, conforme a{' '}
            <a href="/privacidade" className="text-orange-400 hover:underline">
              Política de Privacidade
            </a>
            .
          </span>
        </label>

        {status === 'error' && (
          <p className="text-xs text-red-400">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm transition"
        >
          {status === 'loading' ? 'Registrando…' : 'Quero ser avisado'}
        </button>
      </form>

      <p className="text-[11px] text-slate-500 text-center">
        Sem spam. Você poderá cancelar pelo link no e-mail.
      </p>
    </div>
  );
}
