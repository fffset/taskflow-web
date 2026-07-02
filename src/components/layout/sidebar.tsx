'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronsUpDown, FolderKanban, Settings, Plus, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspaces } from '@/hooks/use-workspace';
import { useProjects } from '@/hooks/use-project';

interface SidebarProps {
  workspaceId: string;
}

export function Sidebar({ workspaceId }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: workspaces } = useWorkspaces();
  const { data: projects, isLoading: projectsLoading } = useProjects(workspaceId);

  const currentWorkspace = workspaces?.find((w) => w.id === workspaceId);

  return (
    <aside className="w-64 border-r bg-muted/20 flex flex-col h-screen sticky top-0">
      <div className="p-3 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-sm font-semibold shrink-0">
                {currentWorkspace?.name.charAt(0) ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {currentWorkspace?.name ?? 'Workspace'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentWorkspace?.role}
                </p>
              </div>
              <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {workspaces?.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => router.push(`/workspaces/${ws.id}/projects`)}
                className="flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-semibold">
                  {ws.name.charAt(0)}
                </div>
                <span className="flex-1 truncate">{ws.name}</span>
                {ws.id === workspaceId && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/workspaces')}>
              Tüm Workspace&apos;ler
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2 px-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Projeler
          </p>
          <Link
            href={`/workspaces/${workspaceId}/projects`}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-3.5 h-3.5" />
          </Link>
        </div>

        {projectsLoading ? (
          <div className="space-y-1.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 rounded-md" />
            ))}
          </div>
        ) : (
          <nav className="space-y-0.5">
            {projects?.map((project) => {
              const isActive = pathname.includes(project.id);
              return (
                <Link
                  key={project.id}
                  href={`/workspaces/${workspaceId}/projects/${project.id}/boards`}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground/80 hover:bg-muted'
                  }`}
                >
                  <FolderKanban className="w-4 h-4 shrink-0" />
                  <span className="truncate">{project.name}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      <div className="p-3 border-t">
        <Link
          href={`/workspaces/${workspaceId}/settings`}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-foreground/80 hover:bg-muted transition-colors"
        >
          <Settings className="w-4 h-4" />
          Ayarlar
        </Link>
      </div>
    </aside>
  );
}
