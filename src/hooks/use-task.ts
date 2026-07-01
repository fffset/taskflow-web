import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task/task.service';
import type { CreateTaskPayload, UpdateTaskPayload } from '@/services/task/task.types';

export function useTasks(workspaceId: string, boardId: string) {
  return useQuery({
    queryKey: ['tasks', boardId],
    queryFn: () => taskService.getAll(workspaceId, boardId),
    enabled: !!workspaceId && !!boardId,
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
    },
  });
}

export function useUpdateTask(workspaceId: string, boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) =>
      taskService.update(workspaceId, taskId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks', boardId] });
    },
  });
}