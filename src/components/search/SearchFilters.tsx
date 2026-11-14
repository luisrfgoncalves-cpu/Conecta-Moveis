'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, RotateCcw, X, Check } from 'lucide-react';
import { CATEGORIES_CATALOG } from '@/lib/profile/schemas';

interface SearchFiltersProps {
  currentFilters: {
    termo?: string;
    uf?: string;
    cidade?: string;
    categoria?: string;
    especialidade?: string;
    ordenacao?: string;
  };
}

export function SearchFilters({ currentFilters }: SearchFiltersProps) {
  const router = useRouter();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [termo, setTermo] = useState(currentFilters.termo || '');
  const [uf, setUf] = useState(currentFilters.uf || '');
  const [cidade, setCidade] = useState(currentFilters.cidade || '');
  const [categoria, setCategoria] = useState(currentFilters.categoria || '');
  const [especialidade, setEspecialidade] = useState(currentFilters.especialidade || '');
  const [ordenacao, setOrdenacao] = useState(currentFilters.ordenacao || 'rotativa');

  // Especialidades dinâmicas baseadas na categoria selecionada
  const selectedCategoryObj = CATEGORIES_CATALOG.find((c) => c.slug === categoria);
  const availableSpecialties = selectedCategoryObj
    ? selectedCategoryObj.specialties
    : CATEGORIES_CATALOG.flatMap((c) => c.specialties);

  const applyFilters = (customValues?: Partial<typeof currentFilters>) => {
    const params = new URLSearchParams();

    const t = customValues?.termo !== undefined ? customValues.termo : termo;
    const u = customValues?.uf !== undefined ? customValues.uf : uf;
    const c = customValues?.cidade !== undefined ? customValues.cidade : cidade;
    const cat = customValues?.categoria !== undefined ? customValues.categoria : categoria;
    const esp = customValues?.especialidade !== undefined ? customValues.especialidade : especialidade;
    const ord = customValues?.ordenacao !== undefined ? customValues.ordenacao : ordenacao;

    if (t?.trim()) params.set('termo', t.trim());
    if (u?.trim()) params.set('uf', u.trim());
    if (c?.trim()) params.set('cidade', c.trim());
    if (cat?.trim()) params.set('categoria', cat.trim());
    if (esp?.trim()) params.set('especialidade', esp.trim());
    if (ord && ord !== 'rotativa' && ord !== 'relevancia') params.set('ordenacao', ord);

    // Reset para página 1 ao filtrar
    params.set('page', '1');

    router.push(`/encontrar-profissionais?${params.toString()}`);
    setIsDrawerOpen(false);
  };

  const handleReset = () => {
    setTermo('');
    setUf('');
    setCidade('');
    setCategoria('');
    setEspecialidade('');
    setOrdenacao('rotativa');
    router.push('/encontrar-profissionais');
    setIsDrawerOpen(false);
  };

  const hasActiveFilters = Boolean(
    currentFilters.termo ||
    currentFilters.uf ||
    currentFilters.cidade ||
    currentFilters.categoria ||
    currentFilters.especialidade ||
    (currentFilters.ordenacao && currentFilters.ordenacao !== 'relevancia')
  );

  return (
    <>
      {/* Botão para abrir gaveta de filtros no celular */}
      <div className="lg:hidden flex items-center justify-between gap-3 mb-6 p-3 rounded-2xl bg-white/5 border border-white/10">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-500/20 text-orange-400 font-bold text-sm border border-orange-500/30 hover:bg-orange-500/30 transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtros e Busca {hasActiveFilters && '(Ativos)'}</span>
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
            title="Limpar filtros"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Gaveta Mobile (Drawer Modal) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border-t border-white/20 rounded-t-3xl max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-orange-400" />
                Filtrar Resultados
              </h2>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo compartilhado dos filtros */}
            <div className="space-y-4">
              <div>
                <label htmlFor="mobile-termo" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Palavra-chave / Nome
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    id="mobile-termo"
                    aria-label="Palavra-chave ou Nome"
                    type="text"
                    value={termo}
                    onChange={(e) => setTermo(e.target.value)}
                    placeholder="Ex: Armário, Promob, João..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white placeholder:text-slate-500 text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label htmlFor="mobile-uf" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    UF
                  </label>
                  <select
                    id="mobile-uf"
                    aria-label="UF"
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    className="w-full px-2 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white text-sm focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">Todas</option>
                    <option value="SP">SP</option>
                    <option value="MG">MG</option>
                    <option value="RJ">RJ</option>
                    <option value="PR">PR</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label htmlFor="mobile-cidade" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Cidade
                  </label>
                  <input
                    id="mobile-cidade"
                    aria-label="Cidade"
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Ex: Jundiaí"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white placeholder:text-slate-500 text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mobile-categoria" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Categoria
                </label>
                <select
                  id="mobile-categoria"
                  aria-label="Categoria"
                  value={categoria}
                  onChange={(e) => {
                    setCategoria(e.target.value);
                    setEspecialidade('');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Todas as categorias</option>
                  {CATEGORIES_CATALOG.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="mobile-especialidade" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Especialidade
                </label>
                <select
                  id="mobile-especialidade"
                  aria-label="Especialidade"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Todas as especialidades</option>
                  {availableSpecialties.map((esp) => (
                    <option key={esp.slug} value={esp.slug}>
                      {esp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="mobile-ordenacao" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Ordenar Por
                </label>
                <select
                  id="mobile-ordenacao"
                  aria-label="Ordenar Por"
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="rotativa">Ordem Rotativa (Padrão)</option>
                  <option value="recentes">Mais Recentes</option>
                  <option value="completos">Perfil Mais Completo</option>
                  <option value="avaliacoes">Por Avaliação dos Usuários</option>
                </select>
                <Link
                  href="/como-ordenamos-os-resultados"
                  className="text-[11px] text-orange-400 hover:underline block mt-1"
                >
                  Como ordenamos os resultados
                </Link>
              </div>
            </div>

            {/* Ações da Gaveta */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => applyFilters()}
                className="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <Check className="w-4 h-4" />
                Aplicar Filtros
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-sm font-semibold transition"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Coluna para Desktop */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="glass-card rounded-2xl p-6 border border-white/10 sticky top-36 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-orange-400" />
              Filtros
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-orange-400 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                Limpar
              </button>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              applyFilters();
            }}
            className="space-y-4"
          >
            {/* Termo */}
            <div>
              <label htmlFor="desktop-termo" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Palavra-chave
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  id="desktop-termo"
                  aria-label="Palavra-chave"
                  type="text"
                  value={termo}
                  onChange={(e) => setTermo(e.target.value)}
                  placeholder="Nome, serviço..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-white placeholder:text-slate-500 text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* UF e Cidade */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="desktop-uf" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  UF
                </label>
                <select
                  id="desktop-uf"
                  aria-label="UF"
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Todas</option>
                  <option value="SP">SP</option>
                  <option value="MG">MG</option>
                  <option value="RJ">RJ</option>
                  <option value="PR">PR</option>
                </select>
              </div>
              <div className="col-span-2">
                <label htmlFor="desktop-cidade" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Cidade
                </label>
                <input
                  id="desktop-cidade"
                  aria-label="Cidade"
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex: Jundiaí"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-white placeholder:text-slate-500 text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label htmlFor="desktop-categoria" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Categoria
              </label>
              <select
                id="desktop-categoria"
                aria-label="Categoria"
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value);
                  setEspecialidade('');
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs focus:border-orange-500 focus:outline-none"
              >
                <option value="">Todas as categorias</option>
                {CATEGORIES_CATALOG.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Especialidade */}
            <div>
              <label htmlFor="desktop-especialidade" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Especialidade
              </label>
              <select
                id="desktop-especialidade"
                aria-label="Especialidade"
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs focus:border-orange-500 focus:outline-none"
              >
                <option value="">Todas as especialidades</option>
                {availableSpecialties.map((esp) => (
                  <option key={esp.slug} value={esp.slug}>
                    {esp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <label htmlFor="desktop-ordenacao" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Ordenação
              </label>
              <select
                id="desktop-ordenacao"
                aria-label="Ordenação"
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs focus:border-orange-500 focus:outline-none"
              >
                <option value="rotativa">Ordem Rotativa (Padrão)</option>
                <option value="recentes">Mais Recentes</option>
                <option value="completos">Perfil Mais Completo</option>
                <option value="avaliacoes">Por Avaliação dos Usuários</option>
              </select>
              <Link
                href="/como-ordenamos-os-resultados"
                className="text-[11px] text-orange-400 hover:underline block mt-1"
              >
                Como ordenamos os resultados
              </Link>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition"
            >
              Aplicar Filtros
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
