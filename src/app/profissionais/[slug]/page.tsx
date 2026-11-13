import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  Building,
  ShieldCheck,
  Sparkles,
  Clock,
  Phone,
  MessageCircle,
  AlertTriangle,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { getPublicProfessionalBySlug } from '@/lib/search/actions';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const professional = await getPublicProfessionalBySlug(slug);

  if (!professional) {
    return {
      title: 'Profissional não encontrado | Conecta Móveis',
      description: 'O perfil solicitado não existe, foi despublicado ou está suspenso.',
    };
  }

  const title = `${professional.display_name} — ${professional.city}/${professional.state} | Conecta Móveis`;
  const description = professional.bio
    ? professional.bio.slice(0, 155) + '...'
    : `Veja o perfil de ${professional.display_name}, prestador em ${professional.city} - ${professional.state} no setor moveleiro.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: professional.avatar_url ? [{ url: professional.avatar_url }] : [],
    },
  };
}

export default async function ProfissionalPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const professional = await getPublicProfessionalBySlug(slug);

  if (!professional) {
    notFound();
  }

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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                E-mail confirmado
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                Perfil completo
              </span>
              {isNew() && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Clock className="w-3.5 h-3.5" />
                  Perfil novo
                </span>
              )}
            </div>
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
                <a
                  href={`https://wa.me/55${professional.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp: {professional.whatsapp}</span>
                </a>
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
