import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Image from 'next/image';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ConditionalShellWrapper } from '@/components/layout/ConditionalShellWrapper';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Conecta Móveis — Profissionais de Móveis em Jundiaí e Região',
    template: '%s | Conecta Móveis',
  },
  description:
    'Encontre marceneiros, montadores e especialistas em móveis planejados em Jundiaí e região. Compare perfis, portfólios e contrate com segurança.',
  icons: {
    icon: '/brand/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://conectamoveis.com.br',
    siteName: 'Conecta Móveis',
    title: 'Conecta Móveis — Profissionais de Móveis em Jundiaí e Região',
    description:
      'Encontre marceneiros, montadores e especialistas em móveis planejados em Jundiaí e região. Compare perfis, portfólios e contrate com segurança.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Conecta Móveis — Plataforma de Profissionais Moveleiros',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conecta Móveis — Profissionais de Móveis em Jundiaí e Região',
    description:
      'Encontre marceneiros, montadores e especialistas em móveis planejados em Jundiaí e região. Compare perfis, portfólios e contrate com segurança.',
    images: ['/og-default.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${plusJakarta.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased text-slate-100 relative bg-[#07090f]">
        
        {/* IMAGEM DE FUNDO EM ALTA DEFINIÇÃO E VISIBILIDADE REAL (65% OPACIDADE) */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <Image
            src="/images/background-full.jpg"
            alt="Ambiente planejado com iluminação aconchegante"
            fill
            priority
            quality={95}
            className="object-cover object-center opacity-65 scale-100"
          />
          {/* Overlay suave escurecido apenas o suficiente para contraste perfeito */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090f]/50 via-[#07090f]/60 to-[#07090f]/80" />
        </div>

        <ConditionalShellWrapper header={<Header />} footer={<Footer />}>
          {children}
        </ConditionalShellWrapper>
      </body>
    </html>
  );
}
