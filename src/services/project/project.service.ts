import { api } from '../api';
import type {
  Project,
  ProjectStatus,
  CreateProjectPayload,
  UpdateProjectPayload,
  CreateProjectStatusPayload,
  UpdateProjectStatusPayload,
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

  createStatus: async (
    workspaceId: string,
    payload: CreateProjectStatusPayload,
  ): Promise<ProjectStatus> => {
    const { data } = await api.post<ProjectStatus>(
      `/workspaces/${workspaceId}/projects/statuses`,
      payload,
    );
    return data;
  },

  updateStatus: async (
    workspaceId: string,
    statusId: string,
    payload: UpdateProjectStatusPayload,
  ): Promise<ProjectStatus> => {
    const { data } = await api.patch<ProjectStatus>(
      `/workspaces/${workspaceId}/projects/statuses/${statusId}`,
      payload,
    );
    return data;
  },

  deleteStatus: async (workspaceId: string, statusId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/statuses/${statusId}`);
  },
};
