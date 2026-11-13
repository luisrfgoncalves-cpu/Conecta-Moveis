'use client';

import { usePathname } from 'next/navigation';

export function ConditionalShellWrapper({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboardOrAdmin = pathname?.startsWith('/painel') || pathname?.startsWith('/admin');

  return (
    <>
      {!isDashboardOrAdmin && header}
      <main className="flex-1 w-full relative z-10 flex flex-col">{children}</main>
      {!isDashboardOrAdmin && footer}
    </>
  );
}

