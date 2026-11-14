import { Metadata } from 'next';
import { getAdminUserRole } from '@/lib/admin/actions';
import { notFound } from 'next/navigation';
import { listSearchSynonyms, getNoResultTerms } from '@/lib/search/actions';
import { AdminBuscaClient } from '@/components/admin/AdminBuscaClient';
import { Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Busca Inteligente & Sinônimos | Admin Conecta Móveis',
  description: 'Gerenciamento de sinônimos de busca e monitoramento de termos sem resultado.',
};

export default async function AdminBuscaPage() {
  const { role } = await getAdminUserRole();
  if (!role || (role !== 'owner' && role !== 'admin')) {
    notFound();
  }

  const [synonymsRes, noResultsRes] = await Promise.all([
    listSearchSynonyms(),
    getNoResultTerms(30),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-6 h-6 text-orange-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Busca Inteligente & Sinônimos
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure sinônimos de busca do vocabulário moveleiro e analise termos sem resultado para novas categorias.
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <AdminBuscaClient
          initialSynonyms={synonymsRes.synonyms || []}
          initialNoResults={noResultsRes.terms || []}
        />
      </div>
    </div>
  );
}
