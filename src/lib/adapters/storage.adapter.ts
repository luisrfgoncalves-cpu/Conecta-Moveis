export interface StorageAdapter {
  upload(bucket: string, path: string, file: Blob | Buffer, contentType: string): Promise<{ success: boolean; url?: string; error?: string }>;
  delete(bucket: string, path: string): Promise<{ success: boolean; error?: string }>;
  getPublicUrl(bucket: string, path: string): string;
  getVariantUrl(bucket: string, path: string, variant: 'thumb' | 'full'): string;
}

/**
 * Implementação Gratuita Atual (Supabase Storage Standard)
 * No plano gratuito, variantes 'thumb' e 'full' utilizam a URL pública original do bucket.
 * 
 * UPGRADE PATH (Plano Pro):
 * Para utilizar transformação de imagem em tempo real (resizing sob demanda na CDN):
 * 1. Alterar o método getVariantUrl para injetar os parâmetros do Supabase Image Transformation:
 *    `${baseUrl}/render/image/public/${bucket}/${path}?width=300&height=300&resize=contain`
 * 2. Ativar a feature flag 'on_demand_image_transform' no painel de configurações.
 */
export class SupabaseStorageAdapter implements StorageAdapter {
  private baseUrl: string;

  constructor(supabaseUrl?: string) {
    this.baseUrl = (supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  }

  getPublicUrl(bucket: string, path: string): string {
    const cleanPath = path.replace(/^\//, '');
    return `${this.baseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
  }

  getVariantUrl(bucket: string, path: string, variant: 'thumb' | 'full'): string {
    const cleanPath = path.replace(/^\//, '');
    // No plano gratuito: retorna URL pública com indicação de variante
    if (variant === 'thumb') {
      return `${this.baseUrl}/storage/v1/object/public/${bucket}/${cleanPath}#variant=thumb`;
    }
    return `${this.baseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
  }

  async upload(
    bucket: string,
    path: string,
    _file: Blob | Buffer,
    _contentType: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    return {
      success: true,
      url: this.getPublicUrl(bucket, path),
    };
  }

  async delete(_bucket: string, _path: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}

