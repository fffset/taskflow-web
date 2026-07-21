import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { workspaceService } from '@/services/workspace/workspace.service';
import type {
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
} from '@/services/workspace/workspace.types';

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceService.getAll,
  });
}

export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceService.getOne(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWorkspacePayload) => workspaceService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace oluşturuldu');
    },
    onError: () => {
      toast.error('Workspace oluşturulamadı');
    },
  });
}

export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateWorkspacePayload) =>
      workspaceService.update(workspaceId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      void queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      toast.success('Workspace güncellendi');
    },
    onError: () => {
      toast.error('Workspace güncellenemedi');
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (workspaceId: string) => workspaceService.remove(workspaceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace silindi');
      router.push('/workspaces');
    },
    onError: () => {
      toast.error('Workspace silinemedi');
    },
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceService.getOne(workspaceId),
    enabled: !!workspaceId,
  });

  return {
    members: data?.members ?? [],
    isLoading,
  };
}
