'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="space-y-3">
        <AlertTriangle className="w-16 h-16 text-red-500/60 mx-auto" />
        <span className="text-5xl font-black text-red-600">Erro</span>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          Ocorreu uma falha inesperada
        </h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          Não foi possível carregar as informações desta seção.
          Tente novamente ou volte à página inicial.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-bold border border-white/20 transition"
        >
          <Home className="w-4 h-4" />
          Página inicial
        </Link>
      </div>
    </main>
  );
}
