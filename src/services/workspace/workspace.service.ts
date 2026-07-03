import { api } from '../api';
import type {
  Workspace,
  WorkspaceDetail,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
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
};
