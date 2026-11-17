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
    background_color: '#080c16',
    theme_color: '#ff6b00',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png?v=2',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png?v=2',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable.png?v=2',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

