import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from '@/lib/auth/actions';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { BrandLogo } from '@/components/brand/BrandLogo';
import {
  LayoutDashboard,
  User,
  Images,
  MessageSquare,
  Heart,
  Star,
  CreditCard,
  Settings,
  ShieldCheck,
  Building2,
  LogOut,
  ShieldAlert,
  Globe,
  Eye,
  PlusCircle,
  Search,
} from 'lucide-react';

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redireciona se não autenticado
  if (!user) redirect('/entrar');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single();

  // Cliente admin para checar papéis e existência de perfil profissional
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [{ data: roleRow }, { data: profRow }] = await Promise.all([
    adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['owner', 'admin', 'moderator'])
      .maybeSingle(),
    adminClient
      .from('professional_profiles')
      .select('slug')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  const isAdminOrMod = !!roleRow;
  const hasProfessionalProfile = !!profRow;

  // Itens de navegação contextuais conforme Bloco 6.2
  // Com perfil: Meu anúncio, Fotos de apresentação, Contatos recebidos, Minhas avaliações, Meu plano, Minha conta, Segurança
  // Sem perfil: Início, Favoritos, Pedidos de contato enviados, Alertas, Minha conta e privacidade, botão "Quero divulgar meu trabalho"
  const navItems = hasProfessionalProfile
    ? [
        { href: '/painel', label: 'Painel', icon: LayoutDashboard },
        { href: '/painel/perfil', label: 'Meu Anúncio', icon: User },
        { href: '/painel/fotos', label: 'Fotos de Apresentação', icon: Images },
        { href: '/painel/solicitacoes', label: 'Contatos Recebidos', icon: MessageSquare },
        { href: '/painel/avaliacoes', label: 'Avaliações', icon: Star },
        { href: '/painel/assinatura', label: 'Meu Plano', icon: CreditCard },
        { href: '/painel/empresas', label: 'Empresa', icon: Building2 },
        { href: '/painel/configuracoes', label: 'Minha Conta', icon: Settings },
        { href: '/painel/seguranca', label: 'Segurança', icon: ShieldCheck },
      ]
    : [
        { href: '/painel', label: 'Início', icon: LayoutDashboard },
        { href: '/encontrar-profissionais', label: 'Buscar Profissionais', icon: Search },
        { href: '/painel/favoritos', label: 'Favoritos', icon: Heart },
        { href: '/painel/solicitacoes', label: 'Pedidos Enviados', icon: MessageSquare },
        { href: '/painel/configuracoes', label: 'Minha Conta e Privacidade', icon: Settings },
        { href: '/painel/seguranca', label: 'Segurança', icon: ShieldCheck },
      ];

  async function handleSignOut() {
    'use server';
    await signOut();
    redirect('/');
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 glass-panel border-r border-white/10 flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <BrandLogo href="/" size="sm" />
        </div>

        {/* Perfil do usuário */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black text-sm flex-shrink-0">
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {profile?.full_name ?? 'Usuário'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navegação contextual */}
        <nav aria-label="Menu do painel" className="p-4">
          <ul className="space-y-1">
            {isAdminOrMod && (
              <li className="mb-3 pb-3 border-b border-orange-500/20">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shadow-sm"
                >
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-orange-400" aria-hidden />
                  Painel de Administração
                </Link>
              </li>
            )}

            {!hasProfessionalProfile && (
              <li className="mb-3 pb-3 border-b border-white/10">
                <Link
                  href="/painel/perfil"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition shadow-md"
                >
                  <PlusCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Quero divulgar meu trabalho</span>
                </Link>
              </li>
            )}

            {navItems.map(({ href, label, icon: Icon }) => (
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

          <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
            {profRow?.slug && (
              <Link
                href={`/profissionais/${profRow.slug}`}
                target="_blank"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <Eye className="w-4 h-4 flex-shrink-0" aria-hidden />
                Ver como visitante
              </Link>
            )}
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <Globe className="w-4 h-4 flex-shrink-0" aria-hidden />
              Ver Vitrine Pública
            </Link>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden />
                Sair da conta
              </button>
            </form>
          </div>
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6 lg:p-10 max-w-5xl" id="main-content">
        {children}
      </main>
    </div>
  );
}
