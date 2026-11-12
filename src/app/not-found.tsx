import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <span className="text-4xl font-extrabold text-brand-600">404</span>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Página não encontrada</h1>
      <p className="text-xs text-slate-500 max-w-sm">
        O link solicitado não existe ou foi removido do catálogo.
      </p>
      <Link
        href="/"
        className="px-4 py-2 text-xs font-semibold rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition"
      >
        Voltar à página inicial
      </Link>
    </div>
  );
}

