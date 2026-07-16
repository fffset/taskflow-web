import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { taskService } from '@/services/task/task.service';
import type {
  CreateTaskPayload,
  UpdateTaskPayload,
  CreateTaskStatusPayload,
  UpdateTaskStatusPayload,
  Task,
} from '@/services/task/task.types';

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
  const queryKey = ['tasks', boardId];

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) =>
      taskService.update(workspaceId, taskId, payload),
    onError: () => {
      toast.error('Task güncellenemedi');
      void queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: (updatedTask, variables) => {
      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        old?.map((task) => (task.id === variables.taskId ? updatedTask : task)),
      );
      void queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      toast.success('Task güncellendi');
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

export function useCreateTaskStatus(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskStatusPayload) => taskService.createStatus(workspaceId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['task-statuses', workspaceId] });
      toast.success('Status eklendi');
    },
    onError: () => {
      toast.error('Status eklenemedi');
    },
  });
}

export function useUpdateTaskStatus(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      statusId,
      payload,
    }: {
      statusId: string;
      payload: UpdateTaskStatusPayload;
    }) => taskService.updateStatus(workspaceId, statusId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['task-statuses', workspaceId] });
      toast.success('Status güncellendi');
    },
    onError: () => {
      toast.error('Status güncellenemedi');
    },
  });
}

export function useDeleteTaskStatus(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statusId: string) => taskService.deleteStatus(workspaceId, statusId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['task-statuses', workspaceId] });
      toast.success('Status silindi');
    },
    onError: () => {
      toast.error('Status silinemedi (sistem status\'u olabilir)');
    },
  });
}
