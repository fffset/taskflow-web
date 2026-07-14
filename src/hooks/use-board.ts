import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { boardService } from '@/services/board/board.service';
import type { CreateBoardPayload, UpdateBoardPayload } from '@/services/board/board.types';

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
      toast.success('Board oluşturuldu');
    },
    onError: () => {
      toast.error('Board oluşturulamadı');
    },
  });
}

export function useUpdateBoard(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, payload }: { boardId: string; payload: UpdateBoardPayload }) =>
      boardService.update(workspaceId, projectId, boardId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['boards', workspaceId, projectId] });
      toast.success('Board güncellendi');
    },
    onError: () => {
      toast.error('Board güncellenemedi');
    },
  });
}

export function useDeleteBoard(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => boardService.remove(workspaceId, projectId, boardId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['boards', workspaceId, projectId] });
      toast.success('Board silindi');
    },
    onError: () => {
      toast.error('Board silinemedi');
    },
  });
}
