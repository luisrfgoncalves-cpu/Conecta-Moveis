import type { Metadata } from 'next';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SignInForm } from '@/components/auth/SignInForm';

export const metadata: Metadata = {
  title: 'Entrar — Conecta Móveis',
  description: 'Acesse sua conta na plataforma Conecta Móveis.',
};

export default function EntrarPage() {
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
      <Suspense>
        <SignInForm />
      </Suspense>
    </main>
  );
}

