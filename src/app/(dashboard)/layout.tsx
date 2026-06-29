'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks/use-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isError, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (isError) {
      router.push('/login');
    }
  }, [isError, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return <>{children}</>;
}