import { api } from '../api';
import type { Board, CreateBoardPayload, UpdateBoardPayload } from './board.types';

export const boardService = {
  getAll: async (workspaceId: string, projectId: string): Promise<Board[]> => {
    const { data } = await api.get<Board[]>(
      `/workspaces/${workspaceId}/projects/${projectId}/boards`,
    );
    return data;
  },

  create: async (
    workspaceId: string,
    projectId: string,
    payload: CreateBoardPayload,
  ): Promise<Board> => {
    const { data } = await api.post<Board>(
      `/workspaces/${workspaceId}/projects/${projectId}/boards`,
      payload,
    );
    return data;
  },

  update: async (
    workspaceId: string,
    projectId: string,
    boardId: string,
    payload: UpdateBoardPayload,
  ): Promise<Board> => {
    const { data } = await api.patch<Board>(
      `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}`,
      payload,
    );
    return data;
  },

  reorder: async (
    workspaceId: string,
    projectId: string,
    boardIds: string[],
  ): Promise<Board[]> => {
    const { data } = await api.patch<Board[]>(
      `/workspaces/${workspaceId}/projects/${projectId}/boards/reorder`,
      { boardIds },
    );
    return data;
  },

  remove: async (workspaceId: string, projectId: string, boardId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}`);
  },
};
