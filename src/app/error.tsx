'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/common/error-state/error-state';

// Next.js konvansiyonu — bu dosya adı ve konumu (app/error.tsx) sabit,
// değiştirilemez. İçerik ise components/common/error-state'ten geliyor.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Beklenmeyen hata:', error);
  }, [error]);

  return (
    <ErrorState onRetry={reset} onGoHome={() => (window.location.href = '/workspaces')} />
  );
}
