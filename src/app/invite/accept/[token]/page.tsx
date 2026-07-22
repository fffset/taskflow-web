'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAcceptInvite } from '@/hooks/use-workspace';
import { useMe } from '@/hooks/use-auth';

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { data: user, isLoading: isCheckingAuth, isError: notLoggedIn } = useMe();
  const { mutate: acceptInvite, isPending, isSuccess, isError } = useAcceptInvite();

  useEffect(() => {
    if (user && !isPending && !isSuccess && !isError) {
      acceptInvite(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const currentUrl = `/invite/accept/${token}`;

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Davet Kabul Et</CardTitle>
            <CardDescription>
              Daveti kabul edebilmek için önce giriş yapman veya hesap oluşturman gerekiyor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href={`/login?redirect=${encodeURIComponent(currentUrl)}`}>
                Giriş Yap
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/register?redirect=${encodeURIComponent(currentUrl)}`}>
                Hesap Oluştur
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isPending && (
            <>
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground mb-2" />
              <CardTitle>Davet kontrol ediliyor...</CardTitle>
            </>
          )}
          {isSuccess && (
            <>
              <CheckCircle2 className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <CardTitle>Katıldın!</CardTitle>
              <CardDescription>Workspace&apos;e yönlendiriliyorsun...</CardDescription>
            </>
          )}
          {isError && (
            <>
              <XCircle className="w-8 h-8 mx-auto text-destructive mb-2" />
              <CardTitle>Davet Geçersiz</CardTitle>
              <CardDescription>
                Bu davet linki geçersiz veya süresi dolmuş olabilir
              </CardDescription>
            </>
          )}
        </CardHeader>
        {isError && (
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/workspaces">Workspace&apos;lerime Dön</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}