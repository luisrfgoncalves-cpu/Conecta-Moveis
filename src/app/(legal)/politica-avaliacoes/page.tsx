import type { Metadata } from "next";
import { LEGAL_VERSION, LEGAL_DATE } from "@/lib/legal/config";
import { LegalBanner } from "@/components/legal/LegalBanner";

export const metadata: Metadata = {
  title: "Política de Avaliações | Conecta Móveis",
  description:
    "Como funcionam as avaliações de profissionais na Conecta Móveis: regras, moderação e direitos.",
};

export default function PoliticaAvaliacoesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Política de Avaliações
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
            1. Quem pode avaliar
          </h2>
          <p>
            Apenas usuários cadastrados podem publicar avaliações. Cada usuário
            pode avaliar um mesmo profissional uma única vez. A plataforma não
            verifica se houve efetivamente uma contratação — a responsabilidade
            pela veracidade é do avaliador.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            2. Conteúdo das avaliações
          </h2>
          <p>
            Avaliações devem descrever experiências reais de forma respeitosa.
            São proibidos xingamentos, ataques pessoais, informações falsas,
            difamação e qualquer conteúdo que viole a legislação. A plataforma
            pode remover conteúdo sem aviso prévio e solicitar correção ou
            comprovação.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            3. Moderação
          </h2>
          <p>
            Avaliações podem ser sinalizadas por qualquer usuário ou pelo
            próprio profissional. A equipe da Conecta Móveis analisa as
            sinalizações e pode editar, ocultar ou excluir avaliações que violem
            estas regras.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            4. Direito de resposta
          </h2>
          <p>
            O profissional avaliado pode publicar uma resposta à avaliação. A
            resposta deve ser respeitosa e objetiva, e está sujeita às mesmas
            regras de moderação.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            5. Avaliações e reputação
          </h2>
          <p>
            As avaliações compõem a nota de reputação exibida no perfil. Essa
            nota reflete apenas as avaliações recebidas na plataforma e não
            representa certificação, endosso ou garantia de qualidade por parte
            da Conecta Móveis.
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
