import { api } from '../api';
import type { Workspace, CreateWorkspacePayload } from './workspace.types';

export const workspaceService = {
  getAll: async (): Promise<Workspace[]> => {
    const { data } = await api.get<Workspace[]>('/workspaces');
    return data;
  },

  create: async (payload: CreateWorkspacePayload): Promise<Workspace> => {
    const { data } = await api.post<Workspace>('/workspaces', payload);
    return data;
  },
};