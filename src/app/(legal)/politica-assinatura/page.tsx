import type { Metadata } from "next";
import { LEGAL_REVIEWED, LEGAL_VERSION, LEGAL_DATE } from "@/lib/legal/config";
import { LegalBanner } from "@/components/legal/LegalBanner";

export const metadata: Metadata = {
  title: "Política de Assinatura | Conecta Móveis",
  description:
    "Como funcionam os planos de assinatura da Conecta Móveis: benefícios, cancelamento e condições.",
  ...(!LEGAL_REVIEWED && { robots: { index: false } }),
};

export default function PoliticaAssinaturaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Política de Assinatura
        </h1>
        <p className="text-xs text-slate-400">
          Versão {LEGAL_VERSION} — {LEGAL_DATE}
        </p>
      </div>

      <LegalBanner />

      <div className="space-y-6 text-sm text-slate-200 leading-relaxed">
        <p className="text-slate-300 italic">
          A Conecta Móveis é uma plataforma de divulgação. Os profissionais são
          autônomos e independentes. Orçamento, contratação, pagamento e
          execução do serviço ocorrem diretamente entre cliente e profissional,
          sem intermediação da plataforma.
        </p>
        <p className="text-slate-300 italic">
          A presença na plataforma não é garantia de qualidade, pontualidade ou
          resultado.
        </p>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            1. O que são os planos de assinatura
          </h2>
          <p>
            A Conecta Móveis oferece planos pagos que concedem maior visibilidade
            ao perfil do anunciante dentro da plataforma — como destaque nos
            resultados de busca, mais espaço para fotos e portfólio, e acesso a
            recursos exclusivos. Os planos são ferramentas de <strong>visibilidade</strong>, 
            não de captação garantida de clientes.
          </p>
          <p className="mt-2 text-amber-300/80">
            Assinar um plano não garante o recebimento de contatos, orçamentos
            ou contratações. Os resultados dependem de fatores externos à
            plataforma, como qualidade do perfil, demanda do mercado e
            disponibilidade do profissional.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            2. Cobrança e renovação
          </h2>
          <p>
            Os planos são cobrados antecipadamente pelo período escolhido (mensal
            ou anual). O valor é debitado no ato da contratação ou renovação.
            Planos com renovação automática serão renovados automaticamente ao
            fim de cada período, salvo cancelamento prévio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            3. Cancelamento
          </h2>
          <p>
            O cancelamento pode ser solicitado a qualquer momento pelo painel do
            assinante. Ao cancelar, o plano permanece ativo até o fim do período
            já pago — não há reembolso proporcional pelo tempo restante. Após o
            encerramento do período vigente, o perfil retorna ao plano gratuito.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            4. Alteração de plano
          </h2>
          <p>
            O anunciante pode fazer upgrade de plano a qualquer momento, com
            cobrança proporcional ao período restante. O downgrade entra em
            vigor apenas no próximo ciclo de renovação.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            5. Suspensão por violação de termos
          </h2>
          <p>
            Perfis que violem os Termos de Uso ou demais políticas da plataforma
            podem ter a assinatura suspensa sem direito a reembolso. A plataforma
            pode remover conteúdo sem aviso prévio e solicitar correção ou
            comprovação.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            6. Alterações nos planos e preços
          </h2>
          <p>
            A Conecta Móveis pode alterar os planos disponíveis, seus benefícios
            e preços a qualquer momento. Assinantes ativos serão comunicados com
            antecedência mínima de 30 dias antes de qualquer aumento de preço.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            7. Seus dados e privacidade
          </h2>
          <p>
            Para exercer seus direitos como titular de dados, acesse{" "}
            <a href="/contato" className="text-orange-400 underline">
              /contato
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
