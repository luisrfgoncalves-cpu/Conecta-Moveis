import type { Metadata } from 'next';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RecoverPasswordForm, NewPasswordForm } from '@/components/auth/RecoverPasswordForm';

export const metadata: Metadata = {
  title: 'Recuperar senha — Conecta Móveis',
  description: 'Redefina sua senha de acesso à plataforma Conecta Móveis.',
};

interface Props {
  searchParams: Promise<{ modo?: string }>;
}

export default async function RecuperarSenhaPage({ searchParams }: Props) {
  const params = await searchParams;
  const isNewPasswordMode = params.modo === 'nova';

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
        {isNewPasswordMode ? <NewPasswordForm /> : <RecoverPasswordForm />}
      </Suspense>
    </main>
  );
}

