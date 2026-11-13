const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('--- Populando Supabase Cloud Diretamente ---');

  // 1. Categorias
  const categories = [
    { id: 'c1111111-1111-1111-1111-111111111111', name: 'Montador de Móveis', slug: 'montador-de-moveis', description: 'Montagem e desmontagem de móveis modulados e convencionais.', icon: 'Wrench' },
    { id: 'c2222222-2222-2222-2222-222222222222', name: 'Marceneiro', slug: 'marceneiro', description: 'Marcenaria fina, fabricação sob medida e restauração.', icon: 'Sparkles' },
    { id: 'c3333333-3333-3333-3333-333333333333', name: 'Loja de Planejados', slug: 'loja-de-planejados', description: 'Lojas e showrooms de mobiliário planejado completo.', icon: 'Box' },
    { id: 'c4444444-4444-4444-4444-444444444444', name: 'Marcenaria', slug: 'marcenaria', description: 'Oficinas e fábricas de marcenaria de médio e grande porte.', icon: 'Hammer' },
    { id: 'c5555555-5555-5555-5555-555555555555', name: 'Projetista', slug: 'projetista', description: 'Desenvolvimento de projetos 3D, paginação de ambientes e renderização.', icon: 'Ruler' },
    { id: 'c6666666-6666-6666-6666-666666666666', name: 'Parceiros Complementares', slug: 'parceiros-complementares', description: 'Instaladores de fitas LED, serralheiros, vidraceiros, medidores e reparadores.', icon: 'Lightbulb' }
  ];

  const { error: catErr } = await supabase.from('categories').upsert(categories, { onConflict: 'slug' });
  if (catErr) {
    console.error('Erro categorias:', catErr);
    return;
  }
  console.log('✅ Categorias inseridas/atualizadas com sucesso!');

  // 2. Especialidades
  const specialties = [
    { id: '0d10eb12-81c5-409e-b488-d0735fe9af83', category_id: 'c1111111-1111-1111-1111-111111111111', name: 'Móveis Modulados', slug: 'moveis-modulados' },
    { id: 'dcdcd206-af20-401d-89bb-de17dd342e1c', category_id: 'c1111111-1111-1111-1111-111111111111', name: 'Montagem de Guarda-Roupas', slug: 'montagem-guarda-roupas' },
    { id: '1125e317-29ab-4e3d-b648-27e5e9a75376', category_id: 'c1111111-1111-1111-1111-111111111111', name: 'Cozinhas Planejadas', slug: 'cozinhas-planejadas' },
    { id: 'a241bc0b-a32f-4c40-aed6-21c275f6a633', category_id: 'c1111111-1111-1111-1111-111111111111', name: 'Desmontagem e Mudança', slug: 'desmontagem-mudanca' },
    { id: '91c63f10-87ae-4b76-bce5-9fce8b615cee', category_id: 'c1111111-1111-1111-1111-111111111111', name: 'Regulagem de Portas e Gavetas', slug: 'regulagem-portas' },

    { id: '1d630c2f-5d2b-4ed1-a0ae-36f7d26aa527', category_id: 'c2222222-2222-2222-2222-222222222222', name: 'Cozinhas Sob Medida', slug: 'cozinhas-sob-medida' },
    { id: '7638d817-e79c-46b6-9ad1-4344affc75b6', category_id: 'c2222222-2222-2222-2222-222222222222', name: 'Painéis Ripados', slug: 'paineis-ripados' },
    { id: '7670f515-ee71-41ca-be5f-de2fa7309499', category_id: 'c2222222-2222-2222-2222-222222222222', name: 'Closets e Dormitórios', slug: 'closets-dormitorios' },
    { id: 'cbc95b7d-a99b-4961-94ef-3c3dba509299', category_id: 'c2222222-2222-2222-2222-222222222222', name: 'Móveis para Banheiro', slug: 'moveis-banheiro' },
    { id: '32511e04-ca00-4a4d-9dc2-c46dfc73e3f6', category_id: 'c2222222-2222-2222-2222-222222222222', name: 'Restauração de Madeira', slug: 'restauracao-madeira' },

    { id: 'c952d1c0-9e81-4e0e-b2e1-2a05155dfc10', category_id: 'c3333333-3333-3333-3333-333333333333', name: 'Ambientes Completos', slug: 'ambientes-completos' },
    { id: 'ea5309bd-8353-4035-a89b-e8cca0d92244', category_id: 'c3333333-3333-3333-3333-333333333333', name: 'Planejados Residenciais', slug: 'planejados-residenciais' },
    { id: 'a4e2e1e9-1d11-4ac8-927d-77472392de15', category_id: 'c3333333-3333-3333-3333-333333333333', name: 'Planejados Corporativos', slug: 'planejados-corporativos' },

    { id: '5a6bf4d7-7f11-4152-9749-e4d6ff193b9f', category_id: 'c4444444-4444-4444-4444-444444444444', name: 'Usinagem CNC', slug: 'usinagem-cnc' },
    { id: 'e819f860-a376-4634-a757-4f0760f38b50', category_id: 'c4444444-4444-4444-4444-444444444444', name: 'Grandes Lotes e Franquias', slug: 'grandes-lotes' },
    { id: 'e9c38eb3-2d2e-4787-8d6c-1b7cfbd975eb', category_id: 'c4444444-4444-4444-4444-444444444444', name: 'Corte e Fita de Borda', slug: 'corte-borda' },

    { id: 'fd4dcb30-5e4f-4fd1-9eee-141d370615a2', category_id: 'c5555555-5555-5555-5555-555555555555', name: 'Projeto 3D / Promob', slug: 'projeto-promob' },
    { id: '251ff6c0-fa2b-40c2-a354-795e54a43389', category_id: 'c5555555-5555-5555-5555-555555555555', name: 'Renderização Fotorrealista', slug: 'render-fotorrealista' },
    { id: 'fcb855df-6539-43e8-8088-262fcb95e6fb', category_id: 'c5555555-5555-5555-5555-555555555555', name: 'Planta Técnica de Fabricação', slug: 'planta-tecnica' },

    { id: '3f51b548-72ab-46c7-b7fb-fc7537a31127', category_id: 'c6666666-6666-6666-6666-666666666666', name: 'LED em Móveis', slug: 'led-em-moveis' },
    { id: '3f414fcf-7219-4ed5-8bd3-2afcf9a68892', category_id: 'c6666666-6666-6666-6666-666666666666', name: 'Vidraçaria / Portas de Alumínio', slug: 'vidracaria-portas' },
    { id: '10d9735d-ef2a-4bc4-90d3-b858716dc776', category_id: 'c6666666-6666-6666-6666-666666666666', name: 'Serralheria para Móveis', slug: 'serralheria-moveis' },
    { id: '376abbe8-3ebe-4928-a794-d6fee7d86842', category_id: 'c6666666-6666-6666-6666-666666666666', name: 'Transporte e Frete Dedicado', slug: 'transporte-moveis' }
  ];

  const { error: specErr } = await supabase.from('specialties').upsert(specialties, { onConflict: 'slug' });
  if (specErr) {
    console.error('Erro especialidades:', specErr);
    return;
  }
  console.log('✅ Especialidades inseridas/atualizadas com sucesso!');

  // 3. Planos
  const plans = [
    { id: 'free', name: 'Gratuito', description: 'Plano de entrada para autônomos.', max_photos: 6, max_categories: 2, allow_featured: false, price_cents: 0, is_active: true },
    { id: 'pro', name: 'Profissional', description: 'Para profissionais com portfólio completo.', max_photos: 15, max_categories: 5, allow_featured: true, price_cents: 0, is_active: true },
    { id: 'enterprise', name: 'Loja ou Marcenaria', description: 'Para empresas, lojas e fábricas.', max_photos: 30, max_categories: 10, allow_featured: true, price_cents: 0, is_active: true }
  ];

  const { error: planErr } = await supabase.from('plans').upsert(plans, { onConflict: 'id' });
  if (planErr) {
    console.error('Erro planos:', planErr);
    return;
  }
  console.log('✅ Planos inseridos/atualizados com sucesso!');

  console.log('🎉 BANCO DE DADOS POPULADO COM 100% DE SUCESSO!');
}

main();
