import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, CheckCircle2, XCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Função e Limites da Plataforma — Conecta Móveis',
  description: 'Conheça o escopo institucional da Conecta Móveis como catálogo e vitrine de divulgação do setor moveleiro.',
};

export default function FuncaoDaPlataformaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Início
        </Link>
        <h1 className="text-3xl font-black text-white">Função e Limites da Plataforma</h1>
        <p className="text-sm text-slate-400 mt-2">
          Declaração oficial sobre o papel da Conecta Móveis, nossa atuação como vitrine de divulgação e nossos deveres legais.
        </p>
      </div>

      {/* Declaração Oficial */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-400" />
          Declaração Institucional de Função
        </h2>
        <p className="text-sm text-slate-200 leading-relaxed font-serif">
          A Conecta Móveis é um provedor de aplicação de internet que oferece espaço de divulgação (vitrine e diretório de anúncios) e um meio de aproximação inicial entre usuários e anunciantes do setor moveleiro. Não é fornecedora, prestadora, corretora, representante, empregadora, garantidora nem intermediadora da contratação ou do pagamento dos serviços. Não participa da negociação, do preço, do prazo, da execução, da entrega nem da qualidade. Não verifica, avalia nem endossa anunciantes, informações, fotos ou avaliações, que são de responsabilidade de quem os publica. A plataforma responde pelos seus próprios atos e deveres legais: segurança, dados pessoais, moderação, atendimento de notificações e cumprimento de ordens judiciais.
        </p>
      </div>

      {/* O que o Conecta Móveis é e o que não é */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 bg-emerald-950/10 space-y-4">
          <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            O que a Conecta Móveis é:
          </h3>
          <ul className="text-xs text-slate-300 space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Vitrine e diretório de anúncios:</strong> Divulgação pública de profissionais e empresas do setor moveleiro em Jundiaí e região.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Meio de aproximação inicial:</strong> Canal rápido para o cliente encontrar o contato direto (WhatsApp ou mensagem) do profissional.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Operador de dados responsável:</strong> Cumpre a LGPD e o Marco Civil da Internet com seriedade, privacidade e segurança técnica.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Moderador de conformidade:</strong> Aplica regras públicas e uniformes para impedir fotos impróprias, ofensas e fraudes.</span>
            </li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-red-500/20 bg-red-950/10 space-y-4">
          <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            O que a Conecta Móveis NÃO é:
          </h3>
          <ul className="text-xs text-slate-300 space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>Não é prestadora nem empregadora:</strong> Marceneiros e montadores são autônomos ou empresas independentes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>Não intermedia pagamentos:</strong> Nenhum valor de serviço passa pela plataforma. Não cobramos comissão por negócio fechado.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>Não emite garantia de serviço:</strong> Qualidade, prazo, preço e acabamento são de responsabilidade exclusiva de quem executa.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>Não faz curadoria de qualidade:</strong> Não classificamos quem é &quot;melhor&quot; ou &quot;certificado&quot;. A escolha é sempre do cliente.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400">
        Para orientações práticas sobre contratação direta, contratos e precauções, acesse nossa página de <Link href="/contrate-com-seguranca" className="text-orange-400 hover:underline">orientações de segurança</Link>.
      </div>
    </div>
  );
}

