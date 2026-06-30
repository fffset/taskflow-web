import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/project/project.service';
import type { CreateProjectPayload } from '@/services/project/project.types';

export function useProjects(workspaceId: string) {
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => projectService.getAll(workspaceId),
    enabled: !!workspaceId,
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
    },
  });
}