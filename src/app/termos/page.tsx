import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_VERSION, LEGAL_DATE } from "@/lib/legal/config";
import { LegalBanner } from "@/components/legal/LegalBanner";

export const metadata: Metadata = {
  title: "Termos de Uso e Condições Gerais | Conecta Móveis",
  description:
    "Termos de uso da plataforma Conecta Móveis — vitrine de anúncios e aproximação no setor moveleiro em Jundiaí e região.",
};

export default function TermosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Termos de Uso e Condições Gerais
        </h1>
        <p className="text-xs text-slate-400">
          Versão {LEGAL_VERSION} — Atualizado em {LEGAL_DATE}
        </p>
      </div>

      <LegalBanner />

      <div className="space-y-6 text-sm text-slate-200 leading-relaxed">
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs">
          <strong>Declaração Oficial:</strong> A Conecta Móveis é um provedor de aplicação de internet que oferece espaço de divulgação (vitrine e diretório de anúncios) e meio de aproximação inicial entre usuários e anunciantes do setor moveleiro. Não é fornecedora, prestadora, corretora, representante nem garantidora de serviços.
        </div>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Natureza e Função da Plataforma</h2>
          <p>
            A Conecta Móveis opera exclusivamente como catálogo e vitrine de divulgação regional (Jundiaí e cidades vizinhas). A plataforma não presta serviços de montagem, marcenaria ou reparos, não intermedeia pagamentos, não retém valores e não cobra qualquer comissão ou porcentagem sobre negócios eventualmente pactuados entre as partes.
          </p>
          <p className="mt-2">
            Saiba mais em detalhes na nossa página <Link href="/funcao-da-plataforma" className="text-orange-400 underline">Função e Limites da Plataforma</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Requisitos de Acesso e Trava de Idade</h2>
          <p>
            O uso dos serviços, cadastro de perfil ou anúncio na Conecta Móveis é <strong>estritamente restrito a pessoas com 18 anos ou mais</strong> ou pessoas jurídicas regularmente constituídas. Ao criar uma conta, você declara expressamente possuir plena capacidade civil.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Não Endosso, Sem Avaliação e Sem Garantia</h2>
          <p>
            A presença de qualquer profissional, empresa ou anúncio nesta plataforma <strong>não constitui recomendação, seleção, homologação ou atestado de idoneidade</strong> por parte da Conecta Móveis.
          </p>
          <p className="mt-2">
            A plataforma não verifica previamente a competência técnica dos anunciantes nem garante a qualidade, a pontualidade ou o resultado dos serviços. Orientações preventivas e canais de proteção podem ser consultados em <Link href="/contrate-com-seguranca" className="text-orange-400 underline">Orientações de Segurança</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Responsabilidade do Anunciante e Direitos de Propriedade</h2>
          <p>
            O anunciante é o único e integral responsável pelas informações, fotos, portfólios, marcas, prazos e orçamentos que publicar, bem como pela execução dos serviços prestados.
          </p>
          <p className="mt-2">
            O anunciante declara e garante ser o titular exclusivo dos direitos autorais de todas as fotos e imagens de projetos enviadas, ou que possui expressa autorização legal de autores e clientes. O anunciante concede à Conecta Móveis licença limitada, não exclusiva, gratuita e revogável exclusivamente para veicular as imagens na vitrine do anúncio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">5. Direito de Regresso</h2>
          <p>
            Caso a Conecta Móveis venha a responder administrativa ou judicialmente por qualquer dano, infração autoral, inadimplemento ou ato ilícito praticado pelo anunciante ou originado de seu conteúdo, a plataforma exercerá integralmente o <strong>direito de regresso</strong> contra o anunciante responsável, incluindo custas e honorários advocatícios.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">6. Modelo de Cobrança: Apenas Espaço de Divulgação</h2>
          <p>
            Eventuais planos pagos cobram unicamente mensalidade fixa pela disponibilização do espaço de anúncio ou destaque. A plataforma <strong>não recebe nem retém comissão sobre orçamentos ou negócios fechados</strong> e não participa de cobrança ao cliente.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">7. Moderação e Procedimento de Notificação e Retirada</h2>
          <p>
            A plataforma mantém moderação baseada em regras públicas e uniformes. Violações de direitos autorais, imagem, dados pessoais ou práticas ilícitas podem ser comunicadas formalmente com protocolo em <Link href="/denunciar" className="text-orange-400 underline">Notificar Conteúdo</Link>. Conteúdos ilegais ou que desrespeitem estas normas serão suspensos ou removidos, resguardado o direito de contestação.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">8. Responsabilidade Legal da Plataforma</h2>
          <p>
            A Conecta Móveis responde pelos seus próprios atos e deveres legais impostos pelo Marco Civil da Internet (Lei 12.965/2014) e pela LGPD (Lei 13.709/2018), incluindo segurança dos dados, atendimento a ordens judiciais e guarda de logs de conexão e acesso a aplicações nos termos da lei.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">9. Alterações e Aceite de Termos</h2>
          <p>
            Quaisquer alterações materiais nestes termos serão avisadas aos usuários cadastrados e demandarão novo aceite para prosseguimento do uso. O histórico e versões anteriores dos documentos podem ser consultados no rodapé legal da plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">10. Legislação e Foro</h2>
          <p>
            Estes termos são regidos pelas leis da República Federativa do Brasil. Fica respeitado o foro de domicílio do consumidor nas relações de consumo, e subsidiariamente eleito o foro da Comarca de Jundiaí/SP para as demais controvérsias.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">11. Contatos do Operador</h2>
          <p>
            Para exercer direitos de titular de dados pessoais, apresentar notificações extrajudiciais ou comunicar ordens de autoridades públicas, consulte os canais dedicados em <Link href="/contato" className="text-orange-400 underline">Contato e Informações Legais</Link> e em <Link href="/autoridades" className="text-orange-400 underline">Canal de Autoridades</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
