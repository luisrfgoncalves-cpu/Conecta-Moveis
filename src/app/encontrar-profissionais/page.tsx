import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Feedback';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EncontrarProfissionaisPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      
      {/* Cabeçalho da Página com Texto Branco Puro e Nítido */}
      <div className="space-y-3">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Início
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Profissionais e Empresas em Jundiaí e Região
        </h1>
        <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
          Catálogo aberto de montadores independentes, marceneiros sob medida, projetistas 3D e marcenarias. Encontre o profissional ideal e negocie diretamente sem comissões.
        </p>
      </div>

      {/* Aviso de Transparência Institucional */}
      <Alert type="legal">
        <strong className="text-white font-bold block mb-1">Aviso aos Contratantes:</strong>
        Os perfis abaixo são mantidos pelos próprios prestadores. A plataforma não intermedeia pagamentos, não formula orçamentos e não garante serviços. A contratação é direta entre as partes.
      </Alert>

      {/* Grade de Profissionais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          title="Montagem de Cozinha Planejada e Iluminação"
          category="Montador de Móveis"
          location="Jundiaí - SP (Vila Arens e Centro)"
          imageUrl="/images/portfolio-cozinha.svg"
          tags={['Cozinhas', 'Ferragens Blum', 'LED Embutido']}
          isDemo={true}
        />
        <Card
          title="Marcenaria de Dormitórios, Closets e Ripados"
          category="Marceneiro"
          location="Jundiaí - SP (Eloy Chaves e Medeiros)"
          imageUrl="/images/portfolio-closet.svg"
          tags={['Closets', 'Portas Reflecta', 'Ripados']}
          isDemo={true}
        />
        <Card
          title="Painéis de Home Theater em Grande Formato"
          category="Marcenaria & Design"
          location="Jundiaí e Itupeva - SP"
          imageUrl="/images/portfolio-painel.svg"
          tags={['Painéis TV', 'Marmorato', 'Fita LED']}
          isDemo={true}
        />
      </div>
    </div>
  );
}
