'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Wrench, Sparkles, Loader2 } from 'lucide-react';
import { saveUserIntent, type UserIntent } from '@/lib/preferences/actions';

export function IntencaoCards() {
  const router = useRouter();
  const [loadingIntent, setLoadingIntent] = useState<UserIntent | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelect = async (intent: UserIntent) => {
    setLoadingIntent(intent);
    setErrorMsg('');

    const res = await saveUserIntent(intent);
    if (res.success) {
      if (intent === 'divulgar' || intent === 'ambos') {
        router.push('/painel/perfil');
      } else {
        router.push('/encontrar-profissionais');
      }
    } else {
      setErrorMsg(res.error || 'Erro ao registrar preferência.');
      setLoadingIntent(null);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs max-w-md mx-auto">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {/* Opção 1: Encontrar um profissional */}
        <button
          type="button"
          disabled={loadingIntent !== null}
          onClick={() => handleSelect('procurar')}
          className="glass-card p-6 rounded-2xl border border-white/10 hover:border-orange-500/50 transition flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-orange-500 text-left cursor-pointer disabled:opacity-60"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition">
                Encontrar um profissional
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Quero buscar montadores, marceneiros ou projetistas em Jundiaí e região para realizar serviços.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center text-xs font-bold text-orange-400">
            {loadingIntent === 'procurar' ? (
              <span className="flex items-center gap-1.5"><Loader2 className="w-4 h-4 animate-spin" /> Salvando…</span>
            ) : (
              <span>Selecionar</span>
            )}
          </div>
        </button>

        {/* Opção 2: Divulgar meu trabalho */}
        <button
          type="button"
          disabled={loadingIntent !== null}
          onClick={() => handleSelect('divulgar')}
          className="glass-card p-6 rounded-2xl border border-white/10 hover:border-orange-500/50 transition flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-orange-500 text-left cursor-pointer disabled:opacity-60"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
                Divulgar meu trabalho
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Sou montador, marceneiro ou tenho empresa e quero publicar meu anúncio e fotos no catálogo.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center text-xs font-bold text-emerald-400">
            {loadingIntent === 'divulgar' ? (
              <span className="flex items-center gap-1.5"><Loader2 className="w-4 h-4 animate-spin" /> Salvando…</span>
            ) : (
              <span>Selecionar</span>
            )}
          </div>
        </button>

        {/* Opção 3: Os dois */}
        <button
          type="button"
          disabled={loadingIntent !== null}
          onClick={() => handleSelect('ambos')}
          className="glass-card p-6 rounded-2xl border border-white/10 hover:border-orange-500/50 transition flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-orange-500 text-left cursor-pointer disabled:opacity-60"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition">
                Os dois
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Quero tanto anunciar meus serviços moveleiros quanto buscar outros parceiros ou profissionais.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center text-xs font-bold text-sky-400">
            {loadingIntent === 'ambos' ? (
              <span className="flex items-center gap-1.5"><Loader2 className="w-4 h-4 animate-spin" /> Salvando…</span>
            ) : (
              <span>Selecionar</span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
