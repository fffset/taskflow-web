import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { taskService } from '@/services/task/task.service';
import type { CreateTaskPayload, UpdateTaskPayload } from '@/services/task/task.types';

export function useTasks(workspaceId: string, boardId: string) {
  return useQuery({
    queryKey: ['tasks', boardId],
    queryFn: () => taskService.getAll(workspaceId, boardId),
    enabled: !!workspaceId && !!boardId,
  });
}

export function useTask(workspaceId: string, taskId: string) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskService.getOne(workspaceId, taskId),
    enabled: !!workspaceId && !!taskId,
  });
}

export function useTaskStatuses(workspaceId: string) {
  return useQuery({
    queryKey: ['task-statuses', workspaceId],
    queryFn: () => taskService.getStatuses(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useCreateTask(workspaceId: string, boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.create(workspaceId, boardId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks', boardId] });
      toast.success('Task oluşturuldu');
    },
    onError: () => {
      toast.error('Task oluşturulamadı');
    },
  });
}

export function useUpdateTask(workspaceId: string, boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) =>
      taskService.update(workspaceId, taskId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['tasks', boardId] });
      void queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      toast.success('Task güncellendi');
    },
    onError: () => {
      toast.error('Task güncellenemedi');
    },
  });
}

export function useDeleteTask(workspaceId: string, boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.remove(workspaceId, taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks', boardId] });
      toast.success('Task silindi');
    },
    onError: () => {
      toast.error('Task silinemedi');
    },
  });
}