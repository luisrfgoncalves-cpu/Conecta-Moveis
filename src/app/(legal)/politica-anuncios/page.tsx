import type { Metadata } from "next";
import { LEGAL_REVIEWED, LEGAL_VERSION, LEGAL_DATE } from "@/lib/legal/config";
import { LegalBanner } from "@/components/legal/LegalBanner";

export const metadata: Metadata = {
  title: "Política de Anúncios | Conecta Móveis",
  description:
    "Regras para publicação de anúncios, perfis e portfólios na plataforma Conecta Móveis.",
  ...(!LEGAL_REVIEWED && { robots: { index: false } }),
};

export default function PoliticaAnunciosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Política de Anúncios
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
            1. O que pode ser anunciado
          </h2>
          <p>
            A Conecta Móveis é destinada exclusivamente a profissionais e
            empresas do setor moveleiro: marceneiros, montadores de móveis,
            decoradores, lojas de móveis planejados, reformadores e serviços
            correlatos. Anúncios fora desse escopo não serão aceitos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            2. Informações obrigatórias
          </h2>
          <p>
            Todo anúncio deve conter: nome real ou razão social, cidade de
            atuação, especialidade declarada e pelo menos uma forma de contato
            válida. Perfis com informações incompletas podem ser ocultados até a
            regularização.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            3. O que é proibido
          </h2>
          <p>
            São proibidos anúncios com informações falsas ou enganosas; fotos
            que não sejam de autoria ou posse do anunciante; promessas de
            resultados que a plataforma não pode garantir; preços ou condições
            enganosas; e qualquer conteúdo que viole leis brasileiras.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            4. Moderação e remoção
          </h2>
          <p>
            A plataforma pode remover conteúdo sem aviso prévio e solicitar
            correção ou comprovação. Anúncios denunciados passam por análise
            interna. Havendo indícios de irregularidade, o anuncio pode ser
            ocultado durante a apuração.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            5. Atualização das informações
          </h2>
          <p>
            O anunciante é responsável por manter suas informações atualizadas.
            Perfis com contatos inválidos ou desatualizados podem ser suspensos
            após aviso.
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
