export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  role: WorkspaceRole;
  memberCount: number;
  createdAt: string;
}

export interface WorkspaceMemberInfo {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface WorkspaceDetail extends Workspace {
  members: WorkspaceMemberInfo[];
}

export interface CreateWorkspacePayload {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
  description?: string;
}

export interface InviteMemberPayload {
  email: string;
  role: WorkspaceRole;
}
