'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, SlidersHorizontal, Wrench, Sparkles, Ruler, Lightbulb, Box } from 'lucide-react';
import { sounds } from '@/lib/sound';

const quickCategories = [
  { label: 'Montadores', slug: 'montador-de-moveis', icon: Wrench, color: 'text-orange-400' },
  { label: 'Marcenaria Sob Medida', slug: 'marceneiro', icon: Sparkles, color: 'text-amber-400' },
  { label: 'Projetistas 3D', slug: 'projetista', icon: Ruler, color: 'text-sky-400' },
  { label: 'LED & Complementares', slug: 'parceiros-complementares', icon: Lightbulb, color: 'text-yellow-400' },
  { label: 'Lojas de Planejados', slug: 'loja-de-planejados', icon: Box, color: 'text-emerald-400' },
];

export function SearchBox() {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [city, setCity] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    const params = new URLSearchParams();
    if (term.trim()) params.set('termo', term.trim());
    if (city.trim()) params.set('cidade', city.trim());
    router.push(`/encontrar-profissionais?${params.toString()}`);
  };

  const handleCategoryClick = (slug: string) => {
    sounds.playClick();
    router.push(`/encontrar-profissionais?categoria=${slug}`);
  };

  return (
    <div className="w-full glass-card rounded-3xl p-5 sm:p-7 relative overflow-hidden">
      {/* Borda LED Superior com Glow Contínuo */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-stretch gap-3">
        {/* Campo de Termo */}
        <div className="flex-1 relative">
          <label
            htmlFor="search-term"
            className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center gap-1.5"
          >
            <Search className="w-4 h-4 text-orange-400" />
            Serviço ou Atuação
          </label>
          <input
            id="search-term"
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Ex: Montador de dormitório, marceneiro de cozinha..."
            className="w-full pl-4 pr-4 py-3.5 rounded-xl bg-slate-950/90 border border-white/20 text-white placeholder:text-slate-500 text-sm focus:border-orange-500 focus:outline-none transition"
          />
        </div>

        {/* Campo de Região */}
        <div className="w-full md:w-72 relative">
          <label
            htmlFor="search-city"
            className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4 text-sky-400" />
            Polo Regional
          </label>
          <input
            id="search-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Jundiaí ou região"
            className="w-full px-4 py-3.5 rounded-xl bg-slate-950/90 border border-white/20 text-white placeholder:text-slate-500 text-sm focus:border-orange-500 focus:outline-none transition font-semibold"
          />
        </div>

        {/* Botão de Disparo */}
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/20"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Buscar</span>
          </button>
        </div>
      </form>

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
                onClick={() => handleCategoryClick(cat.slug)}
                className="category-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white shadow-sm border border-white/15 hover:border-orange-500/50 transition cursor-pointer"
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
