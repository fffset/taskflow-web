'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Kanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBoards, useCreateBoard } from '@/hooks/use-board';

const createBoardSchema = z.object({
  name: z.string().min(1, 'Board adı gerekli'),
});

type CreateBoardForm = z.infer<typeof createBoardSchema>;

export default function BoardsPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string }>;
}) {
  const { workspaceId, projectId } = use(params);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data: boards, isLoading } = useBoards(workspaceId, projectId);
  const { mutate: createBoard, isPending } = useCreateBoard(workspaceId, projectId);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateBoardForm>({
    resolver: zodResolver(createBoardSchema),
  });

  const onSubmit = (data: CreateBoardForm) => {
    createBoard(data, {
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
            <h1 className="text-3xl font-bold">Board&apos;lar</h1>
            <p className="text-muted-foreground mt-1">Sprint&apos;ler ve board&apos;lar</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Board
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Board Oluştur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>İsim</Label>
                  <Input placeholder="Sprint 1" {...register('name')} />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
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
        ) : boards?.length === 0 ? (
          <div className="text-center py-20">
            <Kanban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Henüz board yok</h2>
            <p className="text-muted-foreground mb-6">İlk board&apos;unu oluştur</p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Board Oluştur
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards?.map((board) => (
              <Card
                key={board.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() =>
                  router.push(
                    `/workspaces/${workspaceId}/projects/${projectId}/boards/${board.id}`,
                  )
                }
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{board.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {board._count?.tasks ?? 0} task
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