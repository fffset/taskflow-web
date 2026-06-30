import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register') ||
      error.config?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      try {
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        return api.request(error.config);
      } catch {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);