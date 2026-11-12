import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Image from 'next/image';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Conecta Móveis | Plataforma Moveleira de Jundiaí e Região',
  description: 'Descubra montadores de móveis, marceneiros e lojas de planejados em Jundiaí/SP. Conexão direta e sem taxas.',
  icons: {
    icon: '/brand/favicon.png',
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

        <Header />
        <main className="flex-1 w-full relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
