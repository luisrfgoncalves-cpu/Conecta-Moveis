import Image from 'next/image';
import { MapPin, ExternalLink, ShieldCheck, MessageCircle, Clock } from 'lucide-react';

interface CardProps {
  title: string;
  professionalName?: string;
  category: string;
  location: string;
  imageUrl?: string;
  experience?: string;
  tags?: string[];
  isDemo?: boolean;
}

export function Card({
  title,
  professionalName = 'Profissional Cadastrado',
  category,
  location,
  imageUrl = '/images/portfolio-cozinha.svg',
  experience = 'Atende em até 24h',
  tags = ['Planejados', 'Montagem'],
  isDemo = true
}: CardProps) {
  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col group relative border border-white/10 hover:border-orange-500/50 transition-all duration-300">
      
      {/* Imagem em Destaque no Estilo Streaming */}
      <div className="relative h-56 w-full bg-slate-950 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition duration-700 opacity-90 group-hover:opacity-100"
        />
        
        {/* Gradiente Escuro Suave na Base */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Badge Demonstrativo */}
        {isDemo && (
          <div className="absolute top-3.5 left-3.5 z-10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-black/85 backdrop-blur-md text-amber-300 border border-amber-500/50 rounded-lg shadow-lg">
            Exemplo Ilustrativo
          </div>
        )}

        {/* Badge de Resposta Rápida */}
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-emerald-300">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>{experience}</span>
        </div>

        {/* Faixa Inferior da Imagem com Categoria e Selo */}
        <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between">
          <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg bg-orange-600 text-white shadow-md backdrop-blur-sm">
            {category}
          </span>
          <span className="text-xs font-semibold text-white flex items-center gap-1.5 bg-black/80 px-2.5 py-1 rounded-lg border border-white/15">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Perfil Ativo
          </span>
        </div>
      </div>

      {/* Conteúdo com Informações Humanizadas e Tipografia Nítida */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          
          {/* Identificação do Profissional / Empresa */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-300 flex items-center justify-center text-[11px] font-black text-slate-950 shrink-0 shadow-md">
              {professionalName.charAt(0)}
            </div>
            <div className="text-xs font-bold text-slate-200 truncate">
              {professionalName}
            </div>
          </div>

          <h3 className="font-extrabold text-white text-lg group-hover:text-orange-400 transition leading-snug line-clamp-2">
            {title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
            <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
            <span>{location}</span>
          </div>

          {/* Tags de Especialidade */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag, idx) => (
              <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800/80 border border-white/15 text-slate-200">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Rodapé do Card com Ação Rápida */}
        <div className="pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="text-xs text-slate-300 font-medium italic">
            Sem avaliações ainda
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition"
              title="Iniciar conversa direta no WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-orange-400 transition"
              title="Abrir perfil completo"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
