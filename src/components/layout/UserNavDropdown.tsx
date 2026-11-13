'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, ShieldAlert, LogOut, LayoutDashboard, ChevronDown, Images, CreditCard } from 'lucide-react';
import { signOut } from '@/lib/auth/actions';
import { sounds } from '@/lib/sound';

interface UserNavDropdownProps {
  user: {
    id: string;
    email?: string | null;
    fullName?: string | null;
    avatarUrl?: string | null;
    isAdminOrMod?: boolean;
  } | null;
}

export function UserNavDropdown({ user }: UserNavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/entrar"
          onClick={() => sounds.playClick()}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          Entrar
        </Link>
        <Link
          href="/criar-conta"
          onClick={() => sounds.playClick()}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          Cadastre-se
        </Link>
      </div>
    );
  }

  const initial = (user.fullName || user.email || 'U').charAt(0).toUpperCase();

  async function handleSignOut() {
    sounds.playClick();
    await signOut();
    window.location.href = '/';
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          sounds.playClick();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl glass-panel border border-white/15 hover:border-orange-500/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-black text-xs shrink-0 shadow-inner">
          {initial}
        </div>
        <div className="hidden sm:block text-left max-w-[120px] truncate">
          <p className="text-xs font-bold text-white truncate">
            {user.fullName || 'Minha Conta'}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {user.isAdminOrMod ? 'Administrador' : 'Profissional'}
          </p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl border border-white/20 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-white/10 mb-1">
            <p className="text-xs font-bold text-white truncate">{user.fullName || 'Usuário'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>

          <div className="space-y-0.5 text-xs font-medium text-slate-300">
            {user.isAdminOrMod && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 transition-colors font-bold mb-1"
              >
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                Painel Administrativo
              </Link>
            )}

            <Link
              href="/painel"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:text-white hover:bg-white/10 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-sky-400" />
              Meu Painel Geral
            </Link>

            <Link
              href="/painel/perfil"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:text-white hover:bg-white/10 transition-colors"
            >
              <User className="w-4 h-4 text-emerald-400" />
              Meu Perfil Profissional
            </Link>

            <Link
              href="/painel/portfolio"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:text-white hover:bg-white/10 transition-colors"
            >
              <Images className="w-4 h-4 text-amber-400" />
              Meus Projetos / Fotos
            </Link>

            <Link
              href="/painel/assinatura"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:text-white hover:bg-white/10 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-purple-400" />
              Minha Assinatura / Planos
            </Link>
          </div>

          <div className="pt-1.5 mt-1 border-t border-white/10">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

