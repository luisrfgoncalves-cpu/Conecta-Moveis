import type { Metadata } from "next";
import { LEGAL_REVIEWED, LEGAL_VERSION, LEGAL_DATE } from "@/lib/legal/config";
import { LegalBanner } from "@/components/legal/LegalBanner";

export const metadata: Metadata = {
  title: "Termos de Uso | Conecta Móveis",
  description:
    "Termos de uso e condições gerais da plataforma Conecta Móveis — marketplace de profissionais de móveis em Jundiaí/SP.",
  ...(!LEGAL_REVIEWED && { robots: { index: false } }),
};

export default function TermosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Termos de Uso e Condições Gerais
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
            1. O que é a Conecta Móveis
          </h2>
          <p>
            A Conecta Móveis é um catálogo digital que permite que profissionais
            do setor moveleiro — marceneiros, montadores, decoradores e lojas —
            divulguem seus serviços para consumidores da região de Jundiaí e
            cidades vizinhas. A plataforma não participa da prestação dos
            serviços, não emite orçamentos e não retém pagamentos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            2. Quem pode usar a plataforma
          </h2>
          <p>
            Qualquer pessoa física ou jurídica maior de 18 anos ou devidamente
            representada pode se cadastrar como consumidor ou como anunciante.
            Ao criar uma conta, o usuário declara que as informações fornecidas
            são verdadeiras.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            3. Responsabilidade pelos conteúdos publicados
          </h2>
          <p>
            Cada anunciante é o único responsável pelas informações, fotos,
            portfólios e avaliações que publica. A Conecta Móveis não valida
            previamente os conteúdos e não garante a veracidade das informações.
            Conteúdos falsos, enganosos ou ilegais podem ser removidos a
            qualquer momento.
          </p>
          <p className="mt-2">
            A plataforma pode remover conteúdo sem aviso prévio e solicitar
            correção ou comprovação.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            4. Negociação e contratação
          </h2>
          <p>
            Todo contato, orçamento, negociação e pagamento ocorre diretamente
            entre o consumidor e o profissional. A Conecta Móveis não participa
            desse processo e não assume qualquer responsabilidade por acordos
            firmados entre as partes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            5. Condutas proibidas
          </h2>
          <p>
            É proibido cadastrar informações falsas, utilizar a plataforma para
            fraudes, publicar conteúdo ofensivo ou que viole direitos autorais
            de terceiros, ou tentar comprometer a segurança e disponibilidade
            dos sistemas da Conecta Móveis.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            6. Encerramento de conta
          </h2>
          <p>
            A Conecta Móveis pode suspender ou encerrar contas que violem estes
            termos, sem necessidade de aviso prévio. O usuário também pode
            solicitar o encerramento da própria conta a qualquer momento pelo
            painel ou pelo canal de contato.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            7. Alterações nos termos
          </h2>
          <p>
            Estes termos podem ser atualizados a qualquer momento. A versão
            vigente sempre estará disponível nesta página com a data de
            atualização. O uso continuado da plataforma após uma atualização
            implica aceitação dos novos termos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            8. Seus dados pessoais
          </h2>
          <p>
            O tratamento de dados pessoais está descrito na nossa{" "}
            <a href="/privacidade" className="text-orange-400 underline">
              Política de Privacidade
            </a>
            . Para exercer seus direitos como titular de dados, acesse{" "}
            <a href="/contato" className="text-orange-400 underline">
              /contato
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            9. Lei aplicável
          </h2>
          <p>
            Estes termos são regidos pela legislação brasileira. O foro da
            Comarca de Jundiaí/SP fica eleito para dirimir quaisquer
            controvérsias decorrentes do uso da plataforma.
          </p>
        </section>
      </div>
    </div>
  );
}
