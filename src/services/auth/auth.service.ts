import { api } from '../api';
import type { User, LoginPayload, RegisterPayload } from './auth.types';

export const authService = {
  login: async (payload: LoginPayload): Promise<User> => {
    const { data } = await api.post<User>('/auth/login', payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    const { data } = await api.post<User>('/auth/register', payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  refresh: async (): Promise<void> => {
    await api.post('/auth/refresh');
  },
};