import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_VERSION, LEGAL_DATE } from "@/lib/legal/config";
import { LegalBanner } from "@/components/legal/LegalBanner";

export const metadata: Metadata = {
  title: "Política de Anúncios e Destaques | Conecta Móveis",
  description:
    "Regras para publicação de anúncios, vitrines e posições de destaque na plataforma Conecta Móveis.",
};

export default function PoliticaAnunciosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Política de Anúncios e Destaques
        </h1>
        <p className="text-xs text-slate-400">
          Versão {LEGAL_VERSION} — Atualizado em {LEGAL_DATE}
        </p>
      </div>

      <LegalBanner />

      <div className="space-y-6 text-sm text-slate-200 leading-relaxed">
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs">
          <strong>Aviso Importante:</strong> A Conecta Móveis é uma vitrine de anúncios que aproxima pessoas e profissionais. Não presta, intermedeia, contrata, garante nem avalia a qualidade dos serviços. Informações, fotos e avaliações são de responsabilidade de quem as publica.
        </div>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Escopo Setorial e Finalidade</h2>
          <p>
            A Conecta Móveis destina-se exclusivamente a profissionais e empresas atuantes no setor moveleiro e marcenaria na região de Jundiaí/SP e cidades adjacentes. É proibida a publicação de anúncios fora desse nicho ou que desvirtuem o caráter informativo do diretório.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Requisito de Maioridade (18+ Anos)</h2>
          <p>
            É terminantemente proibido o anúncio de serviços por menores de 18 anos. Todos os anunciantes declaram ter capacidade civil plena ao cadastrar sua vitrine de serviços.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Não Endosso e Natureza da Vitrine</h2>
          <p>
            A publicação de um perfil ou a compra de um espaço de destaque não constitui selo de aprovação, recomendação, certificação ou validação técnica por parte da Conecta Móveis. O anunciante é inteiramente responsável por suas declarações comerciais e pela execução dos serviços que realizar.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Posições de Destaque e Critérios de Ordenação</h2>
          <p>
            Os planos de destaque concedem maior visibilidade visual no catálogo rotativo da plataforma, sem alterar o caráter neutro da ordenação ou criar hierarquia qualitativa de profissionais. Entenda nossos critérios objetivos e transparentes em <Link href="/como-ordenamos-os-resultados" className="text-orange-400 underline">Como Ordenamos os Resultados</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">5. Proibições Estritas</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>Publicar informações falsas, induvidosas ou contatos de terceiros sem autorização prévia;</li>
            <li>Utilizar fotografias ou projetos de móveis de terceiros sem expressa titularidade de direitos autorais;</li>
            <li>Prometer garantias vinculadas ao nome da Conecta Móveis;</li>
            <li>Praticar condutas discriminatórias ou ilegais na prestação do serviço.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">6. Moderação e Procedimento Notificação e Retirada</h2>
          <p>
            Perfis que descumprirem estas regras poderão ser suspensos ou excluídos pela equipe de moderação. Notificações fundadas de infração podem ser enviadas via <Link href="/denunciar" className="text-orange-400 underline">Notificar Conteúdo</Link>, gerando protocolo e histórico de contestação.
          </p>
        </section>
      </div>
    </div>
  );
}
