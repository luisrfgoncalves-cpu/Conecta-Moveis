'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { sounds } from '@/lib/sound';
import {
  Sparkles,
  Compass,
  FileText,
  Volume2,
  VolumeX,
  Menu,
  X,
  ShieldCheck,
  CreditCard,
  Briefcase,
} from 'lucide-react';
import { UserNavDropdown } from './UserNavDropdown';

interface HeaderClientProps {
  currentUser: {
    id: string;
    email?: string | null;
    fullName?: string | null;
    avatarUrl?: string | null;
    isAdminOrMod?: boolean;
  } | null;
}

export function HeaderClient({ currentUser }: HeaderClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(false);

  const toggleSound = () => {
    const state = sounds.toggle();
    setSoundActive(state);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/85 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between gap-4">
        {/* LOGO OFICIAL */}
        <Link
          href="/"
          className="flex items-center focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-xl p-1 transition flex-shrink-0"
          onClick={() => sounds.playClick()}
        >
          <div className="relative">
            <Image
              src="/brand/logo-conecta-moveis.png"
              alt="Conecta Móveis"
              width={220}
              height={70}
              priority
              className="h-12 sm:h-14 w-auto object-contain hover:scale-[1.02] transition-transform duration-200"
            />
          </div>
        </Link>

        {/* Navegação Desktop Principal */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition"
            onClick={() => sounds.playClick()}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Início
          </Link>
          <Link
            href="/encontrar-profissionais"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
            onClick={() => sounds.playClick()}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Buscar Profissionais
          </Link>
          <Link
            href="/categorias"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
            onClick={() => sounds.playClick()}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Categorias
          </Link>
          <Link
            href="/como-funciona"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
            onClick={() => sounds.playClick()}
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            Como Funciona
          </Link>
          <Link
            href="/planos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-orange-400 hover:bg-white/10 transition"
            onClick={() => sounds.playClick()}
          >
            <Briefcase className="w-3.5 h-3.5 text-orange-400" />
            Para Profissionais
          </Link>
        </nav>

        {/* Ações e Identificação de Usuário Logado */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Efeitos Sonoros Opcionais */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label="Alternar sons da interface"
            className="p-2 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 hover:text-orange-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            title="Efeitos sonoros"
          >
            {soundActive ? (
              <Volume2 className="w-4 h-4 text-orange-400 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Componente Dropdown de Usuário Logado ou Botões de Entrar/Cadastrar */}
          <UserNavDropdown user={currentUser} />

          {/* Menu Mobile Toggle */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Gaveta */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/98 border-t border-white/10 px-6 py-5 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <Link
            href="/"
            className="flex items-center gap-3 py-2.5 text-slate-200 font-bold border-b border-white/5 text-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            Início
          </Link>
          <Link
            href="/encontrar-profissionais"
            className="flex items-center gap-3 py-2.5 text-slate-200 font-bold border-b border-white/5 text-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Buscar Profissionais
          </Link>
          <Link
            href="/categorias"
            className="flex items-center gap-3 py-2.5 text-slate-200 font-bold border-b border-white/5 text-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Categorias
          </Link>
          <Link
            href="/como-funciona"
            className="flex items-center gap-3 py-2.5 text-slate-200 font-bold border-b border-white/5 text-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Compass className="w-4 h-4 text-sky-400" />
            Como Funciona
          </Link>
          <Link
            href="/planos"
            className="flex items-center gap-3 py-2.5 text-slate-200 font-bold border-b border-white/5 text-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <CreditCard className="w-4 h-4 text-orange-400" />
            Planos e Visibilidade
          </Link>
          <Link
            href="/termos"
            className="flex items-center gap-3 py-2.5 text-slate-200 font-bold text-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <FileText className="w-4 h-4 text-slate-400" />
            Termos de Uso
          </Link>
        </div>
      )}
    </header>
  );
}

