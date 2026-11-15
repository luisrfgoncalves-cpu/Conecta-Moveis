import { ImageResponse } from 'next/og';
import { getBrandConfig } from '@/lib/config/brand';

export const runtime = 'nodejs';
export const alt = 'Imagem de Compartilhamento';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  const brand = getBrandConfig();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#07090f',
          padding: '60px',
          color: 'white',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              backgroundColor: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '44px',
              fontWeight: 900,
              color: 'white',
            }}
          >
            {brand.shortName.charAt(0)}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '64px',
              fontWeight: 900,
              letterSpacing: '-0.03em',
            }}
          >
            {brand.name}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: '32px',
            color: '#fdba74',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.3,
            marginBottom: '20px',
          }}
        >
          {brand.slogan}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: '20px',
            color: '#94a3b8',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {brand.focusRegion} — Catálogo de Profissionais
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
