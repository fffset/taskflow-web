'use client';

import Link from 'next/link';
import { ArrowLeft, Trash2, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useDeleteAccount,
} from '@/hooks/use-user';
import { UserMenu } from '@/components/layout/user-menu';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter'),
  avatarUrl: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
    newPassword: z.string().min(8, 'En az 8 karakter olmalı'),
    confirmPassword: z.string().min(1, 'Şifreyi tekrar gir'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;
type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const profileForm = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    values: profile
      ? { name: profile.name, avatarUrl: profile.avatarUrl ?? '' }
      : undefined,
  });

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onUpdateProfile = (data: UpdateProfileForm) => {
    updateProfile({
      name: data.name,
      avatarUrl: data.avatarUrl || undefined,
    });
  };

  const onChangePassword = (data: ChangePasswordForm) => {
    changePassword(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { onSuccess: () => passwordForm.reset() },
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b flex items-center justify-between px-6 sticky top-0 bg-background/95 backdrop-blur z-10">
        <Link
          href="/workspaces"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Workspace&apos;lere Dön
        </Link>
        <UserMenu />
      </header>

      {isLoading ? (
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Profil</h1>
            <p className="text-muted-foreground mt-1">Hesap bilgilerini yönet</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Genel Bilgiler</CardTitle>
              <CardDescription>{profile?.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Ad Soyad</Label>
                  <Input {...profileForm.register('name')} />
                  {profileForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Avatar URL (opsiyonel)</Label>
                  <Input
                    placeholder="https://example.com/avatar.jpg"
                    {...profileForm.register('avatarUrl')}
                  />
                  {profileForm.formState.errors.avatarUrl && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.avatarUrl.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {profile?.twoFactorEnabled ? (
                    <Badge variant="default" className="gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      2FA Aktif
                    </Badge>
                  ) : (
                    <Badge variant="outline">2FA Kapalı</Badge>
                  )}
                  <span>
                    {profile?._count?.workspaceMemberships ?? 0} workspace&apos;e üye
                  </span>
                </div>

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Şifre Değiştir</CardTitle>
              <CardDescription>
                Şifreni değiştirince tüm oturumların sonlanır, tekrar giriş yapman gerekir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Mevcut Şifre</Label>
                  <Input type="password" {...passwordForm.register('currentPassword')} />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Yeni Şifre</Label>
                  <Input type="password" {...passwordForm.register('newPassword')} />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Yeni Şifre (Tekrar)</Label>
                  <Input type="password" {...passwordForm.register('confirmPassword')} />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Tehlikeli Bölge</CardTitle>
              <CardDescription>
                Hesabını silmek kalıcıdır ve geri alınamaz. Tüm workspace üyeliklerin sona erer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hesabımı Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Emin misin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hesabın ve tüm kişisel verilerin kalıcı olarak silinecek. Sahip olduğun
                      workspace&apos;ler etkilenmez ama senin üyeliğin sona erer. Bu işlem geri
                      alınamaz.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteAccount()}
                      disabled={isDeleting}
                      className="bg-destructive text-white hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Siliniyor...' : 'Evet, Hesabımı Sil'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
