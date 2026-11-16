import type { MetadataRoute } from 'next';
import { getBrandConfig } from '@/lib/config/brand';

export default function manifest(): MetadataRoute.Manifest {
  const brand = getBrandConfig();

  return {
    name: `${brand.name} — Vitrine de Profissionais Moveleiros`,
    short_name: brand.shortName,
    description:
      `Catálogo aberto para encontrar montadores e marceneiros em ${brand.focusRegion}.`,
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#f97316',
    orientation: 'portrait',
    icons: [
      {
        src: '/brand/icon-conecta-moveis.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/brand/icon-conecta-moveis.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

