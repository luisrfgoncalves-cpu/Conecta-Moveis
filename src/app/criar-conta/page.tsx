import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { SignUpFormSkeleton } from '@/components/auth/SignUpFormSkeleton';
import { BackButton } from '@/components/navigation/BackButton';
import { BrandLogo } from '@/components/brand/BrandLogo';

export const metadata: Metadata = {
  title: 'Criar conta — Conecta Móveis',
  description: 'Crie sua conta grátis e conecte-se a profissionais do setor moveleiro.',
};

export default function CriarContaPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="absolute top-6 left-6 sm:top-10 sm:left-10">
        <BackButton fallback="/" label="Voltar ao início" />
      </div>
      <div className="mb-8">
        <BrandLogo href="/" size="md" />
      </div>
      <Suspense fallback={<SignUpFormSkeleton />}>
        <SignUpForm />
      </Suspense>
    </main>
  );
}

