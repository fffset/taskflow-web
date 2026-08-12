import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { commentService } from '@/services/comment/comment.service';
import type { CreateCommentPayload, UpdateCommentPayload } from '@/services/comment/comment.types';

export function useComments(workspaceId: string, taskId: string) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentService.getAll(workspaceId, taskId),
    enabled: !!workspaceId && !!taskId,
  });
}

export function useCreateComment(workspaceId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCommentPayload) =>
      commentService.create(workspaceId, taskId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
    onError: () => {
      toast.error('Yorum eklenemedi');
    },
  });
}

export function useUpdateComment(workspaceId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, payload }: { commentId: string; payload: UpdateCommentPayload }) =>
      commentService.update(workspaceId, commentId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
    onError: () => {
      toast.error('Yorum güncellenemedi');
    },
  });
}

export function useDeleteComment(workspaceId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentService.remove(workspaceId, commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      toast.success('Yorum silindi');
    },
    onError: () => {
      toast.error('Yorum silinemedi');
    },
  });
}
