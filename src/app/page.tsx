'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks/use-auth';

export default function Home() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useMe();

  useEffect(() => {
    if (isLoading) return;

    if (isError || !user) {
      router.push('/login');
    } else {
      router.push('/workspaces');
    }
  }, [isLoading, isError, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Yönlendiriliyor...</p>
    </div>
  );
}