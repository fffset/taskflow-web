'use client';

import { useState, use } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { Plus, Kanban, Settings, Pencil, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useBoards,
  useCreateBoard,
  useUpdateBoard,
  useDeleteBoard,
  useReorderBoards,
} from '@/hooks/use-board';
import type { Board } from '@/services/board/board.types';
import { EmptyState } from '@/components/common/empty-state/empty-state';
import { PageSkeleton } from '@/components/common/loading/list-skeleton';

const boardSchema = z.object({
  name: z.string().min(1, 'Board adı gerekli'),
});

type BoardForm = z.infer<typeof boardSchema>;

function SortableBoardCard({
  board,
  workspaceId,
  projectId,
  onEdit,
  onDelete,
}: {
  board: Board;
  workspaceId: string;
  projectId: string;
  onEdit: (board: Board) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: board.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-pointer hover:border-primary transition-colors group"
      onClick={() =>
        router.push(`/workspaces/${workspaceId}/projects/${projectId}/boards/${board.id}`)
      }
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5">
            <button
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <CardTitle className="text-lg">{board.name}</CardTitle>
          </div>

          <div
            className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onEdit(board)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Board silinsin mi?</AlertDialogTitle>
                  <AlertDialogDescription>
                    &quot;{board.name}&quot; board&apos;u ve içindeki tüm task&apos;lar
                    kalıcı olarak silinecek.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(board.id)}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Sil
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{board._count?.tasks ?? 0} task</p>
      </CardContent>
    </Card>
  );
}

export default function BoardsPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string }>;
}) {
  const { workspaceId, projectId } = use(params);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const router = useRouter();

  const { data: boards, isLoading, isError } = useBoards(workspaceId, projectId);
  const { mutate: createBoard, isPending: isCreating } = useCreateBoard(workspaceId, projectId);
  const { mutate: updateBoard, isPending: isUpdating } = useUpdateBoard(workspaceId, projectId);
  const { mutate: deleteBoard } = useDeleteBoard(workspaceId, projectId);
  const { mutate: reorderBoards } = useReorderBoards(workspaceId, projectId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const createForm = useForm<BoardForm>({ resolver: zodResolver(boardSchema) });
  const editForm = useForm<BoardForm>({ resolver: zodResolver(boardSchema) });

  const onCreate = (data: BoardForm) => {
    createBoard(data, {
      onSuccess: () => {
        setCreateOpen(false);
        createForm.reset();
      },
    });
  };

  const onUpdate = (data: BoardForm) => {
    if (editingBoard) {
      updateBoard(
        { boardId: editingBoard.id, payload: data },
        { onSuccess: () => setEditingBoard(null) },
      );
    }
  };

  const startEdit = (board: Board) => {
    setEditingBoard(board);
    editForm.reset({ name: board.name });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !boards) return;

    const oldIndex = boards.findIndex((b) => b.id === active.id);
    const newIndex = boards.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(boards, oldIndex, newIndex);

    reorderBoards(reordered.map((b) => b.id));
  };

  // Proje geçersizse (yok, veya erişim yok) gerçek 404 göster
  if (isError) {
    notFound();
  }

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Board&apos;lar</h1>
            <p className="text-muted-foreground mt-1">Sprint&apos;ler ve board&apos;lar</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                router.push(`/workspaces/${workspaceId}/projects/${projectId}/settings`)
              }
              title="Proje Ayarları"
            >
              <Settings className="w-4 h-4" />
            </Button>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
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
                <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>İsim</Label>
                    <Input placeholder="Sprint 1" {...createForm.register('name')} />
                    {createForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {createForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? 'Oluşturuluyor...' : 'Oluştur'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {boards?.length === 0 ? (
          <EmptyState
            icon={Kanban}
            title="Henüz board yok"
            description="İlk board'unu oluştur"
            actionLabel="Board Oluştur"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={boards?.map((b) => b.id) ?? []}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {boards?.map((board) => (
                  <SortableBoardCard
                    key={board.id}
                    board={board}
                    workspaceId={workspaceId}
                    projectId={projectId}
                    onEdit={startEdit}
                    onDelete={(id) => deleteBoard(id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Dialog open={!!editingBoard} onOpenChange={(open) => !open && setEditingBoard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Board Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>İsim</Label>
              <Input {...editForm.register('name')} />
            </div>
            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}