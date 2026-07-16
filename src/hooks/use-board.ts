import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { boardService } from '@/services/board/board.service';
import type { Board, CreateBoardPayload, UpdateBoardPayload } from '@/services/board/board.types';

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

// Optimistic update — sürükleme anında UI'ı hemen güncelle,
// API cevabını beklemeden. Hata olursa eski sıraya geri dön.
export function useReorderBoards(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['boards', workspaceId, projectId];

  return useMutation({
    mutationFn: (boardIds: string[]) => boardService.reorder(workspaceId, projectId, boardIds),
    onMutate: async (boardIds: string[]) => {
      await queryClient.cancelQueries({ queryKey });
      const previousBoards = queryClient.getQueryData<Board[]>(queryKey);

      if (previousBoards) {
        const reordered = boardIds
          .map((id) => previousBoards.find((b) => b.id === id))
          .filter((b): b is Board => !!b);
        queryClient.setQueryData(queryKey, reordered);
      }

      return { previousBoards };
    },
    onError: (_err, _boardIds, context) => {
      if (context?.previousBoards) {
        queryClient.setQueryData(queryKey, context.previousBoards);
      }
      toast.error('Sıralama güncellenemedi');
    },
    onSuccess: (data) => {
      // Server'dan dönen güncel veriyi cache'e yaz — invalidate yerine
      // direkt setQueryData kullanıyoruz ki ekstra bir fetch/refetch
      // tetiklenip "geri sıçrama" (flicker) oluşmasın.
      queryClient.setQueryData(queryKey, data);
    },
    // onSettled kasıtlı olarak kaldırıldı — invalidateQueries burada
    // gereksiz bir refetch tetikleyip optimistic state'in üzerine
    // stale veriyle yazabiliyordu.
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
