import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth/auth.service';
import { useAuthStore } from '@/store/auth.store';
import type { LoginPayload, RegisterPayload } from '@/services/auth/auth.types';
import { useEffect } from 'react';


export function useAutoRefresh() {
  useEffect(() => {
    const interval = setInterval(
      () => {
        void authService.refresh().catch(() => {
          // sessizce geç — süresi gerçekten dolmuşsa zaten
          // sonraki istekte axios interceptor login'e yönlendirecek
        });
      },
      13 * 60 * 1000, // 13 dakika — access token 15 dakikada dolduğu için önden yenile
    );

    return () => clearInterval(interval);
  }, []);
}

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const user = await authService.me();
      setUser(user);
      return user;
    },
    retry: false,
    staleTime: 0,
  });
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['me'], user);
      router.push('/workspaces');
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: () => {
      router.push('/login');
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      router.push('/login');
    },
  });
}