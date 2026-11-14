import { Suspense } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SignUpForm } from '@/components/auth/SignUpForm';

export const metadata: Metadata = {
  title: 'Criar conta — Conecta Móveis',
  description: 'Crie sua conta grátis e conecte-se a profissionais do setor moveleiro.',
};

export default function CriarContaPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-8 block" aria-label="Voltar para a página inicial">
        <Image
          src="/brand/logo-conecta-moveis.png"
          alt="Conecta Móveis"
          width={180}
          height={48}
          className="h-10 w-auto"
          priority
        />
      </Link>
      <Suspense fallback={<div className="text-slate-400 text-sm">Carregando formulário...</div>}>
        <SignUpForm />
      </Suspense>
    </main>
  );
}

