import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/95 backdrop-blur-md py-14 text-sm relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/brand/logo-conecta-moveis.png"
                alt="Conecta Móveis"
                width={200}
                height={66}
                className="h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-slate-300 leading-relaxed">
              Catálogo de divulgação e conexão direta para o setor moveleiro de Jundiaí/SP e região metropolitana.
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
                <Link href="/planos" className="text-slate-300 hover:text-orange-400 transition">
                  Planos e Visibilidade
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-sm tracking-wide">Legal & LGPD</h4>
            <ul className="space-y-2 text-xs">
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
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-sm tracking-wide">Transparência</h4>
            <p className="text-xs leading-relaxed text-slate-300">
              A plataforma não atua como prestadora nem intermediadora financeira de montagens ou fabricações. Negociação 100% autônoma.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Conecta Móveis. Todos os direitos reservados.</p>
          <p className="text-slate-300">Desenvolvido com foco em alto desempenho e acessibilidade.</p>
        </div>
      </div>
    </footer>
  );
}
