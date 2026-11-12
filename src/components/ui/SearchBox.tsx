'use client';

import { Search, MapPin, SlidersHorizontal, Wrench, Sparkles, Ruler, Lightbulb, Box } from 'lucide-react';

const quickCategories = [
  { label: 'Montadores', icon: Wrench, color: 'text-orange-400' },
  { label: 'Marcenaria Sob Medida', icon: Sparkles, color: 'text-amber-400' },
  { label: 'Projetistas 3D', icon: Ruler, color: 'text-sky-400' },
  { label: 'LED & Elétrica de Móveis', icon: Lightbulb, color: 'text-yellow-400' },
  { label: 'Lojas de Planejados', icon: Box, color: 'text-emerald-400' },
];

export function SearchBox() {
  return (
    <div className="w-full glass-card rounded-3xl p-5 sm:p-7 relative overflow-hidden">
      {/* Borda LED Superior com Glow Contínuo */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

      <div className="flex flex-col md:flex-row items-stretch gap-3">
        {/* Campo de Termo */}
        <div className="flex-1 relative">
          <label htmlFor="search-term" className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-orange-400" />
            Serviço ou Atuação
          </label>
          <input
            id="search-term"
            type="text"
            placeholder="Ex: Montador de dormitório, marceneiro de cozinha..."
            disabled
            className="w-full pl-4 pr-4 py-3.5 rounded-xl bg-slate-950/90 border border-white/20 text-slate-300 placeholder:text-slate-500 text-sm focus:outline-none cursor-not-allowed"
          />
        </div>

        {/* Campo de Região */}
        <div className="w-full md:w-72 relative">
          <label htmlFor="search-city" className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-sky-400" />
            Polo Regional
          </label>
          <input
            id="search-city"
            type="text"
            value="Jundiaí - SP (Polo Inicial)"
            disabled
            className="w-full px-4 py-3.5 rounded-xl bg-slate-950/90 border border-white/20 text-white text-sm cursor-not-allowed font-semibold"
          />
        </div>

        {/* Botão de Disparo */}
        <div className="flex items-end">
          <button
            type="button"
            disabled
            className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-white/10 border border-white/20 text-slate-300 text-sm font-bold cursor-not-allowed flex items-center justify-center gap-2 hover:bg-white/15 transition"
          >
            <SlidersHorizontal className="w-4 h-4 text-orange-400" />
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      {/* Pílulas de Atalho Rápido de Categorias com Alto Contraste */}
      <div className="mt-5 pt-4 border-t border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-slate-300 mr-1 uppercase tracking-wider text-[11px]">
            Acesso Rápido:
          </span>
          {quickCategories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <button
                key={i}
                type="button"
                className="category-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white shadow-sm border border-white/15"
              >
                <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
