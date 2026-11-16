import Link from 'next/link';
import { PlatformNotice } from '@/components/legal/PlatformNotice';
import { getOperatorSettings } from '@/lib/config/operator';
import { getBrandConfig } from '@/lib/config/brand';
import { BrandLogo } from '@/components/brand/BrandLogo';

export function Footer() {
  const op = getOperatorSettings();
  const brand = getBrandConfig();

  return (
    <footer className="border-t border-white/10 bg-slate-950/95 backdrop-blur-md py-14 text-sm relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Aviso Curto Fixo da Plataforma */}
        <PlatformNotice />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <BrandLogo href="/" size="sm" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Catálogo de divulgação e conexão direta para o setor moveleiro de {brand.focusRegion}.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-sm tracking-wide">Navegação</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-slate-300 hover:text-orange-400 transition">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-slate-300 hover:text-orange-400 transition">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="text-slate-300 hover:text-orange-400 transition">
                  Categorias
                </Link>
              </li>
              <li>
                <Link href="/encontrar-profissionais" className="text-slate-300 hover:text-orange-400 transition">
                  Buscar Profissionais
                </Link>
              </li>
              <li>
                <Link href="/para-profissionais" className="text-slate-300 hover:text-orange-400 transition">
                  Para Profissionais
                </Link>
              </li>
              <li>
                <Link href="/planos" className="text-slate-300 hover:text-orange-400 transition">
                  Planos e Visibilidade
                </Link>
              </li>
              <li>
                <Link href="/como-ordenamos-os-resultados" className="text-slate-300 hover:text-orange-400 transition">
                  Como Ordenamos os Resultados
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-sm tracking-wide">Legal & Segurança</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/funcao-da-plataforma" className="text-slate-300 hover:text-orange-400 transition">
                  Função e Limites da Plataforma
                </Link>
              </li>
              <li>
                <Link href="/contrate-com-seguranca" className="text-slate-300 hover:text-orange-400 transition">
                  Dicas de segurança
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-slate-300 hover:text-orange-400 transition">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-slate-300 hover:text-orange-400 transition">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/denunciar" className="text-slate-300 hover:text-orange-400 transition">
                  Canal de Denúncias
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-slate-300 hover:text-orange-400 transition">
                  Canais de Contato & Titulares
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white mb-3 text-sm tracking-wide">Atendimento</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Catálogo de divulgação e conexão direta entre clientes e profissionais em {brand.focusRegion}.
            </p>
            <div className="pt-1">
              <Link
                href="/contato"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 hover:text-white border border-orange-500/30 text-xs font-bold transition"
              >
                <span>Fale com o Suporte</span>
              </Link>
            </div>
            {!op.isPending && (
              <>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  <strong>Razão Social:</strong> {op.razaoSocial}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>CNPJ:</strong> {op.cnpj}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.</p>
          <p className="text-slate-300">Desenvolvido com foco em alto desempenho, acessibilidade e isenção documental.</p>
        </div>
      </div>
    </footer>
  );
}
