import { api } from '../api';
import type { Label, CreateLabelPayload, UpdateLabelPayload } from './label.types';

export const labelService = {
  getAll: async (workspaceId: string, projectId: string): Promise<Label[]> => {
    const { data } = await api.get<Label[]>(
      `/workspaces/${workspaceId}/projects/${projectId}/labels`,
    );
    return data;
  },

  create: async (
    workspaceId: string,
    projectId: string,
    payload: CreateLabelPayload,
  ): Promise<Label> => {
    const { data } = await api.post<Label>(
      `/workspaces/${workspaceId}/projects/${projectId}/labels`,
      payload,
    );
    return data;
  },

  update: async (
    workspaceId: string,
    projectId: string,
    labelId: string,
    payload: UpdateLabelPayload,
  ): Promise<Label> => {
    const { data } = await api.patch<Label>(
      `/workspaces/${workspaceId}/projects/${projectId}/labels/${labelId}`,
      payload,
    );
    return data;
  },

  remove: async (workspaceId: string, projectId: string, labelId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/labels/${labelId}`);
  },

  addToTask: async (workspaceId: string, taskId: string, labelId: string): Promise<void> => {
    await api.post(`/workspaces/${workspaceId}/tasks/${taskId}/labels/${labelId}`);
  },

  removeFromTask: async (workspaceId: string, taskId: string, labelId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/tasks/${taskId}/labels/${labelId}`);
  },
};
