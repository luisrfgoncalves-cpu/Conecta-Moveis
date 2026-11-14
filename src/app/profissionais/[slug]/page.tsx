/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Building,
  ShieldCheck,
  Sparkles,
  Clock,
  Phone,
  AlertTriangle,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { getPublicProfessionalBySlug } from '@/lib/search/actions';
import { createClient } from '@/lib/supabase/server';
import { isFavorite } from '@/lib/favorites/actions';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { ShareButton } from '@/components/share/ShareButton';
import { ReportButton } from '@/components/reports/ReportButton';
import { ContactForm } from '@/components/contact/ContactForm';
import { WhatsAppTracker } from '@/components/contact/WhatsAppTracker';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { PlatformNotice } from '@/components/legal/PlatformNotice';
import { getProfileReviews, checkReviewEligibility } from '@/lib/reviews/actions';
import { BackButton } from '@/components/navigation/BackButton';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const professional = await getPublicProfessionalBySlug(slug);

  if (!professional) {
    return {
      title: 'Profissional não encontrado',
      description: 'O perfil solicitado não existe, foi despublicado ou está suspenso.',
    };
  }

  const title = `${professional.display_name} — Profissional em ${professional.city}`;
  const description = professional.bio
    ? professional.bio.slice(0, 155) + (professional.bio.length > 155 ? '...' : '')
    : `Veja o perfil de ${professional.display_name}, prestador em ${professional.city} - ${professional.state} no setor moveleiro.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      locale: 'pt_BR',
      siteName: 'Conecta Móveis',
      images: professional.avatar_url
        ? [{ url: professional.avatar_url, width: 400, height: 400, alt: professional.display_name }]
        : [{ url: '/og-default.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: professional.avatar_url ? [professional.avatar_url] : ['/og-default.jpg'],
    },
  };
}

export default async function ProfissionalPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const professional = await getPublicProfessionalBySlug(slug);

  if (!professional) {
    notFound();
  }

  // Verificar sessão e favorito
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  const favStatus = user ? await isFavorite(professional.id) : false;

  // Avaliações e elegibilidade
  const { reviews, stats } = await getProfileReviews(professional.id);
  const eligibility = user ? await checkReviewEligibility(professional.id) : { eligible: false, reason: 'Faça login para avaliar.' };
  const isOwner = user ? user.id === (professional as any).user_id : false;

  const profileUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://conecta-moveis.vercel.app'}/profissionais/${slug}`;

  const isNew = () => {
    const createdDate = new Date(professional.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Navegação de Retorno e Breadcrumbs */}
      <div className="flex items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            { label: 'Profissionais', href: '/encontrar-profissionais' },
            { label: professional.display_name },
          ]}
        />
        <BackButton fallback="/encontrar-profissionais" label="Voltar à busca" />
      </div>

      {/* Cartão Principal do Perfil */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-8 relative overflow-hidden">
        {/* Glow Superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />

        {/* Cabeçalho do Perfil */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
            {professional.avatar_url ? (
              <Image
                src={professional.avatar_url}
                alt={professional.display_name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <span className="text-3xl font-black text-slate-200">
                {getInitials(professional.display_name)}
              </span>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {professional.display_name}
              </h1>
              {professional.is_featured && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Destaque
                </span>
              )}
            </div>

            {professional.company_name && professional.company_slug && (
              <p className="text-sm text-slate-300 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-400" />
                <span>Empresa:</span>
                <Link
                  href={`/empresas/${professional.company_slug}`}
                  className="font-semibold text-orange-400 hover:underline"
                >
                  {professional.company_name}
                </Link>
              </p>
            )}

            <p className="text-sm text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                {professional.city} - {professional.state}
              </span>
            </p>

            {/* Selos Permitidos */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span
                title="Informação automática; não é recomendação."
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                E-mail confirmado
              </span>
              <span
                title="Informação automática; não é recomendação."
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Perfil completo
              </span>
              {isNew() && (
                <span
                  title="Informação automática; não é recomendação."
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Perfil novo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Aviso Fixo da Plataforma */}
        <PlatformNotice />

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

        {/* Barra de ações — Favoritar, Compartilhar, Denunciar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          <FavoriteButton
            profileId={professional.id}
            initialIsFav={favStatus}
            isLoggedIn={isLoggedIn}
          />
          <ShareButton
            url={profileUrl}
            title={`${professional.display_name} — ${professional.city}/${professional.state} | Conecta Móveis`}
          />
          <div className="ml-auto">
            <ReportButton
              targetType="profile"
              targetId={professional.id}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>

        {/* Sobre o Profissional (Bio) */}
        {professional.bio && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Apresentação Profissional
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {professional.bio}
            </p>
          </div>
        )}

        {/* Especialidades */}
        {professional.specialties && professional.specialties.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Especialidades e Atuação
            </h2>
            <div className="flex flex-wrap gap-2">
              {professional.specialties.map((spec) => (
                <span
                  key={spec.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 text-slate-200 border border-white/10"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                  {spec.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Regiões Atendidas */}
        {professional.service_regions && professional.service_regions.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Regiões e Cidades Atendidas
            </h2>
            <div className="flex flex-wrap gap-2">
              {professional.service_regions.map((reg, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 text-slate-300 border border-white/10"
                >
                  <MapPin className="w-3 h-3 text-sky-400 inline mr-1" />
                  {reg.city} - {reg.state} {reg.neighborhood ? `(${reg.neighborhood})` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Contato Público (Opcionais autorizados pelo usuário) */}
        {(professional.whatsapp || professional.phone) && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Contatos Autorizados
            </h2>
            <div className="flex flex-wrap gap-3">
              {professional.whatsapp && (
                <WhatsAppTracker
                  profileId={professional.id}
                  whatsapp={professional.whatsapp}
                />
              )}
              {professional.phone && (
                <a
                  href={`tel:${professional.phone.replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/20 transition"
                >
                  <Phone className="w-4 h-4 text-slate-300" />
                  <span>Telefone: {professional.phone}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Galeria de Portfólio — Apenas imagens approved, carregamento preguiçoso */}
        {professional.portfolio && professional.portfolio.length > 0 && (
          <div className="space-y-5 pt-2 border-t border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-400" />
              Portfólio de Projetos ({professional.portfolio.length} {professional.portfolio.length === 1 ? 'projeto' : 'projetos'})
            </h2>
            <div className="space-y-6">
              {professional.portfolio.map((portfolioItem) => (
                <div key={portfolioItem.id} className="space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{portfolioItem.title}</h3>
                    {portfolioItem.description && (
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{portfolioItem.description}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {portfolioItem.images.map((img, imgIdx) => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-white/10 group">
                        <Image
                          src={img.thumb_url || img.image_url}
                          alt={`${portfolioItem.title} — foto ${imgIdx + 1}`}
                          fill
                          className="object-cover transition group-hover:scale-105"
                          loading="lazy"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                        {img.is_demo && (
                          <div className="absolute bottom-2 left-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/90 text-white backdrop-blur-md">
                              <Sparkles className="w-2.5 h-2.5" />
                              Demonstração
                            </span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ReportButton
                            targetType="image"
                            targetId={img.id}
                            isLoggedIn={isLoggedIn}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Avaliações Reais */}
        <ReviewsSection
          profileId={professional.id}
          professionalName={professional.display_name}
          initialReviews={reviews}
          initialStats={stats}
          isLoggedIn={isLoggedIn}
          eligible={eligibility.eligible}
          contactRequestId={eligibility.contactRequestId}
          eligibilityReason={eligibility.reason}
          isOwner={isOwner}
        />
      </div>

      {/* Formulário de Solicitação de Contato */}
      <div className="mt-6">
        <ContactForm
          profileId={professional.id}
          professionalName={professional.display_name}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
}

