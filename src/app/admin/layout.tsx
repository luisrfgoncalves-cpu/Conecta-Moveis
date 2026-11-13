import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users, FileImage, Building2, Flag, Star,
  Tag, CreditCard, FileText, LayoutDashboard, LogOut,
} from 'lucide-react';
import { signOut } from '@/lib/auth/actions';

const adminNav = [
  { href: '/admin', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users },
  { href: '/admin/perfis', label: 'Perfis', icon: Users },
  { href: '/admin/empresas', label: 'Empresas', icon: Building2 },
  { href: '/admin/fotos', label: 'Fotos pendentes', icon: FileImage },
  { href: '/admin/denuncias', label: 'Denúncias', icon: Flag },
  { href: '/admin/avaliacoes', label: 'Avaliações', icon: Star },
  { href: '/admin/categorias', label: 'Categorias', icon: Tag },
  { href: '/admin/planos', label: 'Planos', icon: CreditCard },
  { href: '/admin/logs', label: 'Logs de auditoria', icon: FileText },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/entrar');

  // Verificação de role admin — service role para contornar RLS na checagem inicial
  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: roleRow } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'moderator'])
    .single();

  // Usuário comum em /admin → 404 (não revela que a rota existe)
  if (!roleRow) notFound();

  async function handleSignOut() {
    'use server';
    await signOut();
    redirect('/');
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="w-full lg:w-64 glass-panel border-r border-white/10 flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/" aria-label="Ir para o início">
            <Image
              src="/brand/logo-conecta-moveis.png"
              alt="Conecta Móveis"
              width={140}
              height={36}
              className="h-8 w-auto"
            />
          </Link>
          <div className="mt-2 inline-block px-2 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-black uppercase tracking-wider">
            {roleRow.role}
          </div>
        </div>

        <nav aria-label="Menu administrativo" className="p-4">
          <ul className="space-y-1">
            {adminNav.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" aria-hidden />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t border-white/10">
            <form action={handleSignOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/8 transition-colors"
              >
                <LogOut className="w-4 h-4" aria-hidden />
                Sair
              </button>
            </form>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-6 lg:p-10" id="main-content">
        {children}
      </main>
    </div>
  );
}
