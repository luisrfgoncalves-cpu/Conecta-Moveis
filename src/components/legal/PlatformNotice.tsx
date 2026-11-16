export function PlatformNotice({ className = '' }: { className?: string }) {
  return (
    <div
      role="region"
      aria-label="Aviso oficial da plataforma"
      className={`p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/20 text-xs sm:text-sm text-slate-100 leading-relaxed shadow-xl backdrop-blur-md ${className}`}
    >
      <strong className="text-white font-bold block mb-1">Aviso da Plataforma:</strong>
      A Conecta Móveis é um catálogo aberto que conecta quem procura serviços aos montadores e marceneiros da região. Prazos, pagamentos e a execução do trabalho são combinados diretamente entre você e o anunciante, sem intermediação nem taxas da plataforma. Informações e fotos publicadas são de responsabilidade de cada profissional.
    </div>
  );
}

