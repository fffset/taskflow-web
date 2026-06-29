'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
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
import { registerSchema, type RegisterFormValues } from '@/lib/validators/auth.schema';
import { useRegister } from '@/hooks/use-auth';

export default function RegisterPage() {
  const { mutate: register, isPending, error } = useRegister();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    register(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Hesap Oluştur</CardTitle>
          <CardDescription>Taskflow&apos;a katılın</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                placeholder="Erkan Yılmaz"
                {...formRegister('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="erkan@example.com"
                {...formRegister('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                {...formRegister('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">
                Kayıt sırasında bir hata oluştu
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Zaten hesabın var mı?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Giriş yap
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}