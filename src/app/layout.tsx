import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Image from 'next/image';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ConditionalShellWrapper } from '@/components/layout/ConditionalShellWrapper';
import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner';
import { BrandIntroSound } from '@/components/brand/BrandIntroSound';

import { getBrandConfig } from '@/lib/config/brand';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#07090f',
};

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = getBrandConfig();

  return {
    metadataBase: new URL(brand.baseUrl),
    title: {
      default: `${brand.name} — ${brand.slogan}`,
      template: `%s | ${brand.name}`,
    },
    description: `Encontre marceneiros, montadores e profissionais de móveis em ${brand.focusRegion}. Compare perfis e fotos de apresentação.`,
    icons: {
      icon: '/brand/favicon.png',
    },
    robots: brand.brandProvisional
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: brand.baseUrl,
      siteName: brand.name,
      title: `${brand.name} — ${brand.slogan}`,
      description: `Encontre marceneiros, montadores e profissionais de móveis em ${brand.focusRegion}.`,
      images: [
        {
          url: '/og-default.jpg',
          width: 1200,
          height: 630,
          alt: `${brand.name} — ${brand.slogan}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${brand.name} — ${brand.slogan}`,
      description: `Encontre marceneiros, montadores e profissionais de móveis em ${brand.focusRegion}.`,
      images: ['/og-default.jpg'],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${plusJakarta.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased text-slate-100 relative bg-[#07090f] overflow-x-hidden">
        
        {/* IMAGEM DE FUNDO EM ALTA DEFINIÇÃO E VISIBILIDADE REAL (65% OPACIDADE) */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <picture>
            <source media="(max-width: 768px)" srcSet="/images/background-mobile.webp" type="image/webp" />
            <source media="(min-width: 769px)" srcSet="/images/background-desktop.webp" type="image/webp" />
            {/* Fallback padrão */}
            <Image
              src="/images/background-desktop.webp"
              alt="Ambiente planejado com iluminação aconchegante"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-65 scale-100"
            />
          </picture>
          {/* Overlay suave escurecido apenas o suficiente para contraste perfeito */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090f]/50 via-[#07090f]/60 to-[#07090f]/80" />
        </div>

        <ConditionalShellWrapper header={<Header />} footer={<Footer />}>
          {children}
        </ConditionalShellWrapper>
        <BrandIntroSound />
        <PwaInstallBanner />
      </body>
    </html>
  );
}
