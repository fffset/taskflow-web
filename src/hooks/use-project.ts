import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { projectService } from '@/services/project/project.service';
import type { CreateProjectPayload, UpdateProjectPayload } from '@/services/project/project.types';

export function useProjects(workspaceId: string) {
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => projectService.getAll(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useProject(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: ['project', workspaceId, projectId],
    queryFn: () => projectService.getOne(workspaceId, projectId),
    enabled: !!workspaceId && !!projectId,
  });
}

export function useProjectStatuses(workspaceId: string) {
  return useQuery({
    queryKey: ['project-statuses', workspaceId],
    queryFn: () => projectService.getStatuses(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useCreateProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectService.create(workspaceId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      toast.success('Proje oluşturuldu');
    },
    onError: () => {
      toast.error('Proje oluşturulamadı');
    },
  });
}

export function useUpdateProject(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProjectPayload) =>
      projectService.update(workspaceId, projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      void queryClient.invalidateQueries({ queryKey: ['project', workspaceId, projectId] });
      toast.success('Proje güncellendi');
    },
    onError: () => {
      toast.error('Proje güncellenemedi');
    },
  });
}

export function useDeleteProject(workspaceId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (projectId: string) => projectService.remove(workspaceId, projectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      toast.success('Proje silindi');
      router.push(`/workspaces/${workspaceId}/projects`);
    },
    onError: () => {
      toast.error('Proje silinemedi');
    },
  });
}
