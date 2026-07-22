import { api } from '../api';
import type {
  Workspace,
  WorkspaceDetail,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  InviteMemberPayload,
  UpdateMemberRolePayload,
  PendingInvite,
} from './workspace.types';

export const workspaceService = {
  getAll: async (): Promise<Workspace[]> => {
    const { data } = await api.get<Workspace[]>('/workspaces');
    return data;
  },

  getOne: async (workspaceId: string): Promise<WorkspaceDetail> => {
    const { data } = await api.get<WorkspaceDetail>(`/workspaces/${workspaceId}`);
    return data;
  },

  create: async (payload: CreateWorkspacePayload): Promise<Workspace> => {
    const { data } = await api.post<Workspace>('/workspaces', payload);
    return data;
  },

  update: async (workspaceId: string, payload: UpdateWorkspacePayload): Promise<Workspace> => {
    const { data } = await api.patch<Workspace>(`/workspaces/${workspaceId}`, payload);
    return data;
  },

  remove: async (workspaceId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}`);
  },

  inviteMember: async (
    workspaceId: string,
    payload: InviteMemberPayload,
  ): Promise<{ token: string }> => {
    const { data } = await api.post<{ token: string }>(
      `/workspaces/${workspaceId}/invite`,
      payload,
    );
    return data;
  },

  acceptInvite: async (token: string): Promise<Workspace> => {
    const { data } = await api.post<Workspace>(`/workspaces/invite/accept/${token}`);
    return data;
  },

  removeMember: async (workspaceId: string, userId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },

  updateMemberRole: async (
    workspaceId: string,
    userId: string,
    payload: UpdateMemberRolePayload,
  ): Promise<void> => {
    await api.patch(`/workspaces/${workspaceId}/members/${userId}/role`, payload);
  },

  getPendingInvites: async (workspaceId: string): Promise<PendingInvite[]> => {
    const { data } = await api.get<PendingInvite[]>(`/workspaces/${workspaceId}/invites`);
    return data;
  },

  cancelInvite: async (workspaceId: string, inviteId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/invites/${inviteId}`);
  },
};
