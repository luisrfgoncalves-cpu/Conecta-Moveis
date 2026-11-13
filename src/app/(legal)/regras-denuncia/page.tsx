import type { Metadata } from "next";
import { LEGAL_REVIEWED, LEGAL_VERSION, LEGAL_DATE } from "@/lib/legal/config";
import { LegalBanner } from "@/components/legal/LegalBanner";

export const metadata: Metadata = {
  title: "Regras de Denúncia | Conecta Móveis",
  description:
    "Como funciona o processo de denúncia de conteúdos e profissionais na Conecta Móveis.",
  ...(!LEGAL_REVIEWED && { robots: { index: false } }),
};

export default function RegrasDenunciaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Regras de Denúncia
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
            1. O que pode ser denunciado
          </h2>
          <p>São tipos válidos de denúncia:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li>Perfil falso ou informações enganosas;</li>
            <li>Fotos de portfólio que não pertencem ao anunciante;</li>
            <li>
              Avaliação falsa, forjada ou que viole a política de avaliações;
            </li>
            <li>
              Conteúdo ofensivo, discriminatório ou que viole direitos de
              terceiros;
            </li>
            <li>Perfil de profissional que não atua na área declarada;</li>
            <li>Suspeita de golpe ou fraude no contato com o profissional;</li>
            <li>
              Qualquer conteúdo que viole os Termos de Uso ou a legislação
              brasileira.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            2. Como fazer uma denúncia
          </h2>
          <p>
            Utilize o botão &quot;Denunciar&quot; disponível em perfis, avaliações e fotos
            de portfólio, ou acesse a página{" "}
            <a href="/denunciar" className="text-orange-400 underline">
              /denunciar
            </a>
            . Descreva o motivo com o máximo de detalhes possível. Denúncias
            anônimas são aceitas, mas denúncias identificadas facilitam a
            apuração.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            3. Processo de análise
          </h2>
          <p>
            Após recebida, a denúncia é registrada e encaminhada à equipe de
            moderação. O conteúdo denunciado pode ser ocultado preventivamente
            durante a análise. A equipe avalia as evidências disponíveis e pode
            solicitar informações adicionais ao denunciante ou ao denunciado.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            4. Resultados possíveis
          </h2>
          <p>Após análise, a denúncia pode resultar em:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li>
              <strong className="text-white">Arquivamento:</strong> quando não
              há indícios suficientes de irregularidade;
            </li>
            <li>
              <strong className="text-white">Remoção de conteúdo:</strong>{" "}
              exclusão da avaliação, foto ou informação específica;
            </li>
            <li>
              <strong className="text-white">Suspensão do perfil:</strong>{" "}
              bloqueio temporário da conta enquanto a situação é regularizada;
            </li>
            <li>
              <strong className="text-white">Remoção permanente:</strong>{" "}
              encerramento definitivo do perfil em casos graves ou reincidentes.
            </li>
          </ul>
          <p className="mt-2">
            A plataforma pode remover conteúdo sem aviso prévio e solicitar
            correção ou comprovação.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            5. Uso indevido do sistema de denúncias
          </h2>
          <p>
            Denúncias maliciosas, feitas com o objetivo de prejudicar
            concorrentes ou usuários sem razão, podem resultar em suspensão da
            conta do denunciante.
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
