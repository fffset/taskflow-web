'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { loginSchema, type LoginFormValues } from '@/lib/validators/auth.schema';
import { useLogin, useLoginWith2fa } from '@/hooks/use-auth';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  // 2FA gerekiyorsa, email+şifreyi burada saklayıp ikinci adıma geçiyoruz
  const [pending2fa, setPending2fa] = useState<{ email: string; password: string } | null>(
    null,
  );
  const [code, setCode] = useState('');

  const { mutate: login, isPending, error } = useLogin(redirectTo ?? undefined);
  const {
    mutate: loginWith2fa,
    isPending: isVerifying,
    error: verify2faError,
  } = useLoginWith2fa(redirectTo ?? undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data, {
      onError: (err: unknown) => {
        // Backend, 2FA aktifse AUTH_006 (AUTH_2FA_REQUIRED) errorCode'u ile
        // 401 döner — bu durumda kod isteme ekranına geçiyoruz.
        const axiosError = err as { response?: { data?: { errorCode?: string } } };
        if (axiosError.response?.data?.errorCode === 'AUTH_006') {
          setPending2fa({ email: data.email, password: data.password });
        }
      },
    });
  };

  const handleVerify2fa = () => {
    if (pending2fa) {
      loginWith2fa({ ...pending2fa, code });
    }
  };

  // ─── 2FA Kod Girişi Ekranı ─────────────────────────────────────────────────
  if (pending2fa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">İki Adımlı Doğrulama</CardTitle>
            <CardDescription>
              Authenticator uygulamandaki 6 haneli kodu gir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="text-center text-lg tracking-widest font-mono"
              maxLength={6}
              autoFocus
            />

            {verify2faError && (
              <p className="text-sm text-destructive text-center">
                Kod hatalı, tekrar dene
              </p>
            )}

            <Button
              className="w-full"
              onClick={handleVerify2fa}
              disabled={code.length !== 6 || isVerifying}
            >
              {isVerifying ? 'Doğrulanıyor...' : 'Doğrula'}
            </Button>

            <button
              onClick={() => {
                setPending2fa(null);
                setCode('');
              }}
              className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
            >
              Geri dön
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Normal Login Ekranı ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Taskflow&apos;a Giriş Yap</CardTitle>
          <CardDescription>Email ve şifrenizi girin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="erkan@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">
                Email veya şifre hatalı
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Hesabın yok mu?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Kayıt ol
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
