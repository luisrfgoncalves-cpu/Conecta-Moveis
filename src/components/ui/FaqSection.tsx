'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    category: 'Para Quem Procura Serviços',
    q: 'Como encontro e entro em contato com um montador ou marceneiro?',
    a: 'Você acessa livremente o catálogo, utiliza os filtros de cidade, categoria ou especialidade e escolhe o profissional ideal. Ao abrir o perfil, basta clicar no botão de WhatsApp para conversar em tempo real diretamente com ele. Não há cadastro obrigatório para pesquisar nem intermediários.',
  },
  {
    category: 'Para Quem Procura Serviços',
    q: 'A plataforma cobra alguma taxa para eu consultar os profissionais?',
    a: 'Não. O Conecta Móveis é gratuito para visitantes e contratantes. Você pode navegar, ver as fotos de apresentação dos serviços e iniciar conversas com quantos profissionais quiser sem pagar taxa de uso.',
  },
  {
    category: 'Para Quem Procura Serviços',
    q: 'Como são combinados preço, prazo e pagamento do serviço?',
    a: 'Todo acerto financeiro ocorre fora da plataforma. Preço, prazo, contrato e pagamento são combinados exclusivamente e diretamente entre você e o profissional ou empresa que você contatar. Recomendamos sempre solicitar detalhes por escrito antes de iniciar o trabalho.',
  },
  {
    category: 'Para Quem Procura Serviços',
    q: 'A plataforma oferece garantia de execução ou qualidade dos serviços?',
    a: 'Não. O Conecta Móveis atua estritamente como um catálogo de divulgação e aproximação local. A plataforma não participa das negociações, não executa serviços e não oferece garantia sobre o resultado, cabendo a cada anunciante a responsabilidade pelo seu trabalho.',
  },
  {
    category: 'Para Quem Procura Serviços',
    q: 'Como sei quais cidades ou bairros o profissional atende?',
    a: 'No perfil de cada anunciante você encontra a cidade-sede e o raio de atendimento detalhado na região de Jundiaí e cidades vizinhas. Você também pode esclarecer o local exato da montagem diretamente pelo WhatsApp.',
  },
  {
    category: 'Para Profissionais e Marcenarias',
    q: 'Como funciona o cadastro e a divulgação para quem presta serviços?',
    a: 'Montadores, marceneiros, lojistas e projetistas criam uma conta, preenchem suas especialidades, informam as regiões atendidas e enviam fotos de trabalhos reais para montar sua página pública de apresentação.',
  },
  {
    category: 'Para Profissionais e Marcenarias',
    q: 'A Conecta Móveis cobra comissão ou porcentagem sobre os serviços fechados?',
    a: 'Zero comissão. A plataforma não retém nenhuma porcentagem sobre os atendimentos que você fechar. Todo o rendimento combinado com seus clientes fica integralmente com você.',
  },
  {
    category: 'Para Profissionais e Marcenarias',
    q: 'Preciso ter CNPJ para anunciar meus serviços no catálogo?',
    a: 'Não é obrigatório. Profissionais autônomos que atuam como pessoa física, microempreendedores (MEI) e marcenarias de todos os portes podem criar perfil e divulgar seus trabalhos no Conecta Móveis.',
  },
  {
    category: 'Para Profissionais e Marcenarias',
    q: 'Onde e como os clientes entram em contato comigo?',
    a: 'Os clientes que visitam sua página pública clicam diretamente no botão de WhatsApp cadastrado no seu perfil e iniciam a conversa diretamente no seu aplicativo, além de poderem enviar solicitações de contato pela própria plataforma.',
  },
  {
    category: 'Para Profissionais e Marcenarias',
    q: 'O cadastro continuará gratuito para profissionais?',
    a: 'O cadastro no período de lançamento é totalmente gratuito. Caso ocorram futuras implementações de planos opcionais de destaque, qualquer alteração nas condições será informada com total transparência e antecedência aos usuários.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-400">
          <HelpCircle className="w-4 h-4" />
          Dúvidas Frequentes
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Perguntas Frequentes sobre a Plataforma
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Tudo o que você precisa saber sobre o funcionamento do Conecta Móveis.
        </p>
      </div>

      <div className="space-y-3 pt-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <details
              key={idx}
              open={isOpen}
              onToggle={(e) => {
                const isCurrentlyOpen = (e.currentTarget as HTMLDetailsElement).open;
                if (isCurrentlyOpen) {
                  setOpenIndex(idx);
                } else if (openIndex === idx) {
                  setOpenIndex(null);
                }
              }}
              className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all duration-200 group"
            >
              <summary
                className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-bold text-white hover:text-orange-400 transition cursor-pointer list-none [&::-webkit-details-marker]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-orange-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </summary>
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-200 leading-relaxed border-t border-white/5 font-normal">
                {faq.a}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}

