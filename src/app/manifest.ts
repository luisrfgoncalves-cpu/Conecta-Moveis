import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Conecta Móveis — Vitrine de Profissionais Moveleiros',
    short_name: 'Conecta Móveis',
    description:
      'Vitrine independente para aproximação direta entre clientes e profissionais do setor moveleiro.',
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

