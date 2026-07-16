'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusManager } from '@/components/project/status-manager';
import {
  useTaskStatuses,
  useCreateTaskStatus,
  useUpdateTaskStatus,
  useDeleteTaskStatus,
} from '@/hooks/use-task';

export default function TaskStatusesPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string; boardId: string }>;
}) {
  const { workspaceId, projectId, boardId } = use(params);
  const router = useRouter();

  const { data: statuses, isLoading } = useTaskStatuses(workspaceId);
  const { mutate: createStatus, isPending: isCreating } = useCreateTaskStatus(workspaceId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateTaskStatus(workspaceId);
  const { mutate: deleteStatus, isPending: isDeleting } = useDeleteTaskStatus(workspaceId);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 -ml-2"
          onClick={() =>
            router.push(`/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}`)
          }
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Board&apos;a Dön
        </Button>
        <h1 className="text-2xl font-bold">Task Statusları</h1>
        <p className="text-muted-foreground mt-1">
          Workspace genelinde kullanılan task durumlarını özelleştir
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statuslar</CardTitle>
          <CardDescription>
            Bu status&apos;lar workspace&apos;teki tüm board&apos;larda görünür. Sistem
            status&apos;ları (Todo, In Progress, In Review, Done) silinemez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusManager
            title="Statuslar"
            description="Sistem statusları silinemez, sadece custom olanlar düzenlenebilir"
            statuses={statuses}
            isLoading={isLoading}
            onCreate={(data) => createStatus(data)}
            onUpdate={(id, data) => updateStatus({ statusId: id, payload: data })}
            onDelete={(id) => deleteStatus(id)}
            isCreating={isCreating}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
