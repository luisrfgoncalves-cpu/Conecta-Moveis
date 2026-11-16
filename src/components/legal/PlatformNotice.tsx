export function PlatformNotice({ className = '' }: { className?: string }) {
  return (
    <div
      role="region"
      aria-label="Aviso oficial da plataforma"
      className={`p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/20 text-xs sm:text-sm text-slate-100 leading-relaxed shadow-xl backdrop-blur-md ${className}`}
    >
      <strong className="text-white font-bold block mb-1">Aviso da Plataforma:</strong>
      A Conecta Móveis é uma vitrine de anúncios que aproxima pessoas e profissionais. Não presta, intermedeia, contrata, garante nem avalia a qualidade dos serviços. Informações, fotos e avaliações são de responsabilidade de quem as publica.
    </div>
  );
}

