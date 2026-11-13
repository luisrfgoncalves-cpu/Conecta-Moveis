import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ProfileWizard } from '@/components/profile/ProfileWizard';

export const metadata: Metadata = {
  title: 'Meu Perfil Profissional — Painel Conecta Móveis',
  description: 'Complete e edite seu perfil para ser encontrado por clientes em Jundiaí e região.',
};

export default async function PainelPerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/entrar?next=/painel/perfil');
  }

  // Buscar perfil profissional com especialidades e regiões de atendimento associadas
  const { data: professionalProfile } = await supabase
    .from('professional_profiles')
    .select(`
      *,
      profile_specialties(specialty_id),
      service_regions(city, state, neighborhoods)
    `)
    .eq('user_id', user.id)
    .single();

  // Buscar avatar na tabela profiles básica
  const { data: basicProfile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single();

  const initialData = professionalProfile
    ? {
        ...professionalProfile,
        avatar_url: basicProfile?.avatar_url || '',
      }
    : basicProfile?.avatar_url
    ? { avatar_url: basicProfile.avatar_url }
    : undefined;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white">Meu Perfil Profissional</h1>
        <p className="text-sm text-slate-400 mt-1">
          Preencha os dados em etapas para publicar sua vitrine profissional e receber contatos diretos.
        </p>
      </div>

      <ProfileWizard
        initialProfile={initialData}
        userEmail={user.email ?? ''}
        isEmailConfirmed={!!user.email_confirmed_at}
      />
    </div>
  );
}
