import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { SignUpFormSkeleton } from '@/components/auth/SignUpFormSkeleton';
import { BackButton } from '@/components/navigation/BackButton';
import { BrandLogo } from '@/components/brand/BrandLogo';

export const metadata: Metadata = {
  title: 'Criar conta — Vitrine Moveleira',
  description: 'Crie sua conta grátis e conecte-se a profissionais do setor moveleiro.',
};

export default function CriarContaPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md mx-auto mb-6 flex items-center justify-between">
        <BackButton fallback="/" label="Voltar ao início" />
        <BrandLogo href="/" size="sm" />
      </div>
      <Suspense fallback={<SignUpFormSkeleton />}>
        <SignUpForm />
      </Suspense>
    </main>
  );
}

