import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NotFoundStateProps {
  homeHref?: string;
  homeLabel?: string;
}

export function NotFoundState({
  homeHref = '/workspaces',
  homeLabel = "Workspace'lerime Dön",
}: NotFoundStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <FileQuestion className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <CardTitle>Sayfa Bulunamadı</CardTitle>
          <CardDescription>
            Aradığın sayfa mevcut değil veya taşınmış olabilir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href={homeHref}>{homeLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
