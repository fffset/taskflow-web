import { api } from '../api';
import type { UserProfile, UpdateProfilePayload, ChangePasswordPayload } from './user.types';

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await api.get<UserProfile>('/users/me');
    return data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const { data } = await api.patch<UserProfile>('/users/me', payload);
    return data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await api.patch('/users/me/password', payload);
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/users/me');
  },
};
