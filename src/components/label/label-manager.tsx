'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label as FormLabel } from '@/components/ui/label';
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
import {
  useLabels,
  useCreateLabel,
  useUpdateLabel,
  useDeleteLabel,
} from '@/hooks/use-label';
import type { Label } from '@/services/label/label.types';

const labelSchema = z.object({
  name: z.string().min(1, 'İsim gerekli').max(64),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Geçerli bir hex renk kodu girin (örn. #EF4444)'),
});

type LabelForm = z.infer<typeof labelSchema>;

const presetColors = [
  '#EF4444', '#F59E0B', '#22C55E', '#3B82F6',
  '#6366F1', '#A855F7', '#EC4899', '#6B7280',
];

interface LabelManagerProps {
  workspaceId: string;
  projectId: string;
}

export function LabelManager({ workspaceId, projectId }: LabelManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

  const { data: labels, isLoading } = useLabels(workspaceId, projectId);
  const { mutate: createLabel, isPending: isCreating } = useCreateLabel(workspaceId, projectId);
  const { mutate: updateLabel, isPending: isUpdating } = useUpdateLabel(workspaceId, projectId);
  const { mutate: deleteLabel } = useDeleteLabel(workspaceId, projectId);

  const createForm = useForm<LabelForm>({
    resolver: zodResolver(labelSchema),
    defaultValues: { color: '#6B7280' },
  });

  const editForm = useForm<LabelForm>({ resolver: zodResolver(labelSchema) });

  const onCreate = (data: LabelForm) => {
    createLabel(data, {
      onSuccess: () => {
        setCreateOpen(false);
        createForm.reset({ color: '#6B7280' });
      },
    });
  };

  const onUpdate = (data: LabelForm) => {
    if (editingLabel) {
      updateLabel(
        { labelId: editingLabel.id, payload: data },
        { onSuccess: () => setEditingLabel(null) },
      );
    }
  };

  const startEdit = (label: Label) => {
    setEditingLabel(label);
    editForm.reset({ name: label.name, color: label.color });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Etiket Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Etiket</DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4 mt-2">
              <div className="space-y-2">
                <FormLabel>İsim</FormLabel>
                <Input placeholder="Bug" {...createForm.register('name')} />
                {createForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <FormLabel>Renk</FormLabel>
                <div className="flex items-center gap-2">
                  <Input type="text" placeholder="#EF4444" {...createForm.register('color')} />
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
      ) : labels?.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          Henüz etiket yok
        </p>
      ) : (
        <div className="space-y-1.5">
          {labels?.map((label) => (
            <div
              key={label.id}
              className="flex items-center justify-between p-2 border rounded-md"
            >
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>

              <div className="flex items-center gap-1">
                <Dialog
                  open={editingLabel?.id === label.id}
                  onOpenChange={(open) => !open && setEditingLabel(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7"
                      onClick={() => startEdit(label)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Etiket Düzenle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-4 mt-2">
                      <div className="space-y-2">
                        <FormLabel>İsim</FormLabel>
                        <Input {...editForm.register('name')} />
                      </div>
                      <div className="space-y-2">
                        <FormLabel>Renk</FormLabel>
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

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Etiket silinsin mi?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &quot;{label.name}&quot; etiketi tüm task&apos;lardan kaldırılacak.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteLabel(label.id)}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
