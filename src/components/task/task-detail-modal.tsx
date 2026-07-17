'use client';

import { useState } from 'react';
import { Trash2, Calendar as CalendarIcon, X, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { useTask, useUpdateTask, useDeleteTask, useTaskStatuses } from '@/hooks/use-task';
import { useLabels, useToggleTaskLabel } from '@/hooks/use-label';
import type { TaskPriority } from '@/services/task/task.types';

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'NONE', label: 'Yok' },
  { value: 'LOW', label: 'Düşük' },
  { value: 'MEDIUM', label: 'Orta' },
  { value: 'HIGH', label: 'Yüksek' },
  { value: 'URGENT', label: 'Acil' },
];

interface TaskDetailModalProps {
  workspaceId: string;
  projectId: string;
  boardId: string;
  taskId: string | null;
  onClose: () => void;
}

// Bu component, taskId değiştiğinde parent'ta `key={taskId}` ile yeniden mount edilir.
// Bu sayede useEffect ile state senkronize etmeye gerek kalmaz.
export function TaskDetailModal({
  workspaceId,
  projectId,
  boardId,
  taskId,
  onClose,
}: TaskDetailModalProps) {
  const { data: task, isLoading } = useTask(workspaceId, taskId ?? '');
  const { data: statuses } = useTaskStatuses(workspaceId);
  const { data: projectLabels } = useLabels(workspaceId, projectId);
  const { mutate: updateTask } = useUpdateTask(workspaceId, boardId);
  const { mutate: deleteTask } = useDeleteTask(workspaceId, boardId);
  const { add: addLabel, remove: removeLabel } = useToggleTaskLabel(
    workspaceId,
    boardId,
    taskId ?? '',
  );

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [labelPopoverOpen, setLabelPopoverOpen] = useState(false);

  if (!taskId) return null;

  const handleTitleBlur = () => {
    if (task && title.trim() && title !== task.title) {
      updateTask({ taskId: task.id, payload: { title: title.trim() } });
    }
  };

  const handleDescriptionBlur = () => {
    if (task && description !== (task.description ?? '')) {
      updateTask({ taskId: task.id, payload: { description } });
    }
  };

  const handleStatusChange = (statusId: string) => {
    if (task) updateTask({ taskId: task.id, payload: { statusId } });
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    if (task) updateTask({ taskId: task.id, payload: { priority } });
  };

  const handleDueDateChange = (date: Date | undefined) => {
    if (task) {
      updateTask({
        taskId: task.id,
        payload: { dueDate: date ? date.toISOString() : undefined },
      });
    }
  };

  const handleDelete = () => {
    if (task) {
      deleteTask(task.id);
      onClose();
    }
  };

  const taskLabelIds = new Set(task?.labels?.map((l) => l.label.id) ?? []);

  const toggleLabel = (labelId: string) => {
    if (taskLabelIds.has(labelId)) {
      removeLabel.mutate(labelId);
    } else {
      addLabel.mutate(labelId);
    }
  };

  return (
    <Dialog open={!!taskId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {isLoading || !task ? (
          <div className="py-12 text-center text-muted-foreground">Yükleniyor...</div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">Task Detayı</DialogTitle>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="text-lg font-semibold border-none px-0 shadow-none focus-visible:ring-0"
              />
            </DialogHeader>

            <div className="grid grid-cols-3 gap-6 mt-2">
              <div className="col-span-2 space-y-6">
                <div>
                  <p className="text-sm font-medium mb-2">Açıklama</p>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleDescriptionBlur}
                    placeholder="Açıklama ekle..."
                    rows={5}
                  />
                </div>

                {task.subTasks && task.subTasks.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Alt Görevler ({task.subTasks.length})
                    </p>
                    <div className="space-y-2">
                      {task.subTasks.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-2 border rounded-md text-sm"
                        >
                          <span>{sub.title}</span>
                          <Badge variant="outline">{sub.status.name}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Status</p>
                  <Select value={task.statusId} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: s.color }}
                            />
                            {s.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Öncelik</p>
                  <Select value={task.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Bitiş Tarihi
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start font-normal">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString('tr-TR')
                          : 'Tarih seç'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={task.dueDate ? new Date(task.dueDate) : undefined}
                        onSelect={handleDueDateChange}
                      />
                    </PopoverContent>
                  </Popover>
                  {task.dueDate && (
                    <button
                      onClick={() => handleDueDateChange(undefined)}
                      className="text-xs text-muted-foreground hover:text-destructive mt-1 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Tarihi kaldır
                    </button>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Etiketler</p>
                    <Popover open={labelPopoverOpen} onOpenChange={setLabelPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-5 h-5">
                          <Tag className="w-3.5 h-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2" align="end">
                        {projectLabels && projectLabels.length > 0 ? (
                          <div className="space-y-1">
                            {projectLabels.map((label) => (
                              <button
                                key={label.id}
                                onClick={() => toggleLabel(label.id)}
                                className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-muted text-left text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={taskLabelIds.has(label.id)}
                                  readOnly
                                  className="pointer-events-none"
                                />
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full text-white"
                                  style={{ backgroundColor: label.color }}
                                >
                                  {label.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            Bu projede henüz etiket yok
                          </p>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>

                  {task.labels && task.labels.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {task.labels.map(({ label }) => (
                        <span
                          key={label.id}
                          className="text-xs px-2 py-0.5 rounded-full text-white inline-flex items-center gap-1"
                          style={{ backgroundColor: label.color }}
                        >
                          {label.name}
                          <button
                            onClick={() => removeLabel.mutate(label.id)}
                            className="hover:opacity-70"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Etiket yok</p>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Task&apos;ı Sil
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Emin misin?</AlertDialogTitle>
                        <AlertDialogDescription>
                          &quot;{task.title}&quot; kalıcı olarak silinecek. Bu işlem geri
                          alınamaz.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
