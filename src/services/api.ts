import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Refresh Lock ──────────────────────────────────────────────────────────
// Backend'de refresh token tek kullanımlık (rotation) — aynı anda iki farklı
// yerden refresh isteği atılırsa (örn. TanStack Query'nin window-focus
// refetch'i + bizim periyodik useAutoRefresh'imiz sekmeye dönüşte aynı anda
// tetiklenirse), biri diğerinin token'ını "yer", ikinci istek 401 alır ve
// kullanıcı yanlışlıkla login'e atılır — oysa session gerçekte hâlâ geçerlidir.
//
// Bu yüzden: bir refresh zaten devam ediyorsa, aynı promise'i paylaşıyoruz.
// Hiçbir zaman iki eş zamanlı refresh isteği gitmiyor.
let refreshPromise: Promise<void> | null = null;

function refreshTokens(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register') ||
      error.config?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      try {
        await refreshTokens();
        return api.request(error.config);
      } catch {
        // Refresh de başarısız oldu — gerçekten session bitmiş demektir.
        // Sabit bir sayfaya yönlendirme yapmıyoruz, her sayfa kendi
        // useMe()/isError durumunu ele alıyor (örn. dashboard layout
        // veya /invite/accept gibi özel akışlı sayfalar).
      }
    }
    return Promise.reject(error);
  },
);

// useAutoRefresh gibi dışarıdan da aynı kilitli fonksiyonu kullanabilmek için
// export ediyoruz — böylece o da kendi başına bağımsız bir refresh isteği
// atmıyor, varsa mevcut olana "katılıyor".
export { refreshTokens };