'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Lock } from 'lucide-react';
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

const statusSchema = z.object({
  name: z.string().min(1, 'İsim gerekli').max(64),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Geçerli bir hex renk kodu girin (örn. #3B82F6)'),
});

type StatusForm = z.infer<typeof statusSchema>;

interface StatusItem {
  id: string;
  name: string;
  color: string;
  position: number;
  isSystem: boolean;
}

interface StatusManagerProps {
  title: string;
  description: string;
  statuses: StatusItem[] | undefined;
  isLoading: boolean;
  onCreate: (data: StatusForm) => void;
  onUpdate: (id: string, data: StatusForm) => void;
  onDelete: (id: string) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

const presetColors = [
  '#6B7280', '#EF4444', '#F59E0B', '#22C55E',
  '#3B82F6', '#6366F1', '#A855F7', '#EC4899',
];

export function StatusManager({
  title,
  description,
  statuses,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  isCreating,
  isUpdating,
  isDeleting,
}: StatusManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const createForm = useForm<StatusForm>({
    resolver: zodResolver(statusSchema),
    defaultValues: { color: '#6B7280' },
  });

  const editForm = useForm<StatusForm>({
    resolver: zodResolver(statusSchema),
  });

  const handleCreate = (data: StatusForm) => {
    onCreate(data);
    setCreateOpen(false);
    createForm.reset({ color: '#6B7280' });
  };

  const handleUpdate = (data: StatusForm) => {
    if (editingId) {
      onUpdate(editingId, data);
      setEditingId(null);
    }
  };

  const startEdit = (status: StatusItem) => {
    setEditingId(status.id);
    editForm.reset({ name: status.name, color: status.color });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Status</DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>İsim</Label>
                <Input placeholder="In Review" {...createForm.register('name')} />
                {createForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Renk</Label>
                <div className="flex items-center gap-2">
                  <Input type="text" placeholder="#3B82F6" {...createForm.register('color')} />
                  <div
                    className="w-9 h-9 rounded-md border shrink-0"
                    style={{ backgroundColor: createForm.watch('color') }}
                  />
                </div>
                <div className="flex gap-1.5 pt-1">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="w-6 h-6 rounded-full border-2 border-transparent hover:border-foreground/20 transition-colors"
                      style={{ backgroundColor: c }}
                      onClick={() => createForm.setValue('color', c)}
                    />
                  ))}
                </div>
                {createForm.formState.errors.color && (
                  <p className="text-sm text-destructive">
                    {createForm.formState.errors.color.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Yükleniyor...</p>
      ) : (
        <div className="space-y-1.5">
          {statuses?.map((status) => (
            <div
              key={status.id}
              className="flex items-center justify-between p-2 border rounded-md"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: status.color }}
                />
                <span className="text-sm">{status.name}</span>
                {status.isSystem && (
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Sistem
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Dialog
                  open={editingId === status.id}
                  onOpenChange={(open) => !open && setEditingId(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7"
                      onClick={() => startEdit(status)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Status Düzenle</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={editForm.handleSubmit(handleUpdate)}
                      className="space-y-4 mt-2"
                    >
                      <div className="space-y-2">
                        <Label>İsim</Label>
                        <Input {...editForm.register('name')} />
                      </div>
                      <div className="space-y-2">
                        <Label>Renk</Label>
                        <div className="flex items-center gap-2">
                          <Input type="text" {...editForm.register('color')} />
                          <div
                            className="w-9 h-9 rounded-md border shrink-0"
                            style={{ backgroundColor: editForm.watch('color') }}
                          />
                        </div>
                        <div className="flex gap-1.5 pt-1">
                          {presetColors.map((c) => (
                            <button
                              key={c}
                              type="button"
                              className="w-6 h-6 rounded-full border-2 border-transparent hover:border-foreground/20 transition-colors"
                              style={{ backgroundColor: c }}
                              onClick={() => editForm.setValue('color', c)}
                            />
                          ))}
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isUpdating}>
                        {isUpdating ? 'Kaydediliyor...' : 'Kaydet'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {!status.isSystem && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Status silinsin mi?</AlertDialogTitle>
                        <AlertDialogDescription>
                          &quot;{status.name}&quot; status&apos;u silinecek. Bu status&apos;u
                          kullanan öğeler varsa önce onları güncellemen gerekebilir.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(status.id)}
                          disabled={isDeleting}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
