import { api } from '../api';
import type { Board, CreateBoardPayload } from './board.types';

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
};