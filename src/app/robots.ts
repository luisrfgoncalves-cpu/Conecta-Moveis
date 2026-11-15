import { MetadataRoute } from 'next';
import { getBrandConfig } from '@/lib/config/brand';

export default function robots(): MetadataRoute.Robots {
  const brand = getBrandConfig();

  // Enquanto brand_provisional for verdadeiro: robots noindex global (R0.4)
  if (brand.brandProvisional) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/painel', '/admin', '/api'],
    },
    sitemap: `${brand.baseUrl}/sitemap.xml`,
  };
}
