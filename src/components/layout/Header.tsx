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
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(false);

  const toggleSound = () => {
    const state = sounds.toggle();
    setSoundActive(state);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-32 flex items-center justify-between">
        
        {/* LOGO OFICIAL COM FUNDO 100% TRANSPARENTE E NITIDEZ MÁXIMA */}
        <Link 
          href="/" 
          className="flex items-center focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-xl p-1 transition"
          onClick={() => sounds.playClick()}
        >
          <div className="relative">
            <Image 
              src="/brand/logo-conecta-moveis.png" 
              alt="Conecta Móveis" 
              width={1024} 
              height={341} 
              priority 
              className="h-20 sm:h-24 md:h-28 w-auto object-contain hover:scale-[1.02] transition-transform duration-200" 
            />
          </div>
        </Link>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
          <Link 
            href="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-200 hover:text-white hover:bg-white/10 transition"
            onClick={() => sounds.playClick()}
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            Início
          </Link>
          <Link 
            href="/como-funciona" 
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
            onClick={() => sounds.playClick()}
          >
            <Compass className="w-4 h-4 text-sky-400" />
            Como Funciona
          </Link>
          <Link 
            href="/categorias" 
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
            onClick={() => sounds.playClick()}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Categorias
          </Link>
          <Link 
            href="/encontrar-profissionais" 
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
            onClick={() => sounds.playClick()}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Profissionais
          </Link>
          <Link 
            href="/termos" 
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
            onClick={() => sounds.playClick()}
          >
            <FileText className="w-4 h-4 text-slate-400" />
            Termos
          </Link>
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSound}
            aria-label="Alternar sons da interface"
            className="btn-glass p-2.5 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2 hover:text-orange-400"
            title="Efeitos sonoros"
          >
            {soundActive ? (
              <>
                <Volume2 className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="hidden sm:inline">Som Ativo</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Som Mudo</span>
              </>
            )}
          </button>

          <Link
            href="/encontrar-profissionais"
            onClick={() => sounds.playClick()}
            className="hidden sm:inline-flex items-center gap-2 px-6 py-3 btn-neon text-xs tracking-wider uppercase font-black"
          >
            <span>Catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Menu Mobile Toggle */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            aria-label="Menu principal"
            className="md:hidden btn-glass p-2.5 rounded-xl text-slate-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Gaveta */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-t border-white/10 px-6 py-5 space-y-3">
          <Link 
            href="/" 
            className="flex items-center gap-3 py-2.5 text-slate-200 font-bold border-b border-white/5" 
            onClick={() => setMobileMenuOpen(false)}
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            Início
          </Link>
          <Link 
            href="/como-funciona" 
            className="flex items-center gap-3 py-2.5 text-slate-200 font-bold border-b border-white/5" 
            onClick={() => setMobileMenuOpen(false)}
          >
            <Compass className="w-4 h-4 text-sky-400" />
            Como Funciona
          </Link>
          <Link 
            href="/categorias" 
            className="flex items-center gap-3 py-2.5 text-slate-200 font-bold border-b border-white/5" 
            onClick={() => setMobileMenuOpen(false)}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Categorias
          </Link>
          <Link 
            href="/encontrar-profissionais" 
            className="flex items-center gap-3 py-2.5 text-slate-200 font-bold border-b border-white/5" 
            onClick={() => setMobileMenuOpen(false)}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Buscar Profissionais
          </Link>
          <Link 
            href="/termos" 
            className="flex items-center gap-3 py-2.5 text-slate-200 font-bold" 
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
