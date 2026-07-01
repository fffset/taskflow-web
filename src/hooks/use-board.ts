import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { boardService } from '@/services/board/board.service';
import type { CreateBoardPayload } from '@/services/board/board.types';

export function useBoards(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: ['boards', workspaceId, projectId],
    queryFn: () => boardService.getAll(workspaceId, projectId),
    enabled: !!workspaceId && !!projectId,
  });
}

export function useCreateBoard(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBoardPayload) =>
      boardService.create(workspaceId, projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['boards', workspaceId, projectId] });
    },
  });
}