import type { Metadata } from "next";
import { LEGAL_REVIEWED, LEGAL_VERSION, LEGAL_DATE } from "@/lib/legal/config";
import { LegalBanner } from "@/components/legal/LegalBanner";

export const metadata: Metadata = {
  title: "Política de Portfólio | Conecta Móveis",
  description:
    "Regras para publicação de fotos e portfólio de trabalhos na Conecta Móveis.",
  ...(!LEGAL_REVIEWED && { robots: { index: false } }),
};

export default function PoliticaPortfolioPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Política de Portfólio
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
            1. O que pode ser publicado no portfólio
          </h2>
          <p>
            O portfólio deve conter apenas imagens de trabalhos realizados pelo
            próprio anunciante. Fotos de projetos de terceiros, imagens retiradas
            da internet ou de concorrentes são estritamente proibidas.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            2. Qualidade das imagens
          </h2>
          <p>
            As imagens devem ser claras, bem enquadradas e representativas do
            serviço oferecido. Imagens com marca d&apos;água de outras
            plataformas, logotipos de concorrentes ou textos promocionais
            excessivos podem ser removidas.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            3. Direitos sobre as imagens
          </h2>
          <p>
            Ao publicar uma foto, o anunciante declara que possui os direitos
            sobre ela e autoriza a Conecta Móveis a exibi-la na plataforma. Caso
            um terceiro reivindique a autoria de uma imagem, ela será removida
            imediatamente enquanto a situação é apurada.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            4. Privacidade de clientes nas fotos
          </h2>
          <p>
            Imagens que mostrem pessoas identificáveis (clientes, moradores)
            devem ter a autorização dessas pessoas. A Conecta Móveis não se
            responsabiliza por uso indevido de imagens que contenham terceiros
            sem autorização.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            5. Moderação
          </h2>
          <p>
            A plataforma pode remover conteúdo sem aviso prévio e solicitar
            correção ou comprovação. Imagens inadequadas, fora do escopo do
            serviço ou que violem estas regras serão removidas.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            6. Seus dados e privacidade
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
