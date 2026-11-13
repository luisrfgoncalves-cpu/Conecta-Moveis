import type { Metadata } from "next";
import { LEGAL_REVIEWED, LEGAL_VERSION, LEGAL_DATE } from "@/lib/legal/config";
import { LegalBanner } from "@/components/legal/LegalBanner";

export const metadata: Metadata = {
  title: "Política de Privacidade | Conecta Móveis",
  description:
    "Saiba como a Conecta Móveis coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.",
  ...(!LEGAL_REVIEWED && { robots: { index: false } }),
};

export default function PrivacidadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Política de Privacidade
        </h1>
        <p className="text-xs text-slate-400">
          Versão {LEGAL_VERSION} — {LEGAL_DATE} · Em conformidade com a Lei nº
          13.709/2018 (LGPD)
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
            1. Quais dados coletamos
          </h2>
          <p>
            Coletamos apenas os dados necessários para o funcionamento do
            catálogo: nome, e-mail, telefone de contato, cidade, especialidade e
            fotos de portfólio dos anunciantes; e nome e e-mail de consumidores
            que criam conta. Não coletamos dados de pagamento — toda transação é
            realizada fora da plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            2. Para que usamos seus dados
          </h2>
          <p>
            Os dados são usados para: exibir o perfil do profissional no
            catálogo; permitir que consumidores entrem em contato; enviar
            notificações relacionadas à conta; e cumprir obrigações legais. Não
            vendemos dados a terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            3. Retenção e descarte
          </h2>
          <p>
            Mensagens e solicitações de contato são retidas por 90 dias e depois
            excluídas automaticamente. Dados de conta são mantidos enquanto a
            conta estiver ativa. Após encerramento, os dados são anonimizados ou
            excluídos em até 30 dias, salvo obrigação legal de retenção maior.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            4. Compartilhamento
          </h2>
          <p>
            Dados públicos do perfil (nome, especialidade, cidade, fotos) são
            visíveis a qualquer visitante. Dados de contato são exibidos apenas
            quando o anunciante opta por isso. Podemos compartilhar dados com
            prestadores de infraestrutura (hospedagem, e-mail) sob
            confidencialidade.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            5. Segurança
          </h2>
          <p>
            Adotamos medidas técnicas razoáveis para proteger seus dados, como
            conexões criptografadas (HTTPS) e controle de acesso. Nenhum sistema
            é 100% inviolável; em caso de incidente, comunicaremos os afetados
            conforme previsto na LGPD.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            6. Cookies e rastreamento
          </h2>
          <p>
            Utilizamos cookies essenciais para manter sua sessão ativa e cookies
            analíticos para entender como a plataforma é usada. Você pode
            desativar cookies no navegador, mas algumas funcionalidades podem
            deixar de funcionar.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            7. Seus direitos como titular (LGPD)
          </h2>
          <p>
            Você tem direito a: confirmar a existência do tratamento; acessar
            seus dados; corrigir dados incompletos ou desatualizados; solicitar
            anonimização ou exclusão de dados desnecessários; revogar
            consentimento; e ser informado sobre o uso de seus dados.
          </p>
          <p className="mt-2">
            Para exercer seus direitos como titular de dados, acesse{" "}
            <a href="/contato" className="text-orange-400 underline">
              /contato
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            8. Alterações nesta política
          </h2>
          <p>
            Esta política pode ser atualizada. A versão vigente ficará sempre
            nesta página com a data de revisão. A plataforma pode remover
            conteúdo sem aviso prévio e solicitar correção ou comprovação.
          </p>
        </section>
      </div>
    </div>
  );
}
