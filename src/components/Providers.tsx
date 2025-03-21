'use client';

import { SessionProvider } from 'next-auth/react';
import Navigation from '@/components/Navigation';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Navigation />
      <main>{children}</main>
    </SessionProvider>
  );
} 