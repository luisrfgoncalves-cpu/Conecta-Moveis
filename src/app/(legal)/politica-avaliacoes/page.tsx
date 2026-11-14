import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_VERSION, LEGAL_DATE } from "@/lib/legal/config";
import { LegalBanner } from "@/components/legal/LegalBanner";

export const metadata: Metadata = {
  title: "Política de Avaliações | Conecta Móveis",
  description:
    "Diretrizes para avaliações e comentários públicos sobre anunciantes na plataforma Conecta Móveis.",
};

export default function PoliticaAvaliacoesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Política de Avaliações e Interações
        </h1>
        <p className="text-xs text-slate-400">
          Versão {LEGAL_VERSION} — Atualizado em {LEGAL_DATE}
        </p>
      </div>

      <LegalBanner />

      <div className="space-y-6 text-sm text-slate-200 leading-relaxed">
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs">
          <strong>Aviso de Isenção:</strong> As avaliações e comentários refletem exclusivamente a opinião subjetiva de quem os redigiu. A Conecta Móveis não atesta a veracidade dos relatos, não seleciona nem certifica anunciantes com base em notas e não se responsabiliza pelas interações entre usuários.
        </div>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Interação Registrada e Requisitos</h2>
          <p>
            Apenas usuários cadastrados e identificados podem enviar avaliações. É exigido comportamento ético e relato fidedigno da experiência de contato ou atendimento. A plataforma classifica avaliações como interações registradas no sistema, sem garantir realização efetiva de serviço ou relação de consumo intermediada.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Conteúdos Vedados</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>Linguagem injuriosa, difamatória, caluniosa ou ofensiva;</li>
            <li>Divulgação de dados pessoais sensíveis (endereço residencial, documentos pessoais, telefones privados);</li>
            <li>Avaliações forjadas por familiares, sócios ou concorrentes comerciais;</li>
            <li>Comentários contendo ameaças, discriminação ou violações à lei.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Direito de Resposta do Anunciante</h2>
          <p>
            O profissional ou empresa avaliada tem a prerrogativa de responder publicamente à avaliação no próprio perfil, com civilidade e profissionalismo. As respostas dos anunciantes são de sua exclusiva autoria e responsabilidade civil e penal.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Contestação e Remoção</h2>
          <p>
            Caso uma avaliação contenha conteúdo ilícito ou falso, qualquer interessado pode abrir uma solicitação formal por meio do canal <Link href="/denunciar" className="text-orange-400 underline">Notificar Conteúdo</Link>. A equipe de moderação apura o relato com base em regras objetivas, aplicando suspensão ou remoção quando cabível.
          </p>
        </section>
      </div>
    </div>
  );
}
