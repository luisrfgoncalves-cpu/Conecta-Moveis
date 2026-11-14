import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_VERSION, LEGAL_DATE } from "@/lib/legal/config";
import { LegalBanner } from "@/components/legal/LegalBanner";

export const metadata: Metadata = {
  title: "Política de Planos e Assinatura | Conecta Móveis",
  description:
    "Diretrizes para aquisição de espaço de anúncio, planos mensais e ausência de comissões na Conecta Móveis.",
};

export default function PoliticaAssinaturaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Política de Planos de Anúncio e Assinatura
        </h1>
        <p className="text-xs text-slate-400">
          Versão {LEGAL_VERSION} — Atualizado em {LEGAL_DATE}
        </p>
      </div>

      <LegalBanner />

      <div className="space-y-6 text-sm text-slate-200 leading-relaxed">
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs">
          <strong>Apenas Mensalidade Fixa:</strong> A cobrança de assinaturas remunera exclusivamente a disponibilização do espaço publicitário digital (vitrine). A plataforma não cobra comissões sobre orçamentos, negócios ou serviços fechados.
        </div>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Natureza da Assinatura: Locação de Espaço Digital</h2>
          <p>
            Os planos de assinatura da Conecta Móveis destinam-se exclusivamente a ampliar o espaço de fotos de portfólio e a posição de exibição na vitrine do diretório. A contratação de um plano não confere qualquer garantia de captação de clientes, volume de orçamentos ou faturamento, dependendo exclusivamente do mercado e do relacionamento direto entre consumidor e anunciante.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Ausência Total de Comissão ou Intermediação Financeira</h2>
          <p>
            A Conecta Móveis jamais cobra percentual, comissão, taxa de sucesso ou qualquer valor atrelado aos negócios acordados entre o cliente e o profissional. Todo e qualquer pagamento relativo à execução dos serviços moveleiros é pactuado diretamente entre as partes, sem participação ou retenção por parte da Conecta Móveis.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Cancelamento e Direito de Arrependimento</h2>
          <p>
            O anunciante que assinar um plano pago na condição de consumidor tem a prerrogativa legal de desistência prevista no Código de Defesa do Consumidor, podendo solicitar o reembolso integral no prazo de 7 (sete) dias a contar da assinatura inicial pelo suporte em <Link href="/contato" className="text-orange-400 underline">Contato</Link>. O cancelamento subsequente pode ser feito a qualquer momento no painel, cessando renovações futuras.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Suspensão por Violação Ética ou Jurídica</h2>
          <p>
            A vigência de um plano pago não isenta o anunciante de cumprir as regras da plataforma. Caso um anunciante assinante cometa fraude, utilize fotos sem autorização ou viole as políticas de uso, o anúncio será suspenso sem direito a indenização, sem prejuízo da cobrança de perdas e danos através do direito de regresso.
          </p>
        </section>
      </div>
    </div>
  );
}
