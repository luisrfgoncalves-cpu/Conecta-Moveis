'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Como funciona a contratação de profissionais na plataforma?',
    a: 'Você navega livremente pelo catálogo, escolhe o montador, marceneiro ou marcenaria de sua preferência e clica para falar diretamente pelo WhatsApp ou enviar uma solicitação pela plataforma. Toda negociação, preço e prazo são combinados diretamente entre você e o profissional, sem intermediários.',
  },
  {
    q: 'A plataforma cobra alguma taxa ou comissão sobre os serviços?',
    a: 'Não. O Conecta Móveis não recebe pagamento pelos serviços e não cobra comissão sobre eles, nem de quem procura nem dos profissionais. O catálogo é livre e direto.',
  },
  {
    q: 'Como posso cadastrar meu perfil ou a minha marcenaria?',
    a: 'Qualquer profissional ou empresa do setor moveleiro com atuação em Jundiaí e região pode criar seu cadastro gratuito, preencher suas especialidades, definir sua área de atendimento e enviar fotos de apresentação de serviços para aprovação.',
  },
  {
    q: 'A plataforma oferece garantia sobre o serviço realizado?',
    a: 'Não. A plataforma atua estritamente como um canal digital de divulgação e aproximação. A execução, prazos e entendimentos são combinados diretamente entre você e o profissional autônomo ou empresa.',
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

