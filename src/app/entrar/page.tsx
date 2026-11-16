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
      <div className="absolute top-6 left-6 sm:top-10 sm:left-10">
        <BackButton fallback="/" label="Voltar ao início" />
      </div>
      <div className="mb-8">
        <BrandLogo href="/" size="md" />
      </div>
      <Suspense fallback={<SignInFormSkeleton />}>
        <SignInForm />
      </Suspense>
    </main>
  );
}

