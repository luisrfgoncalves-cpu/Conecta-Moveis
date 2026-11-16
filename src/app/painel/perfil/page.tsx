import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { ProfileWizard } from '@/components/profile/ProfileWizard';

export const metadata: Metadata = {
  title: 'Meu Perfil Profissional — Painel Vitrine Moveleira',
  description: 'Complete e edite seu perfil para ser encontrado por clientes em Jundiaí e região.',
};

export default async function PainelPerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/entrar?redirect=/painel/perfil');
  }

  // Obter client admin para carregar service_regions e profile_specialties sem bloqueio de RLS
  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Buscar perfil profissional com especialidades e regiões de atendimento associadas
  const { data: professionalProfile } = await admin
    .from('professional_profiles')
    .select(`
      *,
      profile_specialties(specialty_id),
      service_regions(city, state, neighborhoods)
    `)
    .eq('user_id', user.id)
    .maybeSingle();

  // Buscar avatar na tabela profiles básica
  const { data: basicProfile } = await admin
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const resolvedAvatarUrl =
    ((professionalProfile as Record<string, unknown>)?.avatar_url as string | undefined) ||
    basicProfile?.avatar_url ||
    '';

  const initialData = professionalProfile
    ? {
      ...professionalProfile,
      avatar_url: resolvedAvatarUrl,
    }
    : resolvedAvatarUrl
      ? { avatar_url: resolvedAvatarUrl }
      : undefined;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Meu Perfil Profissional</h1>
          <p className="text-sm text-slate-400 mt-1">
            Preencha os dados em etapas para publicar sua vitrine profissional e receber contatos diretos.
          </p>
        </div>
        {(professionalProfile as { slug?: string } | null)?.slug && (
          <Link
            href={`/profissionais/${(professionalProfile as { slug?: string }).slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition shadow-sm self-start sm:self-auto"
          >
            <Eye className="w-4 h-4" />
            <span>Ver como visitante</span>
          </Link>
        )}
      </div>

      <ProfileWizard
        initialProfile={initialData}
        userEmail={user.email ?? ''}
        isEmailConfirmed={!!user.email_confirmed_at}
      />
    </div>
  );
}

