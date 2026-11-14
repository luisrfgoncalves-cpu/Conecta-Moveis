import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_VERSION, LEGAL_DATE } from "@/lib/legal/config";
import { LegalBanner } from "@/components/legal/LegalBanner";
import { getOperatorSettings } from "@/lib/config/operator";

export const metadata: Metadata = {
  title: "Política de Privacidade e Proteção de Dados | Conecta Móveis",
  description:
    "Declaração completa de privacidade, direitos dos titulares e tratamento de dados pessoais da Conecta Móveis nos termos da LGPD.",
};

export default function PrivacidadePage() {
  const op = getOperatorSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Política de Privacidade e Proteção de Dados
        </h1>
        <p className="text-xs text-slate-400">
          Versão {LEGAL_VERSION} — Atualizado em {LEGAL_DATE} · Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)
        </p>
      </div>

      <LegalBanner />

      <div className="space-y-6 text-sm text-slate-200 leading-relaxed">
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs">
          <strong>Compromisso de Privacidade:</strong> A Conecta Móveis preza pela transparência, minimização na coleta de dados e respeito intransigente aos direitos fundamentais de liberdade e privacidade dos usuários e anunciantes do setor moveleiro de Jundiaí e região.
        </div>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Identificação do Controlador e do Encarregado (DPO)</h2>
          <p>
            O controlador dos seus dados pessoais é o operador da plataforma Conecta Móveis (Razão Social: <strong>{op.razaoSocial}</strong>, CNPJ: <strong>{op.cnpj}</strong>, sediado na Comarca de Jundiaí/SP).
          </p>
          <p className="mt-2">
            O canal de atendimento do nosso <strong>Encarregado pelo Tratamento de Dados Pessoais (DPO)</strong> é o e-mail: <a href={`mailto:${op.emailTitulares}`} className="text-orange-400 underline">{op.emailTitulares}</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Princípio da Minimização e Dados Tratados</h2>
          <p>
            Coletamos apenas as informações estritamente necessárias para o funcionamento da vitrine digital. <strong>Nunca solicitamos nem armazenamos números de CPF de consumidores, dados de cartão de crédito, contas bancárias ou localização residencial em tempo real.</strong>
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
            <li><strong>Usuários cadastrados:</strong> Nome, e-mail e senha criptografada em hash seguro;</li>
            <li><strong>Anunciantes e Profissionais:</strong> Nome comercial ou razão social, especialidades moveleiras, cidades de atuação, fotos de portfólio autoral e meios de contato comerciais (WhatsApp/telefone fornecidos voluntariamente);</li>
            <li><strong>Registros Técnicos Obrigatórios:</strong> Endereço IP, data e hora de conexões e ações críticas de autenticação, em observância estrita ao art. 15 do Marco Civil da Internet (Lei 12.965/2014).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Bases Legais para o Tratamento (Art. 7º da LGPD)</h2>
          <p>Nossas operações de dados possuem respaldo legal transparente:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-300">
            <li><strong>Execução de Contrato (Art. 7º, V):</strong> Para manter sua conta, exibir seu perfil no diretório e viabilizar a utilização da plataforma;</li>
            <li><strong>Consentimento (Art. 7º, I):</strong> Para exibição pública voluntária de telefones comerciais e envio de mensagens pelo formulário de contato;</li>
            <li><strong>Cumprimento de Obrigação Legal (Art. 7º, II):</strong> Para guarda de registros de acesso pelo prazo legal de 6 meses (Marco Civil) e atendimento de ordens judiciais;</li>
            <li><strong>Legítimo Interesse (Art. 7º, IX):</strong> Para auditoria de conformidade, segurança cibernética contra fraudes e coibição de conteúdos impróprios.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Subprocessadores e Transferência Internacional de Dados</h2>
          <p>
            Para garantir a estabilidade e segurança técnica dos serviços, utilizamos infraestrutura de computação em nuvem de fornecedores de renome global, operando sob contratos que garantem proteção equivalente à legislação brasileira:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-300">
            <li><strong>Supabase Inc.:</strong> Banco de dados relacional PostgreSQL seguro e autenticação de usuários (servidores situados prioritariamente na região América do Sul / Estados Unidos sob cláusulas contratuais padrão);</li>
            <li><strong>Vercel Inc.:</strong> Hospedagem da aplicação web e processamento de rotas com rede global de entrega de conteúdo (CDN);</li>
            <li><strong>Serviço SMTP (Resend/Transactional):</strong> Envio exclusivo de e-mails transacionais (confirmação de conta e redefinição de senha).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">5. Prazos de Retenção e Expurgo Automático</h2>
          <p>Não mantemos dados pessoais por tempo indeterminado:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
            <li><strong>Solicitações de contato e mensagens privadas:</strong> Expurgo automático em <strong>90 dias</strong>;</li>
            <li><strong>Registros de conexão e acesso a aplicações:</strong> Expurgo automático em <strong>6 meses exatos</strong>, exceto se houver ordem de preservação legal (<em>legal hold</em>);</li>
            <li><strong>Notificações de conteúdo e dossiês de infração:</strong> Retidos pelo prazo prescricional de até 5 anos para instrução de autoridades judiciais;</li>
            <li><strong>Contas de usuários:</strong> Retidas durante a atividade da conta. Mediante solicitação de encerramento, os dados são excluídos ou anonimizados em até 30 dias.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">6. Direitos do Titular de Dados (Art. 18 da LGPD)</h2>
          <p>
            Você pode exercer diretamente seus direitos a qualquer momento no seu painel em <Link href="/painel/seguranca" className="text-orange-400 underline">Segurança e Privacidade</Link> ou pelo nosso canal de DPO:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
            <li>Confirmação da existência de tratamento e acesso aos dados;</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>Portabilidade dos dados para outro fornecedor (com exportação completa em formato JSON padronizado);</li>
            <li>Eliminação dos dados pessoais tratados com base no consentimento;</li>
            <li>Revogação do consentimento e oposição a tratamentos específicos;</li>
            <li>Informação sobre entidades públicas e privadas com as quais houve compartilhamento.</li>
          </ul>
          <p className="mt-2 text-xs text-slate-400">
            Toda solicitação formal via canal de privacidade recebe número de protocolo individual e declaração completa respondida no prazo máximo de até 15 (quinze) dias, nos termos do art. 19, II da LGPD.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">7. Política de Cookies e Rastreamento</h2>
          <p>
            Utilizamos apenas cookies técnicos estritamente necessários para manter sua sessão de autenticação ativa e proteger os formulários contra ataques cibernéticos (CSRF). Não utilizamos cookies de rastreamento de terceiros para publicidade comportamental invasiva.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">8. Proteção aos Direitos de Crianças e Adolescentes</h2>
          <p>
            A plataforma Conecta Móveis destina-se <strong>exclusivamente a maiores de 18 anos</strong>. Não coletamos intencionalmente informações de menores. Contas identificadas como pertencentes a menores de idade são imediatamente suspensas e seus dados expurgados.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">9. Alterações nesta Política</h2>
          <p>
            Atualizações nesta política serão comunicadas no site e exigirão novo aceite em caso de modificações materiais no tratamento dos dados.
          </p>
        </section>
      </div>
    </div>
  );
}
