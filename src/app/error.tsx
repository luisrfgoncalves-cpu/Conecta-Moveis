'use client';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <span className="text-4xl font-extrabold text-red-600">Erro</span>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Ocorreu uma falha inesperada</h1>
      <p className="text-xs text-slate-500 max-w-sm">
        Não foi possível carregar as informações desta seção.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition"
      >
        Tentar novamente
      </button>
    </div>
  );
}

