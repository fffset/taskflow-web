import { api } from '../api';
import type { Project, ProjectStatus, CreateProjectPayload } from './project.types';

export const projectService = {
  getAll: async (workspaceId: string): Promise<Project[]> => {
    const { data } = await api.get<Project[]>(`/workspaces/${workspaceId}/projects`);
    return data;
  },

  getStatuses: async (workspaceId: string): Promise<ProjectStatus[]> => {
    const { data } = await api.get<ProjectStatus[]>(`/workspaces/${workspaceId}/projects/statuses`);
    return data;
  },

  create: async (workspaceId: string, payload: CreateProjectPayload): Promise<Project> => {
    const { data } = await api.post<Project>(`/workspaces/${workspaceId}/projects`, payload);
    return data;
  },
};