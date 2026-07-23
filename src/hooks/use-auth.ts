import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth/auth.service';
import { useAuthStore } from '@/store/auth.store';
import type { LoginPayload, RegisterPayload } from '@/services/auth/auth.types';
import { useEffect } from 'react';
import { refreshTokens } from '@/services/api';


export function useAutoRefresh() {
  useEffect(() => {
    const interval = setInterval(
      () => {
        // Artık api.ts'teki paylaşılan/kilitli refreshTokens() fonksiyonunu
        // kullanıyoruz. Eğer o sırada zaten başka bir istekten (örn.
        // window-focus refetch'inden) tetiklenen bir refresh varsa, aynı
        // promise'e katılır — asla iki eş zamanlı refresh isteği gitmez.
        void refreshTokens().catch(() => {
          // sessizce geç — süresi gerçekten dolmuşsa sonraki istekte
          // normal 401 akışı devreye girecek
        });
      },
      13 * 60 * 1000,
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

export function useLogin(redirectTo?: string) {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['me'], user);
      router.push(redirectTo ?? '/workspaces');
    },
  });
}

export function useRegister(redirectTo?: string) {
  const router = useRouter();
 
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: () => {
      // Register sonrası login'e gidiyor, redirect'i login URL'ine taşı
      const loginUrl = redirectTo
        ? `/login?redirect=${encodeURIComponent(redirectTo)}`
        : '/login';
      router.push(loginUrl);
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

export function useLoginWith2fa(redirectTo?: string) {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { email: string; password: string; code: string }) =>
      authService.loginWith2fa(payload),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['me'], user);
      router.push(redirectTo ?? '/workspaces');
    },
  });
}