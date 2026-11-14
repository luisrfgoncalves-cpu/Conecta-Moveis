import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Building, ShieldCheck, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { PublicProfessional } from '@/lib/search/actions';

interface ProfessionalCardProps {
  professional: PublicProfessional;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
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
    <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-orange-500/50 transition flex flex-col justify-between group">
      <div className="space-y-4">
        {/* Topo do Card: Avatar + Informações Básicas */}
        <div className="flex items-start gap-4">
          <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
            {professional.avatar_url ? (
              <Image
                src={professional.avatar_url}
                alt={professional.display_name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-lg font-black text-slate-300">
                {getInitials(professional.display_name)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/profissionais/${professional.slug}`}
                className="text-lg font-bold text-white hover:text-orange-400 transition truncate"
              >
                {professional.display_name}
              </Link>
              {professional.is_featured && (
                <span
                  title="Destaque patrocinado por plano de visibilidade comercial. Não representa recomendação de qualidade pela plataforma."
                  className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30"
                >
                  {process.env.NEXT_PUBLIC_BILLING_MODE === 'test'
                    ? 'Destaque patrocinado (Teste)'
                    : 'Destaque patrocinado'}
                </span>
              )}
            </div>

            {professional.company_name && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{professional.company_name}</span>
              </p>
            )}

            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>
                {professional.city} - {professional.state}
              </span>
            </p>
          </div>
        </div>

        {/* Selos Permitidos */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span
            title="Informação automática; não é recomendação."
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          >
            <ShieldCheck className="w-3 h-3" />
            E-mail confirmado
          </span>
          <span
            title="Informação automática; não é recomendação."
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20"
          >
            <Sparkles className="w-3 h-3" />
            Perfil completo
          </span>
          {isNew() && (
            <span
              title="Informação automática; não é recomendação."
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
            >
              <Clock className="w-3 h-3" />
              Perfil novo
            </span>
          )}
        </div>

        {/* Bio Curta */}
        {professional.bio && (
          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
            {professional.bio}
          </p>
        )}

        {/* Tags de Especialidades */}
        {professional.specialties && professional.specialties.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-1.5">
            {professional.specialties.slice(0, 3).map((spec) => (
              <span
                key={spec.id}
                className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white/5 text-slate-300 border border-white/10"
              >
                {spec.name}
              </span>
            ))}
            {professional.specialties.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-semibold">
                +{professional.specialties.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Ação Inferior */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">Sem avaliações ainda</span>
        <Link
          href={`/profissionais/${professional.slug}`}
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300 group-hover:translate-x-0.5 transition"
        >
          <span>Ver perfil</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

