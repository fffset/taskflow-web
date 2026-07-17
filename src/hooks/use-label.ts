import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { labelService } from '@/services/label/label.service';
import type { CreateLabelPayload, UpdateLabelPayload } from '@/services/label/label.types';

export function useLabels(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: ['labels', workspaceId, projectId],
    queryFn: () => labelService.getAll(workspaceId, projectId),
    enabled: !!workspaceId && !!projectId,
  });
}

export function useCreateLabel(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLabelPayload) =>
      labelService.create(workspaceId, projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['labels', workspaceId, projectId] });
      toast.success('Etiket oluşturuldu');
    },
    onError: () => {
      toast.error('Etiket oluşturulamadı');
    },
  });
}

export function useUpdateLabel(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ labelId, payload }: { labelId: string; payload: UpdateLabelPayload }) =>
      labelService.update(workspaceId, projectId, labelId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['labels', workspaceId, projectId] });
      toast.success('Etiket güncellendi');
    },
    onError: () => {
      toast.error('Etiket güncellenemedi');
    },
  });
}

export function useDeleteLabel(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelId: string) => labelService.remove(workspaceId, projectId, labelId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['labels', workspaceId, projectId] });
      toast.success('Etiket silindi');
    },
    onError: () => {
      toast.error('Etiket silinemedi');
    },
  });
}

// Task detail modal içinde kullanılacak — task'a label ekle/kaldır
export function useToggleTaskLabel(workspaceId: string, boardId: string, taskId: string) {
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: (labelId: string) => labelService.addToTask(workspaceId, taskId, labelId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', boardId] });
    },
    onError: () => {
      toast.error('Etiket eklenemedi');
    },
  });

  const remove = useMutation({
    mutationFn: (labelId: string) => labelService.removeFromTask(workspaceId, taskId, labelId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', boardId] });
    },
    onError: () => {
      toast.error('Etiket kaldırılamadı');
    },
  });

  return { add, remove };
}
