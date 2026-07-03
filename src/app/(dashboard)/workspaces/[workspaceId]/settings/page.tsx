'use client';

import { use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useWorkspace, useUpdateWorkspace, useDeleteWorkspace } from '@/hooks/use-workspace';

const updateWorkspaceSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter'),
  description: z.string().optional(),
});

type UpdateWorkspaceForm = z.infer<typeof updateWorkspaceSchema>;

export default function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);

  const { data: workspace, isLoading } = useWorkspace(workspaceId);
  const { mutate: updateWorkspace, isPending: isUpdating } = useUpdateWorkspace(workspaceId);
  const { mutate: deleteWorkspace, isPending: isDeleting } = useDeleteWorkspace();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateWorkspaceForm>({
    resolver: zodResolver(updateWorkspaceSchema),
    values: workspace
      ? { name: workspace.name, description: workspace.description ?? '' }
      : undefined,
  });

  const onSubmit = (data: UpdateWorkspaceForm) => {
    updateWorkspace(data);
  };

  const isOwner = workspace?.role === 'OWNER';

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workspace Ayarları</h1>
        <p className="text-muted-foreground mt-1">
          Workspace bilgilerini ve tercihlerini yönet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Genel Bilgiler</CardTitle>
          <CardDescription>Workspace ismi ve açıklaması</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>İsim</Label>
              <Input {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea rows={3} {...register('description')} />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Slug</Label>
              <Input value={workspace?.slug} disabled className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Slug oluşturulduktan sonra değiştirilemez</p>
            </div>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isOwner && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Tehlikeli Bölge</CardTitle>
            <CardDescription>
              Bu işlem geri alınamaz. Workspace ve içindeki tüm veriler kalıcı olarak silinir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Workspace&apos;i Sil
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Emin misin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    &quot;{workspace?.name}&quot; workspace&apos;i ve içindeki tüm projeler,
                    board&apos;lar, task&apos;lar kalıcı olarak silinecek. Bu işlem geri
                    alınamaz.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteWorkspace(workspaceId)}
                    disabled={isDeleting}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
