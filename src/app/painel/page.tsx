import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { User, Images, MessageSquare, Star, ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Painel — Conecta Móveis',
};

const quickLinks = [
  { href: '/painel/perfil', label: 'Completar perfil profissional', icon: User, desc: 'Adicione bio, especialidades e regiões de atendimento' },
  { href: '/painel/portfolio', label: 'Enviar fotos de portfólio', icon: Images, desc: 'Fotos aprovadas ficam visíveis no seu perfil público' },
  { href: '/painel/solicitacoes', label: 'Ver solicitações recebidas', icon: MessageSquare, desc: 'Contatos de clientes interessados nos seus serviços' },
  { href: '/painel/avaliacoes', label: 'Minhas avaliações', icon: Star, desc: 'Visualize e responda avaliações de clientes' },
  { href: '/painel/seguranca', label: 'Segurança da conta', icon: ShieldCheck, desc: 'Altere senha ou baixe seus dados' },
];

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">
          Olá, {firstName}!
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Bem-vindo ao seu painel. O que você quer fazer hoje?
        </p>
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

      {/* Atalhos rápidos */}
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
        Este painel é pessoal e intransferível. Nunca compartilhe seus dados de acesso.
        A plataforma não garante qualidade ou resultado de serviços publicados.
      </p>
    </div>
  );
}
