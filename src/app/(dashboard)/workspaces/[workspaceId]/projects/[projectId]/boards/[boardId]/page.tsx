'use client';

import { useState, use } from 'react';
import { Plus, Calendar, MessageSquare, ListTree } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTasks, useTaskStatuses, useCreateTask, useUpdateTask } from '@/hooks/use-task';
import { TaskDetailModal } from '@/components/task/task-detail-modal';
import type { Task, TaskPriority } from '@/services/task/task.types';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  description: z.string().optional(),
  statusId: z.string().min(1, 'Status seç'),
  priority: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

const priorityColors: Record<TaskPriority, string> = {
  NONE: 'bg-gray-100 text-gray-600',
  LOW: 'bg-blue-100 text-blue-600',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

// ─── Draggable Task Card ─────────────────────────────────────────────────────

function TaskCardContent({ task }: { task: Task }) {
  return (
    <CardContent className="p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-tight">{task.title}</p>
      </div>

      {task.priority !== 'NONE' && (
        <Badge className={`text-xs ${priorityColors[task.priority]}`} variant="secondary">
          {task.priority}
        </Badge>
      )}

      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map(({ label }) => (
            <span
              key={label.id}
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('tr-TR')}
            </span>
          )}
          {(task._count?.comments ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {task._count?.comments}
            </span>
          )}
          {(task._count?.subTasks ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <ListTree className="w-3 h-3" />
              {task._count?.subTasks}
            </span>
          )}
        </div>

        {task.assignee && (
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium">
            {task.assignee.name.charAt(0)}
          </div>
        )}
      </div>
    </CardContent>
  );
}

function DraggableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-pointer hover:border-primary transition-colors mb-3 touch-none"
      onClick={onClick}
    >
      <TaskCardContent task={task} />
    </Card>
  );
}

// ─── Droppable Column ─────────────────────────────────────────────────────────

function DroppableColumn({
  statusId,
  children,
}: {
  statusId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: statusId });

  return (
    <div
      ref={setNodeRef}
      className={`bg-muted/40 rounded-xl p-2 min-h-[400px] transition-colors ${
        isOver ? 'bg-muted' : ''
      }`}
    >
      {children}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function BoardDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string; boardId: string }>;
}) {
  const { workspaceId, boardId } = use(params);
  const [open, setOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const { data: tasks, isLoading } = useTasks(workspaceId, boardId);
  const { data: statuses } = useTaskStatuses(workspaceId);
  const { mutate: createTask, isPending } = useCreateTask(workspaceId, boardId);
  const { mutate: updateTask } = useUpdateTask(workspaceId, boardId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // 5px hareket etmeden drag başlamaz — click ile çakışmasın
    }),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
  });

  const onSubmit = (data: CreateTaskForm) => {
    createTask(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  const tasksByStatus = (statusId: string) =>
    tasks?.filter((t) => t.statusId === statusId) ?? [];

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatusId = over.id as string;
    const task = tasks?.find((t) => t.id === taskId);

    if (task && task.statusId !== newStatusId) {
      updateTask({ taskId, payload: { statusId: newStatusId } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Board</h1>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Task Oluştur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Başlık</Label>
                  <Input placeholder="JWT refresh token implementasyonu" {...register('title')} />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Açıklama (opsiyonel)</Label>
                  <Input placeholder="Detaylar..." {...register('description')} />
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

                <div className="space-y-2">
                  <Label>Öncelik</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    {...register('priority')}
                  >
                    <option value="NONE">Yok</option>
                    <option value="LOW">Düşük</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HIGH">Yüksek</option>
                    <option value="URGENT">Acil</option>
                  </select>
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Oluşturuluyor...' : 'Oluştur'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statuses?.map((status) => (
                <div key={status.id} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <h3 className="font-semibold text-sm">{status.name}</h3>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {tasksByStatus(status.id).length}
                    </span>
                  </div>

                  <DroppableColumn statusId={status.id}>
                    {tasksByStatus(status.id).map((task) => (
                      <DraggableTaskCard
                        key={task.id}
                        task={task}
                        onClick={() => setSelectedTaskId(task.id)}
                      />
                    ))}

                    {tasksByStatus(status.id).length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        Task yok
                      </p>
                    )}
                  </DroppableColumn>
                </div>
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <Card className="cursor-grabbing shadow-lg">
                  <TaskCardContent task={activeTask} />
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <TaskDetailModal
        key={selectedTaskId}
        workspaceId={workspaceId}
        boardId={boardId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}