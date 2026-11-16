import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignInFormSkeleton } from '@/components/auth/SignInFormSkeleton';
import { BackButton } from '@/components/navigation/BackButton';
import { BrandLogo } from '@/components/brand/BrandLogo';

export const metadata: Metadata = {
  title: 'Entrar — Vitrine Moveleira',
  description: 'Acesse sua conta na plataforma Vitrine Moveleira.',
};

export default function EntrarPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md mx-auto mb-6 flex items-center justify-between">
        <BackButton fallback="/" label="Voltar ao início" />
        <BrandLogo href="/" size="sm" />
      </div>
      <Suspense fallback={<SignInFormSkeleton />}>
        <SignInForm />
      </Suspense>
    </main>
  );
}

