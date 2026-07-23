import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '@/services/auth/auth.service';

export function useEnable2fa() {
  return useMutation({
    mutationFn: () => authService.enable2fa(),
    onError: () => {
      toast.error('2FA kurulumu başlatılamadı');
    },
  });
}

export function useVerify2fa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => authService.verify2fa(code),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('2FA aktifleştirildi');
    },
    onError: () => {
      toast.error('Kod hatalı, tekrar dene');
    },
  });
}
