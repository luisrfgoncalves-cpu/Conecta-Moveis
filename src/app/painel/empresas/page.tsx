import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { CompanyForm } from '@/components/profile/CompanyForm';

export const metadata: Metadata = {
  title: 'Minha Empresa — Painel Conecta Móveis',
  description: 'Gerencie os dados cadastrais da sua marcenaria, loja ou showroom de móveis.',
};

export default async function PainelEmpresasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/entrar?next=/painel/empresas');
  }

  // Buscar empresa do usuário onde ele é o owner
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-white">Minha Empresa</h1>
        <p className="text-sm text-slate-400 mt-1">
          Cadastre ou atualize as informações da sua loja, marcenaria ou fábrica de móveis.
        </p>
      </div>

      <CompanyForm initialCompany={company} />
    </div>
  );
}

