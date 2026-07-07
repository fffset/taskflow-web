import { api } from '../api';
import type {
  Project,
  ProjectStatus,
  CreateProjectPayload,
  UpdateProjectPayload,
} from './project.types';

export const projectService = {
  getAll: async (workspaceId: string): Promise<Project[]> => {
    const { data } = await api.get<Project[]>(`/workspaces/${workspaceId}/projects`);
    return data;
  },

  getOne: async (workspaceId: string, projectId: string): Promise<Project> => {
    const { data } = await api.get<Project>(`/workspaces/${workspaceId}/projects/${projectId}`);
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

  update: async (
    workspaceId: string,
    projectId: string,
    payload: UpdateProjectPayload,
  ): Promise<Project> => {
    const { data } = await api.patch<Project>(
      `/workspaces/${workspaceId}/projects/${projectId}`,
      payload,
    );
    return data;
  },

  remove: async (workspaceId: string, projectId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}`);
  },
};
