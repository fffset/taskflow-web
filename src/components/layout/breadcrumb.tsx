'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useWorkspaces } from '@/hooks/use-workspace';
import { useProjects } from '@/hooks/use-project';
import { useBoards } from '@/hooks/use-board';

interface BreadcrumbProps {
  workspaceId?: string;
  projectId?: string;
  boardId?: string;
}

export function Breadcrumb({ workspaceId, projectId, boardId }: BreadcrumbProps) {
  const { data: workspaces } = useWorkspaces();
  const { data: projects } = useProjects(workspaceId ?? '');
  const { data: boards } = useBoards(workspaceId ?? '', projectId ?? '');

  const workspace = workspaces?.find((w) => w.id === workspaceId);
  const project = projects?.find((p) => p.id === projectId);
  const board = boards?.find((b) => b.id === boardId);

  const items = [
    workspace && { label: workspace.name, href: `/workspaces/${workspaceId}/projects` },
    project && {
      label: project.name,
      href: `/workspaces/${workspaceId}/projects/${projectId}/boards`,
    },
    board && {
      label: board.name,
      href: `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}`,
    },
  ].filter(Boolean) as { label: string; href: string }[];

  if (items.length === 0) return <div />;

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {items.map((item, i) => (
        <div key={item.href} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
          {i === items.length - 1 ? (
            <span className="font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
