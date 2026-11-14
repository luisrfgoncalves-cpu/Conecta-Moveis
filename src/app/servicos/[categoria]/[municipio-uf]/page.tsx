import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Tag, ShieldCheck } from 'lucide-react';
import { getPublishedProfilesForServiceCity } from '@/lib/geo/actions';
import { CATEGORIES_CATALOG } from '@/lib/profile/schemas';
import { ProfessionalCard } from '@/components/search/ProfessionalCard';
import type { PublicProfessional } from '@/lib/search/actions';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { PlatformNotice } from '@/components/legal/PlatformNotice';
import { Alert } from '@/components/ui/Feedback';

export const revalidate = 3600; // Cache e regeneração periódica (ISR de 1h) para economizar execução

interface PageProps {
  params: Promise<{
    categoria: string;
    'municipio-uf': string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const categorySlug = resolved.categoria;
  const municipioSlug = resolved['municipio-uf'];

  const category = CATEGORIES_CATALOG.find((c) => c.slug === categorySlug);
  const catName = category ? category.name : 'Profissionais';

  const { municipio, total } = await getPublishedProfilesForServiceCity(
    categorySlug,
    municipioSlug
  );

  if (!municipio || total === 0) {
    return {
      title: 'Serviço não encontrado | Conecta Móveis',
      robots: { index: false, follow: false },
    };
  }

  const title = `${catName} em ${municipio.nome} - ${municipio.uf} | Conecta Móveis`;
  const description = `Encontre ${catName.toLowerCase()} atuantes em ${municipio.nome}/${municipio.uf}. Veja fotos de portfólio e solicite contato diretamente com os anunciantes cadastrados.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `/servicos/${categorySlug}/${municipioSlug}`,
    },
  };
}

export default async function ServicoMunicipioPage({ params }: PageProps) {
  const resolved = await params;
  const categorySlug = resolved.categoria;
  const municipioSlug = resolved['municipio-uf'];

  const category = CATEGORIES_CATALOG.find((c) => c.slug === categorySlug);
  const catName = category ? category.name : 'Profissionais';

  // REGRA MANDATÓRIA: gerada apenas quando há ao menos 1 perfil publicado
  const { municipio, professionals, total } = await getPublishedProfilesForServiceCity(
    categorySlug,
    municipioSlug
  );

  if (!municipio || total === 0 || professionals.length === 0) {
    notFound();
  }

  // JSON-LD estruturado de ItemList (sem nota agregada inventada - R14 e R4)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${catName} em ${municipio.nome} - ${municipio.uf}`,
    description: `Diretório de anunciantes de ${catName.toLowerCase()} em ${municipio.nome}/${municipio.uf}`,
    numberOfItems: professionals.length,
    itemListElement: professionals.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'LocalBusiness',
        name: p.display_name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: p.city,
          addressRegion: p.state,
          addressCountry: 'BR',
        },
        url: `https://conectamoveis.com.br/profissionais/${p.slug}`,
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Script JSON-LD neutro */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: 'Serviços', href: '/encontrar-profissionais' },
              { label: catName, href: `/encontrar-profissionais?categoria=${categorySlug}` },
              { label: `${municipio.nome} - ${municipio.uf}` },
            ]}
          />
          <Link
            href="/encontrar-profissionais"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Todas as cidades
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
              <Tag className="w-3.5 h-3.5" />
              <span>{catName}</span>
              <span>•</span>
              <MapPin className="w-3.5 h-3.5" />
              <span>{municipio.nome} / {municipio.uf}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {catName} em {municipio.nome} - {municipio.uf}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Profissionais e empresas do setor moveleiro atuantes no município de {municipio.nome} e região.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto shadow-sm">
            {total} {total === 1 ? 'anunciante disponível' : 'anunciantes disponíveis'}
          </span>
        </div>
      </div>

      <PlatformNotice />

      <Alert type="legal">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <strong className="text-white font-bold block mb-0.5">Informação de Neutralidade Técnica:</strong>
            Os perfis listados são publicados exclusivamente pelos anunciantes. A ordenação é neutra e rotativa, sem qualquer seleção editorial, endosso institucional ou aferição de conformidade técnica por parte da Conecta Móveis.
          </div>
        </div>
      </Alert>

      {/* Grade de Profissionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
        {professionals.map((prof) => {
          const cardData: PublicProfessional = {
            id: prof.id,
            display_name: prof.display_name,
            slug: prof.slug,
            bio: prof.bio,
            city: prof.city,
            state: prof.state,
            whatsapp: null,
            phone: null,
            is_featured: prof.is_featured,
            created_at: prof.created_at,
            avatar_url: prof.avatar_url,
            company_name: null,
            company_slug: null,
            plan: prof.is_featured ? 'destaque' : 'gratuito',
            rank: 0,
          };
          return <ProfessionalCard key={prof.id} professional={cardData} />;
        })}
      </div>
    </div>
  );
}
