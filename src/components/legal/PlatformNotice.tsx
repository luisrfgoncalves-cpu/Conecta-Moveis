export function PlatformNotice({ className = '' }: { className?: string }) {
  return (
    <div
      role="region"
      aria-label="Aviso oficial da plataforma"
      className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 leading-relaxed ${className}`}
    >
      <strong className="text-slate-300 font-semibold block mb-1">Aviso da Plataforma:</strong>
      A Conecta Móveis é uma vitrine de anúncios que aproxima pessoas e profissionais. Não presta, intermedeia, contrata, garante nem avalia a qualidade dos serviços. Informações, fotos e avaliações são de responsabilidade de quem as publica.
    </div>
  );
}

