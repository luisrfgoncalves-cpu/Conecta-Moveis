import Link from 'next/link';
import { SearchX, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="space-y-3">
        <SearchX className="w-16 h-16 text-slate-600 mx-auto" />
        <span className="text-5xl font-black text-slate-700 dark:text-slate-300">404</span>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          Página não encontrada
        </h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          O link que você acessou não existe ou foi removido do catálogo.
          Verifique o endereço ou use a busca abaixo.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/encontrar-profissionais"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition"
        >
          <Search className="w-4 h-4" />
          Buscar profissionais
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 dark:text-slate-200 text-sm font-bold border border-white/20 transition"
        >
          <Home className="w-4 h-4" />
          Página inicial
        </Link>
      </div>
    </main>
  );
}
