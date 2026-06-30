'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProjects, useProjectStatuses, useCreateProject } from '@/hooks/use-project';

const createProjectSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter'),
  description: z.string().optional(),
  statusId: z.string().min(1, 'Status seçmelisin'),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

export default function ProjectsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data: projects, isLoading } = useProjects(workspaceId);
  const { data: statuses } = useProjectStatuses(workspaceId);
  const { mutate: createProject, isPending } = useCreateProject(workspaceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
  });

  const onSubmit = (data: CreateProjectForm) => {
    createProject(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Projeler</h1>
            <p className="text-muted-foreground mt-1">Workspace&apos;teki tüm projeler</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Proje
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Proje Oluştur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>İsim</Label>
                  <Input placeholder="Backend Refactor" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Açıklama (opsiyonel)</Label>
                  <Input placeholder="Proje açıklaması" {...register('description')} />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    {...register('statusId')}
                  >
                    <option value="">Seç...</option>
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

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Oluşturuluyor...' : 'Oluştur'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : projects?.length === 0 ? (
          <div className="text-center py-20">
            <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Henüz proje yok</h2>
            <p className="text-muted-foreground mb-6">İlk projeni oluştur</p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Proje Oluştur
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects?.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() =>
                  router.push(`/workspaces/${workspaceId}/projects/${project.id}/boards`)
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge style={{ backgroundColor: project.status.color, color: 'white' }}>
                      {project.status.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {project._count?.boards ?? 0} board
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}