export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER';
  memberCount: number;
  createdAt: string;
}

export interface CreateWorkspacePayload {
  name: string;
  slug: string;
  description?: string;
}