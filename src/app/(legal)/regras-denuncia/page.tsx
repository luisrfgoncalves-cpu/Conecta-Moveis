import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_VERSION, LEGAL_DATE } from "@/lib/legal/config";
import { LegalBanner } from "@/components/legal/LegalBanner";

export const metadata: Metadata = {
  title: "Regras de Notificação e Retirada | Conecta Móveis",
  description:
    "Procedimento formal para notificação de conteúdos ilícitos, prazos, contestação e custódia probatória.",
};

export default function RegrasDenunciaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Regras de Notificação e Retirada (Takedown)
        </h1>
        <p className="text-xs text-slate-400">
          Versão {LEGAL_VERSION} — Atualizado em {LEGAL_DATE}
        </p>
      </div>

      <LegalBanner />

      <div className="space-y-6 text-sm text-slate-200 leading-relaxed">
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs">
          <strong>Procedimento da Plataforma:</strong> Este documento disciplina o fluxo de acolhimento de denúncias e notificações formais para remoção de conteúdos alegadamente ilegais, nos termos do Marco Civil da Internet (Lei 12.965/2014) e da Lei de Direitos Autorais (Lei 9.610/1998).
        </div>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Categorias de Notificação</h2>
          <p>
            Qualquer pessoa física, titular de direito autoral, representante legal ou autoridade pública pode formalizar notificação fundamentada através da página <Link href="/denunciar" className="text-orange-400 underline">Notificar Conteúdo</Link>, nas seguintes categorias:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
            <li>Violação de direitos autorais ou uso indevido de fotos de projetos;</li>
            <li>Uso não autorizado de marca registrada ou nome empresarial;</li>
            <li>Ofensa à honra, calúnia, injúria ou difamação em avaliações;</li>
            <li>Exposição indevida de dados pessoais ou violação de privacidade (LGPD);</li>
            <li>Suspeita fundamentada de fraude, perfil fictício ou estelionato;</li>
            <li>Conteúdos com gravidade extrema ou ilicitude manifesta (R9).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Requisitos Formais e Protocolo</h2>
          <p>
            Toda notificação deve conter: identificação do notificante (nome completo e e-mail ativo), link exato ou identificação inequívoca do conteúdo infrator, detalhamento dos fatos e declaração expressa de veracidade e boa-fé. O sistema gera automaticamente um <strong>número de protocolo (NOT-YYYY-XXXXXX)</strong> para acompanhamento.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Análise, Prazos e Medidas Preventivas</h2>
          <p>
            A equipe de moderação recebe a notificação e analisa a consistência formal no prazo de até 48 horas úteis. Em casos de manifesta gravidade ou comprovada titularidade de direitos autorais, o conteúdo pode ser cautelarmente ocultado enquanto se aguarda manifestação das partes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Contraditório e Contranotificação</h2>
          <p>
            O anunciante cujo conteúdo foi objeto de medida será notificado e terá o direito de apresentar contranotificação (contestação) instruída com provas de titularidade ou regularidade do conteúdo. Havendo controvérsia fática insanável, a reintegração final poderá depender de consenso entre as partes ou ordem judicial.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">5. Preservação de Evidências e Custódia para Autoridades</h2>
          <p>
            Todo conteúdo objeto de notificação formal ou ocultação preventiva tem seus dados e mídias congelados em snapshot seguro acompanhado de <strong>hash criptográfico SHA-256</strong>. Essas informações são mantidas sob custódia probatória e podem ser fornecidas exclusivamente à Polícia Judiciária e ao Poder Judiciário mediante requisição nos termos da lei. Consulte nosso <Link href="/autoridades" className="text-orange-400 underline">Canal de Autoridades</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
