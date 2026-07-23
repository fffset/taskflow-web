'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorStateProps {
  onRetry?: () => void;
  onGoHome?: () => void;
  title?: string;
  description?: string;
}

// Next.js'in error.tsx dosyalarının içeriği burada merkezi olarak tutulur.
// app/error.tsx (ve ileride eklenecek segment-bazlı error.tsx'ler) bu
// component'i import edip kullanır — asıl UI/mantık tek bir yerden yönetilir.
export function ErrorState({
  onRetry,
  onGoHome,
  title = 'Bir şeyler ters gitti',
  description = 'Beklenmeyen bir hata oluştu. Tekrar denemek işe yarayabilir.',
}: ErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="w-10 h-10 mx-auto text-destructive mb-2" />
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {onRetry && <Button onClick={onRetry}>Tekrar Dene</Button>}
          {onGoHome && (
            <Button variant="outline" onClick={onGoHome}>
              Ana Sayfaya Dön
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
