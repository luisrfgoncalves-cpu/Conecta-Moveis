import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_VERSION, LEGAL_DATE } from "@/lib/legal/config";
import { LegalBanner } from "@/components/legal/LegalBanner";

export const metadata: Metadata = {
  title: "Política de Conteúdo e Fotos de Apresentação | Conecta Móveis",
  description:
    "Regras e exigências para envio de fotos, imagens de portfólio e direitos autorais na Conecta Móveis.",
};

export default function PoliticaPortfolioPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Política de Conteúdo e Fotos de Apresentação
        </h1>
        <p className="text-xs text-slate-400">
          Versão {LEGAL_VERSION} — Atualizado em {LEGAL_DATE}
        </p>
      </div>

      <LegalBanner />

      <div className="space-y-6 text-sm text-slate-200 leading-relaxed">
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs">
          <strong>Aviso de Autoria:</strong> Todas as fotografias e mídias veiculadas nos perfis são de inteira responsabilidade do anunciante que as carregou. A Conecta Móveis não endossa nem atesta a autenticidade das obras exibidas.
        </div>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Titularidade e Autoria das Imagens</h2>
          <p>
            O anunciante declara e assegura, sob as penas da lei civil e penal, que é o legítimo autor e detentor dos direitos autorais das imagens e projetos carregados em seu anúncio, ou que possui licença expressa, por escrito, de quem de direito. É terminantemente proibido o uso de fotos de bancos de imagens que simulem obras reais, imagens de concorrentes ou fotos encontradas em redes sociais de terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Direitos de Imagem de Pessoas e Clientes</h2>
          <p>
            É dever exclusivo do profissional obter termo de autorização de uso de imagem de clientes caso fotos de ambientes residenciais ou comerciais exibam pessoas, rostos de moradores ou marcas de clientes sem consentimento. O anunciante assume integral e exclusiva responsabilidade por quaisquer questionamentos de terceiros sobre direito de arena, imagem ou intimidade.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Licença de Exibição</h2>
          <p>
            Ao carregar imagens na plataforma, o anunciante outorga à Conecta Móveis uma licença gratuita, não exclusiva, irrevogável durante a vigência do anúncio e limitada ao território nacional, unicamente para exibição do portfólio no site, aplicativo e canais oficiais de divulgação da vitrine.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Direito de Regresso e Indenização</h2>
          <p>
            Em caso de reclamação formal ou processo judicial por violação de propriedade intelectual decorrente de foto publicada pelo anunciante, a Conecta Móveis exercerá seu direito de regresso contra o anunciante para reaver todas as despesas decorrentes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">5. Notificação e Retirada de Imagens</h2>
          <p>
            Fotógrafos, arquitetos, marceneiros ou proprietários que identifiquem fotos de sua autoria veiculadas sem autorização podem solicitar a remoção imediata via <Link href="/denunciar" className="text-orange-400 underline">Notificar Conteúdo</Link>, selecionando a opção &quot;Direitos autorais ou uso indevido de imagem&quot;.
          </p>
        </section>
      </div>
    </div>
  );
}
