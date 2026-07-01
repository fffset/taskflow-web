import { api } from '../api';
import type { Task, TaskStatus, CreateTaskPayload, UpdateTaskPayload } from './task.types';

export const taskService = {
  getAll: async (workspaceId: string, boardId: string): Promise<Task[]> => {
    const { data } = await api.get<Task[]>(`/workspaces/${workspaceId}/boards/${boardId}/tasks`);
    return data;
  },

  getOne: async (workspaceId: string, taskId: string): Promise<Task> => {
    const { data } = await api.get<Task>(`/workspaces/${workspaceId}/tasks/${taskId}`);
    return data;
  },

  getStatuses: async (workspaceId: string): Promise<TaskStatus[]> => {
    const { data } = await api.get<TaskStatus[]>(`/workspaces/${workspaceId}/tasks/statuses`);
    return data;
  },

  create: async (
    workspaceId: string,
    boardId: string,
    payload: CreateTaskPayload,
  ): Promise<Task> => {
    const { data } = await api.post<Task>(
      `/workspaces/${workspaceId}/boards/${boardId}/tasks`,
      payload,
    );
    return data;
  },

  update: async (
    workspaceId: string,
    taskId: string,
    payload: UpdateTaskPayload,
  ): Promise<Task> => {
    const { data } = await api.patch<Task>(`/workspaces/${workspaceId}/tasks/${taskId}`, payload);
    return data;
  },

  remove: async (workspaceId: string, taskId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/tasks/${taskId}`);
  },
};