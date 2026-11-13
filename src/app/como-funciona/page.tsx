import { Search, MessageSquare, Handshake, ShieldAlert } from 'lucide-react';
import { BackButton } from '@/components/navigation/BackButton';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export default function ComoFuncionaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      
      {/* Cabeçalho da Página */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs items={[{ label: 'Como Funciona' }]} />
          <BackButton fallback="/" label="Voltar à tela anterior" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Como Funciona o Conecta Móveis
        </h1>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
          Entenda de forma transparente como aproximamos clientes e prestadores do setor moveleiro em Jundiaí e região.
        </p>
      </div>

      {/* 3 Passos Claros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-base">1. Localize</h3>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Pesquise por especialidade (montagem, marcenaria sob medida, projetos 3D) e confira fotos de serviços já executados.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-base">2. Conecte</h3>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Inicie contato direto com o profissional pelo WhatsApp ou enviando uma mensagem curta pela plataforma, sem barreiras.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Handshake className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-base">3. Negocie</h3>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Combine valores, prazos e formas de pagamento diretamente com o profissional. A plataforma não cobra comissões nem taxas.
          </p>
        </div>
      </div>

      {/* Caixa de Esclarecimento Legal */}
      <div className="glass-card p-8 rounded-3xl border border-orange-500/30 relative overflow-hidden space-y-4">
        <div className="flex items-center gap-3 text-orange-400">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <h2 className="text-lg font-black text-white">Transparência e Responsabilidade Civil</h2>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <p>
            O <strong>Conecta Móveis</strong> opera como catálogo de divulgação e aproximação. A plataforma <strong>não atua como prestadora</strong>, não estabelece tabelas de preços, não emite orçamentos vinculantes e não oferece garantia sobre prazos ou qualidade das entregas.
          </p>
          <p>
            Toda a negociação, formalização e execução é de exclusiva responsabilidade entre o cliente e o profissional contratado.
          </p>
        </div>
      </div>
    </div>
  );
}
