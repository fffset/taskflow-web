'use client';

import { useAutoRefresh, useMe } from '@/hooks/use-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isFetching, isSuccess, isError } = useMe();
  useAutoRefresh();

  const showLoading = isLoading || (isFetching && !isSuccess) || (!isSuccess && !isError);

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