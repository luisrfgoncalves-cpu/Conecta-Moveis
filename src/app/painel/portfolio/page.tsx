import { redirect } from 'next/navigation';

/**
 * Redirecionamento permanente da antiga rota /painel/portfolio
 * para a nova rota padrão /painel/fotos (Fase 24, Item 8).
 */
export default function LegacyPortfolioRedirect() {
  redirect('/painel/fotos');
}
