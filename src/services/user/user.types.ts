export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { workspaceMemberships: number };
}

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
