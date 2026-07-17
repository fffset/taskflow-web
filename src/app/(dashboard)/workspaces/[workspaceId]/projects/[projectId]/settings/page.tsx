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
import { StatusManager } from '@/components/project/status-manager';
import { LabelManager } from '@/components/label/label-manager';
import {
  useProject,
  useProjectStatuses,
  useUpdateProject,
  useDeleteProject,
  useCreateProjectStatus,
  useUpdateProjectStatus,
  useDeleteProjectStatus,
} from '@/hooks/use-project';

const updateProjectSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter'),
  description: z.string().optional(),
  statusId: z.string().min(1, 'Status seç'),
});

type UpdateProjectForm = z.infer<typeof updateProjectSchema>;

export default function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string }>;
}) {
  const { workspaceId, projectId } = use(params);

  const { data: project, isLoading } = useProject(workspaceId, projectId);
  const { data: statuses, isLoading: statusesLoading } = useProjectStatuses(workspaceId);
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject(
    workspaceId,
    projectId,
  );
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject(workspaceId);

  const { mutate: createStatus, isPending: isCreatingStatus } =
    useCreateProjectStatus(workspaceId);
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateProjectStatus(workspaceId);
  const { mutate: deleteStatus, isPending: isDeletingStatus } =
    useDeleteProjectStatus(workspaceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProjectForm>({
    resolver: zodResolver(updateProjectSchema),
    values: project
      ? {
          name: project.name,
          description: project.description ?? '',
          statusId: project.statusId,
        }
      : undefined,
  });

  const onSubmit = (data: UpdateProjectForm) => {
    updateProject(data);
  };

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
        <h1 className="text-2xl font-bold">Proje Ayarları</h1>
        <p className="text-muted-foreground mt-1">
          &quot;{project?.name}&quot; projesinin bilgilerini yönet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Genel Bilgiler</CardTitle>
          <CardDescription>Proje ismi, açıklaması ve durumu</CardDescription>
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
              <Label>Status</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                {...register('statusId')}
              >
                {statuses?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.statusId && (
                <p className="text-sm text-destructive">{errors.statusId.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proje Statusları</CardTitle>
          <CardDescription>
            Workspace genelinde kullanılan proje durumlarını özelleştir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusManager
            title="Statuslar"
            description="Sistem statusları silinemez, sadece custom olanlar düzenlenebilir"
            statuses={statuses}
            isLoading={statusesLoading}
            onCreate={(data) => createStatus(data)}
            onUpdate={(id, data) => updateStatus({ statusId: id, payload: data })}
            onDelete={(id) => deleteStatus(id)}
            isCreating={isCreatingStatus}
            isUpdating={isUpdatingStatus}
            isDeleting={isDeletingStatus}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etiketler</CardTitle>
          <CardDescription>
            Bu projedeki task&apos;lara eklenebilecek etiketleri yönet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LabelManager workspaceId={workspaceId} projectId={projectId} />
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Tehlikeli Bölge</CardTitle>
          <CardDescription>
            Bu işlem geri alınamaz. Proje ve içindeki tüm board&apos;lar, task&apos;lar
            kalıcı olarak silinir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Projeyi Sil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Emin misin?</AlertDialogTitle>
                <AlertDialogDescription>
                  &quot;{project?.name}&quot; projesi ve içindeki tüm board&apos;lar,
                  task&apos;lar kalıcı olarak silinecek. Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteProject(projectId)}
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
    </div>
  );
}
