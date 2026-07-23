'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWorkspaces, useCreateWorkspace } from '@/hooks/use-workspace';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserMenu } from '@/components/layout/user-menu';
import { PageSkeleton } from '@/components/common/loading/list-skeleton';
import { EmptyState } from '@/components/common/empty-state/empty-state';

const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter'),
  slug: z
    .string()
    .min(2, 'En az 2 karakter')
    .regex(/^[a-z0-9-]+$/, 'Sadece küçük harf, rakam ve tire'),
  description: z.string().optional(),
});

type CreateWorkspaceForm = z.infer<typeof createWorkspaceSchema>;

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case 'OWNER': return 'default';
    case 'ADMIN': return 'secondary';
    default: return 'outline';
  }
};

export default function WorkspacesPage() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: workspaces, isLoading } = useWorkspaces();
  const { mutate: createWorkspace, isPending } = useCreateWorkspace();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateWorkspaceForm>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  const onSubmit = (data: CreateWorkspaceForm) => {
    createWorkspace(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b flex items-center justify-between px-6 sticky top-0 bg-background/95 backdrop-blur z-10">
        <span className="font-semibold">Taskflow</span>
        <UserMenu />
      </header>

      {isLoading ? (
        <PageSkeleton />
      ) : (
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Workspace&apos;ler</h1>
              <p className="text-muted-foreground mt-1">Üye olduğun tüm workspace&apos;ler</p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Workspace Oluştur</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>İsim</Label>
                    <Input placeholder="Acme Corp" {...register('name')} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input placeholder="acme-corp" {...register('slug')} />
                    {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Açıklama (opsiyonel)</Label>
                    <Input placeholder="Takımımız için..." {...register('description')} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? 'Oluşturuluyor...' : 'Oluştur'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {workspaces?.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Henüz workspace yok"
              description="İlk workspace'ini oluştur"
              actionLabel="Workspace Oluştur"
              onAction={() => setOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces?.map((ws) => (
                <Card
                  key={ws.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => router.push(`/workspaces/${ws.id}/projects`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{ws.name}</CardTitle>
                      <Badge variant={roleBadgeVariant(ws.role)}>{ws.role}</Badge>
                    </div>
                    <CardDescription>{ws.slug}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />
                      {ws.memberCount} üye
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}