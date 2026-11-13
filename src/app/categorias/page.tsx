import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Wrench, Sparkles, Box, Hammer, Ruler, Lightbulb, LucideIcon } from 'lucide-react';
import { CATEGORIES_CATALOG } from '@/lib/profile/schemas';
import { BackButton } from '@/components/navigation/BackButton';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Categorias de Serviços | Conecta Móveis',
  description: 'Explore as categorias de profissionais e empresas do setor moveleiro: montadores, marceneiros, lojas de planejados, projetistas 3D e parceiros.',
};

const iconMap: Record<string, LucideIcon> = {
  Wrench,
  Sparkles,
  Box,
  Hammer,
  Ruler,
  Lightbulb,
};

export default function CategoriasPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Topo com navegação profissional */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs items={[{ label: 'Categorias' }]} />
          <BackButton fallback="/" label="Voltar à tela anterior" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Categorias do Setor Moveleiro
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Navegue pelas áreas de atuação e encontre profissionais independentes, oficinas e fábricas em Jundiaí e região.
        </p>
      </div>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES_CATALOG.map((cat) => {
          const Icon = iconMap[cat.icon] || Sparkles;
          return (
            <div
              key={cat.id}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-white/10 hover:border-orange-500/50 transition group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/20 transition">
                  <Icon className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-orange-400 transition">
                    {cat.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Especialidades da Categoria */}
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Especialidades ({cat.specialties.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.specialties.map((spec) => (
                      <Link
                        key={spec.id}
                        href={`/encontrar-profissionais?categoria=${cat.slug}&especialidade=${spec.slug}`}
                        className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition"
                      >
                        {spec.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botão de Ver Todos */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <Link
                  href={`/encontrar-profissionais?categoria=${cat.slug}`}
                  className="w-full inline-flex items-center justify-between text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300 transition"
                >
                  <span>Ver profissionais ({cat.name})</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
