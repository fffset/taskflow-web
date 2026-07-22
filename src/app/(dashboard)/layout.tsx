'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks/use-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isFetching, isSuccess, isError } = useMe();
  const router = useRouter();

  const showLoading = isLoading || (isFetching && !isSuccess) || (!isSuccess && !isError);

  useEffect(() => {
    if (isError) {
      router.push('/login');
    }
  }, [isError, router]);

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Yönlendiriliyor...</p>
      </div>
    );
  }

  return <>{children}</>;
}