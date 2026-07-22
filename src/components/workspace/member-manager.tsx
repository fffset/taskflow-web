'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Copy, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useWorkspaceMembers,
  usePendingInvites,
  useInviteMember,
  useCancelInvite,
  useRemoveMember,
  useUpdateMemberRole,
} from '@/hooks/use-workspace';
import type { WorkspaceRole } from '@/services/workspace/workspace.types';

const inviteSchema = z.object({
  email: z.string().email('Geçerli bir email girin'),
  role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']),
});

type InviteForm = z.infer<typeof inviteSchema>;

const roleLabels: Record<WorkspaceRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  MEMBER: 'Member',
};

const roleBadgeVariant = (role: WorkspaceRole) => {
  switch (role) {
    case 'OWNER':
      return 'default';
    case 'ADMIN':
      return 'secondary';
    default:
      return 'outline';
  }
};

interface MemberManagerProps {
  workspaceId: string;
  currentUserId: string;
  currentUserRole: WorkspaceRole;
}

export function MemberManager({
  workspaceId,
  currentUserId,
  currentUserRole,
}: MemberManagerProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { members, isLoading } = useWorkspaceMembers(workspaceId);
  const { data: pendingInvites, isLoading: pendingLoading } = usePendingInvites(workspaceId);
  const { mutate: inviteMember, isPending: isInviting } = useInviteMember(workspaceId);
  const { mutate: cancelInvite } = useCancelInvite(workspaceId);
  const { mutate: removeMember } = useRemoveMember(workspaceId);
  const { mutate: updateRole } = useUpdateMemberRole(workspaceId);

  const canManageMembers = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'MEMBER' },
  });

  const onInvite = (data: InviteForm) => {
    inviteMember(data, {
      onSuccess: (result) => {
        setInviteToken(result.token);
        reset();
      },
    });
  };

  const inviteUrl = inviteToken
    ? `${window.location.origin}/invite/accept/${inviteToken}`
    : null;

  const copyInviteLink = () => {
    if (inviteUrl) {
      void navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeInviteDialog = () => {
    setInviteOpen(false);
    setInviteToken(null);
    setCopied(false);
  };

  return (
    <div className="space-y-4">
      {canManageMembers && (
        <div className="flex items-center justify-end">
          <Dialog
            open={inviteOpen}
            onOpenChange={(open) => (open ? setInviteOpen(true) : closeInviteDialog())}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Üye Davet Et
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Üye Davet Et</DialogTitle>
              </DialogHeader>

              {inviteToken ? (
                <div className="space-y-4 mt-2">
                  <p className="text-sm text-muted-foreground">
                    Davet linki oluşturuldu. Bu linki davet etmek istediğin kişiyle paylaş —
                    link 7 gün geçerli.
                  </p>
                  <div className="flex items-center gap-2">
                    <Input value={inviteUrl ?? ''} readOnly className="text-xs" />
                    <Button size="icon" variant="outline" onClick={copyInviteLink}>
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <Button className="w-full" onClick={closeInviteDialog}>
                    Kapat
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onInvite)} className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="john@example.com" {...register('email')} />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      {...register('role')}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="MANAGER">Manager</option>
                      {currentUserRole === 'OWNER' && <option value="ADMIN">Admin</option>}
                    </select>
                  </div>

                  <Button type="submit" className="w-full" disabled={isInviting}>
                    {isInviting ? 'Oluşturuluyor...' : 'Davet Linki Oluştur'}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Aktif üyeler */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Üyeler
        </p>
        {isLoading ? (
          <p className="text-xs text-muted-foreground">Yükleniyor...</p>
        ) : (
          <div className="space-y-1.5">
            {members.map((member) => {
              const isSelf = member.id === currentUserId;
              const isOwner = member.role === 'OWNER';
              const canEditThisMember = canManageMembers && !isSelf && !isOwner;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {member.name}{' '}
                        {isSelf && <span className="text-muted-foreground">(Sen)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canEditThisMember ? (
                      <Select
                        value={member.role}
                        onValueChange={(role) =>
                          updateRole({
                            userId: member.id,
                            payload: { role: role as WorkspaceRole },
                          })
                        }
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          {currentUserRole === 'OWNER' && (
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={roleBadgeVariant(member.role)}>
                        {roleLabels[member.role]}
                      </Badge>
                    )}

                    {canEditThisMember && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-destructive"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Üye çıkarılsın mı?</AlertDialogTitle>
                            <AlertDialogDescription>
                              &quot;{member.name}&quot; workspace&apos;ten çıkarılacak.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeMember(member.id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Çıkar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bekleyen davetler — sadece yönetici yetkisi olanlar görür */}
      {canManageMembers && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Bekleyen Davetler
          </p>
          {pendingLoading ? (
            <p className="text-xs text-muted-foreground">Yükleniyor...</p>
          ) : pendingInvites && pendingInvites.length > 0 ? (
            <div className="space-y-1.5">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-2 border border-dashed rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {roleLabels[invite.role]} olarak davet edildi
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-destructive"
                    onClick={() => cancelInvite(invite.id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Bekleyen davet yok</p>
          )}
        </div>
      )}
    </div>
  );
}
