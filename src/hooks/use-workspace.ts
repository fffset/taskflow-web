import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { workspaceService } from '@/services/workspace/workspace.service';
import type {
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  InviteMemberPayload,
  UpdateMemberRolePayload,
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

export function useWorkspaceMembers(workspaceId: string) {
  const { data, isLoading } = useWorkspace(workspaceId);

  return {
    members: data?.members ?? [],
    isLoading,
  };
}

export function usePendingInvites(workspaceId: string) {
  return useQuery({
    queryKey: ['pending-invites', workspaceId],
    queryFn: () => workspaceService.getPendingInvites(workspaceId),
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

export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteMemberPayload) =>
      workspaceService.inviteMember(workspaceId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pending-invites', workspaceId] });
      toast.success('Davet oluşturuldu');
    },
    onError: () => {
      toast.error('Davet gönderilemedi');
    },
  });
}

export function useCancelInvite(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => workspaceService.cancelInvite(workspaceId, inviteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pending-invites', workspaceId] });
      toast.success('Davet iptal edildi');
    },
    onError: () => {
      toast.error('Davet iptal edilemedi');
    },
  });
}

export function useAcceptInvite() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => workspaceService.acceptInvite(token),
    onSuccess: (workspace) => {
      void queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success(`${workspace.name} workspace'ine katıldın`);
      router.push(`/workspaces/${workspace.id}/projects`);
    },
    onError: () => {
      toast.error('Davet kabul edilemedi — geçersiz veya süresi dolmuş olabilir');
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => workspaceService.removeMember(workspaceId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      toast.success('Üye çıkarıldı');
    },
    onError: () => {
      toast.error('Üye çıkarılamadı');
    },
  });
}

export function useUpdateMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateMemberRolePayload }) =>
      workspaceService.updateMemberRole(workspaceId, userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      toast.success('Rol güncellendi');
    },
    onError: () => {
      toast.error('Rol güncellenemedi');
    },
  });
}
