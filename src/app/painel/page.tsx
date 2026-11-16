import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  User,
  Images,
  MessageSquare,
  Star,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  Heart,
  Search,
  Wrench,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Painel — Conecta Móveis',
};

export default async function PainelPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const firstName = profile?.full_name?.split(' ')[0] ?? 'usuário';

  // Verificar se o usuário possui perfil profissional cadastrado
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profRow } = await adminClient
    .from('professional_profiles')
    .select('slug, published')
    .eq('user_id', user.id)
    .maybeSingle();

  const hasProfessionalProfile = !!profRow;

  const quickLinks = hasProfessionalProfile
    ? [
      { href: '/painel/perfil', label: 'Meu Anúncio Profissional', icon: User, desc: 'Edite sua bio, especialidades e regiões de atendimento' },
      { href: '/painel/fotos', label: 'Fotos de Apresentação', icon: Images, desc: 'Envie fotos de trabalhos realizados para o seu perfil público' },
      { href: '/painel/solicitacoes', label: 'Contatos Recebidos', icon: MessageSquare, desc: 'Mensagens enviadas por clientes interessados nos seus serviços' },
      { href: '/painel/avaliacoes', label: 'Minhas Avaliações', icon: Star, desc: 'Visualize e responda mensagens e notas de clientes' },
      { href: '/painel/assinatura', label: 'Meu Plano', icon: Wrench, desc: 'Gerencie seu plano de visibilidade no período de lançamento' },
      { href: '/painel/seguranca', label: 'Segurança da Conta', icon: ShieldCheck, desc: 'Altere sua senha ou baixe seus dados cadastrais' },
    ]
    : [
      { href: '/encontrar-profissionais', label: 'Buscar Profissionais', icon: Search, desc: 'Encontre montadores, marceneiros e lojas em Jundiaí e região' },
      { href: '/painel/favoritos', label: 'Profissionais Favoritos', icon: Heart, desc: 'Acesse rapidamente os perfis que você salvou' },
      { href: '/painel/solicitacoes', label: 'Pedidos de Contato Enviados', icon: MessageSquare, desc: 'Histórico de solicitações enviadas a profissionais' },
      { href: '/painel/perfil', label: 'Quero Divulgar Meu Trabalho', icon: PlusCircle, desc: 'Crie seu perfil profissional e comece a anunciar na plataforma' },
      { href: '/painel/configuracoes', label: 'Minha Conta e Privacidade', icon: User, desc: 'Atualize seus dados pessoais e preferências' },
      { href: '/painel/seguranca', label: 'Segurança da Conta', icon: ShieldCheck, desc: 'Gerencie sua senha e sessões ativas' },
    ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">
            Olá, {firstName}!
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {hasProfessionalProfile
              ? 'Gerencie seu anúncio, fotos de apresentação e contatos recebidos.'
              : 'Encontre profissionais ou comece a divulgar seus próprios serviços.'}
          </p>
        </div>

        {!hasProfessionalProfile && (
          <Link
            href="/painel/perfil"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Divulgar meu trabalho</span>
          </Link>
        )}
      </div>

      {/* Aviso de e-mail não confirmado */}
      {!user.email_confirmed_at && (
        <div role="status" className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
          <strong className="font-bold">Confirme seu e-mail</strong>
          <p className="mt-0.5 text-amber-400/80">
            Verifique sua caixa de entrada e clique no link de confirmação para ativar todas as funcionalidades.
          </p>
        </div>
      )}

      {/* Banner explicativo para quem ainda não tem perfil profissional */}
      {!hasProfessionalProfile && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-400" />
              Você presta serviços moveleiros?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Crie seu perfil profissional no catálogo. É gratuito no período de lançamento e permite que você receba contatos diretos no WhatsApp.
            </p>
          </div>
          <Link
            href="/painel/perfil"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-orange-400 transition shrink-0"
          >
            Criar meu anúncio
          </Link>
        </div>
      )}

      {/* Atalhos rápidos contextuais */}
      <section aria-labelledby="quick-links-title">
        <h2 id="quick-links-title" className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">
          Acesso rápido
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="glass-card rounded-2xl p-5 flex items-start gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400 flex-shrink-0 group-hover:bg-orange-500/25 transition">
                <Icon className="w-5 h-5" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white group-hover:text-orange-300 transition flex items-center gap-1">
                  {label}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" aria-hidden />
                </p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Aviso legal */}
      <p className="text-xs text-slate-500 leading-relaxed border-t border-white/8 pt-6">
        Este painel é pessoal e intransferível. A plataforma não participa de orçamentos, contratos ou pagamentos e não garante a qualidade ou o resultado dos serviços anunciados.
      </p>
    </div>
  );
}
