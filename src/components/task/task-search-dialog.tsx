'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTaskSearch } from '@/hooks/use-task';

interface TaskSearchDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskSearchDialog({ workspaceId, open, onOpenChange }: TaskSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const { data: results, isFetching } = useTaskSearch(workspaceId, debouncedQuery);

  const handleSelect = (projectId: string | undefined, boardId: string, taskId: string) => {
    if (!projectId) return; // güvenlik için, olmaması gereken durum

    onOpenChange(false);
    setQuery('');
    router.push(
      `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}?openTask=${taskId}`,
    );
  };

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Task Ara</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Task ara... (en az 2 karakter)"
            className="pl-9"
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="max-h-80 overflow-y-auto space-y-1 mt-2">
          {query.trim().length < 2 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aramak için en az 2 karakter yaz
            </p>
          ) : !isFetching && results?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              &quot;{debouncedQuery}&quot; için sonuç bulunamadı
            </p>
          ) : (
            results?.map((task) => (
              <button
                key={task.id}
                onClick={() => handleSelect(task.projectId, task.boardId, task.id)}
                className="w-full flex items-center justify-between gap-2 p-2.5 rounded-md hover:bg-muted text-left transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {task.description}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 text-xs"
                  style={{ borderColor: task.status?.color }}
                >
                  {task.status?.name}
                </Badge>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
