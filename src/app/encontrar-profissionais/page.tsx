import { Metadata } from 'next';
import Link from 'next/link';
import { UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert } from '@/components/ui/Feedback';
import { PlatformNotice } from '@/components/legal/PlatformNotice';
import { searchProfessionals, SearchFilters as FilterType } from '@/lib/search/actions';
import { SearchFilters } from '@/components/search/SearchFilters';
import { ProfessionalCard } from '@/components/search/ProfessionalCard';
import { BackButton } from '@/components/navigation/BackButton';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Encontrar Profissionais e Empresas | Conecta Móveis',
  description: 'Busque montadores de móveis, marceneiros sob medida, projetistas 3D e lojas de planejados em Jundiaí e região.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EncontrarProfissionaisPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  const filters: FilterType = {
    termo: typeof resolvedParams.termo === 'string' ? resolvedParams.termo : undefined,
    uf: typeof resolvedParams.uf === 'string' ? resolvedParams.uf : undefined,
    cidade: typeof resolvedParams.cidade === 'string' ? resolvedParams.cidade : undefined,
    categoria: typeof resolvedParams.categoria === 'string' ? resolvedParams.categoria : undefined,
    especialidade: typeof resolvedParams.especialidade === 'string' ? resolvedParams.especialidade : undefined,
    ordenacao: (typeof resolvedParams.ordenacao === 'string'
      ? resolvedParams.ordenacao
      : 'relevancia') as 'relevancia' | 'atividade' | 'recentes',
    page: typeof resolvedParams.page === 'string' ? Number(resolvedParams.page) || 1 : 1,
  };

  const result = await searchProfessionals(filters);

  // Helper para gerar URLs de paginação mantendo filtros existentes
  const getPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (filters.termo) params.set('termo', filters.termo);
    if (filters.uf) params.set('uf', filters.uf);
    if (filters.cidade) params.set('cidade', filters.cidade);
    if (filters.categoria) params.set('categoria', filters.categoria);
    if (filters.especialidade) params.set('especialidade', filters.especialidade);
    if (filters.ordenacao && filters.ordenacao !== 'relevancia') {
      params.set('ordenacao', filters.ordenacao);
    }
    params.set('page', newPage.toString());
    return `/encontrar-profissionais?${params.toString()}`;
  };

  const startRecord = result.total > 0 ? (result.page - 1) * result.limit + 1 : 0;
  const endRecord = Math.min(result.page * result.limit, result.total);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Topo com navegação profissional */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs items={[{ label: 'Buscar Profissionais' }]} />
          <BackButton fallback="/" label="Voltar à tela anterior" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Encontrar Profissionais
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Catálogo de profissionais e empresas atuantes no polo de Jundiaí e região.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto shadow-sm">
            {result.total} {result.total === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
          </span>
        </div>
      </div>

      {/* Aviso Curto Fixo da Plataforma */}
      <PlatformNotice />

      {/* Aviso Legal Obrigatório da Plataforma */}
      <Alert type="legal">
        <strong className="text-white font-bold block mb-1">Aviso aos Contratantes:</strong>
        Este perfil é publicado pelo anunciante. A presença na plataforma não representa garantia da qualidade, prazo ou resultado do serviço.
      </Alert>

      {/* Layout de Conteúdo: Filtros + Lista */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filtros: Coluna no Desktop e Gaveta no Mobile */}
        <SearchFilters
          currentFilters={{
            termo: filters.termo,
            uf: filters.uf,
            cidade: filters.cidade,
            categoria: filters.categoria,
            especialidade: filters.especialidade,
            ordenacao: filters.ordenacao,
          }}
        />

        {/* Grade de Resultados */}
        <main className="flex-1 w-full space-y-8">
          {result.professionals.length === 0 ? (
            /* Estado Vazio */
            <div className="glass-card rounded-2xl p-12 text-center border border-white/10 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <UserX className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Nenhum profissional encontrado com os filtros atuais
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Tente ajustar os termos da busca, selecionar outra categoria ou remover filtros específicos de cidade para ver mais resultados.
              </p>
              <div className="pt-2">
                <Link
                  href="/encontrar-profissionais"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition"
                >
                  Limpar todos os filtros
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Contagem de Paginação */}
              <div className="text-xs text-slate-400">
                Exibindo <span className="text-white font-semibold">{startRecord}</span> a{' '}
                <span className="text-white font-semibold">{endRecord}</span> de{' '}
                <span className="text-white font-semibold">{result.total}</span> profissionais
              </div>

              {/* Grid 12 por página */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {result.professionals.map((prof) => (
                  <ProfessionalCard key={prof.id} professional={prof} />
                ))}
              </div>

              {/* Paginação */}
              {result.totalPages > 1 && (
                <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                  <div>
                    {result.page > 1 ? (
                      <Link
                        href={getPaginationUrl(result.page - 1)}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Anterior</span>
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 text-slate-600 text-xs font-bold border border-white/5 cursor-not-allowed">
                        <ChevronLeft className="w-4 h-4" />
                        <span>Anterior</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-medium text-slate-400">
                    Página <span className="text-white font-bold">{result.page}</span> de{' '}
                    <span className="text-white font-bold">{result.totalPages}</span>
                  </div>

                  <div>
                    {result.page < result.totalPages ? (
                      <Link
                        href={getPaginationUrl(result.page + 1)}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition"
                      >
                        <span>Próxima</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 text-slate-600 text-xs font-bold border border-white/5 cursor-not-allowed">
                        <span>Próxima</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
