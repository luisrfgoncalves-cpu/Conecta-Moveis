import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Building2,
  MapPin,
  FileCheck2,
  AlertTriangle,
  Star,
  Users,
} from 'lucide-react';
import { getPublicCompanyBySlug } from '@/lib/search/actions';
import { ProfessionalCard } from '@/components/search/ProfessionalCard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getPublicCompanyBySlug(slug);

  if (!company) {
    return {
      title: 'Empresa não encontrada | Conecta Móveis',
      description: 'A empresa solicitada não foi encontrada ou não está publicada.',
    };
  }

  const titleName = company.trade_name || company.name;
  const title = `${titleName} — Empresa do Setor Moveleiro | Conecta Móveis`;
  const description = company.description
    ? company.description.slice(0, 155) + '...'
    : `Conheça a empresa ${titleName} no catálogo do setor moveleiro de Jundiaí e região.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: company.logo_url ? [{ url: company.logo_url }] : [],
    },
  };
}

export default async function EmpresaPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const company = await getPublicCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const displayName = company.trade_name || company.name;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Navegação de Retorno */}
      <div>
        <Link
          href="/encontrar-profissionais"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à busca de profissionais
        </Link>
      </div>

      {/* Cartão Principal da Empresa */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-8 relative overflow-hidden">
        {/* Glow Superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />

        {/* Cabeçalho da Empresa */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
            {company.logo_url ? (
              <Image
                src={company.logo_url}
                alt={displayName}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <Building2 className="w-12 h-12 text-slate-400" />
            )}
          </div>

          <div className="space-y-2 flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white">{displayName}</h1>

            {company.trade_name && company.name !== company.trade_name && (
              <p className="text-xs text-slate-400">
                Razão Social: <span className="text-slate-300">{company.name}</span>
              </p>
            )}

            {company.city && company.state && (
              <p className="text-sm text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  {company.city} - {company.state}
                </span>
              </p>
            )}

            {/* CNPJ Informativo (Sem selo de garantia) */}
            {company.cnpj && (
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
                  <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>CNPJ: {company.cnpj}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Informativo, sem garantia)
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Aviso Obrigatório aos Contratantes */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 block font-bold mb-0.5">
              Aviso aos Contratantes:
            </strong>
            Este perfil é publicado pelo anunciante. A presença na plataforma não representa garantia da qualidade, prazo ou resultado do serviço.
          </div>
        </div>

        {/* Descrição da Empresa */}
        {company.description && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Sobre a Empresa
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {company.description}
            </p>
          </div>
        )}

        {/* Profissionais Vinculados */}
        {company.professionals && company.professionals.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-400" />
              Equipe e Profissionais ({company.professionals.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {company.professionals.map((prof) => (
                <ProfessionalCard key={prof.id} professional={prof} />
              ))}
            </div>
          </div>
        )}

        {/* Seção de Avaliações */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Avaliações e Reputação
          </h2>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-sm font-semibold text-slate-300">Sem avaliações ainda</p>
            <p className="text-xs text-slate-400 mt-1">
              As avaliações serão liberadas após a conclusão de serviços comprovados através da plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
