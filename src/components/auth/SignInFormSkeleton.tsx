export function SignInFormSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-8 w-full max-w-md mx-auto border border-white/10" aria-busy="true">
      <h1 className="text-2xl font-black text-white mb-2">Entrar na conta</h1>
      <p className="text-sm text-slate-400 mb-8">
        Acesse o painel para gerenciar seu perfil e contatos.
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">
            E-mail
          </label>
          <div className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-slate-500 text-sm">
            seu@email.com
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-semibold text-slate-300">
              Senha
            </label>
            <span className="text-xs text-orange-400/60">
              Esqueci minha senha
            </span>
          </div>
          <div className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-slate-500 text-sm">
            ••••••••
          </div>
        </div>

        <div className="btn-neon w-full py-3.5 text-sm flex items-center justify-center opacity-60 cursor-not-allowed">
          Entrar
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-slate-400">
        Ainda não tem conta?{' '}
        <span className="text-orange-400 font-semibold">
          Criar conta grátis
        </span>
      </p>
    </div>
  );
}
