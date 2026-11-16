export function SignUpFormSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-8 w-full max-w-md mx-auto border border-white/10" aria-busy="true">
      <h1 className="text-2xl font-black text-white mb-2">Criar conta grátis</h1>
      <p className="text-sm text-slate-400 mb-8">
        Encontre profissionais ou divulgue seus serviços de móveis em Jundiaí e região.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">
            Nome completo
          </label>
          <div className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-slate-500 text-sm">
            Ex: João da Silva
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">
            E-mail
          </label>
          <div className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-slate-500 text-sm">
            seu@email.com
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">
            Senha (mínimo 8 caracteres)
          </label>
          <div className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-slate-500 text-sm">
            ••••••••
          </div>
        </div>

        <div className="btn-neon w-full py-3.5 text-sm flex items-center justify-center opacity-60 cursor-not-allowed">
          Criar minha conta
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-slate-400">
        Já tem conta?{' '}
        <span className="text-orange-400 font-semibold">
          Fazer login
        </span>
      </p>
    </div>
  );
}
