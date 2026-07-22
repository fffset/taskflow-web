import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { userService } from '@/services/user/user.service';
import { useAuthStore } from '@/store/auth.store';
import type { UpdateProfilePayload, ChangePasswordPayload } from '@/services/user/user.types';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userService.updateProfile(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      // Auth store'daki user bilgisini de güncelle — header/sidebar'da
      // görünen isim/avatar anında yenilensin.
      setUser({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        avatarUrl: updated.avatarUrl,
        twoFactorEnabled: updated.twoFactorEnabled,
      });
      toast.success('Profil güncellendi');
    },
    onError: () => {
      toast.error('Profil güncellenemedi');
    },
  });
}

export function useChangePassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => userService.changePassword(payload),
    onSuccess: () => {
      toast.success('Şifre değiştirildi, tekrar giriş yapman gerekiyor');
      router.push('/login');
    },
    onError: () => {
      toast.error('Şifre değiştirilemedi — mevcut şifreyi kontrol et');
    },
  });
}

export function useDeleteAccount() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      logout();
      toast.success('Hesabın silindi');
      router.push('/login');
    },
    onError: () => {
      toast.error('Hesap silinemedi');
    },
  });
}
