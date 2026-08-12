import { api } from '../api';
import type { Comment, CreateCommentPayload, UpdateCommentPayload } from './comment.types';

export const commentService = {
  getAll: async (workspaceId: string, taskId: string): Promise<Comment[]> => {
    const { data } = await api.get<Comment[]>(
      `/workspaces/${workspaceId}/tasks/${taskId}/comments`,
    );
    return data;
  },

  create: async (
    workspaceId: string,
    taskId: string,
    payload: CreateCommentPayload,
  ): Promise<Comment> => {
    const { data } = await api.post<Comment>(
      `/workspaces/${workspaceId}/tasks/${taskId}/comments`,
      payload,
    );
    return data;
  },

  update: async (
    workspaceId: string,
    commentId: string,
    payload: UpdateCommentPayload,
  ): Promise<Comment> => {
    const { data } = await api.patch<Comment>(
      `/workspaces/${workspaceId}/comments/${commentId}`,
      payload,
    );
    return data;
  },

  remove: async (workspaceId: string, commentId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/comments/${commentId}`);
  },
};
